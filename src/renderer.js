const { initWindowControls } = require('./windowControls')
const { initTheme } = require('./theme')
const { initNavigation } = require('./nav')
const { navigateTo } = require('./dir')
const { initContextMenu } = require('./contextMenu')

const state = require('./state')

window.addEventListener('DOMContentLoaded', () => {
    initWindowControls()
    initTheme()
    initNavigation()
    initContextMenu()

    navigateTo(state.homeDir)
})