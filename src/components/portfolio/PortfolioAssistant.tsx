import { useEffect, useRef, useState, type FormEvent } from "react";
import { Bot, MessageCircle, Send, Sparkles, X } from "lucide-react";

type Message = { role: "assistant" | "user"; content: string };

const PROFILE_LINKS = {
  github: "https://github.com/heyaftab",
  linkedin: "https://www.linkedin.com/in/aftab-uddin-ahmad-7b303429/",
  facebook: "https://www.facebook.com/aftabuddinahmad26/",
};

const ANSWERS: { terms: string[]; answer: string }[] = [
  {
    terms: ["who", "yourself", "intro", "background", "bio", "profile", "about aftab"],
    answer:
      "Aftab Uddin Ahmad is a CSE student at United International University in Dhaka, preparing for a career in AI engineering.",
  },
  {
    terms: ["education", "university", "degree", "study", "studying", "graduation"],
    answer:
      "Aftab is pursuing a B.Sc. in Computer Science & Engineering at UIU and expects to graduate in 2028.",
  },
  {
    terms: ["ai", "machine learning", "ml", "goal", "career", "intelligent systems"],
    answer:
      "Aftab is working toward AI engineering, with interests in machine learning and intelligent systems.",
  },
  {
    terms: ["skill", "technology", "tech stack", "programming", "language", "tools"],
    answer:
      "His toolkit spans Python, C/C++, JavaScript/TypeScript, React, Next.js, Laravel, FastAPI, SQL databases, Docker, Linux, AWS, and Vercel.",
  },
  {
    terms: ["goynar", "gontobbo", "jewellery", "ecommerce", "e-commerce"],
    answer:
      "Goynar Gontobbo is a jewellery commerce platform in development, built with Next.js, Laravel, and MySQL.",
  },
  {
    terms: ["healthcare", "nhre", "medical", "record exchange", "health"],
    answer:
      "NHRE is a healthcare information system concept covering role-based access, clinical records, and notifications. Its presentation is at nhre.lovable.app.",
  },
  {
    terms: ["cnc", "plotter", "microcontroller", "embedded", "hardware"],
    answer:
      "The team-built Smart CNC Plotter used microcontroller programming and motor control to turn drawing commands into movement.",
  },
  {
    terms: ["bozoscope", "bozo scope", "camera app", "camera filters", "photo filters"],
    answer:
      "BozoScope is Aftab's camera app with nine filters; it won first place at UIU Developers Hub's Tech Adda.",
  },
  {
    terms: ["course planner", "uiu planner", "trimester", "credit tracking", "course planning"],
    answer:
      "The UIU CSE Course Planner organizes courses by trimester and tracks credits, using FastAPI and SQLite.",
  },
  {
    terms: ["project", "projects", "work", "built", "portfolio", "repositories", "repo"],
    answer:
      "Featured projects include NHRE, Goynar Gontobbo, BozoScope, the UIU Course Planner, and a Smart CNC Plotter.",
  },
  {
    terms: ["github", "source code", "repository", "repositories", "open source"],
    answer: `GitHub: ${PROFILE_LINKS.github}. It hosts Aftab's project repositories.`,
  },
  {
    terms: ["linkedin", "professional profile", "career profile", "experience", "professional"],
    answer: `LinkedIn: ${PROFILE_LINKS.linkedin}.`,
  },
  {
    terms: ["facebook", "fb", "social media", "social profile"],
    answer: `Facebook: ${PROFILE_LINKS.facebook}.`,
  },
  {
    terms: ["achievement", "award", "hackathon", "place", "competition"],
    answer: "Aftab's team placed third in a 12-hour hackathon.",
  },
  {
    terms: ["contact", "email", "reach", "phone", "connect", "social", "links"],
    answer: `Email: aftabuddinahmad26@gmail.com · LinkedIn: ${PROFILE_LINKS.linkedin} · GitHub: ${PROFILE_LINKS.github} · Facebook: ${PROFILE_LINKS.facebook}`,
  },
  {
    terms: ["resume", "cv", "curriculum", "download"],
    answer: "Download Aftab's AI engineering CV from the Resume section.",
  },
  {
    terms: ["location", "dhaka", "based", "country", "bangladesh"],
    answer: "Aftab is based in Dhaka, Bangladesh.",
  },
  {
    terms: ["opportunity", "job", "internship", "hire", "available"],
    answer: "Aftab is open to AI opportunities. Use the Contact section to reach him.",
  },
];

const QUICK_QUESTIONS = [
  "What is Aftab studying?",
  "Tell me about his projects",
  "How can I contact him?",
];

function getAnswer(question: string) {
  const query = question
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s-]/g, " ")
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const greetings: { pattern: RegExp; reply: string }[] = [
    {
      pattern:
        /^(assalamu alaikum|assalamualaikum|salam alaikum|salaam alaikum|as salamu alaykum|salam|salaam)\b/,
      reply: "Walaikumus Salam 🌿",
    },
    { pattern: /^good morning\b/, reply: "Good morning ☀️" },
    { pattern: /^good afternoon\b/, reply: "Good afternoon ☀️" },
    { pattern: /^good evening\b/, reply: "Good evening 🌆" },
    { pattern: /^good night\b/, reply: "Good night 🌙" },
    { pattern: /^hi\b/, reply: "Hello 👋" },
    { pattern: /^hello\b/, reply: "Hi 👋" },
    { pattern: /^hey\b/, reply: "Hello 👋" },
  ];
  const greeting = greetings.find(({ pattern }) => pattern.test(query));
  const greetingText = greeting?.pattern.exec(query)?.[0] ?? "";
  const remainingQuery = (greeting ? query.slice(greetingText.length) : query)
    .replace(/^[.!?,\s]+|[.!?,\s]+$/g, "")
    .trim();
  const greetingReply = greeting
    ? greeting.reply || `${greetingText.charAt(0).toUpperCase()}${greetingText.slice(1)}.`
    : "";

  if (!remainingQuery) return greetingReply;
  if (/^(how are you|how are things|how is it going)\b/.test(remainingQuery)) {
    return `${greetingReply ? `${greetingReply} ` : ""}I'm doing well, thanks.`;
  }

  const ranked = ANSWERS.map((entry, index) => ({
    answer: entry.answer,
    score:
      entry.terms.reduce((score, term) => {
        const normalizedTerm = term.replace(/-/g, " ");
        if (remainingQuery === normalizedTerm) return score + 4;
        const words = remainingQuery.split(" ");
        const termWords = normalizedTerm.split(" ");
        if (` ${remainingQuery} `.includes(` ${normalizedTerm} `))
          return score + Math.max(1, normalizedTerm.split(" ").length) * 2;
        return (
          score +
          (termWords.length > 1 && termWords.every((word) => words.includes(word))
            ? termWords.length
            : 0)
        );
      }, 0) * (index === 0 ? 0.25 : 1),
  })).sort((a, b) => b.score - a.score);

  const answer = ranked[0]?.score
    ? ranked[0].answer
    : "I don't have that detail. I can answer questions about Aftab's education, skills, projects, or contact links.";
  return greetingReply ? `${greetingReply} ${answer}` : answer;
}

export function PortfolioAssistant() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hello 👋 I can answer questions about Aftab's background, projects, skills, and contact details.",
    },
  ]);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView?.({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      block: "end",
    });
  }, [messages, open]);

  const sendMessage = (question: string) => {
    const cleaned = question.trim().slice(0, 300);
    if (!cleaned) return;
    setMessages((current) => [
      ...current,
      { role: "user", content: cleaned },
      { role: "assistant", content: getAnswer(cleaned) },
    ]);
    setInput("");
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="fixed bottom-5 right-5 z-[60] sm:bottom-7 sm:right-7">
      {open && (
        <section
          aria-label="Aftab portfolio assistant"
          className="assistant-panel mb-3 flex h-[min(34rem,calc(100svh-7rem))] w-[min(24rem,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-3xl border bg-popover text-popover-foreground shadow-2xl shadow-black/30 ring-1 ring-primary/15"
        >
          <header className="relative overflow-hidden border-b bg-surface/80 px-5 py-4">
            <div className="glow-orb pointer-events-none absolute -right-16 -top-24 h-48 w-48 opacity-50" />
            <div className="relative flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                <Bot size={20} />
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="font-display text-sm font-semibold">Aftab's portfolio assistant</h2>
                <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Concise ·
                  portfolio-based
                </p>
              </div>
              <button
                type="button"
                aria-label="Close assistant"
                onClick={() => setOpen(false)}
                className="grid h-9 w-9 place-items-center rounded-xl text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
              >
                <X size={17} />
              </button>
            </div>
          </header>
          <div className="flex-1 space-y-4 overflow-y-auto px-4 py-5" aria-live="polite">
            {messages.map((message, index) => (
              <div
                key={`${index}-${message.role}`}
                className={`assistant-message flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <p
                  className={`max-w-[88%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${message.role === "user" ? "rounded-br-md bg-primary text-primary-foreground" : "rounded-bl-md border bg-background/80 text-foreground"}`}
                >
                  {message.content}
                </p>
              </div>
            ))}
            {messages.length === 1 && (
              <div className="space-y-2 pt-1">
                <p className="px-1 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  Try asking
                </p>
                {QUICK_QUESTIONS.map((question) => (
                  <button
                    key={question}
                    type="button"
                    onClick={() => sendMessage(question)}
                    className="block w-full rounded-xl border bg-background/50 px-3 py-2.5 text-left text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                  >
                    {question}
                  </button>
                ))}
              </div>
            )}
            <div ref={endRef} />
          </div>
          <form onSubmit={onSubmit} className="flex items-center gap-2 border-t bg-surface/60 p-3">
            <label className="sr-only" htmlFor="portfolio-assistant-input">
              Ask about Aftab
            </label>
            <input
              id="portfolio-assistant-input"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              maxLength={300}
              placeholder="Ask about Aftab..."
              className="h-11 min-w-0 flex-1 rounded-xl border bg-background px-3.5 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/60"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              aria-label="Send message"
              className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/20 disabled:cursor-not-allowed disabled:opacity-45"
            >
              <Send size={16} />
            </button>
          </form>
          <p className="flex items-center justify-center gap-1.5 pb-2 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
            <Sparkles size={10} className="text-primary" /> Portfolio knowledge only
          </p>
        </section>
      )}
      <button
        type="button"
        aria-label={open ? "Close portfolio assistant" : "Chat with Aftab's portfolio assistant"}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="ml-auto flex h-14 items-center gap-2.5 rounded-full border border-primary/30 bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-xl shadow-primary/20 transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/30"
      >
        {open ? <X size={19} /> : <MessageCircle size={19} />}
        <span>{open ? "Close" : "Ask Aftab's assistant"}</span>
      </button>
    </div>
  );
}
