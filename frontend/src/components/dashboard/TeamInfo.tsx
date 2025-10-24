"use client";
import React from "react";
import styles from '@/styles/Dashboard.module.css';
interface Member {
  name: string;
  email: string;
  phone: string;
  isLead?: boolean;
}
interface TeamInfoProps {
  projectTitle: string;
  projectDescription: string;
  teamLeadPhone: string;
  members: Member[];
  teamLeadIndex: number;
  selectionStatus?: 'pending' | 'selected' | 'waitlisted' | 'rejected';
  submissionStatus?: 'not_submitted' | 'submitted' | 'under_review' | 'accepted' | 'rejected';
}
const TeamInfo: React.FC<TeamInfoProps> = ({ projectTitle, projectDescription, teamLeadPhone, members, teamLeadIndex, selectionStatus, submissionStatus }) => {
  const getSelectionStatusColor = (status?: string) => {
    switch (status) {
      case 'selected':
        return '#10b981';
      case 'rejected':
        return '#ef4444';
      case 'waitlisted':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  const getSelectionStatusIcon = (status?: string) => {
    switch (status) {
      case 'selected':
        return '✅';
      case 'rejected':
        return '❌';
      case 'waitlisted':
        return '⏳';
      default:
        return '🔄';
    }
  };

  const getSubmissionStatusColor = (status?: string) => {
    switch (status) {
      case 'submitted':
      case 'accepted':
        return '#10b981';
      case 'rejected':
        return '#ef4444';
      case 'under_review':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  const getSubmissionStatusIcon = (status?: string) => {
    switch (status) {
      case 'submitted':
      case 'accepted':
        return '📤';
      case 'rejected':
        return '❌';
      case 'under_review':
        return '🔍';
      default:
        return '📝';
    }
  };

  return (
    <div className={styles.teamOverviewSection}>
      <h2 className={styles.sectionTitle}>Team Overview</h2>
      
      {/* Status Cards Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {/* Selection Status Card */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(255, 5, 0, 0.1) 0%, rgba(0, 0, 0, 0.3) 100%)',
          border: `2px solid ${getSelectionStatusColor(selectionStatus)}`,
          borderRadius: '12px',
          padding: '20px',
          boxShadow: `0 4px 15px ${getSelectionStatusColor(selectionStatus)}40`
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <span style={{ fontSize: '32px' }}>{getSelectionStatusIcon(selectionStatus)}</span>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', margin: 0 }}>Selection Status</h3>
          </div>
          <div style={{ 
            fontSize: '24px', 
            fontWeight: 700, 
            color: getSelectionStatusColor(selectionStatus),
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            {selectionStatus || 'pending'}
          </div>
          <p style={{ fontSize: '12px', color: '#999', marginTop: '8px', marginBottom: 0 }}>
            {selectionStatus === 'selected' && 'Congratulations! Your team has been selected! 🎉'}
            {selectionStatus === 'rejected' && 'Unfortunately, your team was not selected this time.'}
            {selectionStatus === 'waitlisted' && 'Your team is on the waitlist. We\'ll notify you if a spot opens up.'}
            {(!selectionStatus || selectionStatus === 'pending') && 'Your selection status will be updated soon.'}
          </p>
        </div>

        {/* Submission Status Card */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(0, 0, 0, 0.3) 100%)',
          border: `2px solid ${getSubmissionStatusColor(submissionStatus)}`,
          borderRadius: '12px',
          padding: '20px',
          boxShadow: `0 4px 15px ${getSubmissionStatusColor(submissionStatus)}40`
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <span style={{ fontSize: '32px' }}>{getSubmissionStatusIcon(submissionStatus)}</span>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', margin: 0 }}>Submission Status</h3>
          </div>
          <div style={{ 
            fontSize: '24px', 
            fontWeight: 700, 
            color: getSubmissionStatusColor(submissionStatus),
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            {submissionStatus?.replace('_', ' ') || 'not submitted'}
          </div>
          <p style={{ fontSize: '12px', color: '#999', marginTop: '8px', marginBottom: 0 }}>
            {submissionStatus === 'submitted' && 'Your project has been submitted successfully!'}
            {submissionStatus === 'accepted' && 'Your submission has been accepted!'}
            {submissionStatus === 'rejected' && 'Your submission needs revision.'}
            {submissionStatus === 'under_review' && 'Your submission is currently under review.'}
            {(!submissionStatus || submissionStatus === 'not_submitted') && 'Submit your project in the submission tab.'}
          </p>
        </div>
      </div>

      <div className={styles.teamMembersSection}>
        <h3>Team Members</h3>
        <div className={styles.membersGrid}>
          {members.map((member, idx) => (
            <div className={styles.memberCard} key={idx}>
              <div className={styles.memberHeader}>
                <h4 className={styles.memberName}>Member {idx + 1}</h4>
                {idx === teamLeadIndex && <span className={styles.leadBadge}>Team Lead</span>}
              </div>
              <div className={styles.memberDetails}>
                <div className={styles.memberDetail}>
                  <span className={styles.detailIcon}>👤</span>
                  <span className={styles.detailText}><strong>Name:</strong> {member.name}</span>
                </div>
                <div className={styles.memberDetail}>
                  <span className={styles.detailIcon}>📧</span>
                  <span className={styles.detailText}><strong>Email:</strong> {member.email}</span>
                </div>
                <div className={styles.memberDetail}>
                  <span className={styles.detailIcon}>📱</span>
                  <span className={styles.detailText}><strong>Phone:</strong> {member.phone}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default TeamInfo;