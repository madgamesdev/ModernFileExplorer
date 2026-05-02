const { app, BrowserWindow, ipcMain, shell, systemPreferences } = require('electron')
const { spawn } = require('child_process')
const path = require('path')

let win
let py

function createWindow() {
    win = new BrowserWindow({
        width: 1000,
        height: 700,
        minWidth: 400,
        minHeight: 500,
        icon: path.join(__dirname, 'misc/icon.png'),
        title: 'MFExplorer',
        frame: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            devTools: true
        }
    })

    win.loadFile(path.join(__dirname, 'index.html'))

    const fsReaderPath = app.isPackaged
        ? path.join(process.resourcesPath, 'app.asar.unpacked', 'src', 'fs_reader.py')
        : path.join(__dirname, 'fs_reader.py')

    py = spawn(process.env.PYTHON || 'python', [fsReaderPath], { stdio: ['pipe', 'pipe', 'pipe'] })

    py.stdout.on('data', (data) => {
        if (!win || win.isDestroyed()) return

        const lines = data.toString().split('\n')

        for (const line of lines) {
            if (!line.trim()) continue

            try {
                const msg = JSON.parse(line)
                win.webContents.send('fs-stream', msg)
            } catch (err) {}
        }
    })

    py.stderr.on('data', (data) => {
        if (!win || win.isDestroyed()) return

        win.webContents.send('fs-stream', {
            type: 'error',
            error: data.toString()
        })
    })

    py.on('exit', (code) => { return })

    win.on('maximize', () => { win.webContents.send('window-maximized', true) })
    win.on('unmaximize', () => { win.webContents.send('window-maximized', false) })

    win.webContents.on('did-finish-load', sendAccentColor)

    if (process.platform === 'win32') {
        systemPreferences.on('accent-color-changed', sendAccentColor)
    }
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
    if (py) py.kill()
    if (process.platform !== 'darwin') app.quit()
})


ipcMain.on('window-control', (_event, action) => {
    if (!win) return

    switch (action) {
        case 'minimize': win.minimize(); break
        case 'maximize': win.isMaximized() ? win.unmaximize() : win.maximize(); break
        case 'close': win.close(); break
    }
})

ipcMain.on('list-directory', (_event, { dir, token }) => {
    if (!py || py.killed) return

    if (typeof dir !== 'string' || !dir.trim()) return

    py.stdin.write(`list|${dir}|${token}\n`)
})

ipcMain.handle('open-file', async (_event, filePath) => {
    return shell.openPath(filePath)
})

function sendAccentColor() {
    if (!win || win.isDestroyed()) return

    let accentColor = '#9332AB'

    if (process.platform === 'win32') {
        const colorPref = systemPreferences.getAccentColor()
        accentColor = `#${colorPref.substring(0, 6)}`
    }

    win.webContents.send('set-accent-color', accentColor)
}