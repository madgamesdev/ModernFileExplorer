const { app, BrowserWindow, ipcMain, shell, systemPreferences } = require('electron')
const { spawn } = require('child_process')
const path = require('path')

let win
let py

let pendingResolve = null
let buffer = ''
const queue = []

function createWindow() {
    win = new BrowserWindow({
        width: 1000,
        height: 700,
        minWidth: 300,
        minHeight: 200,
        icon: path.join(__dirname, 'src/misc/icon.png'),
        title: 'MFExplorer',
        frame: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            devTools: false
        }
    })

    win.loadFile(path.join(__dirname, 'src', 'index.html'))

    py = spawn(process.env.PYTHON || "python", [
        path.join(__dirname, 'src', 'fs_reader.py')
    ])

    py.stdout.on("data", (data) => {
        buffer += data.toString()

        try {
            const parsed = JSON.parse(buffer.trim())
            buffer = ''

            const resolve = queue.shift()
            if (resolve) resolve(parsed)

        } catch {}
    })

    py.stderr.on("data", (data) => {
        console.error("PY ERROR:", data.toString())
        buffer = ''

        if (pendingResolve) {
            pendingResolve({ error: data.toString() })
            pendingResolve = null
        }
    })

    win.webContents.on('did-finish-load', sendAccentColor)

    if (process.platform === 'win32') {
        systemPreferences.on("accent-color-changed", sendAccentColor)
    }
}
app.whenReady().then(createWindow)

app.on("window-all-closed", () => {
    if (py) py.kill()
    if (process.platform !== 'darwin') app.quit()
})

ipcMain.on('window-control', (event, action) => {
    switch (action) {
        case 'minimize':
            win.minimize()
            break
        case 'maximize':
            if (win.isMaximized()) {
                win.unmaximize()
            } else {
                win.maximize()
            }
            break
        case 'close':
            win.close()
            break
    }
})

ipcMain.handle("list-directory", async (_event, dirPath) => {
    return new Promise((resolve) => {
        queue.push(resolve)
        buffer = ''
        py.stdin.write(dirPath + '\n')
    })
})

ipcMain.handle('open-file', async (_event, filePath) => {
    try {
        await shell.openPath(filePath)
    } catch (err) {
        console.error(err)
    }
})

function sendAccentColor() {
    if (!win || win.isDestroyed()) return
    let accentColor = "#9332AB"
  
    if (process.platform === "win32"){
        const colorPref = systemPreferences.getAccentColor()
        accentColor = `#${colorPref.substring(0,6)}`
    }

    win.webContents.send("set-accent-color", accentColor)
}