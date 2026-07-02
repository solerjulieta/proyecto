import { Router } from 'express'
import { getEvents } from '../controllers/event.controller.js'
import passport from 'passport'
import { authorizeRoles } from '../middlewares/authorizeRoles.middleware.js'

const router = Router()

router.get('/', getEvents)
router.post(
    'events',
    passport.authenticate('current', {
        session: false
    }),
    authorizeRoles('admin', 'organizar'),
    createEvent
)

export default router
