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
    description: 'Learn about our privacy practices and data protection policies.',
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

              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-3">
                2.1 Information You Provide
              </h3>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4 ml-4">
                <li>Files you upload for processing (images, PDFs, etc.)</li>
                <li>Account information if you create an account</li>
                <li>Communications you send to us</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-3">
                2.2 Automatically Collected Information
              </h3>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4 ml-4">
                <li>IP address and location information</li>
                <li>Browser type and version</li>
                <li>Device information</li>
                <li>Usage patterns and preferences</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                3. How We Use Your Information
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                We use the information we collect for various purposes:
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4 ml-4">
                <li>To provide and maintain our services</li>
                <li>To process and convert your files</li>
                <li>To improve our services and develop new features</li>
                <li>To communicate with you about updates and changes</li>
                <li>To ensure security and prevent fraud</li>
                <li>To comply with legal obligations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                4. File Processing and Data Security
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                <strong>Client-Side Processing:</strong> Most of our tools process your files directly in your browser. Files are not uploaded to our servers for processing.
              </p>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                <strong>Temporary Storage:</strong> Some files may be temporarily stored in your browser's memory during processing and are automatically deleted when you close your browser or refresh the page.
              </p>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                <strong>Security Measures:</strong> We implement appropriate technical and organizational security measures to protect your information against unauthorized access, alteration, disclosure, or destruction.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                5. Cookies and Tracking Technologies
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                We use cookies and similar tracking technologies to enhance your experience, analyze usage patterns, and provide personalized content. You can control cookie settings through your browser preferences.
              </p>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                <strong>Essential Cookies:</strong> Required for basic website functionality.
              </p>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                <strong>Analytics Cookies:</strong> Help us understand how users interact with our website.
              </p>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                <strong>Advertising Cookies:</strong> Used to deliver relevant advertisements.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                6. Third-Party Services
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Our website may contain links to third-party websites or integrate with third-party services. We are not responsible for the privacy practices of these third parties.
              </p>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                <strong>Google AdSense:</strong> We use Google AdSense to display advertisements. Google may collect information about your visits to our website. Please refer to Google's Privacy Policy for more information.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                7. Data Retention
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                We retain your personal information only as long as necessary to provide our services and fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required by law.
              </p>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Files uploaded for processing are typically processed immediately and not stored on our servers. Temporary browser storage is cleared when you close your browser.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                8. Your Rights
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Depending on your location, you may have certain rights regarding your personal information:
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4 ml-4">
                <li>Access to your personal information</li>
                <li>Correction of inaccurate information</li>
                <li>Deletion of your personal information</li>
                <li>Restriction of processing</li>
                <li>Data portability</li>
                <li>Objection to processing</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                9. Children's Privacy
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Our services are not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                10. Changes to This Privacy Policy
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                11. Contact Us
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                If you have any questions about this Privacy Policy or our privacy practices, please contact us at:
              </p>
              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                <p className="text-gray-700 dark:text-gray-300">
                  <strong>Email:</strong> privacy@freetools.com<br />
                  <strong>Address:</strong> [Your Business Address]<br />
                  <strong>Phone:</strong> [Your Phone Number]
                </p>
              </div>
            </section>
          </div>
        </div>

        {/* Google AdSense Footer */}
        <div className="bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center mt-8">
          <p className="text-gray-500 dark:text-gray-400">📢 Google AdSense Placeholder</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">728x90 Banner Ad</p>
        </div>
      </div>
    </div>
  );
}
