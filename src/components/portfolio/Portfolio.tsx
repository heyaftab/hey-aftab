import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { ArrowDown, ArrowUpRight, Download, Github, Linkedin, Mail, Phone, MapPin, Menu, X, Trophy, Code2, BookOpen, Puzzle, ArrowRight } from "lucide-react";
import photo from "@/assets/aftab.jpg.asset.json";
import { Cursor, NetworkField, Reveal, Tilt } from "./effects";

const LINKS = {
  github: "https://github.com/heyaftab",
  linkedin: "https://www.linkedin.com/in/aftab-uddin-ahmad-7b3034294/",
  email: "aftabuddinahmad26@gmail.com",
  phone: "01795364351",
  // Place your resume at public/resume.pdf
  resume: "/resume.pdf",
};

/** CONTACT FORM CONFIG — set an endpoint (e.g. Formspree URL) to enable real sending. */
const CONTACT_ENDPOINT = "";

const NAV = ["Home", "About", "Skills", "Projects", "Achievements", "Journey", "Contact"];

function Section({ id, eyebrow, title, children, className = "" }: { id?: string; eyebrow: string; title: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section id={id} className={`relative mx-auto max-w-6xl px-5 py-24 sm:px-8 md:py-36 ${className}`}>
      <Reveal>
        <p className="eyebrow">{eyebrow}</p>
        <h2 className="text-gradient mt-4 text-4xl font-semibold sm:text-5xl md:text-6xl">{title}</h2>
      </Reveal>
      <div className="mt-14">{children}</div>
    </section>
  );
}

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const f = () => setScrolled(window.scrollY > 24);
    f(); window.addEventListener("scroll", f, { passive: true });
    return () => window.removeEventListener("scroll", f);
  }, []);
  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${scrolled || open ? "glass border-x-0 border-t-0" : "border-b border-transparent"}`}>
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <a href="#home" className="font-display text-sm font-semibold tracking-[0.2em]">AUA<span className="text-primary">.</span></a>
        <ul className="hidden items-center gap-7 md:flex">
          {NAV.map((n) => (
            <li key={n}><a href={`#${n.toLowerCase()}`} className="text-sm text-muted-foreground transition-colors hover:text-foreground">{n}</a></li>
          ))}
        </ul>
        <button className="md:hidden" aria-label="Toggle menu" onClick={() => setOpen(!open)}>{open ? <X size={20} /> : <Menu size={20} />}</button>
      </nav>
      {open && (
        <ul className="flex flex-col gap-1 px-5 pb-6 md:hidden">
          {NAV.map((n) => (
            <li key={n}><a onClick={() => setOpen(false)} href={`#${n.toLowerCase()}`} className="block border-b py-3 font-display text-2xl">{n}</a></li>
          ))}
        </ul>
      )}
    </header>
  );
}

function Hero() {
  const img = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const f = () => { if (img.current) img.current.style.transform = `translate3d(0, ${window.scrollY * 0.12}px, 0)`; };
    window.addEventListener("scroll", f, { passive: true });
    return () => window.removeEventListener("scroll", f);
  }, []);
  return (
    <section id="home" className="relative min-h-screen overflow-hidden pt-24">
      <div className="grid-bg absolute inset-0" />
      <div className="glow-orb absolute -top-40 right-0 h-[520px] w-[520px] opacity-60" />
      <div className="absolute inset-0 opacity-70 md:left-[30%]"><NetworkField /></div>
      <div className="relative mx-auto grid min-h-[calc(100vh-6rem)] max-w-6xl items-center gap-12 px-5 pb-16 sm:px-8 lg:grid-cols-[1.25fr_1fr]">
        <div className="order-2 lg:order-1">
          <p className="eyebrow rise flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-primary" style={{ animation: "pulse-dot 2s infinite" }} />Dhaka, Bangladesh · Open to internships</p>
          <h1 className="text-gradient rise mt-6 text-5xl font-semibold leading-[0.95] sm:text-7xl xl:text-8xl" style={{ animationDelay: "120ms" }}>
            AFTAB<br />UDDIN AHMAD
          </h1>
          <p className="rise mt-6 font-mono text-sm text-muted-foreground sm:text-base" style={{ animationDelay: "240ms" }}>
            Computer Science Student <span className="text-primary">→</span> <span className="text-foreground">Software Engineer</span>
          </p>
          <p className="rise mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground" style={{ animationDelay: "360ms" }}>
            I build modern software systems, full-stack web applications, and technology-driven products with a focus on solving real problems.
          </p>
          <div className="rise mt-10 flex flex-wrap gap-3" style={{ animationDelay: "480ms" }}>
            <a href="#projects" className="group inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-[0_0_40px_-8px_var(--glow)] transition-transform hover:-translate-y-0.5">
              Explore My Work <ArrowDown size={16} className="transition-transform group-hover:translate-y-0.5" />
            </a>
            <a href={LINKS.resume} download className="glass inline-flex items-center gap-2 rounded-md px-6 py-3.5 text-sm font-semibold transition-colors hover:border-primary/50">
              Download Resume <Download size={16} />
            </a>
          </div>
          <div className="rise mt-8 flex gap-6 font-mono text-xs text-muted-foreground" style={{ animationDelay: "600ms" }}>
            <a href={LINKS.github} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 hover:text-foreground"><Github size={14} /> GitHub</a>
            <a href={LINKS.linkedin} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 hover:text-foreground"><Linkedin size={14} /> LinkedIn</a>
          </div>
        </div>
        <div className="rise order-1 mx-auto w-full max-w-[300px] sm:max-w-sm lg:order-2" style={{ animationDelay: "200ms" }}>
          <div ref={img} className="relative will-change-transform">
            <div className="glow-orb absolute -inset-10 opacity-70" />
            <div className="float-slow absolute -left-8 top-10 h-14 w-14 rotate-12 border border-primary/40" />
            <div className="float-slow absolute -right-6 bottom-16 h-10 w-10 rounded-full border border-accent/50" style={{ animationDelay: "-3s" }} />
            <div className="float-slow absolute -right-10 top-4 font-mono text-xs text-muted-foreground" style={{ animationDelay: "-5s" }}>{"</>"}</div>
            <Tilt>
              <div className="glass relative rounded-lg p-2.5">
                <div className="relative aspect-[4/5] overflow-hidden rounded-md">
                  <img src={photo.url} alt="Portrait of Aftab Uddin Ahmad" className="h-full w-full object-cover object-top" fetchPriority="high" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between font-mono text-[10px] tracking-widest text-foreground/80">
                    <span>CSE · UIU</span><span>CLASS OF 2028</span>
                  </div>
                </div>
              </div>
            </Tilt>
          </div>
        </div>
      </div>
    </section>
  );
}

function About() {
  const cards = [
    { icon: Code2, t: "BUILD", d: "Turning ideas into working software." },
    { icon: BookOpen, t: "LEARN", d: "Continuously expanding my engineering knowledge." },
    { icon: Puzzle, t: "SOLVE", d: "Breaking complex problems into practical solutions." },
  ];
  return (
    <Section id="about" eyebrow="01 — About me" title="Engineering, taken seriously.">
      <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr]">
        <Reveal className="space-y-6 text-lg leading-relaxed text-muted-foreground">
          <p>I am a Computer Science & Engineering student at <span className="text-foreground">United International University</span> focused on becoming a strong software engineer. I enjoy building practical software, exploring full-stack development, working with databases and learning how modern systems are designed and deployed.</p>
          <p>I am particularly interested in software engineering, web development, backend systems and building technology that solves real-world problems.</p>
        </Reveal>
        <Reveal delay={150}>
          <div className="glass relative overflow-hidden rounded-lg p-7">
            <p className="eyebrow">Education</p>
            <h3 className="mt-4 text-2xl font-semibold">United International University</h3>
            <p className="mt-1 text-muted-foreground">B.Sc. in Computer Science & Engineering</p>
            <div className="mt-6 grid grid-cols-2 gap-4 border-t pt-6">
              <div><p className="font-mono text-xs text-muted-foreground">EXPECTED</p><p className="mt-1 font-display text-3xl">2028</p></div>
              <div><p className="font-mono text-xs text-muted-foreground">CGPA</p><p className="mt-1 font-display text-3xl">3.34<span className="text-base text-muted-foreground"> / 4.00</span></p></div>
            </div>
          </div>
        </Reveal>
      </div>
      <div className="mt-16 grid gap-px overflow-hidden rounded-lg border bg-border md:grid-cols-3">
        {cards.map((c, i) => (
          <Reveal key={c.t} delay={i * 100} className="h-full">
            <div className="group h-full bg-background p-8 transition-colors hover:bg-surface">
              <c.icon size={22} className="text-primary" />
              <h3 className="mt-8 font-mono text-sm tracking-[0.25em]">{c.t}</h3>
              <p className="mt-3 text-muted-foreground">{c.d}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

const SKILLS: { cat: string; items: string[] }[] = [
  { cat: "Programming", items: ["C", "C++", "Python", "JavaScript", "TypeScript", "PHP", "Java"] },
  { cat: "Frontend", items: ["HTML", "CSS", "React", "Next.js", "Tailwind CSS"] },
  { cat: "Backend", items: ["Laravel", "Node.js", "Express", "FastAPI", "REST APIs"] },
  { cat: "Database", items: ["MySQL", "PostgreSQL", "SQLite", "SQL Server"] },
  { cat: "Tools & Infrastructure", items: ["Git", "GitHub", "Docker", "Postman", "Linux", "AWS", "Vercel"] },
];
const STRONG = new Set(["HTML", "CSS", "C", "C++", "Python", "JavaScript", "PHP", "MySQL", "Git", "GitHub"]);

function Skills() {
  const [active, setActive] = useState("All");
  const cats = ["All", ...SKILLS.map((s) => s.cat)];
  const shown = active === "All" ? SKILLS : SKILLS.filter((s) => s.cat === active);
  return (
    <Section id="skills" eyebrow="02 — Stack" title="The tools I build with.">
      <Reveal className="flex flex-wrap gap-2">
        {cats.map((c) => (
          <button key={c} onClick={() => setActive(c)}
            className={`rounded-md border px-4 py-2 font-mono text-xs transition-all ${active === c ? "border-primary/60 bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`}>
            {c}
          </button>
        ))}
      </Reveal>
      <div className="mt-10 divide-y border-y">
        {shown.map((s) => (
          <div key={s.cat} className="grid gap-4 py-7 md:grid-cols-[220px_1fr]">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">{s.cat}</p>
            <div className="flex flex-wrap gap-2.5">
              {s.items.map((it) => (
                <span key={it}
                  className={`rounded-md border px-4 py-2 text-sm transition-all duration-300 hover:-translate-y-0.5 ${STRONG.has(it) ? "border-primary/40 bg-primary/[0.07] text-foreground shadow-[0_0_24px_-12px_var(--glow)] hover:border-primary" : "text-muted-foreground hover:border-foreground/30 hover:text-foreground"}`}>
                  {it}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
      <p className="mt-6 flex items-center gap-2 font-mono text-xs text-muted-foreground"><span className="h-2 w-2 rounded-sm bg-primary" /> Highlighted — current core strengths</p>
    </Section>
  );
}

function Flow({ steps, vertical = false }: { steps: string[]; vertical?: boolean }) {
  return (
    <div className={`flex ${vertical ? "flex-col" : "flex-col sm:flex-row"} items-stretch gap-2`}>
      {steps.map((s, i) => (
        <div key={s} className={`flex ${vertical ? "flex-col" : "flex-col sm:flex-row"} items-center gap-2`}>
          <div className="w-full whitespace-nowrap rounded border bg-background/60 px-3 py-2 text-center font-mono text-[11px] tracking-wider">{s}</div>
          {i < steps.length - 1 && <ArrowRight size={14} className={`shrink-0 text-primary ${vertical ? "rotate-90" : "rotate-90 sm:rotate-0"}`} />}
        </div>
      ))}
    </div>
  );
}

function CncVisual() {
  return (
    <svg viewBox="0 0 300 200" className="h-full w-full" aria-hidden>
      {Array.from({ length: 11 }).map((_, i) => (
        <g key={i} stroke="currentColor" className="text-border" strokeWidth="0.6">
          <line x1={30 + i * 24} y1="20" x2={30 + i * 24} y2="180" /><line x1="30" y1={20 + i * 16} x2="270" y2={20 + i * 16} />
        </g>
      ))}
      <path d="M50 150 C 90 40, 140 40, 160 100 S 230 160, 250 50" fill="none" stroke="var(--primary)" strokeWidth="2" strokeDasharray="6 6" style={{ animation: "flow 1.2s linear infinite" }} />
      <circle cx="250" cy="50" r="5" fill="var(--primary)" />
      <text x="34" y="194" fontSize="8" fill="currentColor" className="text-muted-foreground font-mono">X</text>
      <text x="18" y="26" fontSize="8" fill="currentColor" className="text-muted-foreground font-mono">Y</text>
      <rect x="200" y="140" width="64" height="34" rx="2" fill="none" stroke="var(--accent)" strokeWidth="1" />
      <text x="207" y="160" fontSize="8" fill="var(--accent)" className="font-mono">MCU · MOTOR</text>
    </svg>
  );
}

function Projects() {
  const projects = [
    {
      n: "01", title: "Goynar Gontobbo", cat: "Full-Stack E-Commerce Platform", badge: "Real-world project",
      desc: "A full-stack jewellery e-commerce platform being developed for a real jewellery business, combining customer shopping functionality with administrative product and order management.",
      tech: ["Next.js", "TypeScript", "Tailwind CSS", "Laravel", "PHP", "MySQL"],
      visual: <Flow vertical steps={["CUSTOMER", "FRONTEND · NEXT.JS", "LARAVEL API", "MYSQL"]} />,
    },
    {
      n: "02", title: "National Healthcare Record Exchange", cat: "NHRE · Enterprise Records System",
      desc: "A centralized healthcare record exchange platform designed to support the management and exchange of healthcare information between different system users.",
      tech: ["PHP", "MySQL", "HTML", "CSS", "JavaScript"],
      github: "https://github.com/heyaftab/national-healthcare-record-exchange",
      visual: <Flow steps={["PATIENT", "PROVIDER", "RECORDS", "DATABASE", "NOTIFY"]} />,
    },
    {
      n: "03", title: "Smart CNC Plotter", cat: "Microprocessors & Microcontrollers Project", badge: "Team project",
      desc: "A team-developed Smart CNC Plotter created as part of a Microprocessors & Microcontrollers project, combining embedded programming, hardware interfacing and automated plotting.",
      tech: ["Embedded Programming", "Hardware Interfacing", "Automation"],
      details: "https://lnkd.in/p/gNNXr2y6",
      visual: <div className="h-48 w-full"><CncVisual /></div>,
    },
  ];
  return (
    <Section id="projects" eyebrow="03 — Featured work" title="Selected projects.">
      <div className="space-y-8">
        {projects.map((p, i) => (
          <Reveal key={p.n} delay={i * 60}>
            <Tilt>
              <article data-cursor="view" className="glass group relative grid overflow-hidden rounded-lg transition-colors duration-500 hover:border-primary/30 lg:grid-cols-2">
                <div className="glow-orb pointer-events-none absolute -right-20 -top-20 h-64 w-64 opacity-0 transition-opacity duration-700 group-hover:opacity-60" />
                <div className="relative flex flex-col p-7 sm:p-10">
                  <div className="flex items-center gap-3 font-mono text-xs text-muted-foreground">
                    <span className="text-primary">{p.n}</span><span className="h-px w-8 bg-border" />{p.cat}
                  </div>
                  {p.badge && <span className="mt-6 w-fit rounded border border-primary/40 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-primary">{p.badge}</span>}
                  <h3 className="mt-5 text-3xl font-semibold sm:text-4xl">{p.title}</h3>
                  <p className="mt-4 leading-relaxed text-muted-foreground">{p.desc}</p>
                  <div className="mt-6 flex flex-wrap gap-2">
                    {p.tech.map((t) => <span key={t} className="rounded border px-2.5 py-1 font-mono text-[11px] text-muted-foreground">{t}</span>)}
                  </div>
                  <div className="mt-8 flex flex-wrap gap-3 pt-2 lg:mt-auto">
                    {p.github && <a href={p.github} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"><Github size={15} /> GitHub</a>}
                    {p.details && <a href={p.details} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-md border px-4 py-2.5 text-sm transition-colors hover:border-primary/50">Project details <ArrowUpRight size={15} /></a>}
                    {!p.github && !p.details && <span className="inline-flex items-center gap-2 rounded-md border px-4 py-2.5 font-mono text-xs text-muted-foreground">In active development</span>}
                  </div>
                </div>
                <div className="relative flex items-center justify-center border-t bg-surface/60 p-8 sm:p-10 lg:border-l lg:border-t-0">
                  <div className="grid-bg absolute inset-0 opacity-60" />
                  <div className="relative w-full max-w-md">{p.visual}</div>
                </div>
              </article>
            </Tilt>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

function Achievements() {
  const seq = ["12 HOURS", "IDEA", "BUILD", "TEST", "PRESENT"];
  return (
    <Section id="achievements" eyebrow="04 — Achievements" title="Built under pressure.">
      <Reveal>
        <div className="glass relative overflow-hidden rounded-lg p-8 sm:p-12">
          <div className="glow-orb absolute -bottom-32 -left-20 h-80 w-80 opacity-50" />
          <div className="relative grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-center">
            <div>
              <Trophy className="text-primary" size={30} />
              <h3 className="mt-6 text-4xl font-semibold sm:text-5xl"><span className="text-accent-gradient">3rd Place</span><br />12-Hour Hackathon</h3>
              <p className="mt-5 text-muted-foreground">Collaborated with a team under a strict 12-hour development challenge and achieved 3rd place.</p>
              <a href="https://lnkd.in/p/gXJmyFc" target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center gap-1.5 font-mono text-xs text-primary hover:underline">View on LinkedIn <ArrowUpRight size={13} /></a>
            </div>
            <div className="flex flex-col gap-2">
              {seq.map((s, i) => (
                <Reveal key={s} delay={i * 120}>
                  <div className="flex items-center gap-4 rounded border bg-background/50 px-5 py-3 font-mono text-sm">
                    <span className="text-xs text-muted-foreground">0{i + 1}</span>{s}
                  </div>
                </Reveal>
              ))}
              <Reveal delay={seq.length * 120}>
                <div className="flex items-center gap-4 rounded bg-primary px-5 py-3 font-mono text-sm font-semibold text-primary-foreground">
                  <Trophy size={14} /> 3RD PLACE
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}

function Mindset() {
  const steps = ["Understand the problem", "Design the solution", "Build incrementally", "Test and improve", "Learn and iterate"];
  return (
    <Section eyebrow="05 — Engineering mindset" title="How I approach software.">
      <div className="relative">
        <div className="absolute bottom-0 left-[1.4rem] top-0 w-px bg-gradient-to-b from-primary/60 via-border to-transparent md:left-1/2" />
        {steps.map((s, i) => (
          <Reveal key={s} delay={i * 80}>
            <div className={`relative flex items-center gap-6 py-6 md:w-1/2 ${i % 2 ? "md:ml-auto md:pl-12" : "md:flex-row-reverse md:pr-12 md:text-right"}`}>
              <span className={`relative z-10 grid h-11 w-11 shrink-0 place-items-center rounded-full border bg-background font-mono text-xs text-primary md:absolute ${i % 2 ? "md:-left-[22px]" : "md:-right-[22px]"}`}>0{i + 1}</span>
              <p className="font-display text-2xl sm:text-3xl">{s}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

function Journey() {
  const items = [
    ["2023", "Started B.Sc. in Computer Science & Engineering."],
    ["2026", "Developing software engineering and full-stack development skills."],
    ["2026", "Built Smart CNC Plotter project."],
    ["2026", "Achieved 3rd place in a 12-hour hackathon."],
    ["2027", "Advanced project development and internship preparation."],
    ["2028", "Expected B.Sc. graduation and transition into software engineering."],
  ];
  return (
    <Section id="journey" eyebrow="06 — Journey" title="The road so far.">
      <ol className="border-l">
        {items.map(([y, t], i) => (
          <Reveal key={i} delay={i * 60}>
            <li className="group relative grid gap-2 py-6 pl-8 sm:grid-cols-[120px_1fr] sm:gap-8">
              <span className={`absolute -left-[5px] top-8 h-2.5 w-2.5 rounded-full ${i >= 4 ? "border border-muted-foreground bg-background" : "bg-primary shadow-[0_0_12px_var(--glow)]"}`} />
              <span className="font-display text-2xl text-muted-foreground transition-colors group-hover:text-primary">{y}</span>
              <p className="text-lg">{t}</p>
            </li>
          </Reveal>
        ))}
      </ol>
    </Section>
  );
}

function GithubAndResume() {
  return (
    <section className="mx-auto grid max-w-6xl gap-6 px-5 sm:px-8 md:grid-cols-2">
      <Reveal className="h-full">
        <div className="glass group flex h-full flex-col rounded-lg p-8 sm:p-10">
          <p className="eyebrow">Building with code</p>
          <Github size={36} className="mt-8" />
          <p className="mt-4 font-mono text-lg">github.com/heyaftab</p>
          <p className="mt-2 text-muted-foreground">Repositories, coursework and projects in progress.</p>
          <a href={LINKS.github} target="_blank" rel="noreferrer" className="mt-8 inline-flex w-fit items-center gap-2 rounded-md border px-5 py-3 text-sm transition-colors hover:border-primary/50">View GitHub <ArrowUpRight size={15} /></a>
        </div>
      </Reveal>
      <Reveal delay={120} className="h-full">
        <div id="resume" className="relative flex h-full flex-col overflow-hidden rounded-lg border border-primary/30 bg-primary/[0.06] p-8 sm:p-10">
          <div className="glow-orb absolute -right-16 -top-16 h-56 w-56 opacity-60" />
          <p className="eyebrow relative">Resume</p>
          <h3 className="relative mt-8 text-3xl font-semibold leading-tight">Explore my work.<br />Then let's talk.</h3>
          <p className="relative mt-4 text-muted-foreground">For a traditional overview of my education, skills and projects, download my resume.</p>
          <a href={LINKS.resume} download className="relative mt-8 inline-flex w-fit items-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5">Download Resume <Download size={15} /></a>
        </div>
      </Reveal>
    </section>
  );
}

function Contact() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"" | "ok" | "sending" | "fail">("");
  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get("name") || "").trim();
    const email = String(fd.get("email") || "").trim();
    const message = String(fd.get("message") || "").trim();
    const errs: Record<string, string> = {};
    if (name.length < 2) errs.name = "Please enter your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "Please enter a valid email.";
    if (message.length < 10) errs.message = "Message should be at least 10 characters.";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    if (!CONTACT_ENDPOINT) {
      // Not connected yet: open the visitor's email app with the message pre-filled.
      window.location.href = `mailto:${LINKS.email}?subject=${encodeURIComponent(`Portfolio message from ${name}`)}&body=${encodeURIComponent(`${message}\n\n— ${name} (${email})`)}`;
      setStatus("ok");
      return;
    }
    setStatus("sending");
    try {
      const r = await fetch(CONTACT_ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({ name, email, message }) });
      setStatus(r.ok ? "ok" : "fail");
    } catch { setStatus("fail"); }
  };
  const field = "w-full rounded-md border bg-background/60 px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/60";
  const contacts = [
    { icon: Mail, l: "Email", v: LINKS.email, h: `mailto:${LINKS.email}` },
    { icon: Linkedin, l: "LinkedIn", v: "aftab-uddin-ahmad", h: LINKS.linkedin },
    { icon: Github, l: "GitHub", v: "heyaftab", h: LINKS.github },
    { icon: Phone, l: "Phone", v: LINKS.phone, h: `tel:${LINKS.phone}` },
  ];
  return (
    <Section id="contact" eyebrow="07 — Contact" title="Let's build something.">
      <div className="grid gap-12 lg:grid-cols-2">
        <Reveal>
          <p className="text-lg leading-relaxed text-muted-foreground">I'm currently developing my skills and looking for opportunities to grow through internships, real-world projects and challenging software development work.</p>
          <ul className="mt-10 divide-y border-y">
            {contacts.map((c) => (
              <li key={c.l}>
                <a href={c.h} target={c.h.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="group grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 py-4">
                  <c.icon size={17} className="text-primary" />
                  <span className="min-w-0"><span className="block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{c.l}</span><span className="block truncate">{c.v}</span></span>
                  <ArrowUpRight size={16} className="text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-6 flex items-center gap-2 text-sm text-muted-foreground"><MapPin size={14} /> Dhaka, Bangladesh</p>
        </Reveal>
        <Reveal delay={120}>
          <form onSubmit={onSubmit} noValidate className="glass space-y-4 rounded-lg p-6 sm:p-8">
            {(["name", "email"] as const).map((f) => (
              <div key={f}>
                <label htmlFor={f} className="mb-2 block font-mono text-[11px] uppercase tracking-widest text-muted-foreground">{f}</label>
                <input id={f} name={f} type={f === "email" ? "email" : "text"} maxLength={120} className={field} placeholder={f === "name" ? "Your name" : "you@example.com"} />
                {errors[f] && <p className="mt-1.5 text-xs text-destructive">{errors[f]}</p>}
              </div>
            ))}
            <div>
              <label htmlFor="message" className="mb-2 block font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Message</label>
              <textarea id="message" name="message" rows={5} maxLength={2000} className={field} placeholder="Tell me about your project or opportunity" />
              {errors.message && <p className="mt-1.5 text-xs text-destructive">{errors.message}</p>}
            </div>
            <button type="submit" disabled={status === "sending"} className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5 disabled:opacity-60">
              {status === "sending" ? "Sending…" : "Send Message"} <ArrowRight size={15} />
            </button>
            {status === "ok" && <p className="text-sm text-muted-foreground">{CONTACT_ENDPOINT ? "Thanks — your message was sent." : "Your email app should open with the message ready to send."}</p>}
            {status === "fail" && <p className="text-sm text-destructive">Couldn't send right now. Please email me directly.</p>}
          </form>
        </Reveal>
      </div>
    </Section>
  );
}

function Footer() {
  return (
    <footer className="border-t">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-14 sm:px-8 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-display text-2xl font-semibold tracking-tight">AFTAB UDDIN AHMAD</p>
          <p className="mt-2 text-sm text-muted-foreground">Computer Science & Engineering<br />United International University</p>
        </div>
        <div className="flex flex-col gap-3 md:items-end">
          <div className="flex gap-5 font-mono text-xs text-muted-foreground">
            <a href={LINKS.github} target="_blank" rel="noreferrer" className="hover:text-foreground">GitHub</a>
            <a href={LINKS.linkedin} target="_blank" rel="noreferrer" className="hover:text-foreground">LinkedIn</a>
            <a href={`mailto:${LINKS.email}`} className="hover:text-foreground">Email</a>
          </div>
          <p className="font-mono text-xs text-muted-foreground">© 2026 Aftab Uddin Ahmad</p>
        </div>
      </div>
    </footer>
  );
}

export function Portfolio() {
  return (
    <div className="relative">
      <Cursor />
      <Nav />
      <main>
        <Hero />
        <About />
        <Skills />
        <Projects />
        <Achievements />
        <Mindset />
        <Journey />
        <GithubAndResume />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
