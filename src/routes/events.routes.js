import { Router } from 'express'
import { getEvents, createEventHandler, updateEventHandler, deleteEventHandler, getAllUsers } from '../controllers/event.controller.js'
import passport from 'passport'
import { authorize } from '../middlewares/authorize.middleware.js'
import { isEventOwnerOrAdmin } from '../middlewares/event.middleware.js'

const router = Router()

router.get('/', getEvents)

router.post(
    '/',
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
    isEventOwnerOrAdmin,
    updateEventHandler
)

router.delete(
    '/:id', 
    passport.authenticate('current', {
        session: false
    }),
    authorize('admin', 'organizer'),
    isEventOwnerOrAdmin,
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
