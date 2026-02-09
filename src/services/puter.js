export const getPuter = () => {
  if (typeof window === "undefined") return null;
  return window.puter || null;
};

export const initPuter = async () => {
  const puter = getPuter();
  if (!puter) return null;

  if (puter.init) {
    await puter.init();
  }
  return puter;
};

export const signIn = async () => {
  const puter = getPuter();
  if (puter?.auth?.signIn) {
    return puter.auth.signIn();
  }
  if (puter?.auth?.login) {
    return puter.auth.login();
  }
  throw new Error("Puter auth is not available in this environment.");
};

export const getUser = async () => {
  const puter = getPuter();
  if (puter?.auth?.getUser) {
    try {
      return await puter.auth.getUser();
    } catch {
      return null;
    }
  }
  return null;
};

export const isSignedIn = async () => {
  const puter = getPuter();
  if (puter?.auth?.isSignedIn) {
    return await puter.auth.isSignedIn();
  }
  return false;
};

const extractJson = (text) => {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {
        return null;
      }
    }
    return null;
  }
};

export const analyzeResume = async ({ resumeText, jobDescription, images = [] }) => {
  const puter = getPuter();

  if (!puter?.ai?.chat) {
    throw new Error("Puter AI is not available. Please sign in to Puter to use AI analysis.");
  }

  const systemPrompt = `You are an expert ATS (Applicant Tracking System) resume analyzer. Your task is to analyze resumes against job descriptions and provide detailed feedback.

IMPORTANT: Return ONLY a valid JSON object. Do not include markdown formatting, code blocks, or any explanatory text.

Use this exact JSON schema:
{
  "atsScore": number (0-100),
  "matchPercentage": number (0-100),
  "summary": "Brief overall assessment (2-3 sentences)",
  "strengths": ["List of candidate's key strengths"],
  "weaknesses": ["Areas needing improvement"],
  "missingKeywords": ["Important keywords from job description not found in resume"],
  "skillsMatch": {
    "matched": ["Skills found in both resume and job description"],
    "missing": ["Required skills not found in resume"]
  },
  "experienceRelevance": "Assessment of how relevant the experience is (High/Medium/Low)",
  "formattingIssues": ["Any ATS formatting problems detected"],
  "recommendations": ["Actionable suggestions for improvement"],
  "sectionScores": {
    "contactInfo": number (0-100),
    "summary": number (0-100),
    "experience": number (0-100),
    "education": number (0-100),
    "skills": number (0-100)
  }
}`;

  const userPrompt = `Please analyze the following resume against the job description provided.

RESUME TEXT:
${resumeText}

JOB DESCRIPTION:
${jobDescription || "No specific job description provided. Analyze the resume for general ATS optimization."}

Provide a comprehensive ATS analysis with specific scores and actionable recommendations.`;

  const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;

  try {
    // Use the correct Puter AI API syntax: puter.ai.chat(prompt, options)
    const response = await puter.ai.chat(fullPrompt, {
      model: "gpt-4o-mini"  // Use a reliable model
    });

    // Response can be a string directly or have various structures
    let content = "";
    if (typeof response === "string") {
      content = response;
    } else if (response?.message?.content) {
      content = response.message.content;
    } else if (response?.content) {
      content = response.content;
    } else if (response?.text) {
      content = response.text;
    } else {
      content = String(response);
    }

    const parsed = extractJson(content);

    if (!parsed) {
      console.error("Failed to parse AI response:", content.substring(0, 500));
      throw new Error("AI response was not valid JSON. Please try again.");
    }
    return parsed;
  } catch (error) {
    console.error("Puter AI error:", error);
    const errorMessage = error?.message || error?.toString() || "Unknown error occurred";
    throw new Error("AI analysis failed: " + errorMessage);
  }
};

export const saveResumeAssets = async ({ name, images, metadata, resumeFile }) => {
  const puter = getPuter();
  if (!puter?.fs) {
    return null;
  }

  const folder = `/AI-Resume-Analyzer/${name}-${Date.now()}`;

  try {
    await puter.fs.mkdir(folder);

    const savedFiles = [];

    if (images && images.length > 0) {
      const imageFiles = await Promise.all(
        images.map(async (image, index) => {
          const filePath = `${folder}/page-${index + 1}.png`;
          await puter.fs.writeFile(filePath, image);
          return filePath;
        })
      );
      savedFiles.push(...imageFiles);
    }

    const metaPath = `${folder}/analysis.json`;
    await puter.fs.writeFile(metaPath, JSON.stringify(metadata, null, 2));
    savedFiles.push(metaPath);

    if (resumeFile) {
      const resumePath = `${folder}/resume.pdf`;
      await puter.fs.writeFile(resumePath, resumeFile);
      savedFiles.push(resumePath);
    }

    return { folder, files: savedFiles };
  } catch (error) {
    throw new Error("Failed to save assets: " + error.message);
  }
};

export const listStoredAnalyses = async () => {
  const puter = getPuter();
  if (!puter?.fs) {
    return [];
  }

  try {
    const basePath = "/AI-Resume-Analyzer";
    const entries = await puter.fs.readdir(basePath);
    const analyses = [];

    for (const entry of entries) {
      if (entry.isDirectory || entry.type === "directory") {
        try {
          const metaPath = `${basePath}/${entry.name}/analysis.json`;
          const metaContent = await puter.fs.readFile(metaPath);
          const metadata = JSON.parse(metaContent);
          analyses.push({
            ...metadata,
            storagePath: `${basePath}/${entry.name}`
          });
        } catch {
          // Skip directories without valid metadata
        }
      }
    }

    return analyses.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } catch {
    return [];
  }
};

export const deleteStoredAnalysis = async (folderPath) => {
  const puter = getPuter();
  if (!puter?.fs) {
    return false;
  }

  try {
    await puter.fs.rmdir(folderPath, { recursive: true });
    return true;
  } catch (error) {
    throw new Error("Failed to delete analysis: " + error.message);
  }
};
