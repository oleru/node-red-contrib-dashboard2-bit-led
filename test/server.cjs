// Isolated local runtime; never reads the user's Node-RED configuration.
const fs = require('node:fs')
const path = require('node:path')
const http = require('node:http')
const express = require('express')
const RED = require('node-red')
const root = path.resolve(__dirname, '..')
const userDir = path.join(root, '.test-runtime')
fs.mkdirSync(userDir, { recursive: true })
fs.writeFileSync(path.join(userDir, 'package.json'), JSON.stringify({ name: 'bit-led-test', version: '1.0.0', dependencies: {} }))
const app = express()
const server = http.createServer(app)
RED.init(server, {
    userDir, nodesDir: process.env.BIT_LED_PACKAGE ? path.resolve(process.env.BIT_LED_PACKAGE) : root, flowFile: path.join(userDir, 'flows.json'),
    uiPort: 18890, httpAdminRoot: '/red', httpNodeRoot: '/',
    telemetry: { enabled: false, updateNotification: false },
    logging: { console: { level: 'warn' } }, editorTheme: { tours: false, projects: { enabled: false } }
})
app.use('/red', RED.httpAdmin)
app.use('/', RED.httpNode)
app.post('/test/input/:id', express.json(), (req, res) => {
    const node = RED.nodes.getNode(req.params.id)
    if (!node) return res.sendStatus(404)
    node.receive({ payload: req.body.payload, largeMetadata: 'not for transport' })
    res.sendStatus(204)
})
app.get('/test/ready', (req, res) => res.sendStatus(RED.nodes.getNode('led-uint32') ? 200 : 503))
app.post('/test/shutdown', (req, res) => { res.sendStatus(204); setImmediate(() => process.exit(0)) })
server.listen(18890, '127.0.0.1', async () => {
    await RED.start()
    const flow = JSON.parse(fs.readFileSync(path.join(root, 'examples/dashboard2-bit-led-flow.json')))
    flow.find(node => node.id === 'led-uint8').indicators[1].activeColor = 'rgb(var(--v-theme-primary))'
    for (const labelLayout of ['label-led', 'led-label', 'label-led-spread', 'led-label-spread']) {
        flow.push({ id: 'layout-' + labelLayout, type: 'ui-bit-led', z: 'led-flow', x: 750, y: 100, name: labelLayout, group: 'led-group', inputType: 'boolean', count: 1, width: 6, height: 0, layout: 'column', labelLayout, indicators: [{ label: 'Signal' }], wires: [] })
    }
    await RED.nodes.setFlows(flow, 'full')
})
async function close () { await RED.stop(); server.close(); process.exit(0) }
process.on('SIGTERM', close)
process.on('SIGINT', close)
