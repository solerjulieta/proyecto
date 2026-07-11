import { Router } from 'express'
import { 
    getEvents, 
    getEventByIdHandler,
    createEventHandler, 
    updateEventHandler,
    updateEventStatusHandler, 
    deleteEventHandler, 
    getAllUsers 
} from '../controllers/event.controller.js'
import passport from 'passport'
import { authorize } from '../middlewares/authorize.middleware.js'
import { isEventOwnerOrAdmin } from '../middlewares/event.middleware.js'

const router = Router()

const passportAuth = passport.authenticate('current', { session: false })

router.get('/', getEvents)
router.get('/:id', getEventByIdHandler)

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
    passportAuth,
    authorize('admin', 'organizer'),
    isEventOwnerOrAdmin,
    updateEventHandler
)

router.patch(
    '/:id/status',
    passportAuth,
    authorize('admin', 'organizer'),
    updateEventStatusHandler
)

router.delete(
    '/:id', 
    passportAuth,
    authorize('admin', 'organizer'),
    isEventOwnerOrAdmin,
    deleteEventHandler
)

router.get(
    '/admin/users', 
    passportAuth,
    authorize('admin'),
    getAllUsers
)

export default router
