/**
 * AI concierge content — greeting, suggestion chips, and the grounding
 * brief used to answer questions when ANTHROPIC_API_KEY is configured.
 */

export const aiSuggestions = [
  { icon: "◆", label: "Walk me through Tata Sierra EV" },
  { icon: "✦", label: "How does he use AI in his workflow?" },
  { icon: "▲", label: "Career highlights" },
  { icon: "●", label: "What makes him different?" },
];

export const aiGreeting = {
  morning: "Good morning!",
  afternoon: "Good afternoon!",
  evening: "Good evening!",
  sub: "I'm Sayan's assistant — ask me anything about his work.",
};

export const aiOfflineReply =
  "The concierge is offline right now (no API key configured). " +
  "Meanwhile: Sayan is a Senior Product Designer in Mumbai — 3+ years across " +
  "automotive (Tata Motors, MG Motor), enterprise ERP and consumer apps, " +
  "with a Masters in Interaction Design and an AI-first workflow. " +
  "Reach him at hello@sayandas.design.";
