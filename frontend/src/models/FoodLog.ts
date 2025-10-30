import mongoose from 'mongoose';

const FoodLogSchema = new mongoose.Schema({
  name: { type: String, required: true },
  teamName: { type: String, required: true },
  teamId: { type: String, required: true, index: true }, // Add index for fast lookup
  attendance: { type: Boolean, default: false },
  // Use your database field names
  hadBreakfast: { type: Boolean, default: false },
  hadLunch: { type: Boolean, default: false },
  hadDinner: { type: Boolean, default: false },
  hadSnacks: { type: Boolean, default: false },
});

// Tell Mongoose to use the 'food1' collection
export default mongoose.models.FoodLog || mongoose.model('FoodLog', FoodLogSchema, 'food1');