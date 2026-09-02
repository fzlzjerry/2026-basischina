import { requirePage } from "@/config/pageData";
import { PageHead } from "@/shared/components/PageHead";
import { HeroSection } from "./sections/HeroSection";
import { ApproachSection } from "./sections/ApproachSection";
import { KineticStatementSection } from "./sections/KineticStatementSection";
import { WorkstreamsSection } from "./sections/WorkstreamsSection";
import { ClosingCtaSection } from "./sections/ClosingCtaSection";

const page = requirePage("home");

/**
 * Homepage: cover, three-spot approach, kinetic signature, linked
 * workstream leaves, then sunset send-off. One telling of each idea.
 */
export function HomePage() {
  return (
    <>
      <PageHead path={page.path} title={page.title} seo={page.seo} />
      <HeroSection />
      <ApproachSection />
      <KineticStatementSection />
      <WorkstreamsSection />
      <ClosingCtaSection />
    </>
  );
}

export default HomePage;
