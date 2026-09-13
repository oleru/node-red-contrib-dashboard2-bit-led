<template>
    <div class="bit-led-widget">
        <div class="bit-led-list" :class="'bit-led-' + config.layout" :style="{ '--bit-led-columns': config.columns }" role="list" :aria-label="props.name || 'Bit indicators'">
            <div v-for="(item, index) in config.indicators" :key="index" class="bit-led-item" :class="['bit-led-position-' + config.labelLayout, { 'bit-led-disabled': !item.enabled }]" role="listitem">
                <span :ref="element => lamps[index] = element" class="bit-led-lamp" :class="{ 'bit-led-round': !item.icon }" :style="{ color: item.disabledColor, backgroundColor: item.icon ? 'transparent' : item.disabledColor }" role="img" :aria-label="item.label + ': ' + (item.enabled ? 'Waiting for data' : 'Disabled')">
                    <v-icon v-if="item.icon" :icon="item.icon" size="20" />
                </span>
                <span class="bit-led-label">{{ item.label }}</span>
            </div>
        </div>
        <output v-if="config.diagnostics" ref="diagnostics" class="bit-led-diagnostics" />
    </div>
</template>

<script>
import core from '../lib/core.cjs'
import { createRenderer } from './renderer.mjs'

export default {
    name: 'BitLed',
    inject: ['$dataTracker'],
    props: ['id', 'props', 'state'],
    data () { return { config: core.configure(this.props), lamps: [] } },
    created () {
        this.renderer = createRenderer(this.config, (index, value, paint) => {
            const lamp = this.lamps[index]
            if (!lamp) return
            const item = this.config.indicators[index]
            lamp.style.color = paint
            if (!item.icon) lamp.style.backgroundColor = paint
            lamp.setAttribute('aria-label', `${item.label}: ${value === null ? 'Disabled' : value ? 'Active' : 'Inactive'}`)
            lamp.dataset.state = value === null ? 'disabled' : value ? 'active' : 'inactive'
        }, stats => {
            if (this.$refs.diagnostics) this.$refs.diagnostics.textContent = `${stats.received} received · ${stats.renders} renders · ${stats.changed} LED changes · ${stats.coalesced} coalesced · ${stats.invalid} invalid · ${stats.rate.toFixed(1)} msg/s · ${stats.renderRate.toFixed(1)} renders/s`
        })
        const receive = msg => { if (msg && Object.hasOwn(msg, 'payload')) this.renderer.receive(msg.payload) }
        this.$dataTracker(this.id, receive, receive)
    },
    beforeUnmount () { this.renderer.dispose() }
}
</script>

<style scoped>
.bit-led-widget { padding: 8px; min-width: 0; }
.bit-led-list { display: grid; gap: 10px 16px; grid-template-columns: repeat(var(--bit-led-columns), minmax(0, 1fr)); }
.bit-led-column { grid-template-columns: minmax(0, 1fr); }
.bit-led-row { display: flex; flex-wrap: wrap; }
.bit-led-item { display: flex; align-items: center; gap: 9px; min-width: 0; }
.bit-led-position-label-led, .bit-led-position-label-led-spread { flex-direction: row-reverse; }
.bit-led-position-label-led { justify-content: flex-end; }
.bit-led-position-label-led-spread, .bit-led-position-led-label-spread { justify-content: space-between; }
.bit-led-row > .bit-led-position-label-led-spread, .bit-led-row > .bit-led-position-led-label-spread { flex: 1 1 140px; }
.bit-led-disabled { opacity: .45; }
.bit-led-lamp { width: 20px; height: 20px; flex: 0 0 20px; display: inline-flex; align-items: center; justify-content: center; }
.bit-led-round { border-radius: 50%; box-shadow: inset 0 0 0 1px rgba(var(--v-theme-on-surface), .15); }
.bit-led-lamp[data-state="active"] { filter: drop-shadow(0 0 3px currentColor); }
.bit-led-label { overflow-wrap: anywhere; line-height: 1.35; }
.bit-led-diagnostics { display: block; margin-top: 12px; font-size: 11px; opacity: .7; }
@media (max-width: 600px) { .bit-led-grid { grid-template-columns: repeat(min(2, var(--bit-led-columns)), minmax(0, 1fr)); } }
</style>
