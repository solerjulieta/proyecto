import Event from '../models/event.model.js'

export default class EventDAO {
  async getAll({ filter = {}, page = 1, limit = 10, sort = 'date' } = {}){
    const skip = (page - 1) * limit 

    const [data, total] = await Promise.all([
      Event.find(filter)
        .sort({ [sort]: 1 })
        .skip(skip)
        .limit(limit)
        .populate('organizer', 'first_name last_name email'),
      Event.countDocuments(filter)
    ])
    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  }

  async getById(id){
    return await Event.findById(id).populate('organizer', 'first_name last_name email')
  }

  async create(data){
    return await Event.create(data)
  }

  async update(id, data){
    return await Event.findByIdAndUpdate(id, data, { new: true, returnDocument: 'after' })
  }

  async delete(id){
    return await Event.findByIdAndDelete(id)
  }
}