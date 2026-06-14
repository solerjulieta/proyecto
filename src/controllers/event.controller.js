import EventService from '../services/event.services.js'

const eventService = new EventService()

export const getEvents = async (req, res) => {
  try {
    const events = await eventService.getAllEvents()
    res.status(200).json({ status: 'success', payload: events })
  } catch (error) {
    console.error('Error en getEvents', error.message)
    res.status(500).json({ status: 'error', message: 'Error al obtener los eventos' })
  }
}
