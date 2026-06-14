import mongoose from 'mongoose'
import { MONGO_URL } from './env.js'

export const connectDB = async () =>
{
    try {
        await mongoose.connect(MONGO_URL)
        console.log('MongoDB conectado')
    } catch (error) {
        console.error('Error al conectar a MongoDB', error.message)
        process.exit(1)
    }
}