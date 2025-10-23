import mongoose, { Schema, Model, Document } from 'mongoose';

interface IPayment extends Document {
  name: string;
  email: string;
  message: string;
  image?: {
    data: Buffer;
    contentType: string;
    filename: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>({
  name: {
    type: String,
    required: [true, 'Please provide a name.'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please provide an email.'],
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address'],
    trim: true,
    lowercase: true,
  },
  message: {
    type: String,
    required: [true, 'Please provide a message.'],
    trim: true,
  },
  image: {
    data: Buffer,
    contentType: String,
    filename: String,
  },
}, {
  timestamps: true
});

export default (mongoose.models.Payment as Model<IPayment>) ||
  mongoose.model<IPayment>('Payment', PaymentSchema);