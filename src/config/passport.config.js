import passport from 'passport'
import { Strategy as LocalStrategy } from 'passport-local'
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt'
import { JWT_SECRET } from './env.js'
import SessionService from '../services/session.services.js'

const sessionService = new SessionService()

passport.use('register', new LocalStrategy(
    {
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    },
    async (req, email, password, done) => {
        try {
            const { first_name, last_name } = req.body

            const newUser = await sessionService.registerUser({
                first_name,
                last_name,
                email,
                password
            })

            return done(null, newUser)
        } catch (error) {
            return done(null, false, { message: error.message, status: error.status || 500 })
        }
    }
))

passport.use('login', new LocalStrategy(
    {
        usernameField: 'email',
        passwordField: 'password'
    },
    async (email, password, done) => {
        try {
            const token = await sessionService.loginUser({ email, password })
            return done(null, { token })
        } catch (error) {
            return done(null, false, { message: error.message, status: error.status || 401 })
        }
    }
))

const cookieExtractor = (req) => {
    return req?.cookies?.currentUser || null
}

passport.use('current', new JwtStrategy(
    {
        jwtFromRequest: cookieExtractor,
        secretOrKey: JWT_SECRET
    },
    async (payload, done) => {
        try {
            return done(null, { id: payload.id, email: payload.email, role: payload.role })
        } catch (error) {
            return done(error, false)
        }
    }
))

export default passport
