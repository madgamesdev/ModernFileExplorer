const { app, BrowserWindow, ipcMain, shell, systemPreferences } = require('electron')
const path = require('path')
const fs = require('fs')
const fswin = require('fswin')

let win

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
        },
    })

    win.loadFile(path.join(__dirname, "src", "index.html"))

    win.webContents.on("did-finish-load", sendAccentColor)
    if (process.platform === "win32"){
        systemPreferences.on("accent-color-changed", () => {
        sendAccentColor()
    })
  }
}

app.whenReady().then(createWindow)

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit()
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
    try {
        const entries = await fs.promises.readdir(dirPath, { withFileTypes: true })

        const result = []

        for (const entry of entries) {
            const fullPath = path.join(dirPath, entry.name)

            let isHidden = false

            try {
                const stats = fswin.getAttributesSync(fullPath)
                isHidden = stats && stats.IS_HIDDEN
            } catch { isHidden = false }

            result.push({
                name: entry.name,
                isDirectory: entry.isDirectory(),
                path: fullPath,
                hidden: isHidden
            })
        }

        return result
    } catch (err) {
        return { error: err.message }
    }
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