const { ipcRenderer } = require('electron')
const { adjustColorBrightness, detectOS } = require('./utils')
const { getUI } = require('./ui')

function setWindowBorderUp() {
    const ui = getUI()
    if (!ui.border) return

    const osType = detectOS()
    switch (osType) {
        case 1: // Win 10
            ui.border.style.borderRadius = '0px'
            break
        case 2: // Win 11
            ui.border.style.borderRadius = '8px'
            break
        case 3: // Mac OS
            ui.border.style.borderRadius = '16px'
            break
        default:
            // Not Windows
            ui.border.style.display = 'none'
            break
    }
}

/* Make the border-radius of our custom window border 0px when maximized
   or 8px when not, to match the Windows 11 window logic */
function applyBorderRadius(isMaximized) {
    const ui = getUI()
    if (!ui.border) return

    ui.border.style.borderRadius = isMaximized ? '0px' : '8px'                                                          
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

    if (detectOS() === 2) { // Win 11 logic
        ipcRenderer.on('window-maximized', (_e, isMaximized) => {
            applyBorderRadius(isMaximized)
        })
    }
}    

module.exports = { initTheme }