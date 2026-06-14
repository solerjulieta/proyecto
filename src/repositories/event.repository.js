import EventDAO from '../dao/event.dao.js'

export default class EventRepository {
  constructor() {
    this.dao = new EventDAO()
  }

  async getAll() {
    return this.dao.getAll()
  }
}
