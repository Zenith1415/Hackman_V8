import mongoose, { Schema, Model, Document } from 'mongoose';
interface IMember {
  name: string;
  email: string;
  phone: string;
  usn?: string;
  linkedin: string;
  github: string;
}
interface ISubmissionDetails {
  githubRepo: string;
  liveDemo: string;
  presentationLink: string;
  additionalNotes: string;
  submittedAt: Date | null;
}
interface IRegistration extends Document {
  teamName: string;
  collegeName: string;
  projectTitle: string;
  projectDescription: string;
  teamLeadId: number;
  members: IMember[];
  teamCode: string;
  submissionStatus: 'not_submitted' | 'submitted' | 'under_review' | 'accepted' | 'rejected';
  selectionStatus: 'pending' | 'selected' | 'waitlisted' | 'rejected';
  paymentStatus: 'unpaid' | 'paid' | 'verified';
  submissionDetails: ISubmissionDetails;
  reviewComments: string;
  finalScore: number | null;
  createdAt: Date;
  updatedAt: Date;
}
const MemberSchema = new Schema<IMember>({
  name: {
    type: String,
    required: [true, "Please provide the member's name."],
  },
  email: {
    type: String,
    required: [true, "Please provide the member's email."],
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address'],
    trim: true,
    lowercase: true,
  },
  phone: {
    type: String,
    required: [true, "Please provide the member's phone number."],
    match: [/^\d{10}$/, 'Phone must contain exactly 10 digits'],
  },
  usn: {
    type: String,
    required: false,
    match: [/^1[a-zA-Z]{2}2[1-5][a-zA-Z]{2}\d{3}$/, 'USN must match 1 + 2 letters + 21-25 + 2 letters + 3 digits'],
  },
  linkedin: {
    type: String,
    required: [true, "Please provide the member's LinkedIn profile URL."],
    match: [/^(https?:\/\/)?([a-z0-9-]+\.)*linkedin\.com\//i, 'LinkedIn URL must be from linkedin.com'],
  },
  github: {
    type: String,
    required: [true, "Please provide the member's GitHub profile URL."],
    match: [/^(https?:\/\/)?([a-z0-9-]+\.)*github\.com\//i, 'GitHub URL must be from github.com'],
  },
});
const RegistrationSchema = new Schema<IRegistration>({
  teamName: {
    type: String,
    required: [true, 'Please provide a team name.'],
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
    default: 0,
  },
  members: {
    type: [MemberSchema],
    validate: [
      (v: IMember[]) => v.length >= 2 && v.length <= 4,
      'Team must have between 2 and 4 members.'
    ]
  },
  teamCode: {
    type: String,
    unique: true,
    required: true,
  },
  submissionStatus: {
    type: String,
    enum: ['not_submitted', 'submitted', 'under_review', 'accepted', 'rejected'],
    default: 'not_submitted',
  },
  selectionStatus: {
    type: String,
    enum: ['pending', 'selected', 'waitlisted', 'rejected'],
    default: 'pending',
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'paid', 'verified'],
    default: 'unpaid',
  },
  submissionDetails: {
    githubRepo: {
      type: String,
      default: '',
    },
    liveDemo: {
      type: String,
      default: '',
    },
    presentationLink: {
      type: String,
      default: '',
    },
    additionalNotes: {
      type: String,
      default: '',
    },
    submittedAt: {
      type: Date,
      default: null,
    },
  },
  reviewComments: {
    type: String,
    default: '',
  },
  finalScore: {
    type: Number,
    default: null,
  },
}, { 
  timestamps: true
});
export default (mongoose.models.Registration as Model<IRegistration>) || 
  mongoose.model<IRegistration>('Registration', RegistrationSchema);
