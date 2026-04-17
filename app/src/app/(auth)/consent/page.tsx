/**
 * SCR-02: PDPA Consent Page
 * T-003: FR-AUTH-10 — Display PDPA consent form for first-time users.
 *
 * Server component. Shows consent text + accept/decline buttons.
 * Accept -> POST /api/auth/consent -> redirect to /
 * Decline -> POST /api/auth/logout -> redirect to /login with explanation
 */

const CONSENT_VERSION = "1.0";

export default function ConsentPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-2xl rounded-xl bg-white p-8 shadow-lg">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Data Protection Consent</h1>
          <p className="mt-2 text-sm text-gray-500">
            DriveWiki requires your consent before proceeding (PDPA compliance)
          </p>
        </div>

        {/* Consent Text */}
        <div className="mb-6 max-h-80 overflow-y-auto rounded-lg border border-gray-200 bg-gray-50 p-6 text-sm text-gray-700 leading-relaxed">
          <h2 className="mb-3 font-semibold text-gray-900">
            Personal Data Protection Act (PDPA) Consent Notice
          </h2>
          <p className="mb-3">
            By using DriveWiki, you consent to the collection, use, and storage of the
            following personal data for the purposes described below:
          </p>
          <h3 className="mb-2 font-semibold">Data Collected:</h3>
          <ul className="mb-3 list-disc pl-5 space-y-1">
            <li>Google account information (name, email address, profile picture)</li>
            <li>Organization and department membership</li>
            <li>Activity logs (queries, wiki interactions, document access timestamps)</li>
            <li>Session data (IP address, user agent, login timestamps)</li>
          </ul>
          <h3 className="mb-2 font-semibold">Purpose:</h3>
          <ul className="mb-3 list-disc pl-5 space-y-1">
            <li>Authentication and access control</li>
            <li>Knowledge management and search functionality</li>
            <li>Usage analytics and cost tracking per department</li>
            <li>Audit trail for compliance and security</li>
          </ul>
          <h3 className="mb-2 font-semibold">Your Rights:</h3>
          <ul className="mb-3 list-disc pl-5 space-y-1">
            <li>Right to access your personal data</li>
            <li>Right to correct inaccurate data</li>
            <li>Right to request deletion of your data</li>
            <li>Right to withdraw consent (will result in account deactivation)</li>
          </ul>
          <p className="text-xs text-gray-500">
            Consent Version: {CONSENT_VERSION} | Data is stored in compliance with PDPA
            regulations on Google Cloud (asia-southeast1 region).
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          {/* Decline: logout with explanation */}
          <form action="/api/auth/consent" method="POST" className="flex-1">
            <input type="hidden" name="action" value="decline" />
            <button
              type="submit"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              Decline
            </button>
          </form>

          {/* Accept: record consent + redirect */}
          <form action="/api/auth/consent" method="POST" className="flex-1">
            <input type="hidden" name="action" value="accept" />
            <input type="hidden" name="version" value={CONSENT_VERSION} />
            <button
              type="submit"
              className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              I Accept
            </button>
          </form>
        </div>

        <p className="mt-4 text-center text-xs text-gray-400">
          You must accept to use DriveWiki. Declining will log you out.
        </p>
      </div>
    </div>
  );
}
