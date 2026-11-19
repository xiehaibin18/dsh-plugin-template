const expected = '963452075e9d7e2a47a482f297143af5ed4f76c0'

if (Bun.revision !== expected) {
  throw new Error(`Expected Bun 1.4.4-canary.1 (${expected}); received ${Bun.revision}. See README.md.`)
}
