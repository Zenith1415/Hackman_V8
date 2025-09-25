import mongoose from 'mongoose';

// A "Schema" defines the structure of a document.
// This is a sub-schema for the team members.
const MemberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide the member's name."],
  },
  email: {
    type: String,
    required: [true, "Please provide the member's email."],
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address'],
  },
  phone: {
    type: String,
    required: [true, "Please provide the member's phone number."],
  },
});

// This is the main schema for the entire registration document.
const RegistrationSchema = new mongoose.Schema({
  teamName: {
    type: String,
    required: [true, 'Please provide a team name.'],
    unique: true, // Ensures no two teams can register with the same name.
  },
  collegeName: {
    type: String,
    required: [true, 'Please provide a college name.'],
  },
  projectTitle: {
    type: String,
    required: [true, 'Please provide a project title.'],
  },
  projectDescription: {
    type: String,
    required: [true, 'Please provide a project description.'],
  },
  teamLeadId: {
    type: Number,
    required: true,
  },
  members: {
    type: [MemberSchema], // An array of documents that must conform to MemberSchema
    validate: [v => v.length >= 2 && v.length <= 4, 'Team must have between 2 and 4 members.']
  },
}, { 
  timestamps: true // Automatically adds `createdAt` and `updatedAt` fields.
});

// A "Model" is a constructor compiled from a Schema definition.
// An instance of a model is a "Document".
// This line prevents a Mongoose error in Next.js's hot-reloading environment.
// It checks if the model is already defined before trying to define it again.
export default mongoose.models.Registration || mongoose.model('Registration', RegistrationSchema);