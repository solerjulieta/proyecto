import Reservation from '../models/reservation.model.js'

export default class ReservationDAO{
    async create(data){
        return await Reservation.create(data)
    }

    async findById(id){
        return await Reservation.findById(id)
    }

    async findByUserAndEvent(userId, eventId){
        return await Reservation.findOne({
            user: userId,
            event: eventId,
            status: { $ne: 'cancelled' }
        })
    }

    async findByUser(userId){
        return await Reservation.find({ event: eventId })
            .populate('event', 'title data location status category')
            .sort({ createdAt: -1 })
    }

    async findByEvent(eventId){
        return await Reservation.find({ event: eventId })
            .populate('user', 'first_name last_name email')
            .sort({ createdAt: -1 })
    }

    async update(id, data){
        return await Reservation.findByIdAndUpdate(id, data, { new: true })
    }
}