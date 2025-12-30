import type { Metadata } from 'next';
import ContactPageClient from './ContactPageClient';

export const metadata: Metadata = {
  title: 'Contact Us - Get in Touch with Free Tools | Free Tools',
  description: 'Have questions, feedback, or feature requests? Contact the Free Tools team. We\'re here to help you get the most out of our online tools.',
  keywords: [
    'contact free tools',
    'support',
    'help',
    'feedback',
    'feature requests',
    'customer support',
    'tool support'
  ],
  openGraph: {
    title: 'Contact Us - Get in Touch with Free Tools',
    description: 'Have questions, feedback, or feature requests? Contact the Free Tools team. We\'re here to help you get the most out of our online tools.',
    type: 'website',
    url: 'https://freetools.com/contact',
  },
  twitter: {
    card: 'summary',
    title: 'Contact Us - Get in Touch with Free Tools',
    description: 'Have questions, feedback, or feature requests? Contact the Free Tools team.',
  },
  alternates: {
    canonical: 'https://freetools.com/contact',
  },
};

export default function ContactPage() {
  return <ContactPageClient />;
}
