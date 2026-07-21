import mongoose from 'mongoose'

const reservationSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
        status: { type: String, enum: ['active', 'cancelled', 'used', 'expired'], default: 'active' },
        quantity: { type: Number, default: 1, max: 1 },
        code: { type: String, unique: true },
        createdAt: { type: Date, default: null }
    },
    { timestamps: true }
)

export default mongoose.model('Reservation', reservationSchema)