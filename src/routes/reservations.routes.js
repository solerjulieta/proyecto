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
router.post('/events/:ied/tickets', passportAuth, createReservationHandler)

// Mis reservas
router.get('/my-tickets', passportAuth, getMyReservationsHandler)

// Ver reservas de un evento
router.get('/events/:ied/tickets', passportAuth, authorize('organizer', 'admin'), getEventReservationsHandler)

// Cancelar reserva
router.patch('/tickets/:tid/cancel', passportAuth, cancelReservationHandler)

export default router