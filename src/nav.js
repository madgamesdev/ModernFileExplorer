const state = require('./state')
const { addressBar, backButton, forwardButton } = require('./ui')
const { navigateTo } = require('./dir')

function initNavigation() {
    backButton.onclick = () => { goBack() }

    forwardButton.onclick = () => { goForward() }

    addressBar.addEventListener('keydown', (e) => {
        if (e.key === "Enter") navigateTo(addressBar.value)
    })

    addressBar.addEventListener('focus', () => addressBar.select())

    window.addEventListener('mousedown', (e) => {
        if (e.button === 3) { goBack() }
        else if (e.button === 4) { goForward() }
    })
}

function goBack() {
    if (state.historyIndex <= 0) return
    state.historyIndex--
    navigateTo(state.history[state.historyIndex], false)
}
function goForward() {
    if (state.historyIndex >= state.history.length - 1) return
    state.historyIndex++
    navigateTo(state.history[state.historyIndex], false)
}

module.exports = { initNavigation }