import mongoose from 'mongoose';

const restaurantSchema = new mongoose.Schema({
  name: String,
  address: String,
  distance: Number,
  latitude: Number,
  longitude: Number
}, { timestamps: true });

export default mongoose.models.Restaurant || mongoose.model('Restaurant', restaurantSchema);