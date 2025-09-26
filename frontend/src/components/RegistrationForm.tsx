"use client";

import React, { useState } from 'react';
import styles from '../styles/RegistrationForm.module.css';
import { Nosifer } from 'next/font/google';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

const nosifer = Nosifer({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
});

interface TeamMember {
  id: number;
  name: string;
  email: string;
  phone: string;
  usn?: string;
  linkedin?: string;
  github?: string;
}

const RegistrationForm: React.FC = () => {
  const router = useRouter();
  const [teamName, setTeamName] = useState('');
  const [collegeName, setCollegeName] = useState('');
  const [projectTitle, setProjectTitle] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [members, setMembers] = useState<TeamMember[]>([
    { id: 1, name: '', email: '', phone: '', usn: '', linkedin: '', github: '' },
    { id: 2, name: '', email: '', phone: '', usn: '', linkedin: '', github: '' },
  ]);
  const [teamLeadId, setTeamLeadId] = useState<number | null>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasTriedSubmit, setHasTriedSubmit] = useState(false);

  const isValidUsn = (usn: string) => /^1[a-z]{2}2[1-5][a-z]{2}\d{3}$/i.test(usn);
  const isNonEmpty = (s: string) => s.trim().length > 0;
  const isValidEmail = (s: string) => /.+@.+\..+/.test(s.trim());
  const isValidPhone = (s: string) => /^\d{10}$/.test(s);
  const isValidUrl = (s: string) => /^https?:\/\/.+\..+/i.test(s.trim());
  const isLinkedInUrl = (s: string) => /^(https?:\/\/)?([a-z0-9-]+\.)*linkedin\.com\//i.test(s.trim());
  const isGitHubUrl = (s: string) => /^(https?:\/\/)?([a-z0-9-]+\.)*github\.com\//i.test(s.trim());

  const handleMemberChange = (id: number, field: keyof TeamMember, value: string) => {
    const nextValue = (() => {
      if (field === 'phone') {
        return value.replace(/\D/g, '').slice(0, 10);
      }
      if (field === 'usn') {
        const cleaned = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
        return cleaned.slice(0, 10);
      }
      if (field === 'linkedin' || field === 'github') {
        const trimmed = value.trim();
        return trimmed;
      }
      return value;
    })();

    setMembers(
      members.map((member) =>
        member.id === id ? { ...member, [field]: nextValue } : member
      )
    );
  };

  const addMember = () => {
    if (members.length < 4) {
      const newId = Date.now();
      setMembers([...members, { id: newId, name: '', email: '', phone: '', usn: '', linkedin: '', github: '' }]);
    }
  };

  const removeMember = (id: number) => {
    if (members.length > 2) {
      setMembers(members.filter((member) => member.id !== id));
      if (teamLeadId === id) {
        setTeamLeadId(members[0]?.id || null);
      }
    }
  };


const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  const memberEmails = members.map(member => member.email.trim().toLowerCase());
  const uniqueEmails = new Set(memberEmails);

  if (uniqueEmails.size !== memberEmails.length) {
    toast.error('Each team member must have a unique email address. Please check for duplicates.');
    return;
  }

  if (members.length < 2 || members.length > 4) {
    toast.error('Your team must have between 2 and 4 members.');
    return;
  }

  if (teamLeadId === null || !members.some((m) => m.id === teamLeadId)) {
    toast.error('Please select a valid team lead from your members.');
    return;
  }

  const formData = {
    teamName,
    collegeName,
    projectTitle,
    projectDescription,
    teamLeadId,
    members,
  };

  try {
    setHasTriedSubmit(true);
    setIsSubmitting(true);
    if (!isNonEmpty(teamName) || !isNonEmpty(collegeName) || !isNonEmpty(projectTitle) || !isNonEmpty(projectDescription)) {
      toast.error('Please fill all required team and project fields.');
      setIsSubmitting(false);
      return;
    }
    const missingInMembers = members.some((m) => !isNonEmpty(m.name) || !isValidEmail(m.email || '') || !isValidUrl(m.linkedin || '') || !isValidUrl(m.github || ''));
    if (missingInMembers) {
      toast.error('Please fill all required member fields (name, email, LinkedIn, GitHub).');
      setIsSubmitting(false);
      return;
    }
    const invalidPhones = members.filter(
      (member) => member.phone.replace(/\D/g, '').length !== 10
    );
    if (invalidPhones.length > 0) {
      toast.error('Each phone number must contain exactly 10 digits.');
      setIsSubmitting(false);
      return;
    }
    const invalidUsn = members.some((m) => !isValidUsn(m.usn || ''));
    if (invalidUsn) {
      toast.error('Please fix invalid USN formats.');
      setIsSubmitting(false);
      return;
    }
    const response = await fetch('/api/registration', { 
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    const result = await response.json();

    if (response.ok) {
      toast.success('Registration submitted successfully! Welcome to Hackman V8!');
      router.push('/');
    } else {
      toast.error(`Registration failed: ${result.message}`);
    }
  } catch (error) {
    console.error('Failed to submit form:', error);
    toast.error('An error occurred while submitting the form. Please try again.');
  } finally {
    setIsSubmitting(false);
  }
};



  return (
    <section className={styles.registrationSection}>
      <div className={styles.formContainer}>
        <h2 className={`${styles.title} ${nosifer.className}`}>
          Register Your Team
        </h2>
        <p className={styles.subtitle}>The gates to Hackman V8 are opening. Dare to enter?</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <fieldset className={styles.fieldset}>
            <div className={styles.inputGroup}>
              <label htmlFor="teamName" className={styles.label}>Team Name</label>
              <div className={styles.fieldControl}>
                <input
                  type="text"
                  id="teamName"
                  className={styles.input}
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="e.g., The Code Crusaders"
                  required
                />
                {!isNonEmpty(teamName) && (hasTriedSubmit || teamName.length > 0) && (
                  <small className={styles.errorText}>*Invalid</small>
                )}
              </div>
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="collegeName" className={styles.label}>College Name</label>
              <div className={styles.fieldControl}>
                <input
                  type="text"
                  id="collegeName"
                  className={styles.input}
                  value={collegeName}
                  onChange={(e) => setCollegeName(e.target.value)}
                  placeholder="e.g., Dayananda Sagar College of Engineering"
                  required
                />
                {!isNonEmpty(collegeName) && (hasTriedSubmit || collegeName.length > 0) && (
                  <small className={styles.errorText}>*Invalid</small>
                )}
              </div>
            </div>
          </fieldset>

          <fieldset className={styles.fieldset}>
            <legend className={`${styles.legend} ${nosifer.className}`}>
              Team Members (2-4)
            </legend>
            {members.map((member, index) => (
              <div key={member.id} className={styles.memberCard}>
                <div className={styles.memberHeader}>
                  <h4 className={styles.memberTitle}>Member {index + 1}</h4>
                  <div className={styles.leadSelector}>
                    <input
                      type="radio"
                      id={`lead-${member.id}`}
                      name="teamLead"
                      checked={teamLeadId === member.id}
                      onChange={() => setTeamLeadId(member.id)}
                      className={styles.radio}
                    />
                    <label htmlFor={`lead-${member.id}`}>Team Lead</label>
                  </div>
                  {members.length > 2 && (
                    <button type="button" onClick={() => removeMember(member.id)} className={styles.removeButton}>
                      Remove
                    </button>
                  )}
                </div>
                <div className={styles.memberInputs}>
                  <div className={styles.fieldControl}>
                    <input
                      type="text"
                      placeholder="Full Name"
                      className={styles.input}
                      value={member.name}
                      onChange={(e) => handleMemberChange(member.id, 'name', e.target.value)}
                      required
                    />
                    {!isNonEmpty(member.name) && (hasTriedSubmit || (member.name && member.name.length > 0)) && (
                      <small className={styles.errorText}>*Invalid</small>
                    )}
                  </div>

                  <div className={styles.fieldControl}>
                    <input
                      type="email"
                      placeholder="Email ID"
                      className={styles.input}
                      value={member.email}
                      onChange={(e) => handleMemberChange(member.id, 'email', e.target.value)}
                      required
                    />
                    {!isValidEmail(member.email || '') && (hasTriedSubmit || (member.email && member.email.length > 0)) && (
                      <small className={styles.errorText}>*Invalid</small>
                    )}
                  </div>

                  <div className={styles.fieldControl}>
                    <input
                      type="url"
                      placeholder="LinkedIn Profile URL (optional)"
                      className={styles.input}
                      value={member.linkedin || ''}
                      onChange={(e) => handleMemberChange(member.id, 'linkedin', e.target.value)}
                      required
                    />
                    {!(isValidUrl(member.linkedin || '') && isLinkedInUrl(member.linkedin || '')) && (hasTriedSubmit || (member.linkedin && member.linkedin.length > 0)) && (
                      <small className={styles.errorText}>*Invalid</small>
                    )}
                  </div>

                  <div className={styles.fieldControl}>
                    <input
                      type="url"
                      placeholder="GitHub Profile URL (optional)"
                      className={styles.input}
                      value={member.github || ''}
                      onChange={(e) => handleMemberChange(member.id, 'github', e.target.value)}
                      required
                    />
                    {!(isValidUrl(member.github || '') && isGitHubUrl(member.github || '')) && (hasTriedSubmit || (member.github && member.github.length > 0)) && (
                      <small className={styles.errorText}>*Invalid</small>
                    )}
                  </div>

                  <div className={styles.fieldControl}>
                    <input
                      type="text"
                      placeholder="USN"
                      className={styles.input}
                      value={member.usn || ''}
                      onChange={(e) => handleMemberChange(member.id, 'usn', e.target.value)}
                      required
                      pattern={"^1[a-zA-Z]{2}2[1-5][a-zA-Z]{2}[0-9]{3}$"}
                      title="Format: 1 + 2 letters + 21-25 + 2 letters + 3 digits (e.g., 1AB21CD123)"
                    />
                    {!isValidUsn(member.usn || '') && (hasTriedSubmit || (member.usn && member.usn.length > 0)) && (
                      <small className={styles.errorText}>*Invalid</small>
                    )}
                  </div>

                  <div className={styles.fieldControl}>
                    <input
                      type="tel"
                      placeholder="Phone Number"
                      className={styles.input}
                      value={member.phone}
                      onChange={(e) => handleMemberChange(member.id, 'phone', e.target.value)}
                      required
                    />
                    {!isValidPhone(member.phone || '') && (hasTriedSubmit || (member.phone && member.phone.length > 0)) && (
                      <small className={styles.errorText}>*Invalid</small>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {members.length < 4 && (
              <button type="button" onClick={addMember} className={styles.addButton}>
                + Add Another Member
              </button>
            )}
          </fieldset>

          <fieldset className={styles.fieldset}>
            <legend className={`${styles.legend} ${nosifer.className}`}>
              Project Idea
            </legend>
            <div className={styles.inputGroup}>
              <label htmlFor="projectTitle" className={styles.label}>Project Title</label>
              <div className={styles.fieldControl}>
                <input
                  type="text"
                  id="projectTitle"
                  className={styles.input}
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  placeholder="A cool name for your project"
                  required
                />
                {!isNonEmpty(projectTitle) && (hasTriedSubmit || projectTitle.length > 0) && (
                  <small className={styles.errorText}>*Invalid</small>
                )}
              </div>
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="projectDescription" className={styles.label}>Brief Description</label>
              <div className={styles.fieldControl}>
                <textarea
                  id="projectDescription"
                  className={styles.textarea}
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  maxLength={500}
                  rows={5}
                  placeholder="Describe your project idea in a few sentences..."
                  required
                ></textarea>
                <small className={styles.charCount}>{500 - projectDescription.length} characters remaining</small>
                {!isNonEmpty(projectDescription) && (hasTriedSubmit || projectDescription.length > 0) && (
                  <small className={styles.errorText}>*Invalid</small>
                )}
              </div>
            </div>
          </fieldset>

          <button type="submit" className={`${styles.submitButton} ${nosifer.className}`} disabled={isSubmitting}>
            {isSubmitting && <span className={styles.loader} aria-hidden="true"></span>}
            {isSubmitting ? 'Submitting...' : 'Submit Registration'}
          </button>
        </form>
      </div>
    </section>
  );
};

export default RegistrationForm;
