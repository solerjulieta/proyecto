import ReservationRepository from '../repositories/reservation.repository.js'
import EventRepository from '../repositories/event.repository.js'
import { sendReservationConfirmation } from '../utils/mailer.js'

const reservationRepository = new ReservationRepository()
const eventRepository = new EventRepository()

export const createReservation = async (eventId, quantity = 1, user) => {
    //Verifico si el evento existe
    const event = await eventRepository.getById(eventId)
    if(!event) throw { status: 404, message: 'El evento no existe.' }

    //Verifico si el evento está publicado
    if(event.status !== 'published'){
        throw { status: 400, message: `No se puede reservar un evento con estado "${event.status}".` }
    }

    //Evento no vencido - verificamos fecha y hora
    if (new Date(event.date) < new Date()){
        throw { status: 400, message: 'No se puede reservar un evento que ya pasó.' }
    }

    //Validar cantidad
    if(!quantity || quantity < 1 || quantity > 4){
        throw { status: 400, message: 'Podés reservar entre 1 y 4 entradas por compra.' }
    }

    //Reserva duplicada activa
    const existingReservation = await reservationRepository.findByUserAndEvent(user.id, eventId)
    if (existingReservation) {
        throw { status: 409, message: 'Ya tenés una inscripción activa a este evento.' }
    }

    //Cupos disponibles (solo cuentan reservas no canceladas)
    const occupiedSpots = await reservationRepository.countActiveByEvent(eventId)
    const availableSpots = event.capacity - occupiedSpots

    if (availableSpots < quantity) {
        throw {
        status: 400,
        message: availableSpots === 0
            ? 'No hay cupos disponibles para este evento.'
            : `Solo quedan ${availableSpots} cupos disponibles.`
        }
    }

    const reservation = await reservationRepository.create({
        user: user.id,
        event: eventId,
        quantity
    })

    sendReservationConfirmation({
        to: user.email,
        firstName: user.first_name ||'Usuario',
        eventTitle: event.title,
        eventDate: event.date,
        eventLocation: event.location,
        reservationCode: reservation.reservationCode
    }).catch(err => console.error('Error al enviar email:', err.message))

    return reservation
}

export const getMyReservations = async (userId) => {
    return await reservationRepository.findByUser(userId)
}

export const getEventReservations = async (eventId, user) => {
    const event = await eventRepository.getById(eventId)
    if(!event) throw { status: 404, message: 'El evento no existe.' }

    //El organizador solo puede ver las reservas de sus propios eventos.
    if(user.role === 'organizer' && event.organizer._id.toString() !== user.id){
        throw { status: 403, message: 'No tenés permisos para ver las reservas de este evento.' }
    }

    return await reservationRepository.findByEvent(eventId)
}

export const cancelReservation = async (reservationId, user) => {
    const reservation = await reservationRepository.findById(reservationId)
    if(!reservation) throw { status: 404, message: 'Reserva no encontrada.' }

    //Solo el dueño o admin puede cancelar
    if(user.role !== 'admin' && reservation.user._id.toString() !== user.id){
        throw { status: 403, message: 'No tenés permisos para cancelar esta reserva.' }
    }

    //No cancelar una reserva ya cancelada
    if(reservation.status === 'cancelled'){
        throw { status: 400, message: 'La reserva ya está cancelada.' }
    }

    return await reservationRepository.update(reservationId, {
        status: 'cancelled',
        cancelledAt: new Date()
    })
}