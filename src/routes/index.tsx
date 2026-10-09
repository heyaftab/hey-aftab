import { createFileRoute } from "@tanstack/react-router";
import { Portfolio } from "@/components/portfolio/Portfolio";

const title = "Aftab Uddin Ahmad — Computer Science Student & AI Engineer";
const description =
  "Portfolio of Aftab Uddin Ahmad, a Computer Science student at United International University aspiring to become an AI engineer and build intelligent, useful technology.";

export const Route = createFileRoute("/")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title, key: "title" },
      { name: "description", content: description, key: "description" },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ProfilePage",
          mainEntity: {
            "@type": "Person",
            name: "Aftab Uddin Ahmad",
            jobTitle: "Computer Science Student & AI Engineer",
            memberOf: {
              "@type": "CollegeOrUniversity",
              name: "United International University",
            },
            sameAs: [
              "https://github.com/heyaftab",
              "https://www.linkedin.com/in/aftab-uddin-ahmad-7b303429/",
              "https://www.facebook.com/aftabuddinahmad26/",
            ],
          },
        }),
      },
    ],
  }),
  component: Portfolio,
});
