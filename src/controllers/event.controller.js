import { 
  getAllEvents,
  getEventById, 
  createEvent, 
  updateEvent,
  updateEventStatus, 
  deleteEvent 
} from '../services/event.services.js'
import SessionDAO from '../dao/session.dao.js'
const sessionDAO = new SessionDAO()

export const getEvents = async (req, res) => {
  try {
    const result = await getAllEvents(req.query)
    res.status(200).json({ status: 'success', ...result })
  } catch (error) {
    res.status(error.status || 500).json({ status: 'error', message: error.message })
  }
}

export const getEventByIdHandler = async (req, res) => {
  try {
    const event = await getEventById(req.params.id)
    res.status(200).json({ status: 'success', payload: event })
  } catch (error) {
    res.status(error.status || 500).json({ status: 'error', message: error.message })
  }
}

export const createEventHandler = async (req, res) => {
  try {
    const event = await createEvent(req.body, req.user.id)
    res.status(201).json({ status: 'success', payload: event })
  } catch (error) {
    res.status(error.status || 500).json({ status: 'error', message: error.message })
  }
}

export const updateEventHandler = async (req, res) => {
  try {
    const event = await updateEvent(req.params.id, req.body, req.user, req.event)
    res.status(200).json({ status: 'success', payload: event })
  } catch (error) {
    res.status(error.status || 500).json({ status: 'error', message: error.message })
  }
}

export const updateEventStatusHandler = async (req, res) => {
  try {
    const { status } = req.body
    const event = await updateEventStatus(req.params.id, status, req.user, req.event)
    res.status(200).json({ status: 'success', payload: event })
  } catch (error) {
    res.status(error.status || 500).json({ status: 'error', message: error.message })
  }
}

export const deleteEventHandler = async (req, res) => {
  try {
    await deleteEvent(req.params.id, req.user, req.event)
    res.status(200).json({ status: 'success', message: 'Evento eliminado correctamente.' })
  } catch (error) {
    res.status(error.status || 500).json({ status: 'error', message: error.message })
  }
}