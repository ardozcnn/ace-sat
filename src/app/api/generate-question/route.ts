import { generateLocalQuestion } from "@/lib/generate";
import type { Difficulty, TopicId } from "@/lib/types";
import { SECTION_PATH } from "@/lib/path";
import { z } from "zod";

const BodySchema = z.object({
  topic: z.string(),
  difficulty: z.number().min(1).max(5).optional(),
  weakHint: z.string().optional(),
});

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const body = BodySchema.parse(json);
    const topic = body.topic as TopicId;
    const valid = [
      ...SECTION_PATH.math,
      ...SECTION_PATH.rw,
    ] as TopicId[];
    if (!valid.includes(topic)) {
      return Response.json({ error: "Invalid topic" }, { status: 400 });
    }
    const difficulty = (body.difficulty ?? 2) as Difficulty;

    const key = process.env.OPENAI_API_KEY;
    if (!key) {
      // Always available offline generator
      const question = generateLocalQuestion({ topic, difficulty });
      return Response.json({
        question,
        source: "local-generator",
        note: "Set OPENAI_API_KEY for LLM-authored items.",
      });
    }

    const prompt = `Create one original Digital SAT-style multiple-choice question.
Topic: ${topic}
Difficulty 1-5: ${difficulty}
Student weak hint: ${body.weakHint ?? "n/a"}
Return ONLY compact JSON:
{"stem":"...","passage":null or string,"choices":[{"id":"A","text":"..."},{"id":"B","text":"..."},{"id":"C","text":"..."},{"id":"D","text":"..."}],"correctChoiceId":"A|B|C|D","explanation":"...","skillTags":["..."],"desmosLatex":[] or latex strings for math}
No markdown.`;

    const res = await fetch(OPENAI_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
        temperature: 0.7,
        messages: [
          {
            role: "system",
            content:
              "You author fair Digital SAT practice items for underserved students. Be accurate.",
          },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) {
      const question = generateLocalQuestion({ topic, difficulty });
      return Response.json({
        question,
        source: "local-generator-fallback",
        note: `OpenAI error ${res.status}`,
      });
    }

    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = data.choices?.[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(content) as {
      stem: string;
      passage?: string | null;
      choices: { id: string; text: string }[];
      correctChoiceId: string;
      explanation: string;
      skillTags?: string[];
      desmosLatex?: string[];
    };

    const section = SECTION_PATH.math.includes(topic) ? "math" : "rw";
    const question = {
      id: `openai-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      section,
      topic,
      difficulty,
      stem: parsed.stem,
      passage: parsed.passage || undefined,
      choices: parsed.choices,
      correctChoiceId: parsed.correctChoiceId,
      explanation: parsed.explanation,
      skillTags: parsed.skillTags ?? ["openai"],
      suggestedSeconds: 70,
      desmosLatex: parsed.desmosLatex,
      source: "openai" as const,
      guidedReading: Boolean(parsed.passage),
    };

    return Response.json({ question, source: "openai" });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed";
    return Response.json({ error: message }, { status: 500 });
  }
}
