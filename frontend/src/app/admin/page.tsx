"use client";
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
type Member = {
  name: string;
  email: string;
  phone: string;
  usn?: string;
  linkedin: string;
  github: string;
};
type SubmissionDetails = {
  githubRepo: string;
  liveDemo: string;
  presentationLink: string;
  additionalNotes: string;
  submittedAt: string | null;
};
type EditFormType = {
  teamName: string;
  collegeName: string;
  projectTitle: string;
  projectDescription: string;
  teamLeadId: number | null;
  teamCode: string;
  submissionStatus: string;
  selectionStatus: string;
  paymentStatus: 'unpaid' | 'paid' | 'verified';
  reviewComments: string;
  finalScore: number | null;
  submissionDetails: SubmissionDetails;
  members: Member[];
};
type Registration = {
  _id: string;
  teamName: string;
  collegeName: string;
  projectTitle: string;
  projectDescription: string;
  teamLeadId?: number;
  teamCode: string;
  submissionStatus: string;
  selectionStatus: string;
  paymentStatus?: 'unpaid' | 'paid' | 'verified';
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
export default function AdminPage() {
  const [token, setToken] = useState<string>("");
  const [inputToken, setInputToken] = useState<string>("");
  const [data, setData] = useState<Registration[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [query, setQuery] = useState<string>("");
  const [editTarget, setEditTarget] = useState<Registration | null>(null);
  const [editForm, setEditForm] = useState<EditFormType | null>(null);
  const [savingEdit, setSavingEdit] = useState<boolean>(false);
  const [selectionFilter, setSelectionFilter] = useState<string>('all');
  const [submissionFilter, setSubmissionFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(20);
  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
    if (saved) {
      setToken(saved);
    }
  }, []);
  useEffect(() => {
    if (!token) return;
    setLoading(true);
    setError("");
    fetch('/api/admin/registrations', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text().catch(() => '');
          throw new Error(text || 'Failed to fetch');
        }
        return res.json();
      })
      .then((json) => setData(json.data || []))
      .catch((e) => setError(e.message || 'Failed to load'))
      .finally(() => setLoading(false));
  }, [token]);
  const filtered = useMemo(() => {
    if (!data) return [] as Registration[];
    const text = query.trim().toLowerCase();
    return data.filter((r) => {
      const matchesText = !text || [
        r.teamName,
        r.collegeName,
        r.projectTitle,
        r.teamCode,
        r.selectionStatus,
        r.submissionStatus,
        r.paymentStatus,
        ...r.members.flatMap((m) => [m.name, m.email, m.phone]),
      ].filter(Boolean).some((field) => String(field).toLowerCase().includes(text));
      const matchesSelection = selectionFilter === 'all' || r.selectionStatus === selectionFilter;
      const matchesSubmission = submissionFilter === 'all' || r.submissionStatus === submissionFilter;
      const matchesPayment = paymentFilter === 'all' || (r.paymentStatus || 'unpaid') === paymentFilter;
      return matchesText && matchesSelection && matchesSubmission && matchesPayment;
    });
  }, [data, query, selectionFilter, submissionFilter, paymentFilter]);

  // Pagination
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filtered.slice(startIndex, startIndex + itemsPerPage);
  }, [filtered, currentPage, itemsPerPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [query, selectionFilter, submissionFilter, paymentFilter]);
  function handleSubmitToken(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = inputToken.trim();
    if (!trimmed) return;
    localStorage.setItem('admin_token', trimmed);
    setToken(trimmed);
  }
  function handleLogout() {
    localStorage.removeItem('admin_token');
    setToken("");
    setData(null);
  }
  function openEdit(reg: Registration) {
    setEditTarget(reg);
    setEditForm({
      teamName: reg.teamName,
      collegeName: reg.collegeName,
      projectTitle: reg.projectTitle,
      projectDescription: reg.projectDescription,
      teamLeadId: reg.teamLeadId ?? null,
      teamCode: reg.teamCode,
      submissionStatus: reg.submissionStatus,
      selectionStatus: reg.selectionStatus,
      paymentStatus: reg.paymentStatus || 'unpaid',
      reviewComments: reg.reviewComments ?? '',
      finalScore: reg.finalScore ?? null,
      submissionDetails: {
        githubRepo: reg.submissionDetails?.githubRepo || '',
        liveDemo: reg.submissionDetails?.liveDemo || '',
        presentationLink: reg.submissionDetails?.presentationLink || '',
        additionalNotes: reg.submissionDetails?.additionalNotes || '',
        submittedAt: reg.submissionDetails?.submittedAt || null,
      },
      members: reg.members.map(m => ({
        name: m.name,
        email: m.email,
        phone: m.phone,
        usn: m.usn || '',
        linkedin: m.linkedin,
        github: m.github,
      })),
    });
  }
  function updateEditField(path: string, value: string | number | null) {
    setEditForm((prev: EditFormType | null) => {
      if (!prev) return prev;
      const next = { ...prev };
      const parts = path.split('.');
      if (parts.length === 1) {
        return { ...next, [path]: value };
      }
      if (parts[0] === 'submissionDetails') {
        return {
          ...next,
          submissionDetails: {
            ...next.submissionDetails,
            [parts[1]]: value
          }
        };
      }
      if (parts[0] === 'members') {
        const index = parseInt(parts[1]);
        const field = parts[2];
        const updatedMembers = [...next.members];
        if (updatedMembers[index]) {
          updatedMembers[index] = {
            ...updatedMembers[index],
            [field]: value
          };
        }
        return { ...next, members: updatedMembers };
      }
      return next;
    });
  }
  function addMember() {
    setEditForm((prev: EditFormType | null) => {
      if (!prev) return prev;
      return {
        ...prev,
        members: [
          ...prev.members,
          { name: '', email: '', phone: '', usn: '', linkedin: '', github: '' },
        ],
      };
    });
  }
  function removeMember(index: number) {
    setEditForm((prev: EditFormType | null) => {
      if (!prev) return prev;
      return {
        ...prev,
        members: prev.members.filter((_, i) => i !== index),
      };
    });
  }
  async function saveEdit() {
    if (!editTarget || !token) {
      setError('Admin token required to save edits.');
      return;
    }
    try {
      setSavingEdit(true);
      const res = await fetch(`/api/admin/registrations/${editTarget._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editForm),
      });
      if (res.status === 401) {
        throw new Error('Unauthorized');
      }
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || 'Failed to save');
      }
      const json = await res.json();
      const updated: Registration = json.data;
      setData(prev => (prev || []).map(r => r._id === updated._id ? updated : r));
      setEditTarget(null);
      setEditForm(null);
    } catch (e) {
      if ((e as Error).message === 'Unauthorized') {
        setError('Admin token invalid. Please login again.');
        localStorage.removeItem('admin_token');
        setToken("");
      } else {
        setError((e as Error).message || 'Failed to save');
      }
    } finally {
      setSavingEdit(false);
    }
  }
  async function handleDelete(registrationId: string) {
    if (!window.confirm('Are you sure you want to delete this team? This action cannot be undone.')) {
      return;
    }
    if (!token) {
      setError('Admin token required to delete.');
      return;
    }
    try {
      const res = await fetch(`/api/admin/registrations/${registrationId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.status === 401) {
        throw new Error('Unauthorized');
      }
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || 'Failed to delete');
      }
      setData(prev => (prev || []).filter(r => r._id !== registrationId));
    } catch (e) {
      if ((e as Error).message === 'Unauthorized') {
        setError('Admin token invalid. Please login again.');
        localStorage.removeItem('admin_token');
        setToken("");
      } else {
        setError((e as Error).message || 'Failed to delete');
      }
    }
  }
  if (!token) {
    return (
      <div style={{ maxWidth: 420, margin: '64px auto', padding: 24 }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>Admin Login</h2>
        <p style={{ color: '#666', marginBottom: 16 }}>Enter the admin access token.</p>
        <form onSubmit={handleSubmitToken} style={{ display: 'flex', gap: 8 }}>
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
    <div style={{ padding: '20px', color: '#000000ff', maxWidth: '100vw', overflowX: 'hidden', background: 'linear-gradient(to bottom right, #1a1a1a, #0a0a0a)', minHeight: '100vh' }}>
      <style jsx>{`
        @media (max-width: 768px) {
          .admin-header {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 8px !important;
          }
          .admin-header h2 {
            font-size: 18px !important;
          }
          .admin-header input {
            min-width: 100% !important;
            width: 100% !important;
          }
          .admin-filters {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 8px !important;
            width: 100% !important;
          }
          .admin-filters select {
            width: 100% !important;
            font-size: 14px !important;
          }
          .admin-filters button {
            grid-column: 1 / -1 !important;
            width: 100% !important;
          }
          .table-wrapper {
            overflow-x: auto !important;
            -webkit-overflow-scrolling: touch !important;
            margin: 0 -12px !important;
            padding: 0 12px !important;
            width: calc(100vw - 24px) !important;
            max-width: 100% !important;
          }
          .admin-table {
            min-width: 1200px !important;
            font-size: 11px !important;
            display: table !important;
          }
          .admin-table th,
          .admin-table td {
            padding: 6px 4px !important;
            font-size: 11px !important;
            white-space: nowrap !important;
          }
          .admin-table th {
            position: sticky !important;
            top: 0 !important;
            background: #f5f5f5 !important;
            z-index: 10 !important;
          }
          .admin-table button {
            font-size: 10px !important;
            padding: 4px 6px !important;
          }
          .mobile-scroll-hint {
            display: block !important;
            text-align: center !important;
          }
          .edit-modal {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            bottom: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            border-radius: 0 !important;
            overflow-y: auto !important;
          }
          .edit-content {
            padding: 12px !important;
          }
          .edit-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
      <div className="admin-header" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <h2 style={{ fontSize: '28px', fontWeight: 700, marginRight: 'auto', color: '#FF0000', minWidth: 'fit-content', textShadow: '0 0 20px rgba(255, 0, 0, 0.5)' }}>🎃 Admin Dashboard</h2>
        <input
          placeholder="Search teams, members, codes..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ padding: '8px 10px', border: '1px solid #000000ff', borderRadius: 8, minWidth: '200px', color: '#fff', background: '#111', flex: '1' }}
        />
        <div className="admin-filters" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <select value={selectionFilter} onChange={(e) => setSelectionFilter(e.target.value)} style={{ padding: '8px 10px', border: '1px solid #ddd', borderRadius: 8, color: '#fff', background: '#111' }}>
          <option value="all">All Selections</option>
          <option value="pending">pending</option>
          <option value="selected">selected</option>
          <option value="waitlisted">waitlisted</option>
          <option value="rejected">rejected</option>
        </select>
        <select value={submissionFilter} onChange={(e) => setSubmissionFilter(e.target.value)} style={{ padding: '8px 10px', border: '1px solid #ddd', borderRadius: 8, color: '#fff', background: '#111' }}>
          <option value="all">All Submissions</option>
          <option value="not_submitted">not_submitted</option>
          <option value="submitted">submitted</option>
          <option value="under_review">under_review</option>
          <option value="accepted">accepted</option>
          <option value="rejected">rejected</option>
        </select>
        <select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)} style={{ padding: '8px 10px', border: '1px solid #ddd', borderRadius: 8, color: '#fff', background: '#111' }}>
          <option value="all">All Payments</option>
          <option value="unpaid">unpaid</option>
          <option value="paid">paid</option>
          <option value="verified">verified</option>
        </select>
        <button 
          onClick={handleLogout} 
          style={{ 
            padding: '10px 20px', 
            borderRadius: 8, 
            background: 'linear-gradient(135deg, #4a5568 0%, #2d3748 100%)', 
            color: '#fff',
            border: 'none',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
            transition: 'all 0.3s ease'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, #FF0500 0%, #c53030 100%)';
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 5, 0, 0.5)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, #4a5568 0%, #2d3748 100%)';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.3)';
          }}
        >
          Logout
        </button>
        </div>
      </div>
      {loading && <p style={{ color: 'white', textAlign: 'center', fontSize: '18px', marginTop: '40px' }}>⏳ Loading...</p>}
      {error && (
        <div style={{ 
          color: '#ff6b6b', 
          marginBottom: 16, 
          padding: '12px 16px', 
          background: '#ff6b6b20', 
          border: '1px solid #ff6b6b40', 
          borderRadius: 8 
        }}>
          {error}
        </div>
      )}
      {!loading && data && (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: 16, 
          marginBottom: 24 
        }}>
          <div style={{ 
            background: 'linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%)', 
            padding: 20, 
            borderRadius: 12, 
            border: '1px solid #333',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.5)'
          }}>
            <div style={{ fontSize: '32px', fontWeight: 700, color: '#FF0000' }}>{data.length}</div>
            <div style={{ fontSize: '14px', color: '#999', marginTop: 4 }}>Total Teams</div>
          </div>
          <div style={{ 
            background: 'linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%)', 
            padding: 20, 
            borderRadius: 12, 
            border: '1px solid #333',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.5)'
          }}>
            <div style={{ fontSize: '32px', fontWeight: 700, color: '#10b981' }}>
              {data.filter(r => r.selectionStatus === 'selected').length}
            </div>
            <div style={{ fontSize: '14px', color: '#999', marginTop: 4 }}>Selected</div>
          </div>
          <div style={{ 
            background: 'linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%)', 
            padding: 20, 
            borderRadius: 12, 
            border: '1px solid #333',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.5)'
          }}>
            <div style={{ fontSize: '32px', fontWeight: 700, color: '#3b82f6' }}>
              {data.filter(r => r.submissionStatus === 'submitted' || r.submissionStatus === 'accepted').length}
            </div>
            <div style={{ fontSize: '14px', color: '#999', marginTop: 4 }}>Submissions</div>
          </div>
          <div style={{ 
            background: 'linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%)', 
            padding: 20, 
            borderRadius: 12, 
            border: '1px solid #333',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.5)'
          }}>
            <div style={{ fontSize: '32px', fontWeight: 700, color: '#f59e0b' }}>
              {data.filter(r => r.selectionStatus === 'pending').length}
            </div>
            <div style={{ fontSize: '14px', color: '#999', marginTop: 4 }}>Pending Review</div>
          </div>
        </div>
      )}
      {editTarget && editForm && (
        <div
          role="dialog"
          aria-modal="true"
          className="edit-modal"
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 1000 }}
          onClick={() => { if (!savingEdit) { setEditTarget(null); setEditForm(null); } }}
        >
          <div className="edit-content" onClick={(e) => e.stopPropagation()} style={{ width: 'min(980px, 98%)', background: '#0b0b0b', color: '#fff', borderRadius: 12, border: '1px solid #222', padding: 20, maxHeight: '90vh', overflow: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginRight: 'auto' }}>Edit Team: {editTarget.teamName}</h3>
              <button 
                onClick={() => { if (!savingEdit) { setEditTarget(null); setEditForm(null); } }} 
                style={{ 
                  padding: '8px 16px', 
                  borderRadius: 8, 
                  background: 'linear-gradient(135deg, #4a5568 0%, #2d3748 100%)', 
                  color: '#fff', 
                  border: 'none',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
                  transition: 'all 0.3s ease'
                }}
              >
                Close
              </button>
              <button 
                onClick={saveEdit} 
                disabled={savingEdit} 
                style={{ 
                  padding: '8px 20px', 
                  borderRadius: 8, 
                  background: 'linear-gradient(135deg, #FF0500 0%, #c53030 100%)', 
                  color: '#fff', 
                  border: 'none',
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  cursor: savingEdit ? 'not-allowed' : 'pointer',
                  opacity: savingEdit ? 0.7 : 1,
                  boxShadow: '0 4px 15px rgba(255, 5, 0, 0.4)',
                  transition: 'all 0.3s ease'
                }}
              >
                {savingEdit ? 'Saving...' : 'Save'}
              </button>
            </div>
            <div className="edit-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={{ border: '1px solid #1f1f1f', borderRadius: 10, padding: 12 }}>
                <div style={{ fontWeight: 700, marginBottom: 8 }}>Team Info</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <input placeholder="Team Name" value={editForm.teamName} onChange={(e) => updateEditField('teamName', e.target.value)} style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid #333', background: '#0f0f0f', color: '#fff' }} />
                  <input placeholder="College Name" value={editForm.collegeName} onChange={(e) => updateEditField('collegeName', e.target.value)} style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid #333', background: '#0f0f0f', color: '#fff' }} />
                  <input placeholder="Team Code" value={editForm.teamCode} onChange={(e) => updateEditField('teamCode', e.target.value)} style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid #333', background: '#0f0f0f', color: '#fff', gridColumn: '1 / -1' }} />
                </div>
              </div>
              <div style={{ border: '1px solid #1f1f1f', borderRadius: 10, padding: 12 }}>
                <div style={{ fontWeight: 700, marginBottom: 8 }}>Project</div>
                <input placeholder="Project Title" value={editForm.projectTitle} onChange={(e) => updateEditField('projectTitle', e.target.value)} style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid #333', background: '#0f0f0f', color: '#fff', marginBottom: 8 }} />
                <textarea placeholder="Project Description" value={editForm.projectDescription} onChange={(e) => updateEditField('projectDescription', e.target.value)} style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid #333', background: '#0f0f0f', color: '#fff', minHeight: 100 }} />
              </div>
              <div style={{ border: '1px solid #1f1f1f', borderRadius: 10, padding: 12 }}>
                <div style={{ fontWeight: 700, marginBottom: 8 }}>Statuses</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                  <select value={editForm.submissionStatus} onChange={(e) => updateEditField('submissionStatus', e.target.value)} style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid #333', background: '#0f0f0f', color: '#fff' }}>
                    <option value="not_submitted">not_submitted</option>
                    <option value="submitted">submitted</option>
                    <option value="under_review">under_review</option>
                    <option value="accepted">accepted</option>
                    <option value="rejected">rejected</option>
                  </select>
                  <select value={editForm.selectionStatus} onChange={(e) => updateEditField('selectionStatus', e.target.value)} style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid #333', background: '#0f0f0f', color: '#fff' }}>
                    <option value="pending">pending</option>
                    <option value="selected">selected</option>
                    <option value="waitlisted">waitlisted</option>
                    <option value="rejected">rejected</option>
                  </select>
                  <select value={editForm.paymentStatus} onChange={(e) => updateEditField('paymentStatus', e.target.value)} style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid #333', background: '#0f0f0f', color: '#fff' }}>
                    <option value="unpaid">unpaid</option>
                    <option value="paid">paid</option>
                    <option value="verified">verified</option>
                  </select>
                  <input placeholder="Final Score (optional)" type="number" value={editForm.finalScore ?? ''} onChange={(e) => updateEditField('finalScore', e.target.value === '' ? null : Number(e.target.value))} style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid #333', background: '#0f0f0f', color: '#fff' }} />
                </div>
                <textarea placeholder="Review Comments" value={editForm.reviewComments} onChange={(e) => updateEditField('reviewComments', e.target.value)} style={{ marginTop: 8, padding: '8px 10px', borderRadius: 8, border: '1px solid #333', background: '#0f0f0f', color: '#fff', minHeight: 80 }} />
              </div>
              <div style={{ border: '1px solid #1f1f1f', borderRadius: 10, padding: 12 }}>
                <div style={{ fontWeight: 700, marginBottom: 8 }}>Submission Links</div>
                <input placeholder="GitHub Repo" value={editForm.submissionDetails.githubRepo} onChange={(e) => updateEditField('submissionDetails.githubRepo', e.target.value)} style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid #333', background: '#0f0f0f', color: '#fff', marginBottom: 8 }} />
                <input placeholder="Live Demo" value={editForm.submissionDetails.liveDemo} onChange={(e) => updateEditField('submissionDetails.liveDemo', e.target.value)} style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid #333', background: '#0f0f0f', color: '#fff', marginBottom: 8 }} />
                <input placeholder="Presentation Link" value={editForm.submissionDetails.presentationLink} onChange={(e) => updateEditField('submissionDetails.presentationLink', e.target.value)} style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid #333', background: '#0f0f0f', color: '#fff', marginBottom: 8 }} />
                <input placeholder="Submitted At (ISO)" value={editForm.submissionDetails.submittedAt ?? ''} onChange={(e) => updateEditField('submissionDetails.submittedAt', e.target.value || null)} style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid #333', background: '#0f0f0f', color: '#fff' }} />
                <textarea placeholder="Additional Notes" value={editForm.submissionDetails.additionalNotes} onChange={(e) => updateEditField('submissionDetails.additionalNotes', e.target.value)} style={{ marginTop: 8, padding: '8px 10px', borderRadius: 8, border: '1px solid #333', background: '#0f0f0f', color: '#fff', minHeight: 80 }} />
              </div>
              <div style={{ border: '1px solid #1f1f1f', borderRadius: 10, padding: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ fontWeight: 700, marginBottom: 8, marginRight: 'auto' }}>Members</div>
                  <button 
                    onClick={addMember} 
                    style={{ 
                      padding: '8px 16px', 
                      borderRadius: 8, 
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', 
                      color: '#fff', 
                      border: 'none',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Add
                  </button>
                </div>
                <div style={{ display: 'grid', gap: 8 }}>
                  {editForm.members.map((m: Member, idx: number) => (
                    <div key={idx} style={{ border: '1px solid #2a2a2a', borderRadius: 8, padding: 8 }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                        <input placeholder="Name" value={m.name} onChange={(e) => updateEditField(`members.${idx}.name`, e.target.value)} style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid #333', background: '#0f0f0f', color: '#fff' }} />
                        <input placeholder="Email" value={m.email} onChange={(e) => updateEditField(`members.${idx}.email`, e.target.value)} style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid #333', background: '#0f0f0f', color: '#fff' }} />
                        <input placeholder="Phone" value={m.phone} onChange={(e) => updateEditField(`members.${idx}.phone`, e.target.value)} style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid #333', background: '#0f0f0f', color: '#fff' }} />
                        <input placeholder="USN" value={m.usn} onChange={(e) => updateEditField(`members.${idx}.usn`, e.target.value)} style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid #333', background: '#0f0f0f', color: '#fff' }} />
                        <input placeholder="LinkedIn URL" value={m.linkedin} onChange={(e) => updateEditField(`members.${idx}.linkedin`, e.target.value)} style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid #333', background: '#0f0f0f', color: '#fff' }} />
                        <input placeholder="GitHub URL" value={m.github} onChange={(e) => updateEditField(`members.${idx}.github`, e.target.value)} style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid #333', background: '#0f0f0f', color: '#fff' }} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginTop: 8, gap: 8 }}>
                        {editForm.teamLeadId === idx && (
                          <span style={{ marginRight: 'auto', fontWeight: 'bold', color: '#ffa500' }}>⭐ Team Leader</span>
                        )}
                        <button 
                          onClick={() => removeMember(idx)} 
                          style={{ 
                            padding: '8px 16px', 
                            borderRadius: 8, 
                            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', 
                            color: '#fff', 
                            border: 'none',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)',
                            transition: 'all 0.3s ease'
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {!loading && !error && (
        <>
          <div style={{ 
            display: 'none', 
            background: '#fff3cd', 
            color: '#856404', 
            padding: '8px 12px', 
            borderRadius: 6, 
            marginBottom: 8, 
            fontSize: 13,
            border: '1px solid #ffeeba'
          }} className="mobile-scroll-hint">
            ← Swipe left to see all columns →
          </div>
          <div className="table-wrapper" style={{ overflowX: 'auto', border: '1px solid #333', borderRadius: 12, background: '#0f0f0f' }}>
            <table className="admin-table" style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, color: '#000' }}>
              <thead>
              <tr style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%)', borderBottom: '2px solid #FF0000' }}>
                <th style={{ textAlign: 'left', padding: 16, color: '#FF0000', fontWeight: 700, fontSize: '14px' }}>Team</th>
                <th style={{ textAlign: 'left', padding: 16, color: '#FF0000', fontWeight: 700, fontSize: '14px' }}>College</th>
                <th style={{ textAlign: 'left', padding: 16, color: '#FF0000', fontWeight: 700, fontSize: '14px' }}>Project</th>
                <th style={{ textAlign: 'left', padding: 16, color: '#FF0000', fontWeight: 700, fontSize: '14px' }}>Team Code</th>
                <th style={{ textAlign: 'left', padding: 16, color: '#FF0000', fontWeight: 700, fontSize: '14px' }}>Submission</th>
                <th style={{ textAlign: 'left', padding: 16, color: '#FF0000', fontWeight: 700, fontSize: '14px' }}>Selection</th>
                <th style={{ textAlign: 'left', padding: 16, color: '#FF0000', fontWeight: 700, fontSize: '14px' }}>Payment</th>
                <th style={{ textAlign: 'left', padding: 16, color: '#FF0000', fontWeight: 700, fontSize: '14px' }}>Members</th>
                <th style={{ textAlign: 'left', padding: 16, whiteSpace: 'nowrap', color: '#FF0000', fontWeight: 700, fontSize: '14px' }}>Created</th>
                <th style={{ textAlign: 'left', padding: 16, color: '#FF0000', fontWeight: 700, fontSize: '14px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((r) => (
                <tr key={r._id} style={{ background: '#1c1c1c', color: '#ffffff', borderBottom: '1px solid #2a2a2a' }}>
                  <td style={{ padding: 16, borderTop: '1px solid #2a2a2a' }}>
                    <div style={{ fontWeight: 600 }}>{r.teamName}</div>
                  </td>
                  <td style={{ padding: 16, borderTop: '1px solid #2a2a2a' }}>{r.collegeName}</td>
                  <td style={{ padding: 16, borderTop: '1px solid #2a2a2a' }}>
                    <div style={{ fontWeight: 600 }}>{r.projectTitle}</div>
                    <div style={{ color: '#999', maxWidth: 420, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', fontSize: '13px', marginTop: '4px' }}>{r.projectDescription}</div>
                  </td>
                  <td style={{ padding: 16, borderTop: '1px solid #2a2a2a' }}>
                    <span style={{ 
                      background: 'linear-gradient(135deg, #FF0500 0%, #c53030 100%)', 
                      padding: '4px 12px', 
                      borderRadius: 6, 
                      fontSize: '12px', 
                      fontWeight: 'bold',
                      display: 'inline-block'
                    }}>
                      {r.teamCode}
                    </span>
                  </td>
                  <td style={{ padding: 16, borderTop: '1px solid #2a2a2a' }}>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: 6,
                      fontSize: '12px',
                      fontWeight: 600,
                      display: 'inline-block',
                      background: r.submissionStatus === 'submitted' || r.submissionStatus === 'accepted' ? '#10b98120' : r.submissionStatus === 'rejected' ? '#ef444420' : '#4a556820',
                      color: r.submissionStatus === 'submitted' || r.submissionStatus === 'accepted' ? '#10b981' : r.submissionStatus === 'rejected' ? '#ef4444' : '#9ca3af',
                      border: `1px solid ${r.submissionStatus === 'submitted' || r.submissionStatus === 'accepted' ? '#10b98140' : r.submissionStatus === 'rejected' ? '#ef444440' : '#4a556840'}`
                    }}>
                      {r.submissionStatus.replace('_', ' ')}
                    </span>
                  </td>
                  <td style={{ padding: 16, borderTop: '1px solid #2a2a2a' }}>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: 6,
                      fontSize: '12px',
                      fontWeight: 600,
                      display: 'inline-block',
                      background: r.selectionStatus === 'selected' ? '#10b98120' : r.selectionStatus === 'rejected' ? '#ef444420' : r.selectionStatus === 'waitlisted' ? '#f59e0b20' : '#4a556820',
                      color: r.selectionStatus === 'selected' ? '#10b981' : r.selectionStatus === 'rejected' ? '#ef4444' : r.selectionStatus === 'waitlisted' ? '#f59e0b' : '#9ca3af',
                      border: `1px solid ${r.selectionStatus === 'selected' ? '#10b98140' : r.selectionStatus === 'rejected' ? '#ef444440' : r.selectionStatus === 'waitlisted' ? '#f59e0b40' : '#4a556840'}`
                    }}>
                      {r.selectionStatus}
                    </span>
                  </td>
                  <td style={{ padding: 16, borderTop: '1px solid #2a2a2a' }}>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: 6,
                      fontSize: '12px',
                      fontWeight: 600,
                      display: 'inline-block',
                      background: (r.paymentStatus || 'unpaid') === 'verified' ? '#10b98120' : (r.paymentStatus || 'unpaid') === 'paid' ? '#3b82f620' : '#4a556820',
                      color: (r.paymentStatus || 'unpaid') === 'verified' ? '#10b981' : (r.paymentStatus || 'unpaid') === 'paid' ? '#3b82f6' : '#9ca3af',
                      border: `1px solid ${(r.paymentStatus || 'unpaid') === 'verified' ? '#10b98140' : (r.paymentStatus || 'unpaid') === 'paid' ? '#3b82f640' : '#4a556840'}`
                    }}>
                      {r.paymentStatus || 'unpaid'}
                    </span>
                  </td>
                  <td style={{ padding: 16, borderTop: '1px solid #2a2a2a' }}>
                    <div style={{ fontSize: '13px', color: '#ccc' }}>
                      {r.members.length} member{r.members.length !== 1 ? 's' : ''}
                    </div>
                  </td>
                  <td style={{ padding: 16, borderTop: '1px solid #2a2a2a', fontSize: '13px' }}>
                    {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '-'}
                  </td>
                  <td style={{ padding: 16, borderTop: '1px solid #2a2a2a' }}>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <Link
                        href={`/admin/${r.teamCode}`}
                        style={{ 
                          padding: '8px 16px', 
                          borderRadius: 8, 
                          background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', 
                          color: '#fff', 
                          border: 'none',
                          fontWeight: 'bold',
                          textDecoration: 'none',
                          display: 'inline-block',
                          cursor: 'pointer',
                          boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        View
                      </Link>
                      <button
                        onClick={() => openEdit(r)}
                        style={{ 
                          padding: '8px 16px', 
                          borderRadius: 8, 
                          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', 
                          color: '#fff', 
                          border: 'none',
                          fontWeight: 'bold',
                          cursor: !token ? 'not-allowed' : 'pointer',
                          opacity: !token ? 0.5 : 1,
                          boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)',
                          transition: 'all 0.3s ease'
                        }}
                        disabled={!token}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(r._id)}
                        style={{ 
                          padding: '8px 16px', 
                          borderRadius: 8, 
                          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', 
                          color: '#fff', 
                          border: 'none',
                          fontWeight: 'bold',
                          cursor: !token ? 'not-allowed' : 'pointer',
                          opacity: !token ? 0.5 : 1,
                          boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)',
                          transition: 'all 0.3s ease'
                        }}
                        disabled={!token}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div style={{
            marginTop: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
            padding: '12px 16px',
            background: '#1a1a1a',
            borderRadius: 8,
            border: '1px solid #333'
          }}>
            <div style={{ color: '#999', fontSize: '14px' }}>
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length} team{filtered.length !== 1 ? 's' : ''}
              {filtered.length !== data?.length && ` (${data?.length || 0} total)`}
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {/* Items per page selector */}
              <select 
                value={itemsPerPage} 
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                style={{ 
                  padding: '6px 10px', 
                  border: '1px solid #444', 
                  borderRadius: 6, 
                  color: '#fff', 
                  background: '#111',
                  fontSize: '13px'
                }}
              >
                <option value="10">10 per page</option>
                <option value="20">20 per page</option>
                <option value="50">50 per page</option>
                <option value="100">100 per page</option>
              </select>

              {/* Pagination buttons */}
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                style={{
                  padding: '6px 12px',
                  borderRadius: 6,
                  background: currentPage === 1 ? '#222' : '#333',
                  color: currentPage === 1 ? '#555' : '#fff',
                  border: '1px solid #444',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  fontSize: '13px',
                  fontWeight: 'bold'
                }}
              >
                First
              </button>
              
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                style={{
                  padding: '6px 12px',
                  borderRadius: 6,
                  background: currentPage === 1 ? '#222' : '#333',
                  color: currentPage === 1 ? '#555' : '#fff',
                  border: '1px solid #444',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  fontSize: '13px',
                  fontWeight: 'bold'
                }}
              >
                ← Prev
              </button>
              
              <div style={{ 
                padding: '6px 12px', 
                color: '#FF0000', 
                fontWeight: 'bold',
                fontSize: '13px'
              }}>
                Page {currentPage} of {totalPages}
              </div>
              
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                style={{
                  padding: '6px 12px',
                  borderRadius: 6,
                  background: currentPage === totalPages ? '#222' : '#333',
                  color: currentPage === totalPages ? '#555' : '#fff',
                  border: '1px solid #444',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  fontSize: '13px',
                  fontWeight: 'bold'
                }}
              >
                Next →
              </button>
              
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                style={{
                  padding: '6px 12px',
                  borderRadius: 6,
                  background: currentPage === totalPages ? '#222' : '#333',
                  color: currentPage === totalPages ? '#555' : '#fff',
                  border: '1px solid #444',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  fontSize: '13px',
                  fontWeight: 'bold'
                }}
              >
                Last
              </button>
            </div>
          </div>
        )}

        {/* Simple count when no pagination needed */}
        {totalPages <= 1 && (
          <div style={{ 
            marginTop: 16, 
            textAlign: 'center', 
            color: '#999', 
            fontSize: '14px',
            padding: '12px',
            background: '#1a1a1a',
            borderRadius: 8,
            border: '1px solid #333'
          }}>
            Showing {filtered.length} of {data?.length || 0} team{(data?.length || 0) !== 1 ? 's' : ''}
          </div>
        )}
        </>
      )}
    </div>
  );
}