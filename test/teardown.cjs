module.exports = async () => {
    // Explicit shutdown also handles Windows shell process trees reliably.
    try { await fetch('http://127.0.0.1:18890/test/shutdown', { method: 'POST' }) } catch {}
}
