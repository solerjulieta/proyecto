import SessionDAO from '../dao/session.dao'

const sessionDAO = new SessionDAO()

export const getAllUsers = async (req, res) => {
    try {
        const users = await sessionDAO.getAll()
        res.status(200).json({ status: 'success', payload: users })
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message })
    }
}