import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us - Free Tools for Creative Work | Free Tools',
  description: 'Learn about Free Tools - our mission to democratize access to professional digital tools. Discover our commitment to privacy, innovation, and empowering creators worldwide.',
  keywords: [
    'about free tools',
    'online tools company',
    'digital tools platform',
    'creative tools',
    'privacy focused tools',
    'free online tools about'
  ],
  openGraph: {
    title: 'About Us - Free Tools for Creative Work',
    description: 'Learn about Free Tools - our mission to democratize access to professional digital tools. Discover our commitment to privacy, innovation, and empowering creators worldwide.',
    type: 'website',
    url: 'https://freetools.com/about',
  },
  twitter: {
    card: 'summary',
    title: 'About Us - Free Tools for Creative Work',
    description: 'Learn about Free Tools - our mission to democratize access to professional digital tools.',
  },
  alternates: {
    canonical: 'https://freetools.com/about',
  },
};

export default function AboutPage() {
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
            About Free Tools
          </h1>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            <div className="text-center mb-12">
              <div className="w-32 h-32 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl font-bold text-white">FT</span>
              </div>
              <p className="text-xl text-gray-600 dark:text-gray-400">
                Empowering creators with free, powerful online tools
              </p>
            </div>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Our Mission</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Free Tools was founded with a simple mission: to democratize access to powerful digital tools. We believe that everyone should have access to professional-grade image, audio, video, and PDF processing tools without expensive subscriptions or software purchases.
              </p>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Whether you're a content creator, marketer, developer, student, or just someone who needs to process media files, our platform provides the tools you need to get the job done efficiently and effectively.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">What We Offer</h2>
              <div className="grid md:grid-cols-2 gap-8 mb-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">🖼️ Image Tools</h3>
                  <p className="text-blue-800 dark:text-blue-200">
                    From basic resizing and format conversion to advanced features like background removal, color palette extraction, and creative filters.
                  </p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-3">🎵 Audio Tools</h3>
                  <p className="text-green-800 dark:text-green-200">
                    Professional audio processing including noise reduction, speed adjustment, mixing, and metadata editing.
                  </p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-3">🎥 Video Tools</h3>
                  <p className="text-purple-800 dark:text-purple-200">
                    Complete video editing suite with trimming, joining, GIF creation, and format conversion.
                  </p>
                </div>
                <div className="bg-orange-50 dark:bg-orange-900/20 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100 mb-3">📄 PDF Tools</h3>
                  <p className="text-orange-800 dark:text-orange-200">
                    Comprehensive PDF processing including merging, splitting, compression, and form filling.
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Our Technology</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                We leverage cutting-edge web technologies to bring you professional tools directly in your browser:
              </p>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 mb-6">
                <li><strong>WebAssembly:</strong> High-performance processing for complex operations</li>
                <li><strong>Modern JavaScript:</strong> Efficient algorithms for image and audio processing</li>
                <li><strong>FFmpeg.wasm:</strong> Professional video and audio processing capabilities</li>
                <li><strong>Canvas API:</strong> Real-time visual processing and preview</li>
                <li><strong>Web Audio API:</strong> Advanced audio manipulation and analysis</li>
              </ul>
              <p className="text-gray-600 dark:text-gray-400">
                All processing happens locally in your browser, ensuring your files remain private and secure.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Privacy & Security</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Your privacy and security are our top priorities. We designed our platform with privacy-first principles:
              </p>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 mb-6">
                <li><strong>No file storage:</strong> Your files are never stored on our servers</li>
                <li><strong>Client-side processing:</strong> All operations happen in your browser</li>
                <li><strong>GDPR compliant:</strong> We respect your data protection rights</li>
                <li><strong>Open source components:</strong> Transparent and auditable code</li>
                <li><strong>No tracking:</strong> We don't track your usage or collect personal data</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Education & Learning</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Beyond providing tools, we're committed to helping you master them. Our comprehensive "How To" section includes:
              </p>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 mb-6">
                <li>Step-by-step guides for every tool</li>
                <li>Visual examples and screenshots</li>
                <li>Pro tips and best practices</li>
                <li>Troubleshooting advice</li>
                <li>Creative use cases and inspiration</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Our Values</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🌍</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Accessibility</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Making professional tools available to everyone, regardless of budget or technical expertise.
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🔒</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Privacy</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Protecting your data and respecting your privacy in everything we do.
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🚀</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Innovation</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Continuously improving our tools with the latest web technologies and user feedback.
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Get Involved</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                We love hearing from our users! Whether you have feedback, feature requests, or just want to share how you're using our tools, we'd love to hear from you.
              </p>
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
                <h3 className="text-xl font-semibold mb-3">Ready to start creating?</h3>
                <p className="mb-4 opacity-90">
                  Explore our tools and see what you can create. Every tool is free to use, no sign-up required.
                </p>
                <a
                  href="/"
                  className="inline-flex items-center px-6 py-3 border border-white/20 text-base font-medium rounded-md text-white bg-white/10 hover:bg-white/20 transition-colors"
                >
                  Explore Tools →
                </a>
              </div>
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
