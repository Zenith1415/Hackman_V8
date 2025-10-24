"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Nosifer } from 'next/font/google';
import TeamInfo from '@/components/dashboard/TeamInfo';
import SubmissionStatus from '@/components/dashboard/SubmissionStatus';
import SelectionStatus from '@/components/dashboard/SelectionStatus';
import ProjectSubmission from '@/components/dashboard/ProjectSubmission';
import PaymentManagement from '@/components/dashboard/PaymentManagement';
import styles from '@/styles/Dashboard.module.css';

const nosifer = Nosifer({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
});

interface TeamMember {
  id: number;
  _id?: string;
  name: string;
  email: string;
  phone: string;
  usn?: string;
  linkedin?: string;
  github?: string;
}

interface TeamData {
  _id: string;
  teamName: string;
  collegeName: string;
  projectTitle: string;
  projectDescription: string;
  teamLeadId: number;
  members: TeamMember[];
  submissionStatus: 'not_submitted' | 'submitted' | 'under_review' | 'accepted' | 'rejected';
  selectionStatus: 'pending' | 'selected' | 'waitlisted' | 'rejected';
  paymentStatus?: 'unpaid' | 'pending' | 'paid' | 'verified';
  paymentProof?: string;
  paymentDate?: string;
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

interface PaymentData {
  paymentStatus?: 'unpaid' | 'pending' | 'paid' | 'verified';
  paymentProof?: string;
  paymentDate?: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [leadEmail, setLeadEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [teamData, setTeamData] = useState<TeamData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'submission' | 'status' | 'payment'>('overview');

  
  useEffect(() => {
    const savedLeadEmail = localStorage.getItem('leadEmail');
    const savedPhone = localStorage.getItem('phone');
    const isNewRegistration = localStorage.getItem('isNewRegistration');
    
    if (savedLeadEmail && savedPhone) {
      fetchTeamData(savedLeadEmail, savedPhone, isNewRegistration === 'true');
      // Clear the flag after auto-login
      localStorage.removeItem('isNewRegistration');
    }
  }, []);

  const fetchTeamData = async (leadEmail: string, phone: string, skipWelcomeToast: boolean = false) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/team/lead?email=${encodeURIComponent(leadEmail)}&phone=${encodeURIComponent(phone)}`);
      const data = await response.json();

      if (response.ok) {
        setTeamData(data);
        setIsAuthenticated(true);
        localStorage.setItem('projectName', data.projectTitle || '');
        localStorage.setItem('phone', phone);
        localStorage.setItem('leadEmail', leadEmail);
        if (!skipWelcomeToast) {
          toast.success('Welcome to your team dashboard!');
        }
      } else {
        toast.error(data.message || 'Failed to fetch team data');
        setIsAuthenticated(false);
        localStorage.removeItem('projectName');
        localStorage.removeItem('phone');
      }
    } catch (error) {
      console.error('Error fetching team data:', error);
      toast.error('An error occurred while fetching team data');
      setIsAuthenticated(false);
      localStorage.removeItem('projectName');
      localStorage.removeItem('phone');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadEmail.trim() || !phone.trim()) {
      toast.error('Please enter both team lead email and phone number');
      return;
    }
    await fetchTeamData(leadEmail.trim(), phone.trim());
  };

  const handleLogout = () => {
    setTeamData(null);
    setIsAuthenticated(false);
    setLeadEmail('');
    setPhone('');
    localStorage.removeItem('leadEmail');
    localStorage.removeItem('phone');
    toast.success('Logged out successfully');
  };

  const updateTeamData = (updatedData: Partial<TeamData>) => {
    setTeamData(prev => prev ? { ...prev, ...updatedData } : null);
  };

  const updatePaymentData = (updatedData: Partial<PaymentData>) => {
    // Convert PaymentData to TeamData format
    const teamDataUpdate: Partial<TeamData> = {
      paymentStatus: updatedData.paymentStatus,
      paymentProof: updatedData.paymentProof,
      paymentDate: updatedData.paymentDate,
    };
    updateTeamData(teamDataUpdate);
  };

  if (!isAuthenticated) {
    return (
      <div className={styles.dashboardContainer}>
        <button 
          onClick={() => router.push('/#hero')} 
          className={styles.backToHomeButton}
          title="Back to Home"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          <span>Back to Home</span>
        </button>
        <div className={styles.loginContainer}>
          <h1 className={`${styles.title} ${nosifer.className}`}>Team Dashboard</h1>
          <p className={styles.subtitle}>Enter your project title and team code to access your dashboard</p>
          
          <form onSubmit={handleLogin} className={styles.loginForm}>
            <div className={styles.inputGroup}>
              <label htmlFor="leadEmail" className={styles.label}>Team Lead Email</label>
              <input
                type="email"
                id="leadEmail"
                value={leadEmail}
                onChange={(e) => setLeadEmail(e.target.value)}
                placeholder="Enter team lead's email address"
                className={styles.input}
                required
              />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="phone" className={styles.label}>Team Lead Phone Number</label>
              <input
                type="text"
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter team lead's 10-digit phone number"
                className={styles.input}
                maxLength={10}
                required
              />
            </div>
            <button 
              type="submit" 
              className={`${styles.loginButton} ${nosifer.className}`}
              disabled={isLoading}
            >
              {isLoading ? 'Accessing...' : 'Access Dashboard'}
            </button>
          </form>
          
          <div className={styles.helpText}>
            <p>Don&apos;t have your credentials? Check your registration confirmation email.</p>
            <p>Make sure to enter your project title exactly as you registered it.</p>
            <p>Need help? Contact the organizers.</p>
          </div>
        </div>
      </div>
    );
  }

  if (!teamData) {
    return (
      <div className={styles.dashboardContainer}>
        <div className={styles.loadingContainer}>
          <div className={styles.loader}></div>
          <p>Loading team data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.dashboardHeader}>
        <div className={styles.headerContent}>
          <h1 className={`${styles.dashboardTitle} ${nosifer.className}`}>
            {teamData.teamName}
          </h1>
          <div className={styles.buttonGroup}>
            <button 
              onClick={() => router.push('/#hero')} 
              className={styles.homeButton}
              title="Back to Home"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
              <span>Home</span>
            </button>
            <button onClick={handleLogout} className={styles.logoutButton}>
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className={styles.dashboardContent}>
        <nav className={styles.tabNavigation}>
          <button
            className={`${styles.tabButton} ${activeTab === 'overview' ? styles.active : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Team Overview
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === 'submission' ? styles.active : ''}`}
            onClick={() => setActiveTab('submission')}
          >
            Project Submission
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === 'status' ? styles.active : ''}`}
            onClick={() => setActiveTab('status')}
          >
            Selection Status
          </button>
          {teamData?.selectionStatus === 'selected' && (
            <button
              className={`${styles.tabButton} ${activeTab === 'payment' ? styles.active : ''}`}
              onClick={() => setActiveTab('payment')}
            >
              Payment
            </button>
          )}
        </nav>

        <div className={styles.tabContent}>
          {activeTab === 'overview' && teamData && (
            <TeamInfo 
              projectTitle={teamData.projectTitle}
              projectDescription={teamData.projectDescription}
              teamLeadPhone={teamData.members[teamData.teamLeadId]?.phone || "N/A"}
              members={teamData.members.map((m, idx) => ({ 
                name: m.name, 
                email: m.email, 
                phone: m.phone,
                isLead: idx === teamData.teamLeadId
              }))}
              teamLeadIndex={teamData.teamLeadId}
              selectionStatus={teamData.selectionStatus}
              submissionStatus={teamData.submissionStatus}
            />
          )}
          {activeTab === 'submission' && (
            <ProjectSubmission 
              teamData={teamData} 
              onUpdate={updateTeamData}
            />
          )}
          {activeTab === 'status' && (
            <div className={styles.statusContainer}>
              <SubmissionStatus teamData={teamData} />
              <SelectionStatus teamData={teamData} />
            </div>
          )}
          {activeTab === 'payment' && teamData?.selectionStatus === 'selected' && (
            <PaymentManagement 
              teamData={teamData} 
              onUpdate={updatePaymentData}
            />
          )}
        </div>
      </div>
    </div>
  );
}