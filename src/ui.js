function getUI() {
    return {
        contextMenu: document.getElementById('context-menu'),
        addressBar: document.getElementById('address-bar'),
        fileList: document.getElementById('file-list'),
        backButton: document.getElementById('back-button'),
        forwardButton: document.getElementById('forward-button'),
        refreshButton: document.getElementById('refresh-button'),
        border: document.getElementById('window-border'),
        fileItems: () => Array.from(document.querySelectorAll('.file-item'))
    }
}

module.exports = { getUI }