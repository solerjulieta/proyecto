import ReservationRepository from '../repositories/reservation.repository.js'
import EventRepository from '../repositories/event.repository.js'
import { sendReservationConfirmation } from '../utils/mailer.js'
import { useReducer } from 'react'

const reservationRepository = new ReservationRepository()
const eventRepository = new EventRepository()

export const createReservation = async (eventId, user) => {
    //Verifico si el evento existe
    const event = await eventRepository.getById(eventId)
    if(!event) throw { status: 404, message: 'El evento no existe.' }

    //Verifico si el evento está publicado
    if(event.status !== 'active'){
        throw { status: 400, message: `No se puede reservar un evento con estado "${event.status}".` }
    }

    //El usuario solo puede reservar una vez
    const existingReservation = await reservaationRepository.findByUserAndEvent(user.id, eventId)
    if(existingReservation){
        throw { status: 409, message: 'Ya tenés una reserva para esta clase.' }
    }

    //Cupos disponibles (solo cuentan reservas no canceladas)
    const occupiedSpots = await reservationRepository.countActiveByEvent(eventId)
    const availableSpots = event.capacity - occupiedSpots

    if(availableSpots < 1){
        throw { status: 400, message: 'No hay cupos disponibles para esta clase.' }
    }

    const reservation = await reservationRepository.create({
        user: user.id,
        event: eventId,
        quantity: 1
    })

    sendReservationConfirmation({
        to: user.email,
        firstName: user.first_name ||'Alumno',
        eventTitle: event.title,
        eventDate: event.date,
        eventLocation: event.location,
        reservationCode: reservation.code
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
    if(user.role !== 'admin' && reservation.user._id.toString !== user.id){
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