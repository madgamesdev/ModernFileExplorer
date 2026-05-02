module.exports = {
    adjustColorBrightness,
    facilitateSize,
    normalizePath,
    detectOS
}

const path = require('path')
const fs = require('fs')
const os = require('os')

/**
 * 
 * @param {string} color Hex color (example: #9C2711)
 * @param {number} amount Brightness shift (-255 to 255)
 * @returns {string} Hex color with the brightness shift
 */

function adjustColorBrightness(color, amount){
    const hexWithoutHash = parseInt(color.replace('#', ''), 16)

    let r = (hexWithoutHash >> 16) + amount
    let g = ((hexWithoutHash >> 8) & 0x00FF) + amount
    let b = (hexWithoutHash & 0x0000FF) + amount

    r = Math.max(0, Math.min(255, r))
    g = Math.max(0, Math.min(255, g))
    b = Math.max(0, Math.min(255, b))

    return (
        '#' +
        r.toString(16).padStart(2, '0') +
        g.toString(16).padStart(2, '0') +
        b.toString(16).padStart(2, '0')
    )
}

/**
 * 
 * @param {number} bytes Bytes of let's say a file or a collection of files 
 * @returns {string} User-friendly file size
 */
function facilitateSize(bytes) {
    if (bytes === 0) return '0 B'

    const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))

    const size = bytes / Math.pow(1024, i)

    return `${size.toFixed(i === 0 ? 0 : 1)} ${units[i]}`
}

/**
 * 
 * @returns 0 if not Windows, 1 if Windows 10 or earlier and 2 if Windows 11 or later
 */
function detectOS() {
    if (process.platform !== 'win32') return 0

    const release = os.release()
    const build = parseInt(release.split('.')[2] || '0', 10)

    if (build >= 22000) return 2 // Windows 11
    return 1 // Windows 10 or earlier
}

/**
 * 
 * @param {string} input User input directory path
 * @returns A path that will not break the program
 */
function normalizePath(input) {
    if (!input) return input

    let p = input.trim()

    if (process.platform === 'win32') {
        p = p.replaceAll('/', '\\')

        if (/^[A-Za-z]:$/.test(p)) {
            p = p + '\\'
        }

        try {
            p = fs.realpathSync.native(p)
        } catch (e) {
            return null
        }

        if (/^[a-z]:/.test(p)) {
            p = p[0].toUpperCase() + p.slice(1)
        }
    }

    return p
}