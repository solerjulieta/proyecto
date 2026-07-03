import { Router } from 'express'
import { getEvents, createEventHandler, updateEventHandler, deleteEventHandler, getAllUsers } from '../controllers/event.controller.js'
import passport from 'passport'
import { authorize } from '../middlewares/authorize.middleware.js'

const router = Router()

router.get('/', getEvents)

router.post(
    'events',
    passport.authenticate('current', {
        session: false
    }),
    authorize('admin', 'organizer'),
    createEventHandler
)

router.put(
    '/:id', 
    passport.authenticate('current', {
        session: false
    }),
    authorize('admin', 'organizer'),
    updateEventHandler
)

router.delete(
    '/:id', 
    passport.authenticate('current', {
        session: false
    }),
    authorize('admin', 'organizer'),
    deleteEventHandler
)

router.get(
    '/admin/users', 
    passport.authenticate('current', {
        session: false
    }),
    authorize('admin'),
    getAllUsers
)

export default router
