import User from '../models/user.model.js'

export default class SessionDAO {
  async findByEmail(email) {
    return await User.findOne({ email })
  }

  async create(userData) {
    return await User.create(userData)
  }

  async getAll(){
    return await User.find({}, { password: 0 })
  }
}
