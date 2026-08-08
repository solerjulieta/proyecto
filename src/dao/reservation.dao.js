import Reservation from '../models/reservation.model.js'
import mongoose from 'mongoose'

export default class ReservationDAO {

    async create(data) {
        return await Reservation.create(data)
    }

    async findById(id) {
        return await Reservation.findById(id)
    }

    async findByUserAndEvent(userId, eventId) {
        return await Reservation.findOne({
            user: userId,
            event: eventId,
            status: { $ne: 'cancelled' }
        })
    }

    async findByUser(userId) {
        return await Reservation.find({ user: userId })
            .populate('event', 'title date location status category')
            .sort({ createdAt: -1 })
    }

    async findByEvent(eventId) {
        return await Reservation.find({ event: eventId })
            .populate('user', 'first_name last_name email')
            .sort({ createdAt: -1 })
    }

    async update(id, data) {
        return await Reservation.findByIdAndUpdate(id, data, { new: true })
    }

    async countActiveByEvent(eventId) {
        const result = await Reservation.aggregate([
            {
                $match: {
                    event: new mongoose.Types.ObjectId(eventId),
                    status: { $ne: 'cancelled' }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$quantity' }
                }
            }
        ])
        console.log('aggregate result:', result)
        return result[0]?.total || 0
    }
}