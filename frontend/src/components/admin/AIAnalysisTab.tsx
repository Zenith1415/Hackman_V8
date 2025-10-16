"use client";
import React from 'react';

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

interface AIAnalysisTabProps {
  aiAnalysis?: AIAnalysis;
  analyzing: boolean;
  onRunAnalysis: () => void;
}

export default function AIAnalysisTab({ aiAnalysis, analyzing, onRunAnalysis }: AIAnalysisTabProps) {
  if (!aiAnalysis) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center max-w-md">
          <div className="text-8xl mb-6">👻</div>
          <h3 className="text-2xl font-bold text-orange-400 mb-3" style={{ textShadow: '0 0 20px rgba(255, 100, 0, 0.5)' }}>
            No AI Analysis Yet
          </h3>
          <p className="text-gray-400 mb-6">
            {analyzing ? 
              '🔄 The spirits are analyzing this submission...' : 
              'Click the button below to summon AI-powered insights'
            }
          </p>
          {!analyzing && (
            <button
              onClick={onRunAnalysis}
              className="px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white font-bold rounded-lg transition-all transform hover:scale-105"
              style={{ boxShadow: '0 4px 20px rgba(255, 100, 0, 0.4)' }}
            >
              🎃 Run AI Analysis
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Rerun Button */}
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-orange-400" style={{ textShadow: '0 0 20px rgba(255, 100, 0, 0.5)' }}>
          🤖 AI-Powered Analysis
        </h3>
        <button
          onClick={onRunAnalysis}
          disabled={analyzing}
          className={`px-4 py-2 rounded-lg font-semibold text-white transition-all ${
            analyzing 
              ? 'bg-gray-600 cursor-not-allowed' 
              : 'bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800'
          }`}
        >
          {analyzing ? '🔄 Analyzing...' : '🔄 Re-analyze'}
        </button>
      </div>

      {/* Score Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {/* AI Generated Score */}
        <div className={`p-4 rounded-xl border-2 ${
          aiAnalysis.aiGeneratedScore > 70 ? 'bg-red-900/20 border-red-500/50' :
          aiAnalysis.aiGeneratedScore > 40 ? 'bg-yellow-900/20 border-yellow-500/50' :
          'bg-green-900/20 border-green-500/50'
        }`}>
          <div className="text-xs text-gray-400 mb-1 uppercase font-semibold">AI Generated</div>
          <div className={`text-2xl md:text-3xl font-bold ${
            aiAnalysis.aiGeneratedScore > 70 ? 'text-red-400' :
            aiAnalysis.aiGeneratedScore > 40 ? 'text-yellow-400' :
            'text-green-400'
          }`}>
            {aiAnalysis.aiGeneratedScore}
            <span className="text-sm md:text-lg">/100</span>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {aiAnalysis.aiGeneratedScore > 70 ? '⚠️ High Risk' :
             aiAnalysis.aiGeneratedScore > 40 ? '⚡ Moderate' : '✅ Low Risk'}
          </div>
        </div>

        {/* Idea Uniqueness */}
        <div className={`p-4 rounded-xl border-2 ${
          aiAnalysis.ideaUniqueness > 70 ? 'bg-green-900/20 border-green-500/50' :
          aiAnalysis.ideaUniqueness > 40 ? 'bg-yellow-900/20 border-yellow-500/50' :
          'bg-red-900/20 border-red-500/50'
        }`}>
          <div className="text-xs text-gray-400 mb-1 uppercase font-semibold">Uniqueness</div>
          <div className={`text-2xl md:text-3xl font-bold ${
            aiAnalysis.ideaUniqueness > 70 ? 'text-green-400' :
            aiAnalysis.ideaUniqueness > 40 ? 'text-yellow-400' :
            'text-red-400'
          }`}>
            {aiAnalysis.ideaUniqueness}
            <span className="text-sm md:text-lg">/100</span>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {aiAnalysis.ideaUniqueness > 70 ? '🌟 Innovative' :
             aiAnalysis.ideaUniqueness > 40 ? '👍 Decent' : '❌ Generic'}
          </div>
        </div>

        {/* Technical Complexity */}
        <div className={`p-4 rounded-xl border-2 ${
          aiAnalysis.technicalComplexity > 70 ? 'bg-green-900/20 border-green-500/50' :
          aiAnalysis.technicalComplexity > 40 ? 'bg-yellow-900/20 border-yellow-500/50' :
          'bg-red-900/20 border-red-500/50'
        }`}>
          <div className="text-xs text-gray-400 mb-1 uppercase font-semibold">Complexity</div>
          <div className={`text-2xl md:text-3xl font-bold ${
            aiAnalysis.technicalComplexity > 70 ? 'text-green-400' :
            aiAnalysis.technicalComplexity > 40 ? 'text-yellow-400' :
            'text-red-400'
          }`}>
            {aiAnalysis.technicalComplexity}
            <span className="text-sm md:text-lg">/100</span>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {aiAnalysis.technicalComplexity > 70 ? '🚀 Advanced' :
             aiAnalysis.technicalComplexity > 40 ? '⚙️ Moderate' : '📝 Simple'}
          </div>
        </div>

        {/* Idea Quality */}
        <div className={`p-4 rounded-xl border-2 ${
          aiAnalysis.ideaQuality > 70 ? 'bg-green-900/20 border-green-500/50' :
          aiAnalysis.ideaQuality > 40 ? 'bg-yellow-900/20 border-yellow-500/50' :
          'bg-red-900/20 border-red-500/50'
        }`}>
          <div className="text-xs text-gray-400 mb-1 uppercase font-semibold">Quality</div>
          <div className={`text-2xl md:text-3xl font-bold ${
            aiAnalysis.ideaQuality > 70 ? 'text-green-400' :
            aiAnalysis.ideaQuality > 40 ? 'text-yellow-400' :
            'text-red-400'
          }`}>
            {aiAnalysis.ideaQuality}
            <span className="text-sm md:text-lg">/100</span>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {aiAnalysis.ideaQuality > 70 ? '⭐ Excellent' :
             aiAnalysis.ideaQuality > 40 ? '👌 Good' : '⚠️ Needs Work'}
          </div>
        </div>

        {/* Overall Score */}
        <div className={`p-4 rounded-xl border-2 ${
          aiAnalysis.overallScore > 70 ? 'bg-green-900/20 border-green-500/50' :
          aiAnalysis.overallScore > 40 ? 'bg-yellow-900/20 border-yellow-500/50' :
          'bg-red-900/20 border-red-500/50'
        }`}>
          <div className="text-xs text-gray-400 mb-1 uppercase font-semibold">Overall</div>
          <div className={`text-2xl md:text-3xl font-bold ${
            aiAnalysis.overallScore > 70 ? 'text-green-400' :
            aiAnalysis.overallScore > 40 ? 'text-yellow-400' :
            'text-red-400'
          }`}>
            {aiAnalysis.overallScore}
            <span className="text-sm md:text-lg">/100</span>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {aiAnalysis.overallScore > 70 ? '🎯 Strong' :
             aiAnalysis.overallScore > 40 ? '👍 Fair' : '⚠️ Weak'}
          </div>
        </div>
      </div>

      {/* Detailed Analysis */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Strengths */}
        <div className="bg-black/30 rounded-xl p-5 border border-green-500/30">
          <h3 className="text-lg font-bold text-green-400 mb-3 flex items-center gap-2">
            <span>💪</span> Strengths
          </h3>
          <ul className="space-y-2">
            {aiAnalysis.detailedAnalysis.strengths.map((strength, idx) => (
              <li key={idx} className="text-gray-300 text-sm flex items-start gap-2">
                <span className="text-green-400 mt-1">✓</span>
                <span>{strength}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Weaknesses */}
        <div className="bg-black/30 rounded-xl p-5 border border-red-500/30">
          <h3 className="text-lg font-bold text-red-400 mb-3 flex items-center gap-2">
            <span>⚠️</span> Weaknesses
          </h3>
          <ul className="space-y-2">
            {aiAnalysis.detailedAnalysis.weaknesses.map((weakness, idx) => (
              <li key={idx} className="text-gray-300 text-sm flex items-start gap-2">
                <span className="text-red-400 mt-1">✗</span>
                <span>{weakness}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-black/30 rounded-xl p-5 border border-orange-500/30">
        <h3 className="text-lg font-bold text-orange-400 mb-3 flex items-center gap-2">
          <span>💡</span> Recommendations
        </h3>
        <ul className="space-y-2">
          {aiAnalysis.detailedAnalysis.recommendations.map((rec, idx) => (
            <li key={idx} className="text-gray-300 text-sm flex items-start gap-2">
              <span className="text-orange-400 mt-1">→</span>
              <span>{rec}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Detailed Reasoning - Collapsible */}
      <details className="bg-black/30 rounded-xl p-5 border border-gray-700/50">
        <summary className="text-lg font-bold text-gray-300 cursor-pointer flex items-center gap-2 hover:text-orange-400 transition-colors">
          <span>📊</span> Detailed Reasoning
        </summary>
        <div className="mt-4 space-y-3 text-sm">
          <div>
            <div className="text-orange-400 font-semibold mb-1">AI Detection Analysis:</div>
            <div className="text-gray-300">{aiAnalysis.detailedAnalysis.aiDetectionReasoning}</div>
          </div>
          <div>
            <div className="text-orange-400 font-semibold mb-1">Uniqueness Analysis:</div>
            <div className="text-gray-300">{aiAnalysis.detailedAnalysis.uniquenessReasoning}</div>
          </div>
          <div>
            <div className="text-orange-400 font-semibold mb-1">Complexity Analysis:</div>
            <div className="text-gray-300">{aiAnalysis.detailedAnalysis.complexityReasoning}</div>
          </div>
          <div>
            <div className="text-orange-400 font-semibold mb-1">Quality Analysis:</div>
            <div className="text-gray-300">{aiAnalysis.detailedAnalysis.qualityReasoning}</div>
          </div>
        </div>
      </details>

      {/* Duplicacy Check Results */}
      {aiAnalysis.detailedAnalysis.duplicacyCheck && (
        <div className={`bg-black/30 rounded-xl p-5 border-2 ${
          aiAnalysis.detailedAnalysis.duplicacyCheck.hasSimilar 
            ? 'border-orange-500/50' 
            : 'border-green-500/50'
        }`}>
          <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
            <span>{aiAnalysis.detailedAnalysis.duplicacyCheck.hasSimilar ? '🔍' : '✅'}</span>
            <span className={aiAnalysis.detailedAnalysis.duplicacyCheck.hasSimilar ? 'text-orange-400' : 'text-green-400'}>
              Duplicacy Check
            </span>
          </h3>
          {aiAnalysis.detailedAnalysis.duplicacyCheck.hasSimilar ? (
            <div className="space-y-3">
              <p className="text-orange-300 text-sm font-semibold">⚠️ Similar projects found:</p>
              {aiAnalysis.detailedAnalysis.duplicacyCheck.similarProjects.map((proj, idx) => (
                <div key={idx} className="bg-gray-900/50 rounded-lg p-3 border border-orange-500/30">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <div className="font-semibold text-white">{proj.projectTitle}</div>
                      <div className="text-gray-400 text-xs">by {proj.teamName}</div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                      proj.similarityScore > 80 ? 'bg-red-500/20 text-red-400' :
                      proj.similarityScore > 60 ? 'bg-orange-500/20 text-orange-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {proj.similarityScore}% similar
                    </div>
                  </div>
                  <div className="text-gray-300 text-sm">{proj.reason}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-green-300 text-sm">✨ No similar projects found. This idea appears to be unique!</p>
          )}
        </div>
      )}

      {/* Analysis Timestamp */}
      <div className="text-xs text-gray-500 text-center pt-2 border-t border-orange-900/30">
        👻 Analysis performed on {new Date(aiAnalysis.analyzedAt).toLocaleString()}
      </div>
    </div>
  );
}

