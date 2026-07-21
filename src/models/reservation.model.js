import mongoose from 'mongoose'
import { randomUUID } from 'crypto'

const reservationSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
        status: { type: String, enum: ['active', 'cancelled', 'pending'], default: 'active' },
        quantity: { type: Number, default: 1, min: 1 },
        code: { type: String, default: () => randomUUID(), unique: true },
        cancelledAt: { type: Date, default: null }
    },
    { timestamps: true }
)

export default mongoose.model('Reservation', reservationSchema)