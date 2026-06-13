import express from 'express'
import healtRouter from './src/routes/health.routes.js'
import eventsRouter from './src/routes/events.routes.js'
import sessionsRouter from './src/routes/sessions.routes.js'

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/api/health', healtRouter)
app.use('/api/events', eventsRouter)
app.use('/api/sessions', sessionsRouter)

export default app