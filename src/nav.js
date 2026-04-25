const state = require('./state')
const { addressBar, backButton, forwardButton } = require('./ui')
const { navigateTo } = require('./dir')

function initNavigation() {
    backButton.onclick = () => {
        if (state.historyIndex <= 0) return
        state.historyIndex--
        navigateTo(state.history[state.historyIndex], false)
    }

    forwardButton.onclick = () => {
        if (state.historyIndex >= state.history.length - 1) return
        state.historyIndex++
        navigateTo(state.history[state.historyIndex], false)
    }

    addressBar.addEventListener('keydown', (e) => {
        if (e.key === "Enter") navigateTo(addressBar.value)
    })

    addressBar.addEventListener('focus', () => addressBar.select())
}

module.exports = { initNavigation }