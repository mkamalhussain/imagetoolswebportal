import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy - How We Protect Your Data | Free Tools',
  description: 'Learn about our privacy practices, data collection policies, and how we protect your information. Free Tools is committed to transparency and GDPR compliance.',
  keywords: [
    'privacy policy',
    'data protection',
    'GDPR compliance',
    'privacy practices',
    'data collection',
    'user privacy',
    'security policy'
  ],
  openGraph: {
    title: 'Privacy Policy - How We Protect Your Data',
    description: 'Learn about our privacy practices, data collection policies, and how we protect your information. Free Tools is committed to transparency and GDPR compliance.',
    type: 'website',
    url: 'https://freetools.com/privacy',
  },
  twitter: {
    card: 'summary',
    title: 'Privacy Policy - How We Protect Your Data',
    description: 'Learn about our privacy practices, data collection policies, and how we protect your information.',
  },
  alternates: {
    canonical: 'https://freetools.com/privacy',
  },
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Google AdSense Header */}
        <div className="bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center mb-8">
          <p className="text-gray-500 dark:text-gray-400">📢 Google AdSense Placeholder</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">728x90 Banner Ad</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Privacy Policy
          </h1>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              <strong>Last updated:</strong> {new Date().toLocaleDateString()}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                1. Introduction
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Welcome to Free Tools ("we," "our," or "us"). We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services.
              </p>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                By using our services, you agree to the collection and use of information in accordance with this policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                2. Information We Collect
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                We do not collect any personal information from our users. Our services are designed to process your files entirely in your browser, without any data being transmitted to our servers.
              </p>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">2.1 Files Processed</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                When you use our tools, your files are processed locally in your web browser using WebAssembly and JavaScript. Your files never leave your device or get uploaded to our servers.
              </p>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">2.2 Usage Analytics</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                We do not track, collect, or store any usage analytics, browsing patterns, or behavioral data.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                3. How We Use Information
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Since we do not collect any personal information, we do not use your information for any purposes.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                4. Information Sharing and Disclosure
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                We do not share, sell, or disclose any personal information because we do not collect any.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                5. Data Security
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Your privacy and security are our highest priorities. Here's how we protect your data:
              </p>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
                <li><strong>Client-side processing:</strong> All file processing happens in your browser, not on our servers</li>
                <li><strong>No data storage:</strong> We never store your files or personal information</li>
                <li><strong>No data transmission:</strong> Your files never leave your device</li>
                <li><strong>HTTPS encryption:</strong> Our website uses HTTPS to secure the connection</li>
                <li><strong>Open source:</strong> Our code is transparent and auditable</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                6. Third-Party Services
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                We use third-party services for website hosting and analytics. These services may collect anonymous usage statistics, but we have configured them to minimize data collection.
              </p>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">6.1 Hosting</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Our website is hosted on Vercel, which provides the infrastructure for our site. Vercel may collect anonymous server logs for security and performance monitoring.
              </p>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">6.2 Google AdSense (Future)</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                We may implement Google AdSense in the future. Google AdSense uses cookies and similar technologies to serve personalized ads. You can opt out of personalized advertising by visiting Google's Ads Settings.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                7. Cookies and Tracking
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Currently, our website does not use cookies or tracking technologies. If we implement them in the future, we will update this policy accordingly.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                8. International Data Transfers
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Since we do not collect or store personal data, there are no international data transfers.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                9. Children's Privacy
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Our services are not directed to children under 13. We do not knowingly collect personal information from children under 13.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                10. GDPR Rights (EU Users)
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                As a European user, you have certain rights regarding your personal data. However, since we do not collect any personal information, these rights are automatically fulfilled:
              </p>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
                <li><strong>Right to access:</strong> We don't have your data to access</li>
                <li><strong>Right to rectification:</strong> No data to correct</li>
                <li><strong>Right to erasure:</strong> No data to delete</li>
                <li><strong>Right to restrict processing:</strong> No processing to restrict</li>
                <li><strong>Right to data portability:</strong> No data to port</li>
                <li><strong>Right to object:</strong> No processing to object to</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                11. Changes to This Privacy Policy
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                12. Contact Us
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                If you have any questions about this Privacy Policy, please contact us:
              </p>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
                <li>Email: privacy@freetoolbox.app</li>
                <li>Address: [Company Address - To be updated]</li>
              </ul>
            </section>
          </div>
        </div>

        {/* Google AdSense Bottom Banner */}
        <div className="w-full mt-12">
          <div className="bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center">
            <p className="text-gray-500 dark:text-gray-400">📢 Google AdSense Placeholder</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">728x90 Banner Ad</p>
          </div>
        </div>
      </div>
    </div>
  );
}
