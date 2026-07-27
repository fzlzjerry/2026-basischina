import { requirePage } from "@/config/pageData";
import { PageHead } from "@/shared/components/PageHead";
import { HeroSection } from "./sections/HeroSection";
import { ApproachSection } from "./sections/ApproachSection";
import { KineticStatementSection } from "./sections/KineticStatementSection";
import { WorkstreamsSection } from "./sections/WorkstreamsSection";
import { HighlightsSection } from "./sections/HighlightsSection";
import { ClosingCtaSection } from "./sections/ClosingCtaSection";

const page = requirePage("home");

/**
 * Homepage (§20): composes feature sections only — no multi-thousand-line
 * component. Section content and interaction live inside each section file.
 */
export function HomePage() {
  return (
    <>
      <PageHead path={page.path} title={page.title} seo={page.seo} />
      <HeroSection />
      <ApproachSection />
      <KineticStatementSection />
      <WorkstreamsSection />
      <HighlightsSection />
      <ClosingCtaSection />
    </>
  );
}

export default HomePage;
