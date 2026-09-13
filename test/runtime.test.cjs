const { test } = require('node:test')
const assert = require('node:assert/strict')
const { EventEmitter } = require('node:events')

test('runtime saves only compact valid payloads; invalid 10Hz stream is bounded', t => {
    let time = 0
    t.mock.method(Date, 'now', () => time)
    let Constructor, hooks, registered
    const warnings = [], statuses = [], saved = []
    const base = { stores: { data: { save: (...args) => saved.push(args[2]) } } }
    const group = { register: (node, config, events) => { hooks = events; registered = config }, getBase: () => base }
    require('../nodes/bit-led.js')({ nodes: {
        createNode (node) { Object.assign(node, new EventEmitter()); node.status = s => statuses.push(s); node.warn = w => warnings.push(w) },
        getNode: () => group,
        registerType: (type, ctor) => { Constructor = ctor }
    } })
    new Constructor({ inputType: 'uint32', count: 32 })
    assert.equal(registered.passthru, false)
    const good = hooks.beforeSend({ payload: 2147483648, secret: 'not transmitted', _client: { socketId: 'x' } })
    assert.deepEqual(good, { payload: 2147483648 })
    hooks.onInput(good)
    for (let i = 0; i < 600; i++) {
        time = i * 100
        const rejected = hooks.beforeSend({ payload: i % 2 ? -1 : null })
        // Mirror Dashboard's property checks before its truthiness check.
        assert.equal(Object.prototype.hasOwnProperty.call(rejected, 'enabled'), false)
        assert.equal(Boolean(rejected), false)
        hooks.onInput(rejected)
    }
    assert.equal(saved.length, 1)
    assert.equal(warnings.length, 12)
    assert.equal(statuses.at(-1).fill, 'red')
    hooks.beforeSend({ payload: 0 })
    assert.equal(statuses.at(-1).fill, 'green')
})
