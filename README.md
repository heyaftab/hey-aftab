# Aftab Uddin Ahmad — Portfolio

A personal portfolio for Aftab Uddin Ahmad, a Computer Science & Engineering student at United International University who is working toward a career in AI engineering. The site presents his background, skills, projects, achievements, and contact information in a responsive, single-page experience.

**Live site:** [hey-aftab.lovable.app](https://hey-aftab.lovable.app)

## What the site includes

- **Profile and introduction** — hero section, portrait, location, and career direction.
- **About and education** — degree, university, and expected graduation.
- **Skills** — filterable programming, frontend, backend, database, and infrastructure skills.
- **Featured projects** — Goynar Gontobbo, BozoScope, UIU CSE Course Planner, National Healthcare Record Exchange, and Smart CNC Plotter.
- **Achievements and journey** — hackathon result and career timeline.
- **Resume and contact** — downloadable CV, email and social profile links (LinkedIn, GitHub, and Facebook), and a form that opens a prefilled email in the visitor’s mail app.
- **Theme switcher** — cycles through three color themes and remembers the selection in the browser.
- **Portfolio guide** — a floating chat interface that answers questions using a curated set of facts about the portfolio.

## Chat assistant behavior

The portfolio assistant uses concise, professional answers from a local knowledge base in `src/components/portfolio/PortfolioAssistant.tsx`. It covers Aftab’s education, skills, career goal, projects, achievements, and profile links. It matches questions to curated portfolio details; it does not fetch live content from social profiles or call an AI model or external API. Keep its answers factual and aligned with the public portfolio information.

## Technology

- React 19 and TypeScript
- TanStack Start and TanStack Router
- Vite
- Tailwind CSS 4
- Lucide React icons

## Run locally

### Requirements

- Node.js with npm
- Git, if cloning the repository

### Install and start the development server

```sh
git clone <repository-url>
cd <repository-directory>
npm install
npm run dev
```

Vite prints the local development URL in the terminal after the server starts.

## Available commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the local development server. |
| `npm run build` | Create a production build. |
| `npm run build:dev` | Create a development-mode build. |
| `npm run preview` | Preview the production build locally. |
| `npm run lint` | Run ESLint across the project. |
| `npm test` | Run the Vitest test suite once. |
| `npm run test:watch` | Run Vitest in watch mode. |
| `npm run format` | Format files with Prettier. |

## Project layout

```text
src/
  components/
    portfolio/
      Portfolio.tsx           Main page sections and portfolio content
      PortfolioAssistant.tsx  Local knowledge-based chat assistant
      ThemePicker.tsx         Click-to-cycle theme control
      effects.tsx             Shared visual effects and motion components
    ui/                       Reusable UI components
  routes/
    __root.tsx                Application shell, global metadata, and providers
    index.tsx                 Home page route and page metadata
  styles.css                  Design tokens, themes, and global styles
public/
  assets/Aftab.png            Profile portrait used in the hero section
  Aftab_Uddin_Ahmad_AI_Engineer_CV.docx  Downloadable CV
```

## Updating the portfolio

- Edit page copy, skills, project descriptions, timeline entries, or contact links in `src/components/portfolio/Portfolio.tsx`.
- Edit assistant questions and answers in `src/components/portfolio/PortfolioAssistant.tsx`.
- Edit theme colors and design tokens in `src/styles.css`. Theme IDs are `night`, `ocean`, and `light`; `ThemePicker.tsx` cycles through them in that order.
- Replace `public/assets/Aftab.png` to change the profile portrait. Keep the filename or update the image path in `Portfolio.tsx`.
- Replace `public/Aftab_Uddin_Ahmad_AI_Engineer_CV.docx` to update the downloadable CV. Keep its filename or update the resume path in `Portfolio.tsx`.
- The contact form sends to the server-side `/api/contact` route, which forwards messages to `aftabuddinahmad26@gmail.com` through Resend. The `RESEND_API_KEY` must be configured as a Cloudflare Worker secret; never place it in client code or commit it. For local Worker development, store it in the ignored `.dev.vars` file.

### Enable contact form email delivery

1. Create a Resend account and generate an API key.
2. Add the key to the Cloudflare Worker as a secret named `RESEND_API_KEY` (Worker: `heyaftab-hey-aftab`), then deploy the updated Worker.
3. Resend's default test sender can be used for initial checks when the recipient address is verified in Resend. For unrestricted delivery, verify a domain you control in Resend and update the `from` address in `src/routes/api/contact.ts`.

The contact API validates and limits form fields, checks same-origin requests, and includes a honeypot field to discard basic bot submissions. Messages are sent with the visitor's address as `Reply-To` so you can respond directly.

## Lovable

This repository is connected to [Lovable](https://lovable.dev). The project can be edited in the [Lovable editor](https://lovable.dev/projects/e52edce0-65e2-4a83-8041-ddd760fd261c). Commits pushed to the connected branch sync to the Lovable project, so keep that branch in a working state and do not rewrite its published history.
