const fs = require('node:fs')
const flow = [
    { id: 'led-flow', type: 'tab', label: 'Bit LED examples' },
    { id: 'led-base', type: 'ui-base', name: 'Bit LED demo', path: '/ui', includeClientData: true, acceptsClientConfig: [], showPathInSidebar: false, navigationStyle: 'default', titleBarStyle: 'default' },
    { id: 'led-theme', type: 'ui-theme', name: 'Default', colors: { surface: '#ffffff', primary: '#00897b', bgPage: '#f1f5f9', groupBg: '#ffffff', groupOutline: '#cbd5e1' }, sizes: { density: 'default', pagePadding: '12px', groupGap: '12px', groupBorderRadius: '8px', widgetGap: '12px' } },
    { id: 'led-page', type: 'ui-page', name: 'Signals', ui: 'led-base', path: '/signals', icon: 'mdi-led-on', layout: 'grid', theme: 'led-theme', order: 1, breakpoints: [{ name: 'Default', px: '0', cols: '3' }, { name: 'Tablet', px: '576', cols: '6' }, { name: 'Desktop', px: '1024', cols: '12' }] },
    { id: 'other-page', type: 'ui-page', name: 'Other page', ui: 'led-base', path: '/other', icon: 'mdi-home', layout: 'grid', theme: 'led-theme', order: 2 },
    { id: 'led-group', type: 'ui-group', name: 'Status signals', page: 'led-page', width: '12', height: '1', order: 1, showTitle: true, groupType: 'default' }
]
for (const [index, [inputType, count, payload]] of [['boolean', 1, true], ['uint8', 8, 129], ['uint16', 16, 32769], ['uint32', 32, 2147483649], ['array', 8, [true, false, true, false, true, false, true, false]], ['object', 1, { Ready: true }]].entries()) {
    const id = `led-${inputType}`
    flow.push({ id, type: 'ui-bit-led', z: 'led-flow', name: inputType, group: 'led-group', order: index, width: 6, height: 0, inputType, count, columns: 4, layout: 'grid', indicators: inputType === 'object' ? [{ source: 'Ready', label: 'Ready', icon: 'mdi-check-circle' }] : [], x: 520, y: 80 + index * 70, wires: [] })
    flow.push({ id: `inject-${inputType}`, type: 'inject', z: 'led-flow', name: `Send ${inputType}`, props: [{ p: 'payload' }], payload: JSON.stringify(payload), payloadType: 'json', repeat: '', once: false, x: 210, y: 80 + index * 70, wires: [[id]] })
}
flow.push({ id: 'inject-10hz', type: 'inject', z: 'led-flow', name: '10 Hz synthetic (set repeat to 0.1s)', props: [{ p: 'payload' }], payload: '0', payloadType: 'num', repeat: '', once: false, x: 220, y: 550, wires: [['pattern-all-bits']] })
flow.push({ id: 'pattern-all-bits', type: 'function', z: 'led-flow', name: 'Toggle all 32 bits', func: 'const active = !context.get("active");\ncontext.set("active", active);\nreturn { payload: active ? 4294967295 : 0 };', outputs: 1, x: 510, y: 550, wires: [['led-uint32']] })
flow.find(node => node.id === 'led-uint8').indicators = [{ label: 'Bit 0' }, { label: 'Inverted', inverted: true }, { label: 'Disabled', enabled: false }, { label: 'Red override', activeColor: '#ff0000' }]
fs.mkdirSync('examples', { recursive: true })
fs.writeFileSync('examples/dashboard2-bit-led-flow.json', JSON.stringify(flow, null, 2) + '\n')
