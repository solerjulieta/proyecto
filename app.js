import express from 'express'
import http from 'http'

const app = express()
const server = http.createServer(app)

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const port = 8080

server.listen(port, () => {
    console.log(`Servidor iniciado http://localhost:${port}`)
})