const { ipcRenderer } = require('electron')

const fileList = document.getElementById("FileList")
const fileItems = () => Array.from(document.querySelectorAll('.FileItem'))

let selectedIndex = 0
let anchorIndex = 0
let selectedSet = new Set()
let currentItems = []

document.getElementById('Minimize').addEventListener('click', () => {
    ipcRenderer.send('window-control', 'minimize')
})

document.getElementById('Maximize').addEventListener('click', () => {
    ipcRenderer.send('window-control', 'maximize')
})

document.getElementById('Close').addEventListener('click', () => {
    ipcRenderer.send('window-control', 'close')
})

ipcRenderer.on("set-accent-color", (_e, color) => {
    document.getElementById("WindowBorder").style.borderColor = color
})

document.addEventListener('keydown', (e) => {
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
        openItem(item)
        e.preventDefault()
    }
})

fileList.addEventListener("click", (e) => {
    if (e.ctrlKey || selectedSet.size === 0) return
    clearSelected()
})

async function loadDirectory(dir) {
    const result = await ipcRenderer.invoke("list-directory", dir)

    if (result.error) {
        fileList.innerText = result.error
        return
    }

    currentItems = result
    fileList.innerHTML = ""

    result.forEach((item, i) => {
        const el = document.createElement("div")
        el.className = "FileItem"

        el.textContent = item.isDirectory 
            ? `📁 ${item.name}` 
            : `📄 ${item.name}`

        el.addEventListener("click", (e) => {
            if (e.ctrlKey) toggleSelection(i)
            else clearSelected()
        })

        el.addEventListener("dblclick", (e) => {
            openItem(item)
        })

        fileList.appendChild(el)
    })

    clearSelection()
}

function openItem(item) {
    if (!item) return

    if (item.isDirectory) {
        loadDirectory(item.path)
    } else {
        ipcRenderer.invoke("open-file", item.path)
    }
}

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

    let newIndex = selectedIndex + dir
    newIndex = Math.max(0, Math.min(items.length - 1, newIndex))

    selectedIndex = newIndex

    if (ctrl) {
        clearSelection()

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

loadDirectory("C:\\")