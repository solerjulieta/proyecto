import { getAllEvents, createEvent, updateEvent, deleteEvent } from '../services/event.services.js'
import SessionDAO from '../dao/session.dao.js'
const sessionDAO = new SessionDAO()

export const getEvents = async (req, res) => {
  try {
    const { category, status, location } = req.query
    const filter = {}
    if(category) filter.category = category 
    const events = await getAllEvents()
    res.status(200).json({ status: 'success', payload: events })
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
    const event = await updateEvent(req.params.id, req.body, req.user)
    res.status(200).json({ status: 'success', payload: event })
  } catch (error) {
    res.status(error.status || 500).json({ status: 'error', message: error.message })
  }
}

export const deleteEventHandler = async (req, res) => {
  try {
    await deleteEvent(req.params.id, req.user)
    res.status(200).json({ status: 'success', message: 'Evento eliminado correctamente.' })
  } catch (error) {
    res.status(error.status || 500).json({ status: 'error', message: error.message })
  }
}

export const getAllUsers = async (req, res) => {
  try {
    const users = await sessionDAO.getAll()
    res.status(200).json({ status: 'success', payload: users })
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message })
  }
}