export type Member = {
  name: string;
  email: string;
  phone: string;
  usn?: string;
  linkedin: string;
  github: string;
};
export type Registration = {
  _id: string;
  teamName: string;
  collegeName: string;
  projectTitle: string;
  projectDescription: string;
  teamLeadId?: number;
  teamCode: string;
  submissionStatus: 'not_submitted' | 'submitted' | 'under_review' | 'accepted' | 'rejected';
  selectionStatus: 'pending' | 'selected' | 'waitlisted' | 'rejected';
  paymentStatus?: 'unpaid' | 'pending' | 'paid' | 'verified';
  members: Member[];
  createdAt?: string;
  updatedAt?: string;
  submissionDetails?: {
    githubRepo?: string;
    liveDemo?: string;
    presentationLink?: string;
    additionalNotes?: string;
    submittedAt?: string | null;
  };
  reviewComments?: string;
  finalScore?: number | null;
};
export type EditFormData = Omit<Registration, '_id' | 'createdAt' | 'updatedAt'>;