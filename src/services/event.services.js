import EventRepository from '../repositories/event.repository.js'

const eventRepository = new EventRepository()

export const getAllEvents = async () => {
  return await eventRepository.getAll()
}

export const createEvent = async (data, organizerId) => {
  return await eventRepository.create({ ...data, organizer: organizerId })
}

export const updateEvent = async (id, data, user) => {
  const event = await eventRepository.getById(id)

  if(!event){
    throw { status: 404, message: 'Evento no encontrado.' }
  }

  if(user.role === 'organizer' && event.organizer.toString() !== user.id){
    throw { status: 403, message: 'No tenés permiso para modificar este evento.' }
  }

  return await eventRepository.update(id, data)
}

export const deleteEvent = async (id, user) => {
  const event = await eventRepository.getById(id)

  if(!event){
    throw { status: 404, message: 'Evento no encotrado.' }
  }

  if(user.role === 'organizer' && event.organizer.toString() !== user.id){
    throw { status: 403, message: 'No tenés permiso para cancelar este evento.' }
  }

  return await eventRepository.delete(id)
}