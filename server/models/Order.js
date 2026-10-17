import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  orderItems: [
    {
      name: { type: String, required: true },
      quantity: { type: Number, required: true },
      weight: { type: String, required: true },
      grind: { type: String, required: true },
      image: { type: String, required: true },
      price: { type: Number, required: true },
      product: {
        type: mongoose.Schema.Types.Mixed,
        required: false
      }
    }
  ],
  shippingAddress: {
    fullName: { type: String, required: true },
    email: { type: String },
    address: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: false, default: '1000' },
    country: { type: String, required: false, default: 'Ethiopia' },
    phone: { type: String, required: true }
  },
  userEmail: {
    type: String,
    required: false
  },
  orderRef: {
    type: String,
    required: false
  },
  paymentMethod: {
    type: String,
    required: true,
    default: 'Cash on Delivery'
  },
  paymentStatus: {
    type: String,
    default: 'Pending Verification'
  },
  transactionId: {
    type: String,
    required: false
  },
  chapaTxRef: {
    type: String,
    required: false
  },
  isPaid: {
    type: Boolean,
    required: true,
    default: false
  },
  paidAt: {
    type: Date
  },
  verifiedAt: {
    type: Date
  },
  verifiedBy: {
    type: String
  },
  isDelivered: {
    type: Boolean,
    required: true,
    default: false
  },
  deliveredAt: {
    type: Date
  }
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);
export default Order;
