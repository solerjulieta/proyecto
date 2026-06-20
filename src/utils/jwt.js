import jwt from 'jsonwebtoken'
import { JWT_SECRET, JWT_EXPIRES_IN } from '../config/env.js'

// Genera token con los datos mínimos del usuario
export const generateToken = (payload) => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

// Verifica que el token sea válido y no esté expirado
export const verifyToken = (token) => {
    return jwt.verify(token, JWT_SECRET)
}