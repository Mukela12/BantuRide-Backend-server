import mongoose from 'mongoose';

const Schema = mongoose.Schema;

// Define the Payment schema
const paymentSchema = new Schema({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed'],
    default: 'pending'
  },
  paymentType: {
    type: String,
    enum: ['cash'],
    default: 'cash'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create the Payment model
const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;
