const { performance } = require('node:perf_hooks')
const { configure, validate, decode } = require('../lib/core.cjs')
const config = configure({ inputType: 'uint32', count: 32 })
const iterations = 100000
let checksum = 0
const start = performance.now()
for (let i = 0; i < iterations; i++) {
    const value = i % 2 ? 4294967295 : 0
    if (validate(value, config)) throw new Error('Unexpected rejection')
    for (let bit = 0; bit < 32; bit++) checksum += Number(decode(value, config, bit))
}
const elapsedMs = performance.now() - start
console.log(JSON.stringify({ platform: process.platform, node: process.version, iterations, elapsedMs, updatesPerSecond: iterations / elapsedMs * 1000, checksum, note: 'Synthetic CPU microbenchmark, not Raspberry Pi, network or DOM performance.' }, null, 2))
