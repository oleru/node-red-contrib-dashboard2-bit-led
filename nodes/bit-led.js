'use strict'
const { configure, validate } = require('../lib/core.cjs')

module.exports = function (RED) {
    function BitLedNode (config) {
        RED.nodes.createNode(this, config)
        const node = this
        const group = RED.nodes.getNode(config.group)
        let settings
        try {
            settings = configure(config)
            if (!group) throw new Error('Dashboard 2 group is required')
        } catch (error) {
            node.status({ fill: 'red', shape: 'ring', text: error.message })
            node.error(error.message)
            return
        }
        const normal = `${settings.inputType} · ${settings.count} LEDs`
        let statusText
        let lastWarning = -Infinity
        let invalid = 0
        function status (text, fill) {
            if (statusText === text) return
            statusText = text
            node.status({ fill, shape: 'dot', text })
        }
        status(`${normal} · waiting`, 'grey')
        group.register(node, { ...config, ...settings, passthru: false }, {
            beforeSend (msg) {
                const error = validate(msg.payload, settings)
                if (error) {
                    invalid++
                    status(`${normal} · ${error}`, 'red')
                    const now = Date.now()
                    // Global bound also prevents alternating errors from flooding the log.
                    if (now - lastWarning >= 5000) {
                        node.warn(`${error} (${invalid} invalid payloads since deploy)`)
                        lastWarning = now
                    }
                    // Dashboard 1.31 inspects properties before checking truthiness.
                    // false safely suppresses transport; null throws in its hasProperty.
                    return false
                }
                status(normal, 'green')
                // Do not forward arbitrary message metadata, UI controls or client targeting.
                return { payload: msg.payload }
            },
            onInput (msg) {
                if (msg) group.getBase().stores.data.save(group.getBase(), node, msg)
            }
        })
    }
    RED.nodes.registerType('ui-bit-led', BitLedNode)
}
