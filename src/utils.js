module.exports = {
    adjustColorBrightness
}

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