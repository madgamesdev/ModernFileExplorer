const { getUI } = require('./ui')
const tooltip = require('./tooltip')

let active = false
let contextMenu

function initContextMenu() {
    const ui = getUI()
    contextMenu = ui.contextMenu

    tooltip.attach(contextMenu, 'Under Construction!')

    document.addEventListener('click', (e) => {
        if (contextMenu.contains(e.target)) return
        toggle(false)
    })

    contextMenu.addEventListener('contextmenu', (e) => {
        e.preventDefault()
    })

    document.addEventListener('contextmenu', (e) => {
        e.preventDefault()
        toggle(true)

        contextMenu.style.left = `${e.pageX}px`
        contextMenu.style.top = `${e.pageY}px`
    })

}

function toggle(nextState = !active) {
    active = nextState

    contextMenu.style.display = nextState ? 'block' : 'none'

    if (nextState) {
       contextMenu.style.animation = 'none'
       contextMenu.offsetHeight
       contextMenu.style.animation = ''
    }
}

module.exports = { initContextMenu, toggle }