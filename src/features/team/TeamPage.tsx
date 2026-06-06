import { Cat, Dog, User } from "@phosphor-icons/react";
import { requirePage } from "@/config/pageData";
import { Card } from "@/shared/components/Card";
import { Icon } from "@/shared/components/Icon";
import { PageHead } from "@/shared/components/PageHead";
import { Tag } from "@/shared/components/Tag";
import { Title } from "@/shared/components/Title";
import { resolveAssetUrl } from "@/shared/utils/assetUrl";
import { teamMembers, teamSections } from "./teamData";
import type { TeamMember } from "./teamTypes";

const page = requirePage("team");

function MemberCard({ member }: { member: TeamMember }) {
  return (
    <li>
      <Card variant="polka" compact className="h-full text-center">
        <div className="mx-auto flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-primary-soft">
          {member.photo ? (
            <img
              src={resolveAssetUrl(member.photo)}
              alt={`Portrait of ${member.name}`}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <Icon
              as={User}
              size="lg"
              weight="duotone"
              className="text-primary-deep"
            />
          )}
        </div>
        <h3 className="mt-4 text-lg font-semibold text-ink">{member.name}</h3>
        {member.focus ? (
          <div className="mt-2 flex justify-center">
            <Tag tone="info">{member.focus}</Tag>
          </div>
        ) : null}
        {member.bio ? (
          <p className="mt-3 text-sm text-ink-soft">{member.bio}</p>
        ) : null}
      </Card>
    </li>
  );
}

/**
 * Team page (React feature module). Roster comes from teamData.ts.
 */
export function TeamPage() {
  const renderedSections = teamSections
    .map((section) => ({
      section,
      members: teamMembers.filter((member) =>
        section.roles.includes(member.role),
      ),
    }))
    .filter((group) => group.members.length > 0);

  return (
    <>
      <PageHead path={page.path} title={page.title} seo={page.seo} />
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <header className="mb-10 border-b border-border-soft pb-6">
          <Title level="h1">{page.title}</Title>
          {page.summary ? (
            <p className="mt-4 max-w-3xl text-lg text-ink-soft">
              {page.summary}
            </p>
          ) : null}
        </header>

        {renderedSections.length === 0 ? (
          <Card variant="plain" className="mx-auto max-w-md text-center">
            <div
              aria-hidden="true"
              className="flex items-center justify-center gap-3 text-primary-deep"
            >
              <Icon as={Cat} size="lg" weight="duotone" />
              <Icon as={Dog} size="lg" weight="duotone" />
            </div>
            <p className="mt-4 text-lg font-semibold text-ink">
              Team roster coming soon
            </p>
            <p className="mt-2 text-sm text-ink-soft">
              Our cats &amp; dogs are still rounding up the crew. Check back
              shortly to meet the BASIS-China team.
            </p>
          </Card>
        ) : (
          renderedSections.map(({ section, members }) => (
            <section key={section.id} className="mb-12">
              <Title level="h2">{section.title}</Title>
              <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {members.map((member, index) => (
                  <MemberCard key={`${member.name}-${index}`} member={member} />
                ))}
              </ul>
            </section>
          ))
        )}
      </div>
    </>
  );
}

export default TeamPage;
