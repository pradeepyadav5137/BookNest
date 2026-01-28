import mongoose from 'mongoose';

const purchaseSchema = new mongoose.Schema(
  {
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ['razorpay', 'wallet'],
      required: true,
    },
    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String,
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'cancelled'],
      default: 'pending',
    },
    pdfDelivered: {
      type: Boolean,
      default: false,
    },
    pdfDeliveryAttempts: {
      type: Number,
      default: 0,
    },
    lastDeliveryAttempt: Date,
  },
  { timestamps: true }
);

export default mongoose.model('Purchase', purchaseSchema);
