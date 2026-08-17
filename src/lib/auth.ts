import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database.types";

export type AppRole = Tables<"profiles">["role"];

export const STAFF_ROLES: AppRole[] = [
  "admin",
  "editor",
  "membership_manager",
  "event_manager",
];

export type SessionProfile = {
  userId: string;
  email: string;
  profile: Tables<"profiles">;
};

export async function getSessionProfile(): Promise<SessionProfile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile) return null;
  return { userId: user.id, email: user.email ?? "", profile };
}

/** Gate an admin page: redirects to /login unless the user holds a staff role. */
export async function requireStaff(locale: string): Promise<SessionProfile> {
  const session = await getSessionProfile();
  if (!session || !STAFF_ROLES.includes(session.profile.role)) {
    redirect(`/${locale}/login`);
  }
  return session;
}

/** Gate a server action: throws unless the user holds one of the roles. */
export async function assertRole(roles: AppRole[]): Promise<SessionProfile> {
  const session = await getSessionProfile();
  if (!session || !roles.includes(session.profile.role)) {
    throw new Error("forbidden");
  }
  return session;
}
