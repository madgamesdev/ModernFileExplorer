const { ipcRenderer } = require('electron')
const state = require('./state')
const { fileList, addressBar } = require('./ui')
const { normalizePath, facilitateSize } = require('./utils')
const { clearSelected } = require('./selection')

function navigateTo(path, addToHistory = true) {
    if (!path) return

    path = normalizePath(path)

    loadDirectory(path)
    addressBar.value = path
    state.currentDir = path

    if (addToHistory) {
        state.history = state.history.slice(0, state.historyIndex + 1)
        state.history.push(path)
        state.historyIndex++
    }
}

async function loadDirectory(dir) {
    let result = await ipcRenderer.invoke("list-directory", dir)

    if (result.error) {
        fileList.innerText = result.error
        return
    }

    result = result.filter(i => !i.isHidden)
    state.currentItems = result

    fileList.innerHTML = ""

    result.forEach((item, i) => {
        const el = document.createElement("div")
        el.className = "file-item"
        el.dataset.index = i

        el.innerHTML = `
            <span class="item-name">
                ${item.isDir ? "📁" : "📄"} ${item.name}
            </span>
            <span class="item-size">
                ${item.isDir ? "Folder" : facilitateSize(item.size)}
            </span>
        `

        el.onclick = (e) => {
            const index = i
            const selection = require('./selection')

            if (e.ctrlKey) selection.toggleSelection(index)
            else selection.selectSingle(index)
        }

        el.ondblclick = () => openItem(item)

        fileList.appendChild(el)
    })

    clearSelected()
}

function openItem(item) {
    if (item.isDir) {
        navigateTo(item.path)
    } else {
        ipcRenderer.invoke("open-file", item.path)
    }
}

module.exports = { loadDirectory, navigateTo, openItem }