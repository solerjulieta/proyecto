import { Router } from 'express'
import passport from 'passport'
import { authorize } from '../middlewares/authorize.middleware.js'
import {
    createReservationHandler,
    getMyReservationsHandler,
    getEventReservationsHandler,
    cancelReservationHandler
} from '../controllers/reservation.controller.js'

const router = Router()
const passportAuth = passport.authenticate('current', { session: false })

// Crear reserva a un evento
router.post('/events/:ied/reservations', passportAuth, createReservationHandler)

// Mis reservas
router.get('/my-reservations', passportAuth, getMyReservationsHandler)

// Ver reservas de un evento
router.get('/events/:eid/reservations', passportAuth, authorize('organizer', 'admin'), getEventReservationsHandler)

// Cancelar reserva
router.patch('/reservations/:rid/cancel', passportAuth, cancelReservationHandler)

export default router