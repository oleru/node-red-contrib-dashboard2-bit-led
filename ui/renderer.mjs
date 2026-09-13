import core from '../lib/core.cjs'

export function createRenderer (config, paint, report = () => {}, scheduler = globalThis) {
    const states = new Array(config.count).fill(undefined)
    let frame = null
    let pending
    let disposed = false
    const start = config.diagnostics ? performance.now() : 0
    const stats = config.diagnostics ? { received: 0, renders: 0, changed: 0, coalesced: 0, invalid: 0, rate: 0, renderRate: 0 } : null
    return {
        receive (value) {
            if (disposed) return
            if (stats) stats.received++
            if (core.validate(value, config)) {
                if (stats) { stats.invalid++; report(stats) }
                return
            }
            pending = value
            if (frame !== null) { if (stats) stats.coalesced++; return }
            frame = scheduler.requestAnimationFrame(() => {
                frame = null
                if (stats) stats.renders++
                for (let i = 0; i < config.count; i++) {
                    if (config.indicators[i].hidden) continue
                    const state = core.decode(pending, config, i)
                    if (state !== states[i]) {
                        states[i] = state
                        paint(i, state, core.color(state, config.indicators[i]))
                        if (stats) stats.changed++
                    }
                }
                if (stats) {
                    const seconds = Math.max((performance.now() - start) / 1000, .001)
                    stats.rate = stats.received / seconds
                    stats.renderRate = stats.renders / seconds
                    report(stats)
                }
            })
        },
        dispose () {
            disposed = true
            if (frame !== null) scheduler.cancelAnimationFrame(frame)
            pending = undefined
            frame = null
        }
    }
}
