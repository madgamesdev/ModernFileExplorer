class Tooltip {
    constructor() {
        this.tooltip = document.getElementById('tooltip')
        this.hoverTimeouts = new WeakMap()

        if (!this.tooltip) console.error('Tooltip element missing in HTML')
    }

    followPointer(e) {
        if (!this.tooltip) return

        this.tooltip.style.left = `${e.pageX + 10}px`
        this.tooltip.style.top = `${e.pageY - 20}px`
    }

    attach(el, text) {
        if (!el) return

        el.addEventListener('mouseenter', (e) => {
            const timeout = setTimeout(() => {
                if (!this.tooltip) return

                this.tooltip.textContent = text
                this.tooltip.style.opacity = '1'
            }, 1000) // <------ delay

            this.hoverTimeouts.set(el, timeout)
        })

        el.addEventListener('mouseleave', () => {
            const timeout = this.hoverTimeouts.get(el)
            clearTimeout(timeout)

            this.hoverTimeouts.delete(el)
            
            if (this.tooltip) this.tooltip.style.opacity = '0'
        })

        el.addEventListener('mousemove', (e) => {
            if (!this.tooltip) return

            this.followPointer(e)
        })
    }
}

module.exports = new Tooltip()