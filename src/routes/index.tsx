import { createFileRoute } from "@tanstack/react-router";
import { Portfolio } from "@/components/portfolio/Portfolio";

const title = "Aftab Uddin Ahmad — Computer Science Student & AI Engineer";
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
              "https://github.com/aftabuddinahmad",
              "https://www.linkedin.com/in/aftabuddinahmad",
              "https://www.facebook.com/aftabuddinahmad",
            ],
          },
        }),
      },
    ],
  }),
  component: Portfolio,
});
