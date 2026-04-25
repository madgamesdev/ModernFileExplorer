const { app, BrowserWindow, ipcMain, shell, systemPreferences } = require('electron')
const { spawn } = require('child_process')
const path = require('path')

let win
let py

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
        contextIsolation: false
        // devTools: false
    }
    })

    win.loadFile(path.join(__dirname, 'src', 'index.html'))

    py = spawn("python", [path.join(__dirname, 'src', 'fs_reader.py')])

    py.stdout.on("data", (data) => {
        const msg = data.toString()

        if (msg.includes('init')) return
    })

    win.webContents.on('did-finish-load', sendAccentColor)
    if (process.platform === 'win32'){
        systemPreferences.on("accent-color-changed", () => {
        sendAccentColor()
    })
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
        let output = ''; let error = ''

        const onData = (data) => {
            output += data.toString()

            try {
                const parsed = JSON.parse(output.trim())

                cleanup()
                resolve(parsed)
            } catch {}
        }

        const onError = (data) => {
            error += data.toString()
            cleanup()
            resolve({ error })
        }

        const cleanup = () => {
            py.stdout.off('data', onData)
            py.stderr.off('data', onError)
        }

        py.stdout.on('data', onData)
        py.stderr.on('data', onError)

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