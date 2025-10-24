"use client";
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import styles from '@/styles/Dashboard.module.css';
interface TeamData {
  _id: string;
  teamName: string;
  collegeName: string;
  projectTitle: string;
  projectDescription: string;
  teamLeadId: number;
  members: Array<{
    id: number;
    name: string;
    email: string;
    phone: string;
    usn?: string;
    linkedin?: string;
    github?: string;
  }>;
  submissionStatus: 'not_submitted' | 'submitted' | 'under_review' | 'accepted' | 'rejected';
  selectionStatus: 'pending' | 'selected' | 'waitlisted' | 'rejected';
  submissionDetails: {
    githubRepo: string;
    liveDemo: string;
    presentationLink: string;
    additionalNotes: string;
    submittedAt: Date | null;
  };
  reviewComments: string;
  finalScore: number | null;
  createdAt: string;
  updatedAt: string;
}
interface ProjectSubmissionProps {
  teamData: TeamData;
  onUpdate: (updatedData: Partial<TeamData>) => void;
}
const ProjectSubmission: React.FC<ProjectSubmissionProps> = ({ teamData, onUpdate }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    githubRepo: teamData.submissionDetails.githubRepo || '',
    liveDemo: teamData.submissionDetails.liveDemo || '',
    presentationLink: teamData.submissionDetails.presentationLink || '',
    additionalNotes: teamData.submissionDetails.additionalNotes || '',
  });
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.githubRepo.trim()) {
      toast.dismiss();
      setTimeout(() => toast.error('GitHub repository URL is required'), 10);
      return;
    }
    setIsSubmitting(true);
    try {
  const teamLeadPhone = teamData.members[0]?.phone || '';
      const apiUrl = `/api/team/${teamLeadPhone}/submit?projectName=${encodeURIComponent(teamData.projectTitle)}`;
      console.log('Submitting project to:', apiUrl);
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const result = await response.json();
      if (response.ok) {
        toast.success('Project submitted successfully! 🎉');
        onUpdate({
          submissionStatus: 'submitted',
          submissionDetails: {
            ...teamData.submissionDetails,
            ...formData,
            submittedAt: new Date(),
          }
        });
      } else {
        let errorMsg = result.message || 'Failed to submit project';
        if (result.errors) {
          errorMsg += '\n' + Object.values(result.errors.fieldErrors || {}).join('\n');
          errorMsg += '\n' + (result.errors.formErrors || []).join('\n');
        }
        toast.error(errorMsg);
      }
    } catch (error) {
      console.error('Error submitting project:', error);
      toast.error('An error occurred while submitting the project');
    } finally {
      setIsSubmitting(false);
    }
  };
  const canSubmit = teamData.submissionStatus === 'not_submitted';
  const isSubmitted = teamData.submissionStatus === 'submitted' || teamData.submissionStatus === 'under_review';
  return (
    <div className={styles.submissionContainer}>
      <div className={styles.statusCard}>
        <h3 className={styles.cardTitle}>Project Submission</h3>
        
        {/* Project Information Display */}
        <div className={styles.projectInfo}>
          <div className={styles.projectTitle}>
            <h4>Project Title</h4>
            <p>{teamData.projectTitle}</p>
          </div>
          <div className={styles.projectDescription}>
            <h4>Project Description</h4>
            <p>{teamData.projectDescription}</p>
          </div>
        </div>
        
        {canSubmit ? (
          <form onSubmit={handleSubmit} className={styles.submissionForm}>
            <div className={styles.formGroup}>
              <label htmlFor="githubRepo" className={styles.formLabel}>
                GitHub Repository URL *
              </label>
              <input
                type="url"
                id="githubRepo"
                value={formData.githubRepo}
                onChange={(e) => handleInputChange('githubRepo', e.target.value)}
                placeholder="https://github.com/username/repository"
                className={styles.formInput}
                required
              />
              <small className={styles.formHelp}>
                Make sure your repository is public and contains your project code
              </small>
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="liveDemo" className={styles.formLabel}>
                Live Demo URL (Optional)
              </label>
              <input
                type="url"
                id="liveDemo"
                value={formData.liveDemo}
                onChange={(e) => handleInputChange('liveDemo', e.target.value)}
                placeholder="https://your-demo-site.com"
                className={styles.formInput}
              />
              <small className={styles.formHelp}>
                Link to your deployed application or demo
              </small>
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="presentationLink" className={styles.formLabel}>
                Presentation Link (Optional)
              </label>
              <input
                type="url"
                id="presentationLink"
                value={formData.presentationLink}
                onChange={(e) => handleInputChange('presentationLink', e.target.value)}
                placeholder="https://docs.google.com/presentation/..."
                className={styles.formInput}
              />
              <small className={styles.formHelp}>
                Link to your project presentation or documentation
              </small>
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="additionalNotes" className={styles.formLabel}>
                Additional Notes (Optional)
              </label>
              <textarea
                id="additionalNotes"
                value={formData.additionalNotes}
                onChange={(e) => handleInputChange('additionalNotes', e.target.value)}
                placeholder="Any additional information about your project, setup instructions, or special notes for the judges..."
                className={styles.formTextarea}
                rows={4}
                maxLength={1000}
              />
              <small className={styles.formHelp}>
                {1000 - formData.additionalNotes.length} characters remaining
              </small>
            </div>
            <div className={styles.submissionWarning}>
              <h4>⚠️ Important Notes:</h4>
              <ul>
                <li>You can only submit once. Make sure all information is correct.</li>
                <li>Your GitHub repository must be public and accessible.</li>
                <li>Include a README file with setup and run instructions.</li>
                <li>Make sure your demo link works and is accessible.</li>
              </ul>
            </div>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Project'}
            </button>
          </form>
        ) : (
          <div className={styles.alreadySubmitted}>
            <div className={styles.submittedInfo}>
              <h4>Project Already Submitted</h4>
              <p>Your project has been submitted and is currently under review.</p>
              {teamData.submissionDetails.submittedAt && (
                <div className={styles.submissionTime}>
                  <strong>Submitted on:</strong> {new Date(teamData.submissionDetails.submittedAt).toLocaleString()}
                </div>
              )}
              <div className={styles.submittedDetails}>
                <h5>Submission Details:</h5>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>GitHub Repository:</span>
                  <a 
                    href={teamData.submissionDetails.githubRepo} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={styles.detailLink}
                  >
                    View Repository
                  </a>
                </div>
                {teamData.submissionDetails.liveDemo && (
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Live Demo:</span>
                    <a 
                      href={teamData.submissionDetails.liveDemo} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={styles.detailLink}
                    >
                      View Demo
                    </a>
                  </div>
                )}
                {teamData.submissionDetails.presentationLink && (
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Presentation:</span>
                    <a 
                      href={teamData.submissionDetails.presentationLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={styles.detailLink}
                    >
                      View Presentation
                    </a>
                  </div>
                )}
                {teamData.submissionDetails.additionalNotes && (
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Additional Notes:</span>
                    <span className={styles.detailValue}>{teamData.submissionDetails.additionalNotes}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default ProjectSubmission;