import SessionRepository from '../repositories/session.repository.js'
import { hashPassword, comparePassword } from '../utils/hash.js'
import { generateToken } from '../utils/jwt.js'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MIN_PASSWORD_LENGTH = 6

export default class SessionService 
{
  constructor() {
    this.repository = new SessionRepository()
  }

  async registerUser({ first_name, last_name, email, password }) {
    if(!first_name || !last_name || !email || !password){
      throw { status: 400, message: 'Todos los campos son obligatorios.' }
    }
    if (!EMAIL_REGEX.test(email)) {
      throw { status: 400, message: 'El formato del email es inválido.' }
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      throw { status: 400, message: `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.` }
    }

    const normalizedEmail = email.trim().toLowerCase()

    const existingUser = await this.repository.findByEmail(normalizedEmail)
    if (existingUser) {
      throw { status: 409, message: 'Ya existe un usuario registrado con este email.' }
    }

    const hashedPassword = await hashPassword(password)

    const newUser = await this.repository.create({
      first_name,
      last_name,
      email: normalizedEmail,
      password: hashedPassword,
      role: 'user'
    })

    return {
      _id: newUser._id,
      first_name: newUser.first_name,
      last_name: newUser.last_name,
      email: newUser.email,
      role: newUser.role
    }
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