const { contextMenu } = require('./ui')

let active = false

function initContextMenu() {
    document.addEventListener('click', (e) => {
        if (contextMenu.contains(e.target)) return
        toggle(false)
    })

    contextMenu.addEventListener('contextmenu', (e) => {
        e.preventDefault()
    })
}

function toggle(state = !active) {
    active = state
    contextMenu.style.display = state ? 'block' : 'none'
}

module.exports = { initContextMenu, toggle }