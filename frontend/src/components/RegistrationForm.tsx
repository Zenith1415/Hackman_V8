"use client";

import React, { useState } from 'react';
import styles from '../styles/RegistrationForm.module.css';
import { Nosifer } from 'next/font/google';
import { useRouter } from 'next/navigation';

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
}

const RegistrationForm: React.FC = () => {
  const router = useRouter();
  const [teamName, setTeamName] = useState('');
  const [collegeName, setCollegeName] = useState('');
  const [projectTitle, setProjectTitle] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [members, setMembers] = useState<TeamMember[]>([
    { id: 1, name: '', email: '', phone: '' },
    { id: 2, name: '', email: '', phone: '' },
  ]);
  const [teamLeadId, setTeamLeadId] = useState<number | null>(1);

  const handleMemberChange = (id: number, field: keyof TeamMember, value: string) => {
    setMembers(
      members.map((member) =>
        member.id === id ? { ...member, [field]: value } : member
      )
    );
  };

  const addMember = () => {
    if (members.length < 4) {
      const newId = Date.now();
      setMembers([...members, { id: newId, name: '', email: '', phone: '' }]);
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
  const formData = {
    teamName,
    collegeName,
    projectTitle,
    projectDescription,
    teamLeadId,
    members,
  };

  try {
    const response = await fetch('/api/registration', { 
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    const result = await response.json();

    if (response.ok) {
      router.push('/');
    } else {
      alert(`Error: ${result.message}`);
    }
  } catch (error) {
    console.error('Failed to submit form:', error);
    alert('An error occurred while submitting the form.');
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
          {/* --- Team & College Details --- */}
          <fieldset className={styles.fieldset}>
            <div className={styles.inputGroup}>
              <label htmlFor="teamName" className={styles.label}>Team Name</label>
              <input
                type="text"
                id="teamName"
                className={styles.input}
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="e.g., The Code Crusaders"
                required
              />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="collegeName" className={styles.label}>College Name</label>
              <input
                type="text"
                id="collegeName"
                className={styles.input}
                value={collegeName}
                onChange={(e) => setCollegeName(e.target.value)}
                placeholder="e.g., Dayananda Sagar College of Engineering"
                required
              />
            </div>
          </fieldset>

          {/* --- Team Members Details --- */}
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
                  <input
                    type="text"
                    placeholder="Full Name"
                    className={styles.input}
                    value={member.name}
                    onChange={(e) => handleMemberChange(member.id, 'name', e.target.value)}
                    required
                  />
                  <input
                    type="email"
                    placeholder="Email ID"
                    className={styles.input}
                    value={member.email}
                    onChange={(e) => handleMemberChange(member.id, 'email', e.target.value)}
                    required
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    className={styles.input}
                    value={member.phone}
                    onChange={(e) => handleMemberChange(member.id, 'phone', e.target.value)}
                    required
                  />
                </div>
              </div>
            ))}
            {members.length < 4 && (
              <button type="button" onClick={addMember} className={styles.addButton}>
                + Add Another Member
              </button>
            )}
          </fieldset>

          {/* --- Project Idea Details --- */}
          <fieldset className={styles.fieldset}>
            <legend className={`${styles.legend} ${nosifer.className}`}>
              Project Idea
            </legend>
            <div className={styles.inputGroup}>
              <label htmlFor="projectTitle" className={styles.label}>Project Title</label>
              <input
                type="text"
                id="projectTitle"
                className={styles.input}
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                placeholder="A cool name for your project"
                required
              />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="projectDescription" className={styles.label}>Brief Description</label>
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
            </div>
          </fieldset>

          <button type="submit" className={`${styles.submitButton} ${nosifer.className}`}>
            Submit Registration
          </button>
        </form>
      </div>
    </section>
  );
};

export default RegistrationForm;