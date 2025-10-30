import mongoose from 'mongoose';

const FoodLogSchema = new mongoose.Schema({
  _id: { type: String },
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
// In dev/hot-reload, force recompile to pick up schema changes (string _id)
if (mongoose.models.FoodLog) {
  delete mongoose.models.FoodLog;
}
export default mongoose.model('FoodLog', FoodLogSchema, 'food1');