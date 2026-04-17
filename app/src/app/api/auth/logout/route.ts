/**
 * POST /api/auth/logout
 * Deletes session cookie and redirects to login.
 * T-001: Session cleanup
 */

import { NextResponse } from "next/server";
import { deleteSession } from "@/auth/session";
import { getAppUrl } from "@/auth/config";

export async function POST() {
  await deleteSession();
  return NextResponse.redirect(`${getAppUrl()}/login`);
}
