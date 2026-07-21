import ReservationDAO from '../dao/reservation.dao.js'

export default class ReservationRepository{
    constructor(){
        this.dao = new ReservationDAO()
    }

    async create(data){
        return this.dao.create(data)
    }

    async findById(id){
        return this.dao.findById(id)
    }

    async findByUserAndEvent(userId, eventId){
        return this.dao.findByUserAndEvent(userId, eventId)
    }

    async countActiveByEvent(eventId){
        return this.dao.countActiveByEvent(eventId)
    }

    async findByUser(userId){
        return this.dao.findByUser(userId)
    }

    async findByEvent(eventId){
        return this.dao.findByEvent(eventId)
    }

    async update(id, data){
        return this.dao.update(id, data)
    }
}