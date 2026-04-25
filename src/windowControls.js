const { ipcRenderer } = require('electron')

function initWindowControls() {
    document.getElementById('Minimize').onclick = () =>
        ipcRenderer.send('window-control', 'minimize')

    document.getElementById('Maximize').onclick = () =>
        ipcRenderer.send('window-control', 'maximize')

    document.getElementById('Close').onclick = () =>
        ipcRenderer.send('window-control', 'close')
}

module.exports = { initWindowControls }