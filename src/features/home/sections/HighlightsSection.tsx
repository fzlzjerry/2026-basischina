import { Link } from "react-router-dom";
import { PawPrint } from "@phosphor-icons/react";
import type { PageCategory } from "@/config/pageData";
import { pageCategoryMeta } from "@/config/pageCategoryMeta";
import { Icon } from "@/shared/components/Icon";
import { Card } from "@/shared/components/Card";
import { Title } from "@/shared/components/Title";

interface Highlight {
  title: string;
  description: string;
  to: string;
  cta: string;
  category: PageCategory;
}

const highlights: Highlight[] = [
  {
    title: "The project",
    description:
      "Why we chose our challenge, the science behind our solution, and where we are headed.",
    to: "/description",
    cta: "Read the description",
    category: "project",
  },
  {
    title: "The team",
    description:
      "The students, instructors, and advisors who made this season possible.",
    to: "/team",
    cta: "Meet the team",
    category: "team",
  },
];

/**
 * Homepage highlights (§20). Section content is local to this file.
 */
export function HighlightsSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
      <Title level="h2" align="center">
        Start exploring
      </Title>
      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        {highlights.map((item) => {
          const { Icon: CategoryIcon, accent } =
            pageCategoryMeta[item.category];
          return (
            <Link
              key={item.to}
              to={item.to}
              className="group block rounded-card outline-focus-ring focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              <Card
                variant="interactive"
                accent={accent}
                className="ac-polka h-full"
              >
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-min bg-primary-soft text-primary-deep">
                  <Icon as={CategoryIcon} size="md" />
                </span>
                <h3 className="mt-4 text-xl font-semibold text-ink">
                  {item.title}
                </h3>
                <p className="mt-3 text-ink-soft">{item.description}</p>
                <span className="mt-4 inline-flex items-center gap-2 font-semibold text-primary-deep">
                  {item.cta}
                  <Icon
                    as={PawPrint}
                    className="transition group-hover:translate-x-1"
                  />
                </span>
              </Card>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
