import { requirePage } from "@/config/pageData";
import { PageHead } from "@/shared/components/PageHead";
import { resolveAssetUrl } from "@/shared/utils/assetUrl";
import { teamMembers, teamSections } from "./teamData";
import type { TeamMember } from "./teamTypes";

const page = requirePage("team");

function MemberCard({ member }: { member: TeamMember }) {
  return (
    <li className="rounded-2xl border border-slate-200 p-6 text-center">
      <div className="mx-auto h-24 w-24 overflow-hidden rounded-full bg-emerald-100">
        {member.photo ? (
          <img
            src={resolveAssetUrl(member.photo)}
            alt={`Portrait of ${member.name}`}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <span
            aria-hidden="true"
            className="flex h-full w-full items-center justify-center text-2xl font-bold text-emerald-700"
          >
            {member.name.charAt(0)}
          </span>
        )}
      </div>
      <h3 className="mt-4 text-lg font-semibold text-slate-900">
        {member.name}
      </h3>
      {member.focus ? (
        <p className="text-sm font-medium text-emerald-700">{member.focus}</p>
      ) : null}
      {member.bio ? (
        <p className="mt-2 text-sm text-slate-600">{member.bio}</p>
      ) : null}
    </li>
  );
}

/**
 * Team page (React feature module). Roster comes from teamData.ts.
 */
export function TeamPage() {
  return (
    <>
      <PageHead path={page.path} title={page.title} seo={page.seo} />
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <header className="mb-10 border-b border-slate-200 pb-6">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            {page.title}
          </h1>
          {page.summary ? (
            <p className="mt-3 max-w-3xl text-lg text-slate-600">
              {page.summary}
            </p>
          ) : null}
        </header>

        {teamSections.map((section) => {
          const members = teamMembers.filter((member) =>
            section.roles.includes(member.role),
          );
          if (members.length === 0) return null;
          return (
            <section key={section.id} className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900">
                {section.title}
              </h2>
              <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {members.map((member, index) => (
                  <MemberCard key={`${member.name}-${index}`} member={member} />
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </>
  );
}

export default TeamPage;
