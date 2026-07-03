import Event from '../models/event.model.js'

export default class EventDAO {
  async getAll(){
    return await Event.find({ status: 'published' })
  }

  async getById(id){
    return await Event.findById(id)
  }

  async create(data){
    return await Event.create(data)
  }

  async update(id, data){
    return await Event.findByIdAndUpdate(id, data, { new: true })
  }

  async delete(id){
    return await Event.findByIdAndDelete(id)
  }
}