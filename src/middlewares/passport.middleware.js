import passport from '../config/passport.config.js'

export const passportAuth = (strategyName) => (req, res, next) => {
  passport.authenticate(strategyName, { session: false }, (err, user, info) => {
    if (err) {
      return res.status(500).json({ status: 'error', message: err.message })
    }
    if (!user) {
      const status = info?.status || 401
      return res.status(status).json({ status: 'error', message: info?.message || 'No autorizado.' })
    }
    req.user = user
    next()
  })(req, res, next)
}