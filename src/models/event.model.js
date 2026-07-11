import mongoose from 'mongoose'

const eventSchema = new mongoose.Schema(
    {
      title:       { type: String, required: true, trim: true },
      /*description: { type: String, required: true, trim: true },*/
      category:    { type: String, required: true, enum: ['boxeo', 'kickboxing', 'crossfit', 'funcional', 'yoga', 'natación'], trim: true },
      date:        { type: Date, required: true },
      duration:    { type: Number, required: true, min: 1 },
      location:    { type: String, required: true, trim: true },
      capacity:    { type: Number, required: true, min: 1 },
      /*price:       { type: Number, default: 0, min: 0 },*/
      status:      { type: String, enum: ['draft', 'published', 'cancelled', 'finished'], default: 'published' },
      organizer:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      enrollments: { type: Number, default: 0 }
    },
    { timestamps: true }
)

export default mongoose.model('Event', eventSchema)