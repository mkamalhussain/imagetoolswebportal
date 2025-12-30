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
                By accessing and using Free Tools ("we," "us," or "our"), you accept and agree to be bound by the terms and provision of this agreement.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">2. Use License</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Permission is granted to temporarily use our tools for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
              </p>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 mb-4">
                <li>modify or copy the tools</li>
                <li>use the tools for any commercial purpose or for any public display (commercial or non-commercial)</li>
                <li>attempt to decompile or reverse engineer any software contained in our tools</li>
                <li>remove any copyright or other proprietary notations from the tools</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">3. User Data and Privacy</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                We are committed to protecting your privacy. Please review our Privacy Policy, which also governs your use of our tools, to understand our practices.
              </p>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                <strong>GDPR Compliance:</strong> If you are located in the European Union, you have certain data protection rights under the General Data Protection Regulation (GDPR). You can:
              </p>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 mb-4">
                <li>Access your personal data</li>
                <li>Rectify inaccurate data</li>
                <li>Erase your personal data</li>
                <li>Restrict processing of your personal data</li>
                <li>Data portability</li>
                <li>Object to processing</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">4. File Upload and Processing</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                When you upload files to our tools:
              </p>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 mb-4">
                <li>Files are processed temporarily and deleted after processing</li>
                <li>We do not store your files permanently</li>
                <li>You retain ownership of your original content</li>
                <li>You are responsible for ensuring you have rights to process the files</li>
                <li>Maximum file sizes are specified for each tool</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">5. Intellectual Property Rights</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Our tools and their original content, features, and functionality are and will remain the exclusive property of Free Tools and its licensors. The tools are protected by copyright, trademark, and other laws.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">6. User Content</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Our tools may allow you to upload, process, or generate content. You retain ownership of your content, but you grant us a limited license to process it for the purpose of providing our services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">7. Disclaimer</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                The information on this website is provided on an 'as is' basis. To the fullest extent permitted by law, Free Tools:
              </p>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 mb-4">
                <li>excludes all representations and warranties relating to this website and its contents</li>
                <li>does not guarantee that the tools will be error-free or uninterrupted</li>
                <li>shall not be liable for any direct, indirect, incidental, or consequential damages</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">8. Limitations</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                In no event shall Free Tools or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the tools.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">9. Accuracy of Materials</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                The materials appearing on our tools could include technical, typographical, or photographic errors. Free Tools does not warrant that any of the materials on its tools are accurate, complete, or current.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">10. Modifications</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Free Tools may revise these terms of service at any time without notice. By using our tools, you are agreeing to be bound by the then current version of these terms of service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">11. Governing Law</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                These terms and conditions are governed by and construed in accordance with applicable laws, and any disputes relating to these terms and conditions will be subject to the exclusive jurisdiction of the courts.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">12. Contact Information</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                If you have any questions about these Terms of Service, please contact us through our Contact page.
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
