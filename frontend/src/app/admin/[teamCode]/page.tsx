"use client";
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
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

type AIAnalysis = {
  aiGeneratedScore: number;
  ideaUniqueness: number;
  technicalComplexity: number;
  ideaQuality: number;
  overallScore: number;
  detailedAnalysis: {
    aiDetectionReasoning: string;
    uniquenessReasoning: string;
    complexityReasoning: string;
    qualityReasoning: string;
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
    duplicacyCheck?: {
      hasSimilar: boolean;
      similarProjects: Array<{
        teamName: string;
        projectTitle: string;
        similarityScore: number;
        reason: string;
      }>;
    };
  };
  analyzedAt: string;
};

type TeamData = {
  _id: string;
  teamName: string;
  collegeName: string;
  projectTitle: string;
  projectDescription: string;
  teamLeadId?: number;
  teamCode: string;
  submissionStatus: string;
  selectionStatus: string;
  paymentStatus?: 'unpaid' | 'pending' | 'paid' | 'verified';
  members: Member[];
  createdAt?: string;
  updatedAt?: string;
  submissionDetails?: SubmissionDetails;
  reviewComments?: string;
  finalScore?: number | null;
  aiAnalysis?: AIAnalysis;
};

export default function AdminTeamView() {
  const router = useRouter();
  const params = useParams();
  const teamCode = params.teamCode as string;
  
  const [token, setToken] = useState<string>("");
  const [team, setTeam] = useState<TeamData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [updating, setUpdating] = useState<boolean>(false);
  const [reviewComments, setReviewComments] = useState<string>("");
  const [finalScore, setFinalScore] = useState<string>("");
  const [analyzing, setAnalyzing] = useState<boolean>(false);

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
    if (saved) {
      setToken(saved);
    } else {
      router.push('/admin');
    }
  }, [router]);

  useEffect(() => {
    if (!token || !teamCode) return;
    
    setLoading(true);
    setError("");
    
    fetch(`/api/admin/team/${teamCode}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (res.status === 401) {
          localStorage.removeItem('admin_token');
          router.push('/admin');
          throw new Error('Unauthorized');
        }
        if (!res.ok) {
          const text = await res.text().catch(() => '');
          throw new Error(text || 'Failed to fetch team');
        }
        return res.json();
      })
      .then((json) => {
        setTeam(json.data);
        setReviewComments(json.data.reviewComments || '');
        setFinalScore(json.data.finalScore?.toString() || '');
        
        // Auto-run AI analysis if not present
        if (!json.data.aiAnalysis) {
          runAIAnalysis(true);
        }
      })
      .catch((e) => {
        if (e.message !== 'Unauthorized') {
          setError(e.message || 'Failed to load team');
        }
      })
      .finally(() => setLoading(false));
  }, [token, teamCode, router]);

  async function updateSelectionStatus(status: string) {
    if (!token || !teamCode) return;
    
    const confirmMessage = status === 'selected' 
      ? 'Are you sure you want to ACCEPT this team?' 
      : 'Are you sure you want to REJECT this team?';
    
    if (!window.confirm(confirmMessage)) return;
    
    try {
      setUpdating(true);
      setError("");
      
      const res = await fetch(`/api/admin/team/${teamCode}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          selectionStatus: status,
          reviewComments: reviewComments.trim() || undefined,
          finalScore: finalScore.trim() ? parseFloat(finalScore) : null,
        }),
      });

      if (res.status === 401) {
        localStorage.removeItem('admin_token');
        router.push('/admin');
        throw new Error('Unauthorized');
      }

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Failed to update team');
      }

      const json = await res.json();
      setTeam(json.data);
      alert(`Team ${status === 'selected' ? 'accepted' : 'rejected'} successfully!`);
    } catch (e) {
      if ((e as Error).message !== 'Unauthorized') {
        setError((e as Error).message || 'Failed to update team');
      }
    } finally {
      setUpdating(false);
    }
  }

  async function runAIAnalysis(silent: boolean = false) {
    if (!token || !teamCode) return;
    
    try {
      setAnalyzing(true);
      if (!silent) setError("");
      
      const res = await fetch(`/api/admin/analyze/${teamCode}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ checkDuplicacy: true }),
      });

      if (res.status === 401) {
        localStorage.removeItem('admin_token');
        router.push('/admin');
        throw new Error('Unauthorized');
      }

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.message || 'Failed to analyze team');
      }

      const json = await res.json();
      setTeam(prev => prev ? { ...prev, aiAnalysis: json.data } : null);
      if (!silent) {
        alert('AI Analysis completed successfully!');
      }
    } catch (e) {
      if ((e as Error).message !== 'Unauthorized' && !silent) {
        setError((e as Error).message || 'Failed to run AI analysis');
      }
    } finally {
      setAnalyzing(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-white text-2xl">Loading team data...</div>
      </div>
    );
  }

  if (error || !team) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="max-w-md bg-gray-800 rounded-2xl p-8 text-center border border-red-500/30">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-white mb-4">Error</h2>
          <p className="text-gray-300 mb-6">{error || 'Team not found'}</p>
          <Link 
            href="/admin" 
            className="inline-block px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold rounded-lg hover:from-red-700 hover:to-red-800 transition-all"
          >
            Back to Admin Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
          <div>
            <Link 
              href="/admin" 
              className="text-orange-400 hover:text-orange-300 transition-colors mb-2 inline-block font-semibold"
            >
              ← Back to Dashboard
            </Link>
            <h1 className="text-4xl font-bold text-white mb-2" style={{ textShadow: '0 0 20px rgba(255, 100, 0, 0.5)' }}>
              {team.teamName}
            </h1>
            <div className="flex gap-3 flex-wrap">
              <span className="px-3 py-1 bg-orange-600/20 text-orange-400 rounded-full text-sm font-semibold border border-orange-500/30">
                {team.teamCode}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${
                team.selectionStatus === 'selected' ? 'bg-green-600/20 text-green-400 border-green-500/30' :
                team.selectionStatus === 'rejected' ? 'bg-red-600/20 text-red-400 border-red-500/30' :
                team.selectionStatus === 'waitlisted' ? 'bg-yellow-600/20 text-yellow-400 border-yellow-500/30' :
                'bg-gray-600/20 text-gray-400 border-gray-500/30'
              }`}>
                {team.selectionStatus.toUpperCase()}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${
                team.submissionStatus === 'submitted' || team.submissionStatus === 'accepted' ? 'bg-blue-600/20 text-blue-400 border-blue-500/30' :
                team.submissionStatus === 'rejected' ? 'bg-red-600/20 text-red-400 border-red-500/30' :
                team.submissionStatus === 'under_review' ? 'bg-yellow-600/20 text-yellow-400 border-yellow-500/30' :
                'bg-gray-600/20 text-gray-400 border-gray-500/30'
              }`}>
                {team.submissionStatus.replace('_', ' ').toUpperCase()}
              </span>
              {team.paymentStatus && (
                <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${
                  team.paymentStatus === 'verified' ? 'bg-green-600/20 text-green-400 border-green-500/30' :
                  team.paymentStatus === 'paid' ? 'bg-blue-600/20 text-blue-400 border-blue-500/30' :
                  'bg-gray-600/20 text-gray-400 border-gray-500/30'
                }`}>
                  {team.paymentStatus.toUpperCase()}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Team & Project Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Project Details */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 shadow-xl">
              <h2 className="text-2xl font-bold text-white mb-4">Project Submission</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-gray-400 text-sm font-semibold">Project Title</label>
                  <p className="text-white text-xl font-semibold mt-1">{team.projectTitle}</p>
                </div>
                <div>
                  <label className="text-gray-400 text-sm font-semibold">Description</label>
                  <p className="text-gray-300 mt-1 leading-relaxed">{team.projectDescription}</p>
                </div>
                <div>
                  <label className="text-gray-400 text-sm font-semibold">College</label>
                  <p className="text-white mt-1">{team.collegeName}</p>
                </div>
              </div>
            </div>

            {/* Additional Submission Links */}
            {(team.submissionDetails?.githubRepo || team.submissionDetails?.liveDemo || team.submissionDetails?.presentationLink) && (
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 shadow-xl">
                <h2 className="text-2xl font-bold text-white mb-4">Submission Links</h2>
                <div className="space-y-3">
                  {team.submissionDetails?.githubRepo && (
                    <div>
                      <label className="text-gray-400 text-sm font-semibold">GitHub Repository</label>
                      <a 
                        href={team.submissionDetails.githubRepo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block mt-1 text-blue-400 hover:text-blue-300 transition-colors break-all"
                      >
                        {team.submissionDetails.githubRepo}
                      </a>
                    </div>
                  )}
                  {team.submissionDetails?.liveDemo && (
                    <div>
                      <label className="text-gray-400 text-sm font-semibold">Live Demo</label>
                      <a 
                        href={team.submissionDetails.liveDemo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block mt-1 text-blue-400 hover:text-blue-300 transition-colors break-all"
                      >
                        {team.submissionDetails.liveDemo}
                      </a>
                    </div>
                  )}
                  {team.submissionDetails?.presentationLink && (
                    <div>
                      <label className="text-gray-400 text-sm font-semibold">Presentation</label>
                      <a 
                        href={team.submissionDetails.presentationLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block mt-1 text-blue-400 hover:text-blue-300 transition-colors break-all"
                      >
                        {team.submissionDetails.presentationLink}
                      </a>
                    </div>
                  )}
                  {team.submissionDetails?.additionalNotes && (
                    <div>
                      <label className="text-gray-400 text-sm font-semibold">Additional Notes</label>
                      <p className="text-gray-300 mt-1 whitespace-pre-wrap">{team.submissionDetails.additionalNotes}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* AI Analysis Scores - Subtle Integration */}
            {team.aiAnalysis && (
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white">AI Analysis</h2>
                  <button
                    onClick={() => runAIAnalysis(false)}
                    disabled={analyzing}
                    className="text-xs px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-all"
                  >
                    {analyzing ? 'Analyzing...' : 'Re-analyze'}
                  </button>
                </div>
                
                {/* Compact Score Grid */}
                <div className="grid grid-cols-5 gap-2 mb-4">
                  <div className="text-center p-3 bg-gray-900/50 rounded-lg border border-gray-700/50">
                    <div className="text-xs text-gray-500 mb-1">AI Content</div>
                    <div className={`text-2xl font-bold ${
                      team.aiAnalysis.aiGeneratedScore > 70 ? 'text-red-400' :
                      team.aiAnalysis.aiGeneratedScore > 40 ? 'text-yellow-400' :
                      'text-green-400'
                    }`}>
                      {team.aiAnalysis.aiGeneratedScore}%
                    </div>
                  </div>
                  <div className="text-center p-3 bg-gray-900/50 rounded-lg border border-gray-700/50">
                    <div className="text-xs text-gray-500 mb-1">Uniqueness</div>
                    <div className={`text-2xl font-bold ${
                      team.aiAnalysis.ideaUniqueness > 70 ? 'text-green-400' :
                      team.aiAnalysis.ideaUniqueness > 40 ? 'text-yellow-400' :
                      'text-red-400'
                    }`}>
                      {team.aiAnalysis.ideaUniqueness}%
                    </div>
                  </div>
                  <div className="text-center p-3 bg-gray-900/50 rounded-lg border border-gray-700/50">
                    <div className="text-xs text-gray-500 mb-1">Complexity</div>
                    <div className={`text-2xl font-bold ${
                      team.aiAnalysis.technicalComplexity > 70 ? 'text-green-400' :
                      team.aiAnalysis.technicalComplexity > 40 ? 'text-yellow-400' :
                      'text-red-400'
                    }`}>
                      {team.aiAnalysis.technicalComplexity}%
                    </div>
                  </div>
                  <div className="text-center p-3 bg-gray-900/50 rounded-lg border border-gray-700/50">
                    <div className="text-xs text-gray-500 mb-1">Quality</div>
                    <div className={`text-2xl font-bold ${
                      team.aiAnalysis.ideaQuality > 70 ? 'text-green-400' :
                      team.aiAnalysis.ideaQuality > 40 ? 'text-yellow-400' :
                      'text-red-400'
                    }`}>
                      {team.aiAnalysis.ideaQuality}%
                    </div>
                  </div>
                  <div className="text-center p-3 bg-gray-900/50 rounded-lg border border-gray-700/50">
                    <div className="text-xs text-gray-500 mb-1">Overall</div>
                    <div className={`text-2xl font-bold ${
                      team.aiAnalysis.overallScore > 70 ? 'text-green-400' :
                      team.aiAnalysis.overallScore > 40 ? 'text-yellow-400' :
                      'text-red-400'
                    }`}>
                      {team.aiAnalysis.overallScore}%
                    </div>
                  </div>
                </div>

                {/* Collapsible Details */}
                <details className="text-sm">
                  <summary className="cursor-pointer text-gray-400 hover:text-gray-300 transition-colors font-semibold">
                    View Detailed Analysis
                  </summary>
                  <div className="mt-4 space-y-3">
                    {team.aiAnalysis.detailedAnalysis.strengths.length > 0 && (
                      <div>
                        <div className="text-green-400 font-semibold mb-1">Strengths</div>
                        <ul className="text-gray-300 space-y-1 text-xs">
                          {team.aiAnalysis.detailedAnalysis.strengths.map((s, i) => (
                            <li key={i}>• {s}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {team.aiAnalysis.detailedAnalysis.weaknesses.length > 0 && (
                      <div>
                        <div className="text-red-400 font-semibold mb-1">Weaknesses</div>
                        <ul className="text-gray-300 space-y-1 text-xs">
                          {team.aiAnalysis.detailedAnalysis.weaknesses.map((w, i) => (
                            <li key={i}>• {w}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {team.aiAnalysis.detailedAnalysis.recommendations.length > 0 && (
                      <div>
                        <div className="text-orange-400 font-semibold mb-1">Recommendations</div>
                        <ul className="text-gray-300 space-y-1 text-xs">
                          {team.aiAnalysis.detailedAnalysis.recommendations.map((r, i) => (
                            <li key={i}>• {r}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {team.aiAnalysis.detailedAnalysis.duplicacyCheck?.hasSimilar && (
                      <div>
                        <div className="text-yellow-400 font-semibold mb-1">Similar Projects Found</div>
                        <div className="space-y-2">
                          {team.aiAnalysis.detailedAnalysis.duplicacyCheck.similarProjects.map((p, i) => (
                            <div key={i} className="bg-gray-900/50 p-2 rounded border border-yellow-500/30">
                              <div className="text-white text-xs font-semibold">{p.projectTitle}</div>
                              <div className="text-gray-400 text-xs">by {p.teamName} • {p.similarityScore}% similar</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </details>
              </div>
            )}

            {/* Team Members */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 shadow-xl">
              <h2 className="text-2xl font-bold text-white mb-4">Team Members</h2>
              <div className="space-y-4">
                {team.members.map((member, idx) => (
                  <div 
                    key={idx} 
                    className={`bg-gray-900/50 rounded-xl p-4 border ${
                      idx === team.teamLeadId 
                        ? 'border-yellow-500/50 bg-yellow-900/10' 
                        : 'border-gray-700/50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-bold text-white">{member.name}</h3>
                      {idx === team.teamLeadId && (
                        <span className="px-2 py-1 bg-yellow-600/20 text-yellow-400 rounded-full text-xs font-semibold border border-yellow-500/30">
                          TEAM LEAD
                        </span>
                      )}
                    </div>
                    <div className="space-y-1 text-sm">
                      <p className="text-gray-300">
                        <span className="text-gray-500">Email:</span> {member.email}
                      </p>
                      <p className="text-gray-300">
                        <span className="text-gray-500">Phone:</span> {member.phone}
                      </p>
                      {member.usn && (
                        <p className="text-gray-300">
                          <span className="text-gray-500">USN:</span> {member.usn}
                        </p>
                      )}
                      <div className="flex gap-3 mt-2">
                        {member.linkedin && (
                          <a 
                            href={member.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 transition-colors text-xs"
                          >
                            LinkedIn →
                          </a>
                        )}
                        {member.github && (
                          <a 
                            href={member.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-purple-400 hover:text-purple-300 transition-colors text-xs"
                          >
                            GitHub →
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Review & Actions */}
          <div className="space-y-6">
            {/* Review Section */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 shadow-xl">
              <h2 className="text-2xl font-bold text-white mb-4">Review & Actions</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="text-gray-400 text-sm font-semibold block mb-2">
                    Final Score (Optional)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g., 85.5"
                    value={finalScore}
                    onChange={(e) => setFinalScore(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="text-gray-400 text-sm font-semibold block mb-2">
                    Review Comments
                  </label>
                  <textarea
                    placeholder="Enter your feedback..."
                    value={reviewComments}
                    onChange={(e) => setReviewComments(e.target.value)}
                    rows={6}
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors resize-none"
                  />
                </div>

                {error && (
                  <div className="bg-red-900/30 border border-red-500/50 rounded-xl p-3 text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <div className="pt-2 space-y-3">
                  <button
                    onClick={() => updateSelectionStatus('selected')}
                    disabled={updating || team.selectionStatus === 'selected'}
                    className={`w-full py-3 px-6 rounded-xl font-bold text-white transition-all shadow-lg ${
                      team.selectionStatus === 'selected'
                        ? 'bg-gray-700 cursor-not-allowed opacity-50'
                        : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800'
                    }`}
                  >
                    {updating ? 'Processing...' : team.selectionStatus === 'selected' ? 'Team Accepted' : 'Accept Team'}
                  </button>

                  <button
                    onClick={() => updateSelectionStatus('rejected')}
                    disabled={updating || team.selectionStatus === 'rejected'}
                    className={`w-full py-3 px-6 rounded-xl font-bold text-white transition-all shadow-lg ${
                      team.selectionStatus === 'rejected'
                        ? 'bg-gray-700 cursor-not-allowed opacity-50'
                        : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800'
                    }`}
                  >
                    {updating ? 'Processing...' : team.selectionStatus === 'rejected' ? 'Team Rejected' : 'Reject Team'}
                  </button>

                  <button
                    onClick={() => router.push('/admin')}
                    className="w-full py-2 px-6 rounded-xl font-semibold bg-gray-700 text-gray-300 hover:bg-gray-600 transition-all"
                  >
                    Back to Dashboard
                  </button>
                </div>

                {/* Metadata */}
                <div className="pt-4 mt-4 border-t border-gray-700">
                  <div className="space-y-2 text-xs text-gray-500">
                    {team.createdAt && (
                      <div>Created: {new Date(team.createdAt).toLocaleString()}</div>
                    )}
                    {team.updatedAt && (
                      <div>Updated: {new Date(team.updatedAt).toLocaleString()}</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
