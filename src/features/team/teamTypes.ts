export type TeamRole = "student" | "instructor" | "advisor" | "pi";

export interface TeamMember {
  name: string;
  role: TeamRole;
  /** Short focus area or title, e.g. "Wet Lab", "Modeling". */
  focus?: string;
  bio?: string;
  /** Photo path (resolved through resolveAssetUrl). */
  photo?: string;
}

export interface TeamSection {
  id: string;
  title: string;
  roles: TeamRole[];
}
