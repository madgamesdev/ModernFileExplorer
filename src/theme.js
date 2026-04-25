const { ipcRenderer } = require('electron')
const { adjustColorBrightness } = require('./utils')

function initTheme() {
    ipcRenderer.on('set-accent-color', (_e, color) => {
        const light = adjustColorBrightness(color, 30)
        const lighter = adjustColorBrightness(color, 60)

        document.documentElement.style.setProperty('--accent-color', color)
        document.documentElement.style.setProperty('--light-accent-color', light)
        document.documentElement.style.setProperty('--lighter-accent-color', lighter)
    })
}

module.exports = { initTheme }