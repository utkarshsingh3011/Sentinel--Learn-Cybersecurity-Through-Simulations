import { NextResponse } from "next/server";

interface AnalyzeRequestBody {
  id?: string;
  industry?: string;
  threatActor?: string;
  attackType?: string;
  securityLevel?: string;
  primaryTarget?: string;
  stages?: unknown[];
}

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;

  let body: AnalyzeRequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON request payload." }, { status: 400 });
  }

  const { id, industry, threatActor, attackType, securityLevel, primaryTarget, stages } = body;

  // Fallback check if API key is not configured
  if (!apiKey || apiKey === "your_gemini_api_key_here") {
    console.warn(
      "[SENTINEL WARNING] GEMINI_API_KEY environment variable is not configured. Falling back to localized mock analyzer."
    );
    return NextResponse.json({
      isFallback: true,
      message: "Gemini API Key is not configured. Using local mock generator."
    });
  }

  // System instructions + prompt mapping target variables to MITRE AT&CK
  const prompt = `
You are a friendly, expert cybersecurity mentor. Your role is to provide brief, punchy, and highly understandable simulation results.
Analyze the simulated attack and compile a concise threat summary.
CRITICAL: Keep all descriptions extremely brief and to the point. All textual values (executiveSummary, actorProfile, operationalImpact, mitigations) MUST be exactly 1 to 2 short, direct sentences maximum. Absolutely no fluff, verbose narratives, or generic boilerplate text.

Campaign Telemetry Variables:
- Campaign Reference ID: ${id}
- Target Environment: ${industry}
- Attacker Profile: ${threatActor}
- Attack Scenario: ${attackType}
- Security Strength Level: ${securityLevel}
- Target System: ${primaryTarget}

Adversary Intrusion Execution Stages and Local EDR Logs:
${JSON.stringify(stages, null, 2)}

Task:
Generate a concise educational threat report in JSON format matching the schema below. Act as a supportive mentor. Do NOT output any markdown tags (like \`\`\`json or \`\`\`), just return the raw JSON object string.

Expected Output JSON Schema:
{
  "executiveSummary": "A concise 1-2 sentence explanation of what happened and whether defenses succeeded.",
  "actorProfile": "A brief 1-2 sentence profile of who this threat actor is and their primary goal.",
  "mitreMapping": [
    {
      "stageIndex": number (matching the index of each stage, starting from 0),
      "code": "string (the MITRE ATT&CK technique code, e.g. T1566.002, T1190, T1003.001, T1041)",
      "name": "string (the MITRE ATT&CK technique name, e.g. Spearphishing Link, Exploit Public-Facing Application, OS Credential Dumping, Exfiltration Over C2 Channel)"
    }
  ],
  "businessImpact": {
    "financialLoss": "Estimated financial damages, e.g., '$4,200,000 (remediation and class-action audits)'. Make it realistic and short.",
    "operationalImpact": "A brief 1-2 sentence description of affected systems and operational downtime.",
    "downtime": "Downtime statement, e.g., '24 Hours' or '0 Hours' if fully blocked."
  },
  "mitigations": [
    "Practical recommendation 1 (1 short sentence why it works)...",
    "Practical recommendation 2 (1 short sentence why it works)...",
    "Practical recommendation 3 (1 short sentence why it works)..."
  ],
  "riskAssessment": {
    "currentRisk": number (estimated current compromise chance %, e.g., 85),
    "projectedRisk": number (estimated risk after mitigations are deployed %, should be low, e.g., 5),
    "riskReduction": number (net risk mitigation difference currentRisk - projectedRisk, e.g., 80)
  }
}

Respond ONLY with the JSON matching this schema.
`;

  try {
    // Calling Google Gemini API beta model (supports Structured JSON Mode)
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API returned status ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    const textResponse = result.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textResponse) {
      throw new Error("No text content returned in Gemini API response.");
    }

    const reportData = JSON.parse(textResponse.trim());

    return NextResponse.json({
      isFallback: false,
      ...reportData,
    });
  } catch (error: unknown) {
    console.error("[SENTINEL ERROR] Gemini API generation failed:", error);
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred during API fetch.";
    return NextResponse.json({
      isFallback: true,
      error: errorMessage,
      message: "Gemini API call failed. Falling back to local mock generator."
    });
  }
}
