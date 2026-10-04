import { useEffect, useRef, useState, type FormEvent } from "react";
import { Bot, MessageCircle, Send, Sparkles, X } from "lucide-react";

type Message = { role: "assistant" | "user"; content: string };

const ANSWERS: { terms: string[]; answer: string }[] = [
  {
    terms: ["about", "who", "aftab", "yourself", "intro"],
    answer: "Aftab Uddin Ahmad is a Computer Science & Engineering student at United International University in Dhaka. He is working toward a career in AI engineering and enjoys building useful software.",
  },
  {
    terms: ["education", "university", "degree", "study", "cgpa", "graduation"],
    answer: "Aftab is pursuing a B.Sc. in Computer Science & Engineering at United International University. He started in 2023, expects to graduate in 2028, and lists a CGPA of 3.34 out of 4.00.",
  },
  {
    terms: ["ai", "machine learning", "ml", "goal", "career", "intelligent systems"],
    answer: "Aftab is aspiring to become an AI Engineer. His stated interests include machine learning and intelligent systems. The portfolio presents this as his career direction, while his listed skills currently focus on programming and software engineering foundations.",
  },
  {
    terms: ["skill", "technology", "tech stack", "programming", "language", "tools"],
    answer: "His listed skills include Python, C, C++, JavaScript, TypeScript, PHP, Java, React, Next.js, Tailwind CSS, Laravel, Node.js, Express, FastAPI, REST APIs, MySQL, PostgreSQL, SQLite, SQL Server, Git, Docker, Linux, AWS, and Vercel.",
  },
  {
    terms: ["goynar", "gontobbo", "jewellery", "ecommerce", "e-commerce"],
    answer: "Goynar Gontobbo is a real-world jewellery commerce platform in development. It uses a Next.js and TypeScript storefront connected to a Laravel API and MySQL, with product catalogs, variants, inventory, and customer and admin workflows.",
  },
  {
    terms: ["healthcare", "nhre", "medical", "record exchange", "health"],
    answer: "The National Healthcare Record Exchange is a healthcare information system in development. It brings together authentication, role-based workflows, clinical records, notifications, and relational data management using PHP and MySQL.",
  },
  {
    terms: ["cnc", "plotter", "microcontroller", "embedded", "hardware"],
    answer: "The Smart CNC Plotter was a team project. The prototype connected microcontroller programming, electronics, motor control, and hardware interfacing to turn drawing commands into coordinated movement.",
  },
  {
    terms: ["project", "work", "built", "portfolio"],
    answer: "Featured work includes Goynar Gontobbo, a jewellery commerce platform; the National Healthcare Record Exchange, a healthcare information system; and a team-built Smart CNC Plotter. Ask me about any one of them for details.",
  },
  {
    terms: ["achievement", "award", "hackathon", "place", "competition"],
    answer: "Aftab and his team earned 3rd place in a 12-hour hackathon, building and presenting a project under a tight deadline.",
  },
  {
    terms: ["contact", "email", "reach", "linkedin", "github", "phone", "connect"],
    answer: "You can reach Aftab at aftabuddinahmad26@gmail.com, connect on LinkedIn at aftab-uddin-ahmad, or find his projects on GitHub at heyaftab.",
  },
  {
    terms: ["resume", "cv", "curriculum", "download"],
    answer: "You can download Aftab's AI-engineering-focused CV from the Resume section of this portfolio.",
  },
  {
    terms: ["location", "dhaka", "based", "country", "bangladesh"],
    answer: "Aftab is based in Dhaka, Bangladesh, and studies at United International University.",
  },
  {
    terms: ["opportunity", "job", "internship", "hire", "available"],
    answer: "The portfolio says Aftab is open to AI opportunities and preparing for internships. Use the Contact section to get in touch.",
  },
];

const QUICK_QUESTIONS = ["What is Aftab studying?", "Tell me about his projects", "How can I contact him?"];

function getAnswer(question: string) {
  const query = question.toLowerCase().replace(/[^a-z0-9+#.\s-]/g, " ").replace(/\s+/g, " ").trim();
  if (/^(hi|hello|hey|salam|assalamu alaikum)\b/.test(query)) {
    return "Hi! I can share what Aftab's portfolio says about his background, education, skills, projects, achievements, and contact details. What would you like to know?";
  }

  const ranked = ANSWERS.map((entry) => ({
    answer: entry.answer,
    score: entry.terms.reduce((score, term) => score + (query.includes(term) ? Math.max(1, term.split(" ").length) : 0), 0),
  })).sort((a, b) => b.score - a.score);

  return ranked[0]?.score
    ? ranked[0].answer
    : "I don't see that detail in Aftab's portfolio yet. I can answer questions about his education, AI engineering goals, skills, projects, achievement, or how to contact him.";
}

export function PortfolioAssistant() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hi! I'm Aftab's portfolio guide. Ask me about his skills, projects, education, or AI engineering goals." },
  ]);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, open]);

  const sendMessage = (question: string) => {
    const cleaned = question.trim().slice(0, 300);
    if (!cleaned) return;
    setMessages((current) => [...current, { role: "user", content: cleaned }, { role: "assistant", content: getAnswer(cleaned) }]);
    setInput("");
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="fixed bottom-5 right-5 z-[60] sm:bottom-7 sm:right-7">
      {open && (
        <section aria-label="Aftab portfolio assistant" className="mb-3 flex h-[min(34rem,calc(100svh-7rem))] w-[min(24rem,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-3xl border bg-popover text-popover-foreground shadow-2xl shadow-black/30 ring-1 ring-primary/15">
          <header className="relative overflow-hidden border-b bg-surface/80 px-5 py-4">
            <div className="glow-orb pointer-events-none absolute -right-16 -top-24 h-48 w-48 opacity-50" />
            <div className="relative flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20"><Bot size={20} /></span>
              <div className="min-w-0 flex-1">
                <h2 className="font-display text-sm font-semibold">Aftab's portfolio guide</h2>
                <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Answers from portfolio details</p>
              </div>
              <button type="button" aria-label="Close assistant" onClick={() => setOpen(false)} className="grid h-9 w-9 place-items-center rounded-xl text-muted-foreground transition-colors hover:bg-background hover:text-foreground"><X size={17} /></button>
            </div>
          </header>
          <div className="flex-1 space-y-4 overflow-y-auto px-4 py-5" aria-live="polite">
            {messages.map((message, index) => (
              <div key={`${index}-${message.role}`} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <p className={`max-w-[88%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${message.role === "user" ? "rounded-br-md bg-primary text-primary-foreground" : "rounded-bl-md border bg-background/80 text-foreground"}`}>
                  {message.content}
                </p>
              </div>
            ))}
            {messages.length === 1 && (
              <div className="space-y-2 pt-1">
                <p className="px-1 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Try asking</p>
                {QUICK_QUESTIONS.map((question) => (
                  <button key={question} type="button" onClick={() => sendMessage(question)} className="block w-full rounded-xl border bg-background/50 px-3 py-2.5 text-left text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground">{question}</button>
                ))}
              </div>
            )}
            <div ref={endRef} />
          </div>
          <form onSubmit={onSubmit} className="flex items-center gap-2 border-t bg-surface/60 p-3">
            <label className="sr-only" htmlFor="portfolio-assistant-input">Ask about Aftab</label>
            <input id="portfolio-assistant-input" value={input} onChange={(event) => setInput(event.target.value)} maxLength={300} placeholder="Ask about Aftab..." className="h-11 min-w-0 flex-1 rounded-xl border bg-background px-3.5 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/60" />
            <button type="submit" disabled={!input.trim()} aria-label="Send message" className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/20 disabled:cursor-not-allowed disabled:opacity-45"><Send size={16} /></button>
          </form>
          <p className="flex items-center justify-center gap-1.5 pb-2 font-mono text-[9px] uppercase tracking-widest text-muted-foreground"><Sparkles size={10} className="text-primary" /> Portfolio knowledge only</p>
        </section>
      )}
      <button
        type="button"
        aria-label={open ? "Close portfolio assistant" : "Chat with Aftab's portfolio guide"}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="ml-auto flex h-14 items-center gap-2.5 rounded-full border border-primary/30 bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-xl shadow-primary/20 transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/30"
      >
        {open ? <X size={19} /> : <MessageCircle size={19} />}
        <span>{open ? "Close" : "Ask about Aftab"}</span>
      </button>
    </div>
  );
}
