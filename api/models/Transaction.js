import mongoose from 'mongoose';

const TransactionSchema = new mongoose.Schema({
  id:                { type: String, required: true, unique: true },
  invoiceNumber:     { type: String, required: true },
  storeId:           { type: String, required: true, index: true },
  timestamp:         { type: String, default: () => new Date().toISOString() },
  employeeId:        { type: String, default: '' },
  employeeName:      { type: String, default: '' },
  employeeRole:      { type: String, default: '' },
  tillId:            { type: String, default: 'Till-01' },
  items:             { type: Array, default: [] },
  itemCount:         { type: Number, default: 0 },
  subtotal:          { type: Number, default: 0 },
  tax:               { type: Number, default: 0 },
  discount:          { type: Number, default: 0 },
  discountAmount:    { type: Number, default: 0 },
  grandTotal:        { type: Number, default: 0 },
  amountPaid:        { type: Number, default: 0 },
  remainingBalance:  { type: Number, default: 0 },
  paymentMethod:     { type: String, default: 'CASH' },
  customer:          { type: Object, default: {} }
}, { timestamps: true });

export default mongoose.models.Transaction || mongoose.model('Transaction', TransactionSchema);
