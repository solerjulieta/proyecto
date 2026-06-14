import SessionDAO from '../dao/session.dao.js'

export default class SessionRepository {
  constructor() {
    this.dao = new SessionDAO()
  }

  async findByEmail(email) {
    return this.dao.findByEmail(email)
  }

  async create(userData) {
    return this.dao.create(userData)
  }
}
