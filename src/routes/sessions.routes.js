import { Router } from 'express'
import { register, login, current, logout } from '../controllers/session.controller.js'
import { passportAuth } from '../middlewares/passport.middleware.js'

const router = Router()

router.post('/register', passportAuth('register'), register)
router.post('/login', passportAuth('login'), login)
router.get('/current',passportAuth('current'), current)
router.post('/logout', logout)

export default router
