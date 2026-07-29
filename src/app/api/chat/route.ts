import { NextResponse } from "next/server";
import { aiOfflineReply } from "@/content/ai";
import { site } from "@/content/site";
import { projects, moreWork } from "@/content/projects";
import { experience } from "@/content/experience";
import { skillGroups } from "@/content/skills";

export const runtime = "nodejs";

/** Grounding brief assembled from the content layer (single source of truth). */
function buildBrief(): string {
  const work = projects
    .map((p) => `- ${p.title} (${p.tag}): ${p.description}`)
    .join("\n");
  const more = moreWork.map((w) => `- ${w.title}: ${w.sector}`).join("\n");
  const xp = experience
    .map((e) => `- ${e.period} · ${e.role} @ ${e.company}: ${e.summary}`)
    .join("\n");
  const skills = skillGroups
    .map((g) => `${g.title}: ${g.items.join(", ")}`)
    .join("\n");

  return [
    `${site.name} — ${site.role}, based in ${site.location.city}.`,
    `Positioning: ${site.hero.tagline}`,
    `\nFEATURED WORK:\n${work}\n${more}`,
    `\nEXPERIENCE:\n${xp}`,
    `\nCAPABILITIES:\n${skills}`,
    `\nCONTACT: ${site.email}`,
  ].join("\n");
}

export async function POST(req: Request) {
  let question = "";
  try {
    const body = (await req.json()) as { question?: string };
    question = (body.question ?? "").slice(0, 600);
  } catch {
    return NextResponse.json({ reply: "Ask me something!" }, { status: 400 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    // Graceful offline mode — panel still feels alive without a key.
    return NextResponse.json({ reply: aiOfflineReply });
  }

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-5",
        max_tokens: 400,
        system:
          `You are the friendly portfolio assistant for ${site.name}. ` +
          `Answer visitor questions in 2-4 sentences, warm and specific. ` +
          `Only use the facts below; if unsure, say so and point to ${site.email}.\n\n` +
          buildBrief(),
        messages: [{ role: "user", content: question }],
      }),
    });

    if (!res.ok) throw new Error(`Upstream ${res.status}`);
    const data = (await res.json()) as {
      content: Array<{ type: string; text?: string }>;
    };
    const reply =
      data.content.find((c) => c.type === "text")?.text ??
      "Hmm, I lost my train of thought — try again?";
    return NextResponse.json({ reply });
  } catch {
    return NextResponse.json({ reply: aiOfflineReply });
  }
}
