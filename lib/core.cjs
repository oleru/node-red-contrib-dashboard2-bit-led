'use strict'

const widths = { uint8: 8, uint16: 16, uint32: 32 }
const types = ['boolean', 'uint8', 'uint16', 'uint32', 'array', 'object']
const defaults = {
    activeColor: '#00c853',
    passiveColor: '#a8b5ac',
    disabledColor: 'rgba(var(--v-theme-on-surface), 0.12)'
}

function configure (config) {
    const inputType = config.inputType || 'uint8'
    const count = Number(config.count ?? 8)
    if (!types.includes(inputType)) throw new Error('Select an explicit input type')
    if (![1, 8, 16, 32].includes(count)) throw new Error('Indicator count must be 1, 8, 16 or 32')
    if (inputType === 'boolean' && count !== 1) throw new Error('Boolean input requires one indicator')
    if (widths[inputType] && count > widths[inputType]) throw new Error('Indicator count exceeds input bit width')
    const columns = Number(config.columns ?? 4)
    if (!Number.isInteger(columns) || columns < 1 || columns > 32) throw new Error('Columns must be 1–32')
    const layout = config.layout || 'grid'
    if (!['grid', 'column', 'row'].includes(layout)) throw new Error('Invalid layout')
    const labelLayout = config.labelLayout || 'led-label'
    if (!['label-led', 'led-label', 'label-led-spread', 'led-label-spread'].includes(labelLayout)) throw new Error('Invalid label layout')
    const indicators = Array.from({ length: count }, (_, index) => {
        const item = config.indicators?.[index] || {}
        const source = inputType === 'object' ? String(item.source ?? `bit${index}`) : Number(item.source ?? index)
        if (inputType === 'object') {
            if (!source) throw new Error(`Indicator ${index + 1}: input key is required`)
        } else if (!Number.isInteger(source) || source < 0 || source >= (widths[inputType] || count)) {
            throw new Error(`Indicator ${index + 1}: source is outside the input range`)
        }
        return {
            source,
            label: item.label ?? `Bit ${index}`,
            enabled: item.enabled !== false,
            inverted: typeof item.inverted === 'boolean' ? item.inverted : config.inverted === true,
            activeColor: item.activeColor || config.activeColor || defaults.activeColor,
            passiveColor: item.passiveColor || config.passiveColor || defaults.passiveColor,
            disabledColor: config.disabledColor || defaults.disabledColor,
            icon: item.icon || ''
        }
    })
    return { inputType, count, columns, layout, labelLayout, indicators, diagnostics: config.diagnostics === true }
}

// Strict validation: no truthiness conversion, numeric strings or signed wrapping.
function validate (value, config) {
    const type = config.inputType
    if (type === 'boolean') return typeof value === 'boolean' ? null : 'Expected boolean'
    if (widths[type]) {
        const max = 2 ** widths[type] - 1
        return Number.isInteger(value) && value >= 0 && value <= max ? null : `Expected ${type} integer (0–${max})`
    }
    if (type === 'array') {
        if (!Array.isArray(value) || value.length !== config.count) return `Expected boolean array of length ${config.count}`
        for (let i = 0; i < value.length; i++) if (typeof value[i] !== 'boolean') return `Array index ${i} must be boolean`
        return null
    }
    if (value === null || typeof value !== 'object' || Array.isArray(value)) return 'Expected named boolean object'
    for (const item of config.indicators) {
        if (!Object.hasOwn(value, item.source) || typeof value[item.source] !== 'boolean') return `Key "${item.source}" must be boolean`
    }
    return null
}

function decode (value, config, index) {
    const item = config.indicators[index]
    if (!item.enabled) return null
    const raw = config.inputType === 'boolean' ? value
        : widths[config.inputType] ? (((value >>> 0) >>> item.source) & 1) === 1
            : value[item.source]
    return item.inverted ? !raw : raw
}

function color (state, item) {
    return state === null ? item.disabledColor : state ? item.activeColor : item.passiveColor
}

module.exports = { configure, validate, decode, color, defaults }
