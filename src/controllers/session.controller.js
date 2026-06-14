import SessionService from '../services/session.services.js'

const sessionService = new SessionService()

export const register = async (req, res) => {
  try {
    const newUser = await sessionService.registerUser(req.body)
    res
      .status(501)
      .json({ status: 'pending', message: 'Registro no implementado aún.', payload: newUser })
  } catch (error) {
    console.error('Error en register:', error.message)
    res.status(500).json({ status: 'error', message: error.message })
  }
}

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
