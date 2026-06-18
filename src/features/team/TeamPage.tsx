import { Cat, Dog, User } from "@phosphor-icons/react";
import { requirePage } from "@/config/pageData";
import { Icon } from "@/shared/components/Icon";
import { PageHead } from "@/shared/components/PageHead";
import { Tag } from "@/shared/components/Tag";
import { stickerStyle } from "@/shared/styles/heal";
import { resolveAssetUrl } from "@/shared/utils/assetUrl";
import { teamMembers, teamSections } from "./teamData";
import type { TeamMember } from "./teamTypes";

const page = requirePage("team");

function MemberCard({ member, index }: { member: TeamMember; index: number }) {
  return (
    <li>
      {/* Each member is a paper cutout pasted into the notebook: a framed photo
          with a hand-printed name. Static tilt (heal-cutout), no false hover
          affordance since the card is not a link. */}
      <div
        className="heal-cutout h-full bg-surface p-5 text-center"
        style={stickerStyle(index)}
      >
        <div className="mx-auto flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 border-sticker-ink bg-primary-soft">
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
        <h3 className="mt-4 font-hand text-xl text-ink">{member.name}</h3>
        {member.focus ? (
          <div className="mt-2 flex justify-center">
            <Tag tone="info">{member.focus}</Tag>
          </div>
        ) : null}
        {member.bio ? (
          <p className="mt-3 text-sm text-ink-soft">{member.bio}</p>
        ) : null}
      </div>
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
      <div className="min-h-screen bg-page heal-grid">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <header className="mb-10 border-b-2 border-dashed border-sticker-ink/40 pb-6">
            <h1 className="pb-1 font-script text-[clamp(2.6rem,2rem+2.5vw,3.9rem)] font-bold leading-[1.04] text-ink">
              {page.title}
            </h1>
            {page.summary ? (
              <p className="mt-4 max-w-3xl text-lg text-ink-soft">
                {page.summary}
              </p>
            ) : null}
          </header>

          {renderedSections.length === 0 ? (
            <div
              className="heal-cutout mx-auto max-w-md bg-surface p-8 text-center"
              style={stickerStyle(0)}
            >
              <div
                aria-hidden="true"
                className="flex items-center justify-center gap-3 text-primary-deep"
              >
                <Icon as={Cat} size="lg" weight="duotone" />
                <Icon as={Dog} size="lg" weight="duotone" />
              </div>
              <p className="mt-4 font-hand text-xl text-ink">
                Team roster coming soon
              </p>
              <p className="mt-2 text-sm text-ink-soft">
                Our cats &amp; dogs are still rounding up the crew. Check back
                shortly to meet the BASIS-China team.
              </p>
            </div>
          ) : (
            renderedSections.map(({ section, members }) => (
              <section key={section.id} className="mb-12">
                <h2 className="pb-1 font-script text-[clamp(2rem,1.6rem+1.6vw,2.9rem)] font-bold leading-[1.05] text-ink">
                  {section.title}
                </h2>
                <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {members.map((member, index) => (
                    <MemberCard
                      key={`${member.name}-${index}`}
                      member={member}
                      index={index}
                    />
                  ))}
                </ul>
              </section>
            ))
          )}
        </div>
      </div>
    </>
  );
}

export default TeamPage;
