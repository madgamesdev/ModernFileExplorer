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
        icon: path.join(__dirname, 'misc/icon.png'),
        title: 'MFExplorer',
        frame: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            devTools: false
        }
    })

    win.loadFile(path.join(__dirname, 'index.html'))

    py = spawn(process.env.PYTHON || "python", [
        path.join(__dirname, 'fs_reader.py')
    ])

    py.stdout.on("data", (data) => {
        const lines = data.toString().split("\n")

        for (const line of lines) {
            if (!line.trim()) continue

            try {
                const msg = JSON.parse(line)
                win.webContents.send("fs-stream", msg)
            } catch {}
        }
    })

    py.stderr.on("data", (data) => {
        win.webContents.send("fs-stream", {
            type: "error",
            error: data.toString()
        })
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
    if (!win) return

    switch (action) {
        case 'minimize':
            win.minimize()
            break
        case 'maximize':
            win.isMaximized() ? win.unmaximize() : win.maximize()
            break
        case 'close':
            win.close()
            break
    }
})

ipcMain.handle("list-directory", async (_event, dir) => {
    if (!py) return { error: "Python process not running" }

    return new Promise((resolve) => {
        const token = Date.now().toString()

        const listener = (data) => {
            try {
                const msg = JSON.parse(data.toString())
                resolve(msg)
                py.stdout.off("data", listener)
            } catch {}
        }

        py.stdout.on("data", listener)

        py.stdin.write(`list|${dir}|${token}\n`)
    })
})


ipcMain.handle('open-file', async (_event, filePath) => {
    return shell.openPath(filePath)
})

function sendAccentColor() {
    if (!win || win.isDestroyed()) return

    let accentColor = "#9332AB"

    if (process.platform === "win32") {
        const colorPref = systemPreferences.getAccentColor()
        accentColor = `#${colorPref.substring(0, 6)}`
    }

    win.webContents.send("set-accent-color", accentColor)
}