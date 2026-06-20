import SessionRepository from '../repositories/session.repository.js'
import { hashPassword, comparePassword } from '../utils/hash.js'
import { generateToken } from '../utils/jwt.js'

export default class SessionService 
{
  constructor() {
    this.repository = new SessionRepository()
  }

  async registerUser(userData) {
    const existingUser = await this.repository.findByEmail(userData.email)
    if (existingUser) {
      throw new Error('El usuario ya existe')
    }
    return this.repository.create(userData)
  }

  async loginUser({ email, password }) {
    if(!email || !password){
      throw { status: 400, message: 'El email y contraseña son obligatorios.' }
    }

    const normalizedEmail = email.trim().toLowerCase()

    const user = await this.repository.findByEmail(normalizedEmail)

    if(!user){
      throw { status: 401, message: 'Credenciales inválidas.' }
    }

    const isValidPassword = await comparePassword(password, user.password)

    if(!isValidPassword){
      throw { status: 401, message: 'Credenciales inválidas.' }
    }

    const token = generateToken({
      id: user._id,
      email: user.email,
      role: user.role
    })

    return token
  }
}