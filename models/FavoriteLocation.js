import mongoose from "mongoose";

const favoriteLocationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['home', 'work', 'other'],
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: false, // Not required for home and work
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
});

export const FavoriteLocationModel = mongoose.model('FavoriteLocation', favoriteLocationSchema);
