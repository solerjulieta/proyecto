import { NODE_ENV } from '../config/env.js'
import { CurrentUserDTO } from '../dto/current-user.dto.js'

export const register = async (req, res) => {
  const userDTO = new CurrentUserDTO(req.user)
  res.status(201).json({ status: 'success', payload: userDTO })
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
  const userDTO = new CurrentUserDTO(req.user)
  res.status(200).json({ status: 'success', payload: userDTO })
}

export const logout = (req, res) => 
{
  res.clearCookie('currentUser')
  res.status(200).json({ status: 'success', message: 'Sesión cerrada correctamente.' })
}