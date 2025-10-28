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
  paymentStatus?: 'unpaid' | 'pending' | 'paid' | 'verified';
}
const TeamInfo: React.FC<TeamInfoProps> = ({ projectTitle, projectDescription, teamLeadPhone, members, teamLeadIndex, selectionStatus, paymentStatus }) => {
  const getStatusInfo = () => {
    // If selected, check payment status
    if (selectionStatus === 'selected') {
      if (paymentStatus === 'verified') {
        return {
          color: '#10b981',
          icon: '🎉',
          title: 'Payment Verified!',
          message: "You're confirmed for HackmanV8! See you at the event!"
        };
      } else if (paymentStatus === 'paid' || paymentStatus === 'pending') {
        return {
          color: '#f59e0b',
          icon: '⏳',
          title: 'Payment Under Review',
          message: 'Your payment is being verified. You will be notified once confirmed.'
        };
      } else {
        // unpaid or undefined
        return {
          color: '#fbbf24',
          icon: '💳',
          title: 'Payment Due! (Deadline : 3PM, 29th October 2025) !',
          message: 'Complete payment ASAP to confirm your spot. Go to Payment tab to upload proof. Please adhere to deadline to prevent disqualification.'
        };
      }
    }
    
    // If waitlisted
    if (selectionStatus === 'waitlisted') {
      return {
        color: '#f59e0b',
        icon: '⏳',
        title: 'Waitlisted',
        message: "You're on the waitlist. We'll notify you if a spot opens up."
      };
    }
    
    // If rejected
    if (selectionStatus === 'rejected') {
      return {
        color: '#ef4444',
        icon: '❌',
        title: 'Not Selected',
        message: 'Unfortunately, your team was not selected this time. Better luck next time!'
      };
    }
    
    // Default: pending
    return {
      color: '#6b7280',
      icon: '🔄',
      title: 'Under Evaluation',
      message: 'Your application is being reviewed. Results will be announced soon.'
    };
  };

  const statusInfo = getStatusInfo();

  return (
    <div className={styles.teamOverviewSection}>
      <h2 className={styles.sectionTitle}>Team Overview</h2>
      
      {/* Selection Status Card */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{
          background: `linear-gradient(135deg, ${statusInfo.color}15 0%, rgba(0, 0, 0, 0.3) 100%)`,
          border: `2px solid ${statusInfo.color}`,
          borderRadius: '12px',
          padding: '24px',
          boxShadow: `0 4px 20px ${statusInfo.color}40`
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <span style={{ fontSize: '36px' }}>{statusInfo.icon}</span>
            <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#fff', margin: 0 }}>Selection Status</h3>
          </div>
          <div style={{ 
            fontSize: '28px', 
            fontWeight: 700, 
            color: statusInfo.color,
            marginBottom: '12px'
          }}>
            {statusInfo.title}
          </div>
          <p style={{ fontSize: '14px', color: '#ccc', marginBottom: 0, lineHeight: 1.6 }}>
            {statusInfo.message}
          </p>
        </div>
      </div>

      <div className={styles.projectInfoCard}>
        <h3>Project Submission</h3>
        <div className={styles.projectDetails}>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>Project Title</span>
            <span className={styles.detailValue}>{projectTitle}</span>
          </div>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>Project Description</span>
            <span className={styles.detailValue} style={{ whiteSpace: 'pre-wrap' }}>{projectDescription}</span>
          </div>
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