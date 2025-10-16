import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dbConnect from '@/lib/dbConnect';
import Registration from '@/models/Registration';
// Admin endpoints rely on strong token auth; no rate limiting applied
import { sanitizeString } from '@/lib/security';

function isAuthorized(request: NextRequest): boolean {
  const header = request.headers.get('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  const expected = process.env.ADMIN_TOKEN || '';
  
  return Boolean(expected) && token === expected;
}

interface AnalysisResult {
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
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ teamCode: string }> }
): Promise<NextResponse> {
  if (!isAuthorized(request)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const params = await context.params;
  const teamCode = sanitizeString(params.teamCode).substring(0, 20);

  try {
    // Check if Gemini API key is configured
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { message: 'Gemini API key not configured. Please add GEMINI_API_KEY to your environment variables.' },
        { status: 500 }
      );
    }

    await dbConnect();
    
    // Get the team data
    const team = await Registration.findOne({ 
      teamCode: teamCode.toUpperCase() 
    }).lean();

    if (!team) {
      return NextResponse.json({ message: 'Team not found' }, { status: 404 });
    }

    // Get request body for optional duplicate check
    const body = await request.json().catch(() => ({ checkDuplicacy: false }));
    const checkDuplicacy = body.checkDuplicacy || false;

    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    // Prepare the analysis prompt
    const prompt = `You are an expert hackathon judge and AI content detector. Analyze the following project submission in extreme detail.

**Project Title:** ${team.projectTitle}

**Project Description:** ${team.projectDescription}

**Team Name:** ${team.teamName}

**College:** ${team.collegeName}

${team.submissionDetails?.githubRepo ? `**GitHub Repository:** ${team.submissionDetails.githubRepo}` : ''}
${team.submissionDetails?.liveDemo ? `**Live Demo:** ${team.submissionDetails.liveDemo}` : ''}
${team.submissionDetails?.additionalNotes ? `**Additional Notes:** ${team.submissionDetails.additionalNotes}` : ''}

Please provide a comprehensive analysis with scores (0-100) for each factor:

1. **AI-Generated Content Detection** (0-100, where 0 = completely human-written, 100 = completely AI-generated)
   - Analyze writing style, patterns, and tell-tale signs of AI generation
   - Look for generic phrases, overly formal language, lack of personal touch
   - Check for repetitive structures common in AI text

2. **Idea Uniqueness** (0-100, where 0 = completely generic, 100 = highly innovative)
   - How original is this idea in the hackathon/startup space?
   - Does it solve a real problem in a novel way?
   - Is it just a rehash of existing solutions?

3. **Technical Complexity** (0-100, where 0 = trivial, 100 = highly complex)
   - Evaluate the technical sophistication required
   - Consider the tech stack, architecture, and implementation challenges
   - Assess the depth of technical knowledge needed

4. **Idea Quality/Goodness** (0-100, where 0 = poor, 100 = excellent)
   - Is this a viable, practical idea?
   - Does it have real-world impact potential?
   - Is the problem worth solving?
   - Is the solution well thought out?

5. **Overall Score** (0-100) - Weighted average considering all factors

Additionally, provide:
- Detailed reasoning for each score (2-3 sentences)
- 3-5 key strengths
- 3-5 key weaknesses
- 3-5 actionable recommendations for improvement

**IMPORTANT:** Respond ONLY with valid JSON in this exact format:
{
  "aiGeneratedScore": <number 0-100>,
  "ideaUniqueness": <number 0-100>,
  "technicalComplexity": <number 0-100>,
  "ideaQuality": <number 0-100>,
  "overallScore": <number 0-100>,
  "detailedAnalysis": {
    "aiDetectionReasoning": "<string>",
    "uniquenessReasoning": "<string>",
    "complexityReasoning": "<string>",
    "qualityReasoning": "<string>",
    "strengths": ["<string>", "<string>", ...],
    "weaknesses": ["<string>", "<string>", ...],
    "recommendations": ["<string>", "<string>", ...]
  }
}

Do NOT include any markdown formatting, code blocks, or additional text. Return ONLY the JSON object.`;

    // Generate the analysis
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let analysisText = response.text();

    // Clean up the response - remove markdown code blocks if present
    analysisText = analysisText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    // Parse the JSON response
    let analysis: AnalysisResult;
    try {
      const parsedAnalysis = JSON.parse(analysisText);
      analysis = {
        ...parsedAnalysis,
        analyzedAt: new Date().toISOString(),
      };
    } catch (_parseError) {
      console.error('Failed to parse Gemini response:', analysisText);
      return NextResponse.json(
        { message: 'Failed to parse AI analysis. Please try again.' },
        { status: 500 }
      );
    }

    // Optional: Check for duplicate/similar projects
    if (checkDuplicacy) {
      const allTeams = await Registration.find({
        _id: { $ne: team._id },
      }).select('teamName projectTitle projectDescription').lean();

      if (allTeams.length > 0) {
        // Create a prompt for duplicate checking
        const duplicacyPrompt = `Compare the following project with other projects and identify if there are any similar ideas.

**Current Project:**
Title: ${team.projectTitle}
Description: ${team.projectDescription}

**Other Projects:**
${allTeams.map((t, idx) => `${idx + 1}. "${t.projectTitle}" by ${t.teamName}: ${t.projectDescription}`).join('\n\n')}

Identify any projects that are significantly similar (similarity > 60%) to the current project. For each similar project found, provide:
- The project title and team name
- Similarity score (0-100)
- Brief reason for similarity

Respond ONLY with valid JSON in this format:
{
  "hasSimilar": <boolean>,
  "similarProjects": [
    {
      "teamName": "<string>",
      "projectTitle": "<string>",
      "similarityScore": <number 0-100>,
      "reason": "<string>"
    }
  ]
}

If no similar projects found, return: {"hasSimilar": false, "similarProjects": []}

Do NOT include any markdown formatting or additional text. Return ONLY the JSON object.`;

        try {
          const duplicacyResult = await model.generateContent(duplicacyPrompt);
          const duplicacyResponse = await duplicacyResult.response;
          let duplicacyText = duplicacyResponse.text();
          duplicacyText = duplicacyText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
          
          const duplicacyCheck = JSON.parse(duplicacyText);
          analysis.detailedAnalysis.duplicacyCheck = duplicacyCheck;
        } catch (dupError) {
          console.error('Duplicacy check failed:', dupError);
          // Continue without duplicacy check
        }
      }
    }

    // Store the analysis in the database
    await Registration.findOneAndUpdate(
      { teamCode: teamCode.toUpperCase() },
      { 
        aiAnalysis: analysis,
        updatedAt: new Date()
      },
      { new: true }
    );

    return NextResponse.json({ 
      success: true,
      data: analysis 
    });

  } catch (error) {
    console.error('Analysis error:', error);
    const msg = error instanceof Error ? error.message : 'Failed to analyze team submission';
    return NextResponse.json({ message: msg }, { status: 500 });
  }
}


