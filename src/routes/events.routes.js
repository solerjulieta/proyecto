import { Router } from 'express'
import { getEvents } from '../controllers/event.controller.js'
import passport from 'passport'
import { authorize } from '../middlewares/authorize.middleware.js'

const router = Router()

router.get('/', getEvents)
router.post(
    'events',
    passport.authenticate('current', {
        session: false
    }),
    authorize('admin', 'organizar'),
    createEvent
)

export default router
