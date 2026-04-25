const addressBar = document.getElementById('address-bar')
const fileList = document.getElementById("file-list")

const backButton = document.getElementById("back-button")
const forwardButton = document.getElementById("forward-button")
const refreshButton = document.getElementById("refresh-button")

const contextMenu = document.getElementById('context-menu')

const fileItems = () => Array.from(document.querySelectorAll('.file-item'))

function getUI() {
    return {
        contextMenu: document.getElementById('context-menu'),
        addressBar: document.getElementById('address-bar'),
        fileList: document.getElementById('file-list'),
        backButton: document.getElementById('back-button'),
        forwardButton: document.getElementById('forward-button'),
        refreshButton: document.getElementById('refresh-button'),
        fileItems: () => Array.from(document.querySelectorAll('.file-item'))
    }
}

module.exports = { getUI }