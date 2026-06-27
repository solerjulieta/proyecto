import { NODE_ENV } from '../config/env.js'

export const register = async (req, res) => {
  res.status(201).json({ status: 'success', payload: req.user })
}

export const login = async (req, res) => {
  const token = req.user

  res.cookie('currentUser', token, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 3600000,
    secure: NODE_ENV === 'production'
  })

  res.status(200).json({ status: 'success', message: 'Login exitoso.' })
}

export const current = (req, res) => 
{
  const { id, email, role } = req.user
  res.status(200).json({ status: 'success', payload: { id, email, role } })
}

export const logout = (req, res) => 
{
  res.clearCookie('currentUser')
  res.status(200).json({ status: 'success', message: 'Sesión cerrada correctamente.' })
}