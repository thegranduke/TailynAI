import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

const MATCH_PROMPT_TEMPLATE = `
You're an expert resume matcher. Here's a user's profile:

Skills:
{skills}

Projects:
{projects}

Work Experience:
{experiences}

Job Description:
{job_description}

Return a JSON object with:
- job_title: the job title (if available)
- job_company: the company name (if available)
- job_raw_description: the full job description text, with newlines separated by \\n
- matched_skill_ids: list of skill ids that best match
- matched_project_ids: list of project ids that best match
- matched_experience_ids: list of experience ids that best match
- improved_descriptions: { id: updated_description } for projects and experiences these should follow the XYZ format: What was done , what it achieved , how it was done . Be concise and concrete but natural and conversational. and newlines should be separated by \\n.

Ensure this would be the best combination of skills, projects, and experiences for the user to match the job description and company.

Only return valid JSON. No explanations or markdown.
`;

export async function matchJobToProfile(profile: any, jobDescription: string) {
  try {
    const prompt = MATCH_PROMPT_TEMPLATE
      .replace("{skills}", JSON.stringify(profile.skills, null, 2))
      .replace("{projects}", JSON.stringify(profile.projects, null, 2))
      .replace("{experiences}", JSON.stringify(profile.experiences, null, 2))
      .replace("{job_description}", jobDescription);

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    // Clean up response text (remove markdown if present)
    const cleanText = text.replace(/```json\n?|\n?```/g, "").trim();
    return JSON.parse(cleanText);
  } catch (error) {
    console.error("Error in matchJobToProfile:", error);
    throw error;
  }
} 