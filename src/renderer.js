const { initWindowControls } = require('./windowControls')
const { initTheme } = require('./theme')
const { initNavigation } = require('./nav')
const { navigateTo } = require('./dir')
const state = require('./state')

initWindowControls()
initTheme()
initNavigation()

navigateTo(state.homeDir)