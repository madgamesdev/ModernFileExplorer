const state = require('./state')
const { getUI } = require('./ui')

function getFileItems() {
    const ui = getUI()
    return ui.fileItems()
}

function clearSelected() {
    state.selectedSet.clear()
    state.selectedIndex = -1
    renderSelection()
}

function selectSingle(index) {
    state.selectedSet.clear()
    state.selectedSet.add(index)
    state.anchorIndex = index
    state.selectedIndex = index
    renderSelection()
}

function toggleSelection(index) {
    if (state.selectedSet.has(index)) {
        state.selectedSet.delete(index)
    } else {
        state.selectedSet.add(index)
        state.anchorIndex = index
    }

    state.selectedIndex = index
    renderSelection()
}

function changeSelectionArea(dir, ctrl) {
    const items = getFileItems()
    if (!items.length) return

    if (state.selectedIndex === -1) state.selectedIndex = 0

    let newIndex = Math.max(
        0,
        Math.min(items.length - 1, state.selectedIndex + dir)
    )

    state.selectedIndex = newIndex

    if (ctrl) {
        state.selectedSet.clear()

        const start = Math.min(state.anchorIndex, state.selectedIndex)
        const end = Math.max(state.anchorIndex, state.selectedIndex)

        for (let i = start; i <= end; i++) {
            state.selectedSet.add(i)
        }
    } else {
        selectSingle(state.selectedIndex)
    }

    renderSelection()
}

function renderSelection() {
    const items = getFileItems()

    items.forEach((el, i) => {
        el.classList.toggle('selected', state.selectedSet.has(i))
    })

    items[state.selectedIndex]?.scrollIntoView({
        block: 'nearest'
    })
}

module.exports = {
    clearSelected,
    selectSingle,
    toggleSelection,
    changeSelectionArea,
    renderSelection
}