import PrivacyPageClient from './PrivacyPageClient';
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
  return <PrivacyPageClient />;
}
