const { ipcRenderer } = require('electron')
const state = require('./state')
const { getUI } = require('./ui')
const { normalizePath, facilitateSize } = require('./utils')
const { clearSelected } = require('./selection')
const selection = require('./selection')

let currentToken = null

function navigateTo(path, addToHistory = true) {
    path = normalizePath(path)
    if (!path) return

    const ui = getUI()
    const { addressBar } = ui

    loadDirectory(path)

    if (addressBar) {
        addressBar.value = path
    }

    state.currentDir = path

    if (addToHistory) {
        state.history = state.history.slice(0, state.historyIndex + 1)
        state.history.push(path)
        state.historyIndex++
    }
}

function loadDirectory(dir) {
    const ui = getUI()
    const { fileList } = ui

    if (!fileList) return

    fileList.innerHTML = ''
    state.currentItems = []

    currentToken = Date.now().toString()

    ipcRenderer.send('list-directory', {
        dir,
        token: currentToken
    })

    const handler = (_e, msg) => {
        if (msg.token && msg.token !== currentToken) return

        if (msg.error) {
            fileList.innerText = msg.error
            ipcRenderer.removeListener('fs-stream', handler)
            return
        }

        if (msg.type === 'chunk') {
            const visible = msg.data.filter(i => !i.isHidden)

            visible.forEach((item) => {
                const index = state.currentItems.length
                state.currentItems.push(item)

                const el = document.createElement('div')
                el.className = 'file-item'
                el.dataset.index = index

                el.innerHTML = `
                    <span class='item-name'>
                        ${item.isDir ? '📁' : '📄'} ${item.name}
                    </span>
                    <span class='item-size'>
                        ${item.isDir ? 'Folder' : facilitateSize(item.size)}
                    </span>
                `

                el.onclick = (e) => {
                    if (e.ctrlKey) selection.toggleSelection(index)
                    else selection.selectSingle(index)
                }

                el.ondblclick = () => openItem(item)

                fileList.appendChild(el)
            })
        }

        if (msg.type === 'done') {
            clearSelected()
            ipcRenderer.removeListener('fs-stream', handler)
        }
    }

    ipcRenderer.on('fs-stream', handler)
}

function openItem(item) {
    if (item.isDir) {
        navigateTo(item.path)
    } else {
        ipcRenderer.invoke('open-file', item.path)
    }
}

module.exports = { loadDirectory, navigateTo, openItem }