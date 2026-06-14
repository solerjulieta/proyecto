import SessionRepository from '../repositories/session.repository.js'

export default class SessionService
{
    constructor(){
        this.repository = new SessionRepository()
    }

    async registerUser(userData){
        const existingUser = await this.repository.findByEmail(userData.email)
        if (existingUser) {
            throw new Error('El usuario ya existe')
        }
        return this.repository.create(userData)
    }

    async loginUser(credentials){
        const user = await this.repository.findByEmail(credentials.email)
        if (!user) {
            throw new Error('Credenciales inválidas')
        }
        return user
    }
}