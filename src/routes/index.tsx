import { createFileRoute } from "@tanstack/react-router";
import { Portfolio } from "@/components/portfolio/Portfolio";

const title = "Aftab Uddin Ahmad — Computer Science Student & Aspiring AI Engineer";
const description =
  "Portfolio of Aftab Uddin Ahmad, a Computer Science student at United International University aspiring to become an AI engineer and build intelligent, useful technology.";

export const Route = createFileRoute("/")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Portfolio,
});
