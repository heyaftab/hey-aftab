import { useEffect, useRef, useState, type FormEvent } from "react";
import { MessageCircle, Send, X } from "lucide-react";
import "./assistant-widget.css";
import { renderAssistantMarkdown } from "./assistant-markdown";

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
      "Goynar Gontobbo is a live jewellery commerce storefront in active development, built with Next.js, Laravel, and MySQL: https://goynar-gontobbo.vercel.app/.",
  },
  {
    terms: ["healthcare", "nhre", "medical", "record exchange", "health"],
    answer:
      "NHRE is a live healthcare information system covering role-based access, clinical records, and notifications: https://national-healthcare-record-exchange-production.up.railway.app/. Its presentation is at https://nhre.lovable.app.",
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
  {
    terms: ["python", "pandas", "numpy", "scikit", "tensorflow", "pytorch", "data science"],
    answer:
      "Python is Aftab's main language for AI work — he uses it for machine learning experiments, scripting, and FastAPI backends.",
  },
  {
    terms: [
      "frontend",
      "react",
      "next",
      "nextjs",
      "next.js",
      "ui",
      "javascript",
      "typescript",
      "tailwind",
    ],
    answer:
      "On the frontend Aftab builds with React, Next.js, TypeScript, and Tailwind CSS — Goynar Gontobbo's storefront is a Next.js app.",
  },
  {
    terms: ["backend", "api", "server", "laravel", "fastapi", "php", "rest"],
    answer:
      "For backends Aftab uses FastAPI (Python) and Laravel (PHP), building REST APIs like the ones behind the Course Planner and Goynar Gontobbo.",
  },
  {
    terms: ["database", "databases", "sql", "mysql", "sqlite", "postgres", "postgresql"],
    answer:
      "Aftab works with SQL databases — MySQL for Goynar Gontobbo and SQLite for the UIU Course Planner.",
  },
  {
    terms: ["docker", "devops", "deploy", "deployment", "cloud", "aws", "vercel", "linux"],
    answer: "Aftab deploys with Docker, Linux, AWS, and Vercel.",
  },
  {
    terms: [
      "c++",
      "cpp",
      "c language",
      "competitive",
      "dsa",
      "algorithm",
      "algorithms",
      "data structures",
    ],
    answer:
      "Aftab uses C and C++ for algorithms, data structures, and microcontroller work like the Smart CNC Plotter.",
  },
  {
    terms: ["hobby", "hobbies", "interest", "interests", "free time", "fun", "passion"],
    answer:
      "Outside class Aftab enjoys building side projects, hackathons, and exploring new AI tools.",
  },
  {
    terms: ["best project", "favorite project", "favourite project", "proudest", "biggest project"],
    answer:
      "Highlights: BozoScope won first place at UIU Tech Adda, and NHRE is his most ambitious system design. Goynar Gontobbo is his current build.",
  },
  {
    terms: ["why hire", "strength", "strengths", "why should", "good at", "stand out"],
    answer:
      "Aftab combines full-stack skills (React, Next.js, FastAPI, Laravel) with an AI focus, ships real projects, and has won awards in competitions.",
  },
  {
    terms: ["team", "teamwork", "collaborate", "collaboration", "leadership"],
    answer:
      "Aftab has worked in teams on the Smart CNC Plotter and a 12-hour hackathon where his team placed third.",
  },
  {
    terms: ["age", "old", "year", "semester", "batch"],
    answer: "Aftab is currently an undergraduate CSE student at UIU, expected to graduate in 2028.",
  },
];

const SYNONYMS: Record<string, string> = {
  studies: "study",
  learn: "study",
  learning: "study",
  college: "university",
  uni: "university",
  techs: "technology",
  stack: "tech stack",
  languages: "language",
  know: "skill",
  skills: "skill",
  awards: "award",
  won: "award",
  win: "award",
  prize: "award",
  achievements: "achievement",
  apps: "project",
  app: "project",
  built: "project",
  made: "project",
  build: "project",
  mail: "email",
  gmail: "email",
  message: "contact",
  hire: "hire",
  hiring: "hire",
  jobs: "job",
  internships: "internship",
  where: "location",
  live: "location",
  lives: "location",
  db: "database",
  js: "javascript",
  ts: "typescript",
  ml: "machine learning",
};

const FOLLOW_UPS: Record<string, string[]> = {
  default: ["What are his skills?", "Tell me about BozoScope", "Is he open to internships?"],
  project: ["Tell me about NHRE", "What is Goynar Gontobbo?", "What's his best project?"],
  skill: ["What backend does he use?", "Does he know Docker?", "Which databases?"],
  contact: ["Where is he based?", "Can I see his GitHub?", "Download his resume"],
};

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
    .trim()
    .split(" ")
    .map((word) => SYNONYMS[word] ?? word.replace(/'s$/, ""))
    .join(" ");
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
    : "I don't have that detail. Try asking about Aftab's education, skills (frontend, backend, AI), projects, awards, or how to contact him.";
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
  const [typing, setTyping] = useState(false);
  const [followUps, setFollowUps] = useState<string[]>([]);
  const endRef = useRef<HTMLDivElement>(null);
  const timer = useRef<number>(0);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  useEffect(() => {
    endRef.current?.scrollIntoView?.({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      block: "end",
    });
  }, [messages, open, typing]);

  const sendMessage = (question: string) => {
    const cleaned = question.trim().slice(0, 300);
    if (!cleaned || typing) return;
    const reply = getAnswer(cleaned);
    setMessages((current) => [...current, { role: "user", content: cleaned }]);
    setInput("");
    setFollowUps([]);
    setTyping(true);
    const lower = reply.toLowerCase();
    const topic = /project|bozoscope|nhre|goynar|planner|plotter/.test(lower)
      ? "project"
      : /email|linkedin|github|facebook|contact/.test(lower)
        ? "contact"
        : /python|react|fastapi|laravel|sql|docker|toolkit/.test(lower)
          ? "skill"
          : "default";
    timer.current = window.setTimeout(
      () => {
        setTyping(false);
        setMessages((current) => [...current, { role: "assistant", content: reply }]);
        setFollowUps((FOLLOW_UPS[topic] ?? []).filter((q) => q !== cleaned));
      },
      Math.min(1200, 350 + reply.length * 4),
    );
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="eli-widget fixed bottom-3 right-3 z-[60] sm:bottom-6 sm:right-6">
      {open && (
        <section
          aria-label="ELI assistant"
          className="eli-panel assistant-panel mb-3 flex h-[min(72dvh,620px)] w-[min(400px,calc(100vw-24px))] flex-col overflow-hidden rounded-[28px] border bg-popover text-popover-foreground"
        >
          <header className="eli-header flex items-center gap-3 border-b px-5 py-4">
            <span className="eli-avatar-wrap relative shrink-0">
              <img
                src="/assets/site-logo.png"
                alt=""
                className="eli-avatar h-11 w-11 rounded-2xl"
              />
              <span className="eli-online-dot" role="img" aria-label="Online" />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="eli-name">ELI</h2>
              <p className="eli-subtitle">Aftab's AI assistant</p>
            </div>
            <button
              type="button"
              aria-label="Close assistant"
              onClick={() => setOpen(false)}
              className="eli-close grid h-9 w-9 place-items-center rounded-xl text-muted-foreground transition-colors"
            >
              <X size={18} />
            </button>
          </header>
          <div
            className="eli-messages flex-1 space-y-4 overflow-y-auto px-4 py-5"
            aria-live="polite"
          >
            {messages.map((message, index) => {
              const showAvatar =
                message.role === "assistant" &&
                (index === 0 || messages[index - 1]?.role !== "assistant");
              return (
                <div
                  key={`${index}-${message.role}`}
                  className={`eli-message-row flex items-end gap-2 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {message.role === "assistant" &&
                    (showAvatar ? (
                      <img src="/assets/site-logo.png" alt="" className="eli-message-avatar" />
                    ) : (
                      <span className="eli-avatar-spacer" aria-hidden="true" />
                    ))}
                  <div
                    className={`eli-bubble ${message.role === "user" ? "eli-user-bubble" : "eli-assistant-bubble"}`}
                  >
                    {renderAssistantMarkdown(message.content)}
                  </div>
                </div>
              );
            })}
            {typing && (
              <div className="eli-message-row flex items-end gap-2 justify-start">
                <img src="/assets/site-logo.png" alt="" className="eli-message-avatar" />
                <div
                  className="eli-bubble eli-assistant-bubble eli-typing"
                  role="status"
                  aria-label="ELI is typing"
                >
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            )}
            {!typing && followUps.length > 0 && messages.length > 1 && (
              <div className="flex flex-wrap gap-2">
                {followUps.map((question, i) => (
                  <button
                    key={question}
                    type="button"
                    onClick={() => sendMessage(question)}
                    style={{ animationDelay: `${i * 70}ms` }}
                    className="eli-chip assistant-chip rounded-full border px-3 py-1.5 text-xs transition-colors"
                  >
                    {question}
                  </button>
                ))}
              </div>
            )}
            {messages.length === 1 && (
              <div className="space-y-2 pt-1">
                <p className="px-1 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  Try asking
                </p>
                <div className="eli-suggestions">
                  {QUICK_QUESTIONS.map((question, index) => (
                    <button
                      key={question}
                      type="button"
                      onClick={() => sendMessage(question)}
                      className="eli-chip block w-full rounded-full border px-3 py-2.5 text-left text-xs transition-colors"
                    >
                      <span aria-hidden="true">{["🎓", "💼", "✉️"][index]}</span>
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>
          <form onSubmit={onSubmit} className="eli-composer flex items-end gap-2 border-t p-3">
            <label className="sr-only" htmlFor="portfolio-assistant-input">
              Ask ELI about Aftab
            </label>
            <textarea
              id="portfolio-assistant-input"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  sendMessage(input);
                }
              }}
              maxLength={300}
              rows={1}
              placeholder="Ask ELI about Aftab..."
              className="eli-input min-h-11 min-w-0 flex-1 resize-none rounded-2xl border bg-background px-3.5 py-3 text-sm outline-none transition-colors"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              aria-label="Send message"
              className="eli-send grid h-11 w-11 shrink-0 place-items-center rounded-2xl text-white transition-all disabled:cursor-not-allowed"
            >
              <Send size={16} />
            </button>
          </form>
          <p className="eli-disclaimer px-4 pb-3 text-center text-[10px] text-muted-foreground">
            AI can make mistakes. Contact Aftab directly for anything important.
          </p>
        </section>
      )}
      <button
        type="button"
        aria-label={open ? "Close ELI" : "Chat with ELI"}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="eli-toggle assistant-launcher ml-auto grid h-14 w-14 place-items-center rounded-full border text-primary-foreground shadow-xl transition-all"
      >
        <span className={`eli-toggle-icon ${open ? "is-visible" : ""}`} aria-hidden={!open}>
          <X size={21} />
        </span>
        <span className={`eli-toggle-icon ${open ? "" : "is-visible"}`} aria-hidden={open}>
          <MessageCircle size={21} />
        </span>
      </button>
    </div>
  );
}
