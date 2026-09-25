import mongoose from 'mongoose';

const StoreSchema = new mongoose.Schema({
  storeId:       { type: String, required: true, unique: true },
  storeName:     { type: String, required: true },
  businessType:  { type: String, default: 'GENERAL' },
  ownerName:     { type: String, default: '' },
  ownerEmail:    { type: String, default: '' },
  phone:         { type: String, default: '' },
  address:       { type: String, default: '' },
  currency:      { type: String, default: 'PKR' },
  currencySymbol:{ type: String, default: '₨' },
  taxRate:       { type: Number, default: 0 },
  plan:          { type: String, default: 'NEXCART PRO' },
  status:        { type: String, default: 'ACTIVE' },
  subscriptionPlan:   { type: String, default: '1.5 Month Free Trial' },
  subscriptionStatus: { type: String, default: 'trial_active' },
  trialEndDate:       { type: String, default: '' },
  paymentSlip:        { type: String, default: '' },
  subscription:       { type: Object, default: {} },
  totalTransactionsCount: { type: Number, default: 0 },
  totalSalesVolume:       { type: Number, default: 0 },
  registeredAt:  { type: String, default: () => new Date().toISOString() },
  lastSeenAt:    { type: String, default: () => new Date().toISOString() },
}, { timestamps: true });

// Prevent model recompilation in serverless hot-reloads
export default mongoose.models.Store || mongoose.model('Store', StoreSchema);
