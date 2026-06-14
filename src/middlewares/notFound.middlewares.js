export const notFoundHandler = (req, res) => {
  res.status(404).json({ status: 'error', message: 'Ruta no encontrada.' })
}
