import TermsOfServicePageClient from './TermsOfServicePageClient';
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
  return <TermsOfServicePageClient />;
}
