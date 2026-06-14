import User from '../models/user.model.js'

export default class UserRepository
{
    async findByEmail(email){
        return await User.findOne({ email })
    }

    async create(userData){
        return await User.create(userData)
    }
}

export const userRepository = new UserRepository() 