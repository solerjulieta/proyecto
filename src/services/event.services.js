import EventRepository from '../repositories/event.repository.js'

const eventRepository = new EventRepository()

//Helpers de validación
const validateEventData = ({ title, description, category, date, location, capacity, price }) => {
  if(!title || !description || !category || !location){
    throw { status: 400, message: 'El título, la descripción, la categoría y la ubicación son obligatorias.' }
  }
  if(!date){
    throw { status: 400, message: 'La fecha del evento es obligatoria.' }
  }
  if(new Date(date) < new Date()){
    throw { status: 400, message: 'La fecha del evento no puede ser en el pasado.' }
  }
  if(!capacity || capacity <=0){
    throw { status: 400, message: 'La capacidad debe ser mayor a 0.' }
  }
  if(price === undefined || price === null || price < 0){
    throw { status: 400, message: 'El precio no puede ser negativo.' }
  }
}

// Servicios 
export const getAllEvents = async (query = {}) => {
  const { status, category, location, dateFrom, dateTo, page = 1, limit = 10, sort = 'date' } = query

  const filter = {}
  if (status) filter.status = status
  if (category) filter.category = { $regex: category, $options: 'i' }
  if (location) filter.location = { $regex: location, $options: 'i' }
  if (dateFrom || dateTo) {
    filter.date = {}
    if (dateFrom) filter.date.$gte = new Date(dateFrom)
      if (dateTo) filter.date.$lte = new Date(dateTo)
  }

  return await eventRepository.getAll({
    filter,
    page: parseInt(page),
    limit: parseInt(limit),
    sort
  })
}

export const getEventById = async (id) => {
  const event = await eventRepository.getById(id)
  if(!event) throw { status: 404, message: 'Evento no encontrado.' }
  return event
}

export const createEvent = async (data, organizerId) => {
  validateEventData(data)

  const { organizer, ...safeData } = data

  return await eventRepository.create({ ...safeData, organizer: organizerId })
}

export const updateEvent = async (id, data, user) => {
  const event = await eventRepository.getById(id)

  if(!event){
    throw { status: 404, message: 'Evento no encontrado.' }
  }

  //Evento cancelado no puede modificarse
  if(event.status === 'cancelled'){
    throw { status: 400, message: 'No se puede modificar un evento cancelado.' }
  }

  //Organizer solo puede modificar sus propios eventos
  if(user.role === 'organizer' && event.organizer.toString() !== user.id){
    throw { status: 403, message: 'No tenés permiso para modificar este evento.' }
  }

  //Si viene una nueva fecha la validamos
  if(data.date && new Date(data.date) < new Date()){
    throw { status: 400, message: 'La fecha del evento no puede ser en el pasado.' }
  }

  //No permitimos que se cambie el organizer desde el body
  delete data.organizer

  return await eventRepository.update(id, data)
}

export const updateEventStatus = async (id, status, user) => {
  const VALID_STATUSES = ['draft', 'published', 'cancelled', 'finished']

  if(!VALID_STATUSES.includes(status)){
    throw { status: 400, message: `Estado inválido. Valores posibles: ${VALID_STATUSES.join(', ')}.` }
  }

  const event = await eventRepository.getById(id)
  if(!event) throw { status: 404, message: 'Evento no encontrado.' }

  // Un evento cancelado no puede cambiar el estado
  if(event.status === 'cancelled'){
    throw { status: 400, message: 'No se puede modificar el estado de un evento cancelado.' }
  }

  //No se puede publicar un evento finalizado
  if(event.status === 'finished' && status === 'published'){
    throw { status: 400, message: 'No se puede publicar un evento ya finalizado.' }
  }

  if(user.role === 'organizer' && event.organizer._id.toString() !== user.id){
    throw { status: 403, message: 'No tenés permisos para modificar este evento.' }
  }

  return await eventRepository.update(id, { status })
}

export const deleteEvent = async (id, user) => {
  const event = await eventRepository.getById(id)

  if(!event){
    throw { status: 404, message: 'Evento no encotrado.' }
  }

  if(user.role === 'organizer' && event.organizer.toString() !== user.id){
    throw { status: 403, message: 'No tenés permiso para cancelar este evento.' }
  }

  return await eventRepository.update(id, { status: 'cancelled' })
}