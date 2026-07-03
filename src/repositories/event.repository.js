import EventDAO from '../dao/event.dao.js'

export default class EventRepository {
  constructor() {
    this.dao = new EventDAO()
  }

  async getAll() {
    return this.dao.getAll()
  }

  async getById(id){
    return this.dao.getById(id)
  }

  async create(data){
    return this.dao.create(data)
  }

  async update(id, data){
    return this.dao.update(id, data)
  }

  async delete(id){
    return this.dao.delete(id)
  }
}
