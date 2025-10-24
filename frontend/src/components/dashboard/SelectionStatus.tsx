"use client";
import React from 'react';
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
  submissionStatus: string;
  selectionStatus: 'pending' | 'selected' | 'waitlisted' | 'rejected';
  paymentStatus?: 'unpaid' | 'pending' | 'paid' | 'verified';
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
interface SelectionStatusProps {
  teamData: TeamData;
}
const SelectionStatus: React.FC<SelectionStatusProps> = ({ teamData }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return styles.statusPending;
      case 'selected':
        return styles.statusSelected;
      case 'waitlisted':
        return styles.statusWaitlisted;
      case 'rejected':
        return styles.statusRejected;
      default:
        return styles.statusPending;
    }
  };
  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pending Review';
      case 'selected':
        return 'Selected';
      case 'waitlisted':
        return 'Waitlisted';
      case 'rejected':
        return 'Not Selected';
      default:
        return 'Unknown';
    }
  };
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return '⏳';
      case 'selected':
        return '🎉';
      case 'waitlisted':
        return '📋';
      case 'rejected':
        return '❌';
      default:
        return '❓';
    }
  };
  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Your team is currently under review. We will notify you once the selection process is complete.';
      case 'selected':
        return 'Congratulations! Your team has been selected to participate in the hackathon. Check your email for further instructions.';
      case 'waitlisted':
        return 'Your team is on the waitlist. We will contact you if a spot becomes available.';
      case 'rejected':
        return 'Unfortunately, your team was not selected this time. Thank you for your interest and good luck with future hackathons!';
      default:
        return 'Status information is not available.';
    }
  };
  return (
    <div className={styles.statusCard}>
      <h3 className={styles.cardTitle}>Selection Status</h3>
      <div className={styles.statusHeader}>
        <div className={styles.statusInfo}>
          <div className={styles.statusLabel}>Current Status</div>
          <div className={`${styles.statusBadge} ${getStatusColor(teamData.selectionStatus)}`}>
            <span className={styles.statusIcon}>{getStatusIcon(teamData.selectionStatus)}</span>
            <span className={styles.statusText}>{getStatusText(teamData.selectionStatus)}</span>
          </div>
        </div>
      </div>
      <div className={styles.statusMessage}>
        <p>{getStatusMessage(teamData.selectionStatus)}</p>
      </div>
      {teamData.selectionStatus === 'selected' && (
        <div className={styles.selectedInfo}>
          <h4 className={styles.infoTitle}>Next Steps</h4>
          <ul className={styles.stepsList}>
            <li>Check your email for detailed instructions</li>
            <li>Join the official Discord/communication channel</li>
            <li>Prepare your development environment</li>
            <li>Review the hackathon schedule and rules</li>
            <li>Get ready to build something amazing!</li>
          </ul>
        </div>
      )}
      {teamData.selectionStatus === 'waitlisted' && (
        <div className={styles.waitlistedInfo}>
          <h4 className={styles.infoTitle}>What&apos;s Next?</h4>
          <ul className={styles.stepsList}>
            <li>Keep an eye on your email for updates</li>
            <li>Be ready to respond quickly if a spot opens up</li>
            <li>Consider participating in other hackathons</li>
            <li>Continue building and learning!</li>
          </ul>
        </div>
      )}
      {teamData.selectionStatus === 'rejected' && (
        <div className={styles.rejectedInfo}>
          <h4 className={styles.infoTitle}>Keep Going!</h4>
          <ul className={styles.stepsList}>
            <li>Don&apos;t be discouraged - this is just one opportunity</li>
            <li>Look for other hackathons and competitions</li>
            <li>Continue building projects and improving your skills</li>
            <li>Network with other developers and teams</li>
            <li>Apply to future hackathons with improved projects</li>
          </ul>
        </div>
      )}
      {teamData.selectionStatus === 'pending' && (
        <div className={styles.pendingInfo}>
          <h4 className={styles.infoTitle}>Selection Timeline</h4>
          <div className={styles.timeline}>
            {}
            <div className={styles.timelineItem}>
              <div className={`${styles.timelineDot} ${styles.completed}`}></div>
              <div className={`${styles.timelineContent} ${styles.completed}`}>
                <h5>Registration Closed</h5>
                <p>All teams have been registered</p>
              </div>
            </div>
            {}
            <div className={styles.timelineItem}>
              <div className={`${styles.timelineDot} ${styles.current}`}></div>
              <div className={`${styles.timelineContent} ${styles.current}`}>
                <h5>Review in Progress</h5>
                <p>Our judges are evaluating all submissions</p>
              </div>
            </div>
            {}
            <div className={styles.timelineItem}>
              <div className={`${styles.timelineDot} ${styles.upcoming}`}></div>
              <div className={`${styles.timelineContent} ${styles.upcoming}`}>
                <h5>Results Announcement</h5>
                <p>Selected teams will be notified via email</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default SelectionStatus;