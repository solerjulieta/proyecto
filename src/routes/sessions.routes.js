import { Router } from 'express'
import { register, login, current, logout } from '../controllers/session.controller.js'
import passport from '../config/passport.config.js'

const router = Router()

router.post('/register',
    passport.authenticate('register', { session: false }),
    register
)

router.post('/login',
    passport.authenticate('login',  { session: false }), 
    login
)

router.get('/current', 
    passport.authenticate('current', { session: false }), 
    current
)

router.post('/logout', logout)

export default router
