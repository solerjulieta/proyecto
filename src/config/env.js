import { config } from 'dotenv'
config()

export const PORT = process.env.PORT || 8080
export const NODE_ENV = process.env.NODE_ENV || 'development'
export const MONGO_URL = process.env.MONGO_URL || ''
export const JWT_SECRET = process.env.JWT_SECRET || ''
