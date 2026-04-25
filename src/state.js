const os = require('os')

const state = {
    homeDir: os.homedir(),

    selectedIndex: -1,
    anchorIndex: 0,
    selectedSet: new Set(),

    currentItems: [],

    history: [],
    historyIndex: -1,
    currentDir: ""
}

module.exports = state