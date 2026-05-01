const { ipcRenderer } = require('electron')
const { adjustColorBrightness } = require('./utils')
const os = require('os')
const { getUI } = require('./ui')

function setWindowBorderUp() {
    let style = 0

    const release = os.release()
    const build = parseInt(release.split('.')[2] || '0', 10)

    if (process.platform === 'win32' && build >= 22000) {
        style = 2 // Windows 11
    } else if (process.platform === 'win32') {
        style = 1 // Windows 10
    } else {
        style = 0 // not Windows
    }

    const ui = getUI()

    if (ui.border) {
        switch (style) {
            case 1:
                ui.border.style.borderRadius = '0px'
                break
            case 2:
                ui.border.style.borderRadius = '8px'
                break
            default:
                ui.border.style.display = 'none'
                break
        }
    }
}

function initTheme() {
    setWindowBorderUp()

    ipcRenderer.on('set-accent-color', (_e, color) => {
        const light = adjustColorBrightness(color, 30)
        const lighter = adjustColorBrightness(color, 60)

        document.documentElement.style.setProperty('--accent-color', color)
        document.documentElement.style.setProperty('--light-accent-color', light)
        document.documentElement.style.setProperty('--lighter-accent-color', lighter)
    })
}

module.exports = { initTheme }