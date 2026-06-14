import { test } from 'node:test'
import assert from 'node:assert'
import app from '../../app.js'

test('GET /api/health responde 200 con status success', async () => {
  const server = app.listen(0)
  const { port } = server.address()

  const response = await fetch(`http://localhost:${port}/api/health`)
  const body = await response.json()

  assert.strictEqual(response.status, 200)
  assert.strictEqual(body.status, 'success')

  server.close()
})
