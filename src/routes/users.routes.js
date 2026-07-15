import { Router } from 'express'
import passport from 'passport'
import { authorize } from '../middlewares/authorize.middleware'
import { getAllUsers } from '../controllers/user.controller'

const router = Router()

const passportAuth = passport.authenticate('current', { session: false })

router.get('/', passportAuth, authorize('admin'), getAllUsers)

export default router