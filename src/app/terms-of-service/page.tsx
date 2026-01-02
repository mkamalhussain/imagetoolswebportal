import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service - Usage Guidelines | Free Tools',
  description: 'Read our terms of service and usage guidelines. Learn about acceptable use, user responsibilities, and service limitations for Free Tools.',
  keywords: [
    'terms of service',
    'terms and conditions',
    'usage guidelines',
    'service agreement',
    'user terms',
    'acceptable use',
    'legal terms'
  ],
  openGraph: {
    title: 'Terms of Service - Usage Guidelines',
    description: 'Read our terms of service and usage guidelines. Learn about acceptable use, user responsibilities, and service limitations for Free Tools.',
    type: 'website',
    url: 'https://freetools.com/terms-of-service',
  },
  twitter: {
    card: 'summary',
    title: 'Terms of Service - Usage Guidelines',
    description: 'Read our terms of service and usage guidelines for Free Tools.',
  },
  alternates: {
    canonical: 'https://freetools.com/terms-of-service',
  },
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Google AdSense Top Banner */}
        <div className="w-full mb-12">
          <div className="bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center">
            <p className="text-gray-500 dark:text-gray-400">📢 Google AdSense Placeholder</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">728x90 Banner Ad</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 md:p-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Terms of Service
          </h1>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-gray-600 dark:text-gray-400 mb-8 text-center">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                By accessing and using FreeToolBox.app ("we," "us," or "our"), you accept and agree to be bound by the terms and provision of this agreement.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">2. Description of Service</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                FreeToolBox.app provides online tools for processing images, audio files, videos, and PDF documents. All processing occurs in your web browser using client-side technologies.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">3. Free Service</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Our services are provided free of charge. We reserve the right to modify or discontinue any service at any time without notice.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">4. User Responsibilities</h2>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">4.1 Lawful Use</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                You agree to use our services only for lawful purposes. You may not use our services to:
              </p>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 mb-4">
                <li>Process illegal, harmful, or offensive content</li>
                <li>Violate intellectual property rights</li>
                <li>Distribute malware or viruses</li>
                <li>Harass, abuse, or harm others</li>
                <li>Attempt to gain unauthorized access to our systems</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">4.2 Content Ownership</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                You retain ownership of all content you process through our services. You are responsible for ensuring you have the right to process and modify the files you upload.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">5. Privacy and Data Protection</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Your privacy is important to us. Please review our Privacy Policy, which is incorporated into these Terms by reference. Key points:
              </p>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 mb-4">
                <li>All processing occurs in your browser</li>
                <li>Your files are never uploaded to our servers</li>
                <li>We do not store or track your usage</li>
                <li>We do not collect personal information</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">6. Service Availability</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                While we strive to provide reliable service, we do not guarantee uninterrupted access. Our services may be temporarily unavailable due to maintenance, technical issues, or other reasons beyond our control.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">7. Limitation of Liability</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Our services are provided "as is" without warranties of any kind. We shall not be liable for any direct, indirect, incidental, special, or consequential damages arising from your use of our services.
              </p>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                We are not responsible for the quality or accuracy of processed files. Always keep backups of your original files.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">8. Intellectual Property</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                The FreeToolBox.app website, software, and branding are owned by us and protected by intellectual property laws. You may not copy, modify, or distribute our content without permission.
              </p>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                We use open-source libraries and tools, which are subject to their respective licenses.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">9. Termination</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                We reserve the right to terminate or suspend your access to our services at any time, without notice, for any reason, including violation of these terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">10. Governing Law</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                These Terms shall be governed by and construed in accordance with applicable laws. Any disputes shall be resolved through binding arbitration.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">11. Changes to Terms</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                We may update these Terms at any time. Continued use of our services after changes constitutes acceptance of the new terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">12. Contact Information</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                If you have questions about these Terms, please contact us at legal@freetoolbox.app.
              </p>
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
