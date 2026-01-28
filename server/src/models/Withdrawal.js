import mongoose from 'mongoose';

const withdrawalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    bankAccount: {
      accountNumber: String,
      accountHolder: String,
      bankName: String,
      ifscCode: String,
    },
    upiId: String,
    paymentMethod: {
      type: String,
      enum: ['bank_transfer', 'upi'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
      default: 'pending',
    },
    notes: String,
    processedAt: Date,
  },
  { timestamps: true }
);

export default mongoose.model('Withdrawal', withdrawalSchema);
