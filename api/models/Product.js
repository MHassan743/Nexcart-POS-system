import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  id:             { type: String, required: true, unique: true },
  storeId:        { type: String, required: true, index: true },
  name:           { type: String, required: true },
  sku:            { type: String, default: '' },
  barcode:        { type: String, default: '' },
  category:       { type: String, default: 'General' },
  costPrice:      { type: Number, default: 0 },
  salePrice:      { type: Number, default: 0 },
  stockQuantity: { type: Number, default: 0 },
  reorderThreshold: { type: Number, default: 10 },
  unit:           { type: String, default: 'pcs' },
  supplier:       { type: String, default: '' }
}, { timestamps: true });

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
