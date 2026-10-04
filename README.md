# Aftab Uddin Ahmad — Portfolio

A personal portfolio for Aftab Uddin Ahmad, a Computer Science & Engineering student at United International University who is working toward a career in AI engineering. The site presents his background, skills, projects, achievements, and contact information in a responsive, single-page experience.

**Live site:** [hey-aftab.lovable.app](https://hey-aftab.lovable.app)

## What the site includes

- **Profile and introduction** — hero section, portrait, location, and career direction.
- **About and education** — degree, university, expected graduation, and CGPA.
- **Skills** — filterable programming, frontend, backend, database, and infrastructure skills.
- **Featured projects** — Goynar Gontobbo, National Healthcare Record Exchange, and Smart CNC Plotter.
- **Achievements and journey** — hackathon result and career timeline.
- **Resume and contact** — downloadable CV, contact links, and a form that opens a prefilled email in the visitor’s mail app.
- **Theme switcher** — cycles through three color themes and remembers the selection in the browser.
- **Portfolio guide** — a floating chat interface that answers questions using a curated set of facts about the portfolio.

## Chat assistant behavior

The assistant uses local, predefined answers in `src/components/portfolio/PortfolioAssistant.tsx`. It can answer common questions about Aftab’s education, skills, career goal, projects, achievement, and contact details. It does not call an AI model or an external API, and it only knows the details maintained in that file. Update the answer list there when portfolio information changes.

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
- The contact form currently opens a prefilled email. To submit messages directly to a service, configure `CONTACT_ENDPOINT` in `Portfolio.tsx` and provide a compatible endpoint.

## Lovable

This repository is connected to [Lovable](https://lovable.dev). The project can be edited in the [Lovable editor](https://lovable.dev/projects/e52edce0-65e2-4a83-8041-ddd760fd261c). Commits pushed to the connected branch sync to the Lovable project, so keep that branch in a working state and do not rewrite its published history.
