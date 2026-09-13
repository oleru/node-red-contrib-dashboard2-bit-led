const { test } = require('node:test')
const assert = require('node:assert/strict')
const { configure, validate, decode, color } = require('../lib/core.cjs')

test('hidden defaults off, is independent of enabled and keeps the input contract', () => {
    assert.equal(configure({}).indicators[0].hidden, false)
    const array = configure({ inputType: 'array', count: 8, indicators: [{ hidden: true, enabled: false }] })
    assert.equal(array.indicators[0].hidden, true)
    assert.equal(array.indicators[0].enabled, false)
    assert.equal(validate(Array(8).fill(true), array), null)
    assert.ok(validate(Array(7).fill(true), array))
    const object = configure({ inputType: 'object', count: 1, indicators: [{ source: 'hidden', hidden: true }] })
    assert.ok(validate({}, object))
    assert.equal(validate({ hidden: false }, object), null)
})

for (const [inputType, count] of [['uint8', 8], ['uint16', 16], ['uint32', 32]]) {
    const config = configure({ inputType, count })
    test(`${inputType}: unsigned limits and bit positions`, () => {
        for (const bit of [0, count - 1]) {
            assert.equal(validate(2 ** bit, config), null)
            for (let i = 0; i < count; i++) assert.equal(decode(2 ** bit, config, i), i === bit)
        }
        assert.equal(validate(2 ** count - 1, config), null)
        for (const bad of [null, undefined, -1, 1.5, NaN, Infinity, 2 ** count, '1', true, []]) assert.ok(validate(bad, config))
    })
}
test('boolean, inversion, disabled and color inheritance', () => {
    const config = configure({ inputType: 'boolean', count: 1, inverted: true, activeColor: 'red', indicators: [{ passiveColor: 'blue' }] })
    for (const value of [true, false]) assert.equal(validate(value, config), null)
    for (const value of [0, 1, 'false', null, {}]) assert.ok(validate(value, config))
    assert.equal(decode(false, config, 0), true)
    assert.equal(color(true, config.indicators[0]), 'red')
    assert.equal(color(false, config.indicators[0]), 'blue')
    config.indicators[0].inverted = false
    assert.equal(decode(false, config, 0), false)
    config.indicators[0].enabled = false
    assert.equal(decode(true, config, 0), null)
    assert.equal(color(null, config.indicators[0]), config.indicators[0].disabledColor)
})
for (const count of [1, 8, 16, 32]) {
    test(`array contract and mapping: ${count}`, () => {
        const config = configure({ inputType: 'array', count })
        assert.equal(validate(Array(count).fill(true), config), null)
        assert.ok(validate(Array(count + 1).fill(true), config))
        assert.ok(validate(Array(count - 1).fill(true), config))
        assert.ok(validate(Array(count), config))
        assert.ok(validate(Array(count).fill(1), config))
        assert.equal(decode(Array(count).fill(false), config, count - 1), false)
    })
}
test('objects require own boolean literal keys, allow extras, validate disabled', () => {
    const config = configure({ inputType: 'object', count: 1, indicators: [{ source: 'motor.ready', enabled: false }] })
    assert.equal(validate({ 'motor.ready': true, extra: 'ignored' }, config), null)
    for (const bad of [{}, null, [], { 'motor.ready': 1 }, Object.create({ 'motor.ready': true })]) assert.ok(validate(bad, config))
})
test('invalid configuration fails explicitly; per-LED normal overrides inverted default', () => {
    for (const config of [{ count: 7 }, { inputType: 'auto' }, { inputType: 'boolean', count: 8 }, { inputType: 'uint8', count: 32 }, { columns: 0 }, { indicators: [{ source: 8 }] }]) assert.throws(() => configure(config))
    assert.equal(configure({ inverted: true, indicators: [{ inverted: false }] }).indicators[0].inverted, false)
})
