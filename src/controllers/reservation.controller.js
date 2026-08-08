import {
    createReservation,
    getMyReservations,
    getEventReservations,
    cancelReservation
} from '../services/reservation.service.js'

export const createReservationHandler = async (req, res) => {
    try {
        const { quantity = 1 } = req.body
        const reservation = await createReservation(req.params.ied, quantity, req.user)
        res.status(201).json({ status: 'success', payload: reservation })
    } catch (error) {
        res.status(error.status || 500).json({ status: 'error', message: error.message })
    }
}

export const getMyReservationsHandler = async (req, res) => {
    try {
        const reservations = await getMyReservations(req.user.id)
        res.status(200).json({ status: 'success', payload: reservations })
    } catch (error) {
        res.status(error.status || 500).json({ status: 'error', message: error.message })
    }
}

export const getEventReservationsHandler = async (req, res) => {
    try {
        const reservations = await getEventReservations(req.params.ied, req.user)
        res.status(200).json({ status: 'success', payload: reservations })
    } catch (error) {
        res.status(error.status || 500).json({ status: 'error', message: error.message })
    }
}

export const cancelReservationHandler = async (req, res) => {
    try {
        const reservation = await cancelReservation(req.params.tid, req.user)
        res.status(200).json({ status: 'success', payload: reservation })
    } catch (error) {
        res.status(error.status || 500).json({ status: 'error', message: error.message })
    }
}