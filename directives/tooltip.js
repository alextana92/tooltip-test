/* global config options */
const DISTANCE_FROM_ELEMENT = 10

const toggleTooltip = (tooltip, options, action) => {
    const currentStyle = tooltip.getAttribute('style')
    if (action === 'show') {
        tooltip.classList.add('tooltip-active')
        tooltip.setAttribute('style', buildTransitionStyles(options.transition, currentStyle))

        return
    }

    tooltip.style.opacity = '0'
}

const buildTransitionStyles = (transition, currentStyle) => {
    switch (transition) {
        case 'fade':
        return `${currentStyle}; opacity: 1;`
    }
}

const computeTooltipPosition = (element, tooltip, modifiers, options) => {
    // if we have multiple modifiers
    // we can ignore them, only use one
    const positions = {
        top: modifiers.top,
        right: modifiers.right,
        bottom: modifiers.bottom,
        left: modifiers.left
    }
    if (!Object.values(modifiers).some((el) => el)) {
        // default to bottom if no modifiers
        positions.bottom = true
    }

    // Get bounding client rect
    // and subtract window width / height
    // to get the offset relative to the right / bottom
    // without having to include the element's width/height
    // in calculations
    const o = element.getBoundingClientRect()
    const offsets = {
        top: o.top,
        right: window.innerWidth - o.right,
        bottom: window.innerHeight - o.bottom,
        left: o.left,
    }

    const dimensions = {
        element: {
            width: element.clientWidth,
            height: element.clientHeight,
        },
        tooltip: {
            width: tooltip.clientWidth,
            height: tooltip.clientHeight,
        }
    }

    const computeStyle = (x, y) => {
        const correction = maybeTweakPositioning(x, y)

        return `translate3d(
            ${x + correction.x}px,
            ${y + correction.y}px,
            0px
        )`
    }

    const maybeTweakPositioning = (tooltipX, tooltipY) => {
        // check if this would be out of bounds and correct it
        const windowX = window.innerWidth
        const windowY = window.innerHeight

        let correction = { x: 0, y: 0 }

        // Check if tooltip is out of bounds on the left or right
        if (tooltipX + dimensions.tooltip.width + options.margin > windowX) {
            correction.x = -((tooltipX + dimensions.tooltip.width - windowX) + options.margin)
        } else if (tooltipX - options.margin < 0) {
            correction.x = +(Math.abs(tooltipX) + options.margin)
        }

        // Check if tooltip is out of bounds at the bottom or top
        if (tooltipY + dimensions.tooltip.height + options.margin > windowY) {
            correction.y = windowY - (tooltipY + dimensions.tooltip.height + options.margin)
        } else if (tooltipY - options.margin < 0) {
            correction.y = -(tooltipY - options.margin)
        }

        return correction
    }

    const positionStyles = {
        top: computeStyle(offsets.left + (dimensions.element.width / 2 - dimensions.tooltip.width / 2), offsets.top - (dimensions.tooltip.height) - options.margin),
        right: computeStyle(offsets.left + dimensions.element.width + options.margin, offsets.top + (dimensions.element.height / 2 - dimensions.tooltip.height / 2)),
        bottom: computeStyle(offsets.left + (dimensions.element.width / 2 - dimensions.tooltip.width / 2), offsets.top + (dimensions.element.height) + options.margin),
        left: computeStyle(offsets.left - dimensions.tooltip.width - options.margin, offsets.top + (dimensions.element.height / 2 - dimensions.tooltip.height / 2))
    }

    const findSuitablePosition = (preferredPosition) => {
        const preferredOffset = offsets[preferredPosition]
        const tooltipWidth = dimensions.tooltip.width
        const tooltipHeight = dimensions.tooltip.height

        if (preferredOffset <= ((preferredPosition === 'top' || preferredPosition === 'bottom' ?
            tooltipHeight : tooltipWidth) + options.margin)) {

            // needs extra check to find out if out of bounds
            const suitable = Object.keys(offsets).reduce((a, b) => offsets[a] > offsets[b] ? a : b)

            // set dataset for easy css targeting
            tooltip.dataset.tooltipPlacement = suitable

            return positionStyles[suitable]
        }

        return positionStyles[preferredPosition]
    }

    const preferredPosition = Object.keys(modifiers)[0]

    tooltip.style.transform = findSuitablePosition(preferredPosition)

    // set dataset for easy css targeting
    tooltip.dataset.tooltipPlacement = preferredPosition
}


const parseMarginValue = (binding) => {
    // only used as pixel value, but accepts a string and parses it
    if (typeof binding === 'string') {
        return DISTANCE_FROM_ELEMENT.valueOf()
    }

    if (typeof binding.margin === 'string') {
        return Number(binding.margin.replace(/[^0-9]/g, ''))
    }

    return binding.margin
}

export const vTooltip = {
    mounted(el, binding) {
        if (!binding.value) {
            return
        }

        const tooltip = document.createElement('div')
        // base styles for the tooltip
        // TODO - make it a stylesheet file
        // and import a class
        tooltip.setAttribute(
            'style',
            `opacity: 0;
            max-width: max-content;
            padding: .4rem; .8rem;
            transition: .2s ease;
            position: absolute;
            left: 0;
            top: 0;
            pointer-events: none;`
        )

        tooltip.classList.add('tooltip')

        typeof binding.value === 'string' ?
            tooltip.innerText = binding.value :
            tooltip.innerText = binding.value.text

        // computed options to pass to the functions
        const options = {
            margin: binding.margin ? parseMarginValue(binding.value) : DISTANCE_FROM_ELEMENT,
            transition: binding.transition || 'fade'
        }

        document.body.appendChild(tooltip)

        // compute it once when mounted and set up a listener
        computeTooltipPosition(el, tooltip, binding.modifiers || null, options)
        window.addEventListener('resize', () => computeTooltipPosition(el, tooltip, binding.modifiers || null, options))

        el.addEventListener('mouseover', () => toggleTooltip(tooltip, options, 'show'))
        el.addEventListener('mouseleave', () => toggleTooltip(tooltip, options, 'hide'))
    },
    unMounted(el) {
        el.removeEventListener('mouseover', toggleTooltip)
        el.removeEventListener('mouseleave', toggleTooltip)
        window.removeEventListener('resize', computeTooltipPosition)

    },
}