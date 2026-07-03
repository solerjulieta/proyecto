import Event from '../models/event.model.js'

export const isEventOwnerOrAdmin = async (req, res, next) => 
{
    const { eventId } = req.params 

    const event = await Event.findById(eventId)

    if(!event){
        return res.status(404).json({
            status: 'error',
            message: 'Evento no encontrado.'
        })
    }

    const isAdmin = req.user.role === 'admin'
    const isOwner = event.organizer.toString() === req.user._id.toString()

    if(!isAdmin && !isOwner){
        return res.status(403).json({
            status: 'error',
            message: 'No tenés permisos para modificar este evento.'
        })
    }

    req.event = event

    next()
}