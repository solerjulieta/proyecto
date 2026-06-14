import { registerUser } from '../services/user.services.js'

export const register = async (req, res) => {
  try {
    const newUser = await registerUser(req.body)
    res.status(201).json({ status: 'success', payload: newUser })
  } catch (error) {
    const status = error.status || 500
    res.status(status).json({ status: 'error', message: error.message })
  }
}
/*
export const login = async (req, res) => {
  try {
    const user = await sessionService.loginUser(req.body)
    res
      .status(501)
      .json({ status: 'pending', message: 'Login no implementado aún.', payload: user })
  } catch (error) {
    console.error('Error en login:', error.message)
    res.status(500).json({ status: 'error', message: error.message })
  }
}
*/