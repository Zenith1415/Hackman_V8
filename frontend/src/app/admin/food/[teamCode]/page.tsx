"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Nosifer } from 'next/font/google';
import styles from '@/styles/AdminFood.module.css';
import toast, { Toaster } from 'react-hot-toast';

// --- Interfaces (Matches MongoDB/Mongoose Schema) ---
interface MemberFoodStatus {
  _id: string; // MongoDB Document ID
  name: string;
  teamName: string;
  teamId: string;
  attendance: boolean;
  hadBreakfast: boolean;
  hadLunch: boolean;
  hadDinner: boolean;
  hadSnacks: boolean;
}
type MemberList = MemberFoodStatus[];
type StatusField = 'attendance' | 'hadBreakfast' | 'hadLunch' | 'hadDinner' | 'hadSnacks';

// --- Font Setup ---
const nosifer = Nosifer({ weight: '400', subsets: ['latin'], display: 'swap' });

// --- Mappings for UI ---
const itemTypes: StatusField[] = [
  'attendance',
  'hadLunch',
  'hadDinner',
  'hadSnacks',
  'hadBreakfast',
];
const headerMap: Record<StatusField, string> = {
  attendance: 'Attendance',
  hadBreakfast: 'Breakfast',
  hadLunch: 'Lunch',
  hadDinner: 'Dinner',
  hadSnacks: 'Snacks',
};

export default function FoodDistributionPage() {
  const params = useParams();
  const teamCode = params.teamCode as string;

  // --- State Hooks ---
  const [token, setToken] = useState<string>("");
  const [inputToken, setInputToken] = useState<string>("");
  const [membersData, setMembersData] = useState<MemberList>([]);
  const [teamName, setTeamName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- Data Fetching Effect ---
  useEffect(() => {
    // load token from localStorage
    const stored = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
    if (stored) setToken(stored);
  }, []);

  useEffect(() => {
    if (!teamCode || teamCode === "undefined") {
      setLoading(false);
      setError("Invalid team code in URL.");
      return;
    }

    const fetchTeam = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/admin/food/${teamCode}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.message || 'Team not found');
        }
        const data: MemberList = await response.json();
        setMembersData(data);
        if (data.length > 0) {
          setTeamName(data[0].teamName);
        } else {
          setError("No members found for this team.");
        }
      } catch (err: unknown) { // <-- Fix 1: Use unknown
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred');
        }
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchTeam();
    }
  }, [teamCode, token]);

  // --- Update Handler ---
  const handleFoodToggle = async (
    docId: string,
    field: StatusField
  ) => {
    const originalData = [...membersData];
    const member = membersData.find((m) => m._id === docId);
    if (!member) return;
    const newStatus = !member[field];

    setMembersData((prevData) =>
      prevData.map((m) =>
        m._id === docId ? { ...m, [field]: newStatus } : m
      )
    );

    try {
      const response = await fetch('/api/admin/food/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({
          docId: docId,
          field: field,
          status: newStatus,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save update');
      }
      toast.success(
        `${headerMap[field]} status updated!`
      );
    } catch (saveError: unknown) { // <-- Fix 2: Use unknown
      console.error('Failed to save status:', saveError);
      if (saveError instanceof Error) {
        toast.error(`Failed to save: ${saveError.message}`);
      } else {
        toast.error('Failed to save, reverting change.');
      }
      setMembersData(originalData);
    }
  };

  // --- Render logic ---
  if (loading) { /* ... */ }
  if (error) { /* ... */ }

  if (!token) {
    return (
      <div style={{ maxWidth: 420, margin: '64px auto', padding: 24 }}>
        <Toaster />
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>Admin Login</h2>
        <p style={{ color: '#666', marginBottom: 16 }}>Enter the admin access token.</p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const trimmed = inputToken.trim();
            if (!trimmed) return;
            localStorage.setItem('admin_token', trimmed);
            setToken(trimmed);
          }}
          style={{ display: 'flex', gap: 8 }}
        >
          <input
            type="password"
            placeholder="Admin token"
            value={inputToken}
            onChange={(e) => setInputToken(e.target.value)}
            style={{ flex: 1, padding: '10px 12px', border: '1px solid #ddd', borderRadius: 8 }}
          />
          <button
            type="submit"
            style={{
              padding: '12px 32px',
              borderRadius: 12,
              background: 'linear-gradient(135deg, #FF0500 0%, #c53030 100%)',
              color: 'white',
              border: 'none',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(255, 5, 0, 0.4)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 5, 0, 0.6)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(255, 5, 0, 0.4)';
            }}
          >
            Continue
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <Toaster />
      <h1 className={`${styles.title} ${nosifer.className}`}>
        Food Distribution Log
      </h1>
      <h2 className={styles.subTitle}>
        Team: {teamName} (Code: {teamCode})
      </h2>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.memberNameHeader}>Member Name</th>
              {itemTypes.map((item) => (
                <th key={item}>{headerMap[item]}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {membersData.length > 0 ? (
              membersData.map((member) => (
                <tr key={member._id}>
                  <td className={styles.memberNameCell}>{member.name}</td>
                  {itemTypes.map((item) => (
                    <td key={item}>
                      <input
                        type="checkbox"
                        id={`food-${member._id}-${item}`}
                        checked={!!member[item]}
                        onChange={() => handleFoodToggle(member._id, item)}
                        className={styles.checkbox}
                      />
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={itemTypes.length + 1}
                  style={{ textAlign: 'center', color: '#888', padding: '20px' }}
                >
                  No members found for this team.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}