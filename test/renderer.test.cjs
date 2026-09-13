const { test } = require('node:test')
const assert = require('node:assert/strict')
const { configure } = require('../lib/core.cjs')

test('one pending frame, changed LEDs only, invalid retains last, cleanup', async () => {
    const { createRenderer } = await import('../ui/renderer.mjs')
    let callback, scheduled = 0, cancelled = 0
    const paints = [], reports = []
    const scheduler = { requestAnimationFrame: fn => { callback = fn; return ++scheduled }, cancelAnimationFrame: () => cancelled++ }
    const renderer = createRenderer(configure({ inputType: 'uint32', count: 32, diagnostics: true }), (...args) => paints.push(args), s => reports.push({ ...s }), scheduler)
    renderer.receive(0); renderer.receive(1); renderer.receive(2147483648)
    assert.equal(scheduled, 1)
    callback()
    assert.equal(paints.length, 32)
    assert.equal(paints[31][1], true)
    renderer.receive(2147483648); callback()
    assert.equal(paints.length, 32)
    renderer.receive(2147483649); renderer.receive(-1); callback()
    assert.equal(paints.length, 33)
    assert.equal(reports.at(-1).coalesced, 2)
    assert.equal(reports.at(-1).invalid, 1)
    renderer.receive(0); renderer.dispose()
    assert.equal(cancelled, 1)
})
