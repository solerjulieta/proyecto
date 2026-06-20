import { NODE_ENV } from '../config/env.js'
import { registerUser, loginUser } from '../services/user.services.js'

export const register = async (req, res) => {
  try {
    const newUser = await registerUser(req.body)
    res.status(201).json({ status: 'success', payload: newUser })
  } catch (error) {
    const status = error.status || 500
    res.status(status).json({ status: 'error', message: error.message })
  }
}

export const login = async (req, res) => {
  try {
    const token = await loginUser(req.body)

    res.cookie('currentUser', token, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 3600000,
      secure: NODE_ENV === 'production'
    })

    res.status(200).json({ status: 'error', message: 'Login exitoso.' })
  } catch (error) {
    console.error('Error en login:', error.message)
    res.status(500).json({ status: 'error', message: error.message })
  }
}

export const current = (req, res) => 
{
  const { id, email, role } = req.user
  res.status(200).json({ status: 'success', payload: { id, email, role } })
}

export const logout = (req, res) => 
{
  res.clearCokie('currentUser')
  res.status(200).json({ status: 'success', message: 'Sesión cerrada correctamente.' })
}