import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowUpRight } from "lucide-react";

const BASE_URL = "https://hey-aftab.lovable.app";
const title = "My AI Engineer Roadmap — Aftab Uddin Ahmad";
const description =
  "The learning path I'm following from Computer Science student to AI engineer: foundations, machine learning, projects, and internship preparation.";

export const Route = createFileRoute("/ai-engineer-roadmap")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title, key: "title" },
      { name: "description", content: description, key: "description" },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "article" },
      { property: "og:url", content: `${BASE_URL}/ai-engineer-roadmap` },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `${BASE_URL}/ai-engineer-roadmap` }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          headline: title,
          description,
          author: {
            "@type": "Person",
            name: "Aftab Uddin Ahmad",
            url: BASE_URL,
          },
        }),
      },
    ],
  }),
  component: AiEngineerRoadmap,
});

const phases = [
  {
    period: "2023 — Foundations",
    title: "Computer Science fundamentals",
    body: "Started my B.Sc. in Computer Science & Engineering at United International University. Focused on programming fundamentals, data structures, algorithms, and mathematics — the base everything else stands on.",
    tags: ["C++", "Data Structures", "Algorithms", "Mathematics"],
  },
  {
    period: "2025 — Programming depth",
    title: "Python and software engineering",
    body: "Moved deeper into Python, the language of modern AI. Practiced building real software: clean code, version control with Git, backend development with FastAPI, and working with databases.",
    tags: ["Python", "FastAPI", "Git", "Databases"],
  },
  {
    period: "2026 — Building in public",
    title: "Projects and competitions",
    body: "Started shipping real projects, including a Smart CNC Plotter, and took 3rd place in a 12-hour hackathon. Also began exploring machine learning libraries and AI tools hands-on.",
    tags: ["Machine Learning", "Hackathons", "Smart CNC Plotter", "AI Tools"],
  },
  {
    period: "2027 — Specialization",
    title: "Advanced projects and internships",
    body: "Deepening my machine learning and deep learning knowledge through larger projects, and preparing for internship applications to get real industry experience in AI engineering.",
    tags: ["Deep Learning", "Internships", "Advanced Projects"],
  },
  {
    period: "2028 — Transition",
    title: "Graduation into AI engineering",
    body: "Expected B.Sc. graduation, followed by a full transition into an AI engineering role — building intelligent, useful technology that solves real problems.",
    tags: ["Graduation", "AI Engineer", "Career"],
  },
];

const principles = [
  "Learn by building — every concept gets a project, not just notes.",
  "Master the fundamentals before chasing frameworks.",
  "Compete and collaborate — hackathons teach speed and teamwork.",
  "Share the work — public repositories and write-ups build credibility.",
];

function AiEngineerRoadmap() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-16 sm:px-8 sm:py-24">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
      >
        <ArrowLeft size={15} /> Back to portfolio
      </Link>

      <p className="eyebrow mt-10">Guide</p>
      <h1 className="mt-4 font-display text-4xl sm:text-5xl">
        My AI engineer roadmap
      </h1>
      <p className="mt-6 text-lg text-muted-foreground">
        I'm a Computer Science student at United International University
        working toward a career in AI engineering. This is the path I'm
        following — what's done, what's in progress, and what's next.
      </p>

      <ol className="mt-14 border-l">
        {phases.map((phase) => (
          <li key={phase.period} className="relative py-7 pl-8">
            <span className="absolute -left-[5px] top-9 h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_12px_var(--glow)]" />
            <p className="font-mono text-sm text-muted-foreground">
              {phase.period}
            </p>
            <h2 className="mt-2 font-display text-2xl">{phase.title}</h2>
            <p className="mt-3 text-muted-foreground">{phase.body}</p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {phase.tags.map((tag) => (
                <li
                  key={tag}
                  className="rounded-full border px-3 py-1 font-mono text-xs text-muted-foreground"
                >
                  {tag}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>

      <section className="mt-16">
        <h2 className="font-display text-3xl">How I approach the journey</h2>
        <ul className="mt-6 grid gap-4">
          {principles.map((principle) => (
            <li key={principle} className="glass rounded-lg p-5">
              {principle}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-16 rounded-lg border p-8 text-center">
        <h2 className="font-display text-2xl">Following a similar path?</h2>
        <p className="mt-3 text-muted-foreground">
          I'm always happy to talk about learning, projects, or collaboration.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            View my portfolio <ArrowUpRight size={15} />
          </Link>
          <a
            href="mailto:aftabuddinahmad26@gmail.com"
            className="inline-flex items-center gap-2 rounded-md border px-5 py-3 text-sm transition-colors hover:border-primary/50"
          >
            Get in touch
          </a>
        </div>
      </section>
    </main>
  );
}
