/**
 * POST /api/auth/consent
 * Records PDPA consent or handles decline.
 * T-003: FR-AUTH-10
 *
 * Accept: updates user.consentAt + user.consentVersion, redirects to /
 * Decline: deletes session, redirects to /login?error=consent_declined
 */

import { NextRequest, NextResponse } from "next/server";
import { getSession, deleteSession } from "@/auth/session";
import { getAppUrl } from "@/auth/config";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const appUrl = getAppUrl();
  const formData = await request.formData();
  const action = formData.get("action") as string;
  const version = formData.get("version") as string;

  const session = await getSession();
  if (!session?.userId) {
    return NextResponse.redirect(`${appUrl}/login`);
  }

  if (action === "accept" && version) {
    // Record consent in user record
    await prisma.user.update({
      where: { id: session.userId },
      data: {
        consentAt: new Date(),
        consentVersion: version,
      },
    });

    // Redirect to main page
    return NextResponse.redirect(`${appUrl}/`);
  }

  // Decline: delete session and redirect with explanation
  await deleteSession();
  return NextResponse.redirect(`${appUrl}/login?error=consent_declined`);
}
