export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md p-8 border border-gray-100 prose prose-blue">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-6">Privacy Policy</h1>
        <p className="text-gray-600 mb-4">Last updated: August 2026</p>
        <p className="text-gray-700 mb-4">
          Welcome to Prox (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;). We respect your privacy and are committed to protecting your personal data.
        </p>
        <h2 className="text-xl font-bold text-gray-800 mt-6 mb-3">1. Information We Collect</h2>
        <ul className="list-disc pl-5 text-gray-700 space-y-2 mb-4">
          <li><strong>Account Information:</strong> Collected securely via Supabase Auth when you sign up with email/password or Google.</li>
          <li><strong>Business & Deal Data:</strong> Information you provide regarding your local business and active deals.</li>
          <li><strong>Location Data:</strong> Geolocation is requested solely on your device to calculate live distances in meters. We do not store or track your precise location history on our servers.</li>
        </ul>
        <h2 className="text-xl font-bold text-gray-800 mt-6 mb-3">2. How We Use Your Information</h2>
        <p className="text-gray-700 mb-4">
          We use your email to send essential account notifications and retention reminders via Resend. We do not sell, rent, or trade your personal data to third parties.
        </p>
        <h2 className="text-xl font-bold text-gray-800 mt-6 mb-3">3. Affiliates</h2>
        <p className="text-gray-700 mb-4">
          If you participate in our referral program, we track referral codes and credits to reward both referrers and referred businesses.
        </p>
        <h2 className="text-xl font-bold text-gray-800 mt-6 mb-3">4. Contact Us</h2>
        <p className="text-gray-700">
          If you have any questions about this Privacy Policy, please contact us at support@prox.app.
        </p>
      </div>
    </main>
  )
}
