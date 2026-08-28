export default function TermsPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md p-8 border border-gray-100 prose prose-blue">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-6">Terms of Service</h1>
        <p className="text-gray-600 mb-4">Last updated: August 2026</p>
        <p className="text-gray-700 mb-4">
          By accessing or using Prox, you agree to be bound by these Terms of Service.
        </p>
        <h2 className="text-xl font-bold text-gray-800 mt-6 mb-3">1. Live Ad & Deal Rules</h2>
        <ul className="list-disc pl-5 text-gray-700 space-y-2 mb-4">
          <li><strong>1 Live Ad Per Business:</strong> Each registered business is strictly limited to one active live ad at any given time.</li>
          <li><strong>Expiry:</strong> Deals expire automatically based on your set expiry time (up to 24h recommended).</li>
          <li><strong>Content Guidelines:</strong> No illegal, misleading, or inappropriate content is permitted. Violators will have their deals removed.</li>
        </ul>
        <h2 className="text-xl font-bold text-gray-800 mt-6 mb-3">2. Referral & Affiliate Program</h2>
        <p className="text-gray-700 mb-4">
          Affiliate fraud, automated referral generation, or abuse of the referral program will result in immediate account suspension and forfeiture of all credits. Credits are non-transferable.
        </p>
        <h2 className="text-xl font-bold text-gray-800 mt-6 mb-3">3. Limitation of Liability</h2>
        <p className="text-gray-700 mb-4">
          Prox is provided &quot;as is&quot; without warranties of any kind. We are not liable for transactions between users and local businesses.
        </p>
        <h2 className="text-xl font-bold text-gray-800 mt-6 mb-3">4. Contact</h2>
        <p className="text-gray-700">
          For any legal inquiries, contact us at legal@prox.app.
        </p>
      </div>
    </main>
  )
}
