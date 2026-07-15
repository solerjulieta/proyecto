import express from 'express'
import cookieParser from 'cookie-parser'
import passport from './src/config/passport.config.js'
import healtRouter from './src/routes/health.routes.js'
import eventsRouter from './src/routes/events.routes.js'
import sessionsRouter from './src/routes/sessions.routes.js'
import usersRouter from './src/routes/users.routes.js'

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(passport.initialize())

app.use('/api/health', healtRouter)
app.use('/api/events', eventsRouter)
app.use('/api/sessions', sessionsRouter)
app.use('/api/users', usersRouter)

export default app
