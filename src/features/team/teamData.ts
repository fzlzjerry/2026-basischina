import type { TeamMember, TeamSection } from "./teamTypes";

/**
 * Team roster (§17 reference). Replace the placeholder entries with the real
 * 2026 BASIS-China members; the TeamPage renders whatever is listed here.
 */
export const teamMembers: TeamMember[] = [
  {
    name: "Wet Lab Student Member",
    role: "student",
    focus: "Wet Lab",
    bio: "Add a short bio describing this member's contributions.",
  },
  {
    name: "Dry Lab & Modeling Student Member",
    role: "student",
    focus: "Dry Lab & Modeling",
    bio: "Add a short bio describing this member's contributions.",
  },
  {
    name: "Human Practices Student Member",
    role: "student",
    focus: "Human Practices",
    bio: "Add a short bio describing this member's contributions.",
  },
  {
    name: "Instructor Name",
    role: "instructor",
    focus: "Instructor",
    bio: "Add a short bio describing this instructor's role.",
  },
  {
    name: "Advisor Name",
    role: "advisor",
    focus: "Advisor",
    bio: "Add a short bio describing this advisor's role.",
  },
];

export const teamSections: TeamSection[] = [
  { id: "students", title: "Students", roles: ["student"] },
  { id: "instructors", title: "Instructors", roles: ["instructor", "pi"] },
  { id: "advisors", title: "Advisors", roles: ["advisor"] },
];
