/**
 * Shared Hritik Support chat logic (Gemini only; same contract as former Next /api/chat).
 * Plain fetch to Google Generative Language API; no AI SDK on the server.
 */

/** Fast, low-cost model with a generous free tier on the Gemini Developer API (generateContent). */
const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash-lite";

/** Unversioned / retired ids that return "not found" on v1beta — map to default. */
const LEGACY_GEMINI_MODEL_ALIASES = {
  "gemini-1.5-flash": DEFAULT_GEMINI_MODEL,
  "gemini-1.5-pro": DEFAULT_GEMINI_MODEL,
  "gemini-1.0-pro": DEFAULT_GEMINI_MODEL,
  "gemini-pro": DEFAULT_GEMINI_MODEL,
  "gemini-flash": DEFAULT_GEMINI_MODEL,
};

/** True quota/RPM errors — never use bare `.includes("rate")` (matches "geneRATE" in Google's messages). */
function isQuotaOrRateLimitMessage(message) {
  if (typeof message !== "string") return false;
  const m = message.toLowerCase();
  if (message.includes("[HTTP 429]")) return true;
  if (m.includes("resource exhausted")) return true;
  if (m.includes("resource_exhausted")) return true;
  if (m.includes("too many requests")) return true;
  if (m.includes("rate limit") || m.includes("ratelimit")) return true;
  if (m.includes("quota exceeded") || m.includes("exceeded quota")) return true;
  if (m.includes("requests per minute") || m.includes("tokens per minute"))
    return true;
  if (m.includes("limit: 0")) return true;
  return false;
}

function resolveGeminiModel(env) {
  const raw = (env.GEMINI_MODEL || "").trim();
  if (!raw) return DEFAULT_GEMINI_MODEL;
  const mapped = LEGACY_GEMINI_MODEL_ALIASES[raw];
  if (mapped) return mapped;
  return raw;
}

function hasKey(value) {
  return value != null && String(value).trim() !== "";
}

export function buildSystemPrompt(k) {
  const about = k.about;
  const aboutText = [
    `${about.greeting} ${about.description}`,
    `Location: ${about.location}. ${about.tagline}`,
    ...(about.highlights || []).map((h) => `• ${h}`),
    `${about.escalationText}: ${about.linkedInUrl}`,
  ].join("\n");

  const experienceLines = [];
  for (const job of k.experience) {
    for (const pos of job.positions) {
      const period = pos.end
        ? `${pos.start} – ${pos.end}`
        : `${pos.start} – Present`;
      experienceLines.push(`${job.company}: ${pos.title} (${period})`);
      for (const bullet of pos.description || []) {
        experienceLines.push(`  • ${bullet}`);
      }
    }
  }
  const experienceText = experienceLines.join("\n");

  const educationLines = [];
  for (const edu of k.education) {
    const period = edu.start && edu.end ? `${edu.start} – ${edu.end}` : "";
    educationLines.push(
      `${edu.name}: ${edu.degree}${period ? ` (${period})` : ""}. CGPA: ${edu.cgpa}.`
    );
    educationLines.push(`  Courses: ${(edu.courses || []).join(", ")}`);
  }
  const educationText = educationLines.join("\n");

  const projectLines = k.projects.map(
    (p) =>
      `${p.name}: ${p.description} [${(p.tags || []).join(", ")}]. Source: ${p.sourceUrl ?? "—"}`
  );
  const projectsText = projectLines.join("\n");

  const skills = k.skillsAndSoftware || {};
  const allSoftware = [
    ...(skills.programmingLanguages || []),
    ...(skills.mlAndAI || []),
    ...(skills.dataAndPlatforms || []),
    ...(skills.toolsAndLibraries || []),
    ...(skills.fundamentals || []),
  ];
  const softwareText = Array.from(new Set(allSoftware)).join(", ");

  const contact = k.contact || {};
  const contactText = [
    `LinkedIn: ${contact.linkedIn}`,
    `GitHub: ${contact.github}`,
    `Email: ${contact.email}`,
    `Resume: ${contact.resumeUrl || "/resume.pdf"}`,
    `Website: ${contact.website || "https://hritiksharma.me"}`,
  ].join("\n");

  const siteInfo = k.siteInfo || {};
  const routesText = (siteInfo.routes || [])
    .map((r) => `  ${r.path} — ${r.name}: ${r.description}`)
    .join("\n");
  const siteText = [
    `${siteInfo.name}: ${siteInfo.description}`,
    "Routes:",
    routesText,
    siteInfo.privacyNote ? `Privacy: ${siteInfo.privacyNote}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const persona = k.persona || {};
  const role = persona.role || "Hritik Support";
  const tone = persona.tone || "Friendly and professional.";
  const instructions = (persona.instructions || []).join("\n");

  return `You are ${role}, the assistant for HritikSharma.me. ${tone}

## Your instructions
${instructions}

---

## About Hritik
${aboutText}

## Experience (full detail)
${experienceText}

## Education
${educationText}

## Projects
${projectsText}

## Skills & software (complete list)
Hritik is proficient in: ${softwareText}

## Contact
${contactText}

## Site info
${siteText}

Use the above as the single source of truth. Be confident when describing Hritik's programming skills, algorithm knowledge, and breadth of technologies.`;
}

function toGeminiContents(messages) {
  const contents = [];
  for (const m of messages) {
    if (m.role === "system") continue;
    const role = m.role === "assistant" ? "model" : "user";
    contents.push({
      role,
      parts: [{ text: m.content || "" }],
    });
  }
  return contents;
}

async function chatGemini(env, messages) {
  const key = env.GOOGLE_API_KEY;
  const model = resolveGeminiModel(env);
  const systemMessage = messages.find((m) => m.role === "system");
  const systemInstruction = systemMessage
    ? { parts: [{ text: systemMessage.content || "" }] }
    : undefined;
  const contents = toGeminiContents(messages);
  if (contents.length === 0) return "(No response)";

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction,
      contents,
      generationConfig: {
        maxOutputTokens: 600,
        temperature: 0.7,
      },
    }),
  });

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    const msg =
      errBody.error?.message ||
      res.statusText ||
      `Request failed (${res.status})`;
    if (res.status === 429) {
      throw new Error(`[HTTP 429] ${msg}`);
    }
    throw new Error(msg);
  }

  const data = await res.json();
  const text =
    data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";
  if (text) return text;

  const block = data.promptFeedback?.blockReason;
  if (block) {
    throw new Error(
      `Response blocked (${block}). Try rephrasing your message.`
    );
  }

  return "(No response)";
}

function getContent(m) {
  if (typeof m.content === "string") return m.content;
  if (Array.isArray(m.content)) {
    return m.content
      .map((p) => (p.type === "text" ? p.text ?? "" : ""))
      .join("");
  }
  return "";
}

/**
 * @param {{ GOOGLE_API_KEY?: string; GEMINI_MODEL?: string }} env
 * @param {object} knowledge Parsed chatbot-knowledge.json
 * @param {{ messages?: Array<{ role: string; content: unknown }> }} body
 * @returns {Promise<Response>}
 */
export async function chatPostResponse(env, knowledge, body) {
  const useGoogle = hasKey(env.GOOGLE_API_KEY);

  try {
    const incoming = body?.messages ?? [];

    if (!useGoogle) {
      return new Response(
        JSON.stringify({
          error: "Internal Server Error",
          detail:
            "No GOOGLE_API_KEY. Set it on the server (Gemini API key).",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = buildSystemPrompt(knowledge);
    const conversation = incoming
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map((m) => ({
        role: m.role,
        content: getContent(m),
      }));
    const messages = [{ role: "system", content: systemPrompt }, ...conversation];

    const reply = await chatGemini(env, messages);

    return new Response(reply, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (error) {
    console.error("[chat support]", error);
    const message =
      error instanceof Error ? error.message : "An unknown error occurred";
    const isQuotaOrRate = isQuotaOrRateLimitMessage(message);
    const rateDetail =
      "Gemini free tier has RPM/TPM/RPD caps. Wait a minute, shorten chat history, or check quotas at https://aistudio.google.com/rate-limit . You can set GEMINI_MODEL=gemini-2.5-flash for a different quota bucket.";
    return new Response(
      JSON.stringify({
        error: isQuotaOrRate ? "Rate limit exceeded" : "Internal Server Error",
        detail: isQuotaOrRate ? rateDetail : message,
      }),
      {
        status: isQuotaOrRate ? 429 : 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
