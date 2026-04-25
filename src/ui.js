const addressBar = document.getElementById('address-bar')
const fileList = document.getElementById("file-list")

const backButton = document.getElementById("back-button")
const forwardButton = document.getElementById("forward-button")
const refreshButton = document.getElementById("refresh-button")

const contextMenu = document.getElementById('context-menu')

const fileItems = () => Array.from(document.querySelectorAll('.file-item'))

module.exports = {
    addressBar,
    fileList,
    backButton,
    forwardButton,
    refreshButton,
    contextMenu,
    fileItems
}