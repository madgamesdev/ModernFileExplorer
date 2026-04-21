const { ipcRenderer } = require('electron')
const { adjustColorBrightness, facilitateSize, normalizePath } = require('./utils')
const os = require('os')

// UI Stuff
const addressBar = document.getElementById('address-bar')
const fileList = document.getElementById("file-list")
const fileItems = () => Array.from(document.querySelectorAll('.file-item'))

const backButton = document.getElementById("back-button")
const forwardButton = document.getElementById("forward-button")
const refreshButton = document.getElementById("refresh-button")

const homeDir = os.homedir()

// Explorer Nav Variables
let selectedIndex = -1
let anchorIndex = 0
let selectedSet = new Set()
let currentItems = []

let history = []
let historyIndex = -1

let currentDir = ""

// Window controls
document.getElementById('Minimize').addEventListener('click', () => {
    ipcRenderer.send('window-control', 'minimize')
})

document.getElementById('Maximize').addEventListener('click', () => {
    ipcRenderer.send('window-control', 'maximize')
})

document.getElementById('Close').addEventListener('click', () => {
    ipcRenderer.send('window-control', 'close')
})

// Theme
ipcRenderer.on("set-accent-color", (_e, color) => {
    const lightAccentColor = adjustColorBrightness(color, 40)
    document.documentElement.style.setProperty('--accent-color', color)
    document.documentElement.style.setProperty('--light-accent-color', lightAccentColor)
})

function refreshPage() { navigateTo(currentDir, false) }

// Navigation
function navigateTo(path, addToHistory = true) {
    if (!path) return

    path = normalizePath(path)

    loadDirectory(path)
    addressBar.value = path

    currentDir = path

    if (addToHistory) {
        history = history.slice(0, historyIndex + 1)
        history.push(path)
        historyIndex++
    }

    updateNavButtons()
}

backButton.addEventListener("click", () => {
    if (historyIndex <= 0) return
    historyIndex--
    navigateTo(history[historyIndex], false)
})

forwardButton.addEventListener("click", () => {
    if (historyIndex >= history.length - 1) return
    historyIndex++
    navigateTo(history[historyIndex], false)
})

refreshButton.addEventListener("click", () => {
    refreshPage()
})

function updateNavButtons() {
    if (backButton) backButton.disabled = historyIndex <= 0
    if (forwardButton) forwardButton.disabled = historyIndex >= history.length - 1
}

// ADDRESS BAR
addressBar.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        navigateTo(addressBar.value)
    }
})

addressBar.addEventListener("focus", () => {
    addressBar.select()
})

// Keyboard nav
document.addEventListener('keydown', (e) => {
    if (addressBar.matches(':focus')) return

    if (e.key === 'ArrowDown') {
        changeSelectionArea(1, e.ctrlKey)
        e.preventDefault()
    } 
    else if (e.key === 'ArrowUp') {
        changeSelectionArea(-1, e.ctrlKey)
        e.preventDefault()
    } 
    else if (e.key === 'Enter') {
        const item = currentItems[selectedIndex]
        if (!item) return
        openItem(item)
        e.preventDefault()
    }
    else if (e.key === 'F5') { refreshPage() }
})

// File List Empty Space Click
fileList.addEventListener("click", (e) => {
    if (e.ctrlKey || selectedSet.size === 0) return
    clearSelected()
})

// Load dir
async function loadDirectory(dir) {
    if (!dir || typeof dir !== 'string') return

    let result = await ipcRenderer.invoke("list-directory", dir)

    if (result.error) {
        fileList.innerText = result.error
        return
    }
    
    // FILTER HIDDEN ITEMS
    result = result.filter(item => !item.isHidden) // Might add a setting to change whether
                                                 // you wanna see hidden files or not
    currentItems = result 

    fileList.innerHTML = ""

    result.forEach((item, i) => {
        const el = document.createElement("div")

        el.className = "file-item"
        el.dataset.index = i
        el.innerHTML = `
            <span class="item-name">
                ${item.isDir ? '📁' : '📄'} ${item.name}
            </span>
            <span class="item-size">
                ${item.isDir ? 'Folder' : facilitateSize(item.size)}
            </span>
        `
        
        el.addEventListener("click", (e) => {
            const index = parseInt(el.dataset.index)

            if (e.ctrlKey) toggleSelection(index)
            else clearSelected()
        })

        el.addEventListener("dblclick", () => {
            openItem(item)
        })

        fileList.appendChild(el)
    })

    clearSelected()
}

// OPEN ITEM
function openItem(item) {
    if (!item) return

    if (item.isDir) {
        navigateTo(item.path)
    } else {
        ipcRenderer.invoke("open-file", item.path)
    }
}

// Selection
function clearSelected() { 
    selectedSet.clear() 
    selectedIndex = -1
    renderSelection()
}

function selectSingle(index) {
    selectedSet.clear()
    selectedSet.add(index)
    anchorIndex = index
    selectedIndex = index
    renderSelection()
}

function toggleSelection(index) {
    if (selectedSet.has(index)) {
        selectedSet.delete(index)
    } else {
        selectedSet.add(index)
        anchorIndex = index
    }
    selectedIndex = index
    renderSelection()
}

function changeSelectionArea(dir, ctrl) {
    const items = fileItems()
    if (!items.length) return

    if (selectedIndex === -1) selectedIndex = 0

    let newIndex = selectedIndex + dir
    newIndex = Math.max(0, Math.min(items.length - 1, newIndex))

    selectedIndex = newIndex

    if (ctrl) {
        selectedSet.clear()

        const start = Math.min(anchorIndex, selectedIndex)
        const end = Math.max(anchorIndex, selectedIndex)

        for (let i = start; i <= end; i++) {
            selectedSet.add(i)
        }
    } else {
        selectSingle(selectedIndex)
    }

    renderSelection()
}

function renderSelection() {
    const items = fileItems()

    items.forEach((el, i) => {
        el.classList.toggle("selected", selectedSet.has(i))
    })

    items[selectedIndex]?.scrollIntoView({
        block: "nearest",
        behavior: "smooth"
    })
}



navigateTo(homeDir)