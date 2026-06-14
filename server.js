import app from './app.js'
import { PORT } from './src/config/env.js'
import { connectDB } from './src/config/db.js'

connectDB()

app.listen(PORT, () => {
  console.log(`Servidor iniciado http://localhost:${PORT}`)
})
