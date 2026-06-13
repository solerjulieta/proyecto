import EventRepository from '../repositories/event.repository.js'

export default class EventService{
    constructor(){
        this.repository = new EventRepository()
    }

    async getAllEvents(){
        return this.repository.getAll()
    }
}