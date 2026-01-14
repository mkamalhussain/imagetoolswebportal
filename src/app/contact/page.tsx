import type { Metadata } from 'next';
import ContactPageClient from './ContactPageClient';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Have questions, feedback, or feature requests? Contact the FreeToolBox.app team. We\'re here to help you get the most out of our online tools.',
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
    title: 'Contact Us - Get in Touch with FreeToolBox.app',
    description: 'Have questions, feedback, or feature requests? Contact the FreeToolBox.app team. We\'re here to help you get the most out of our online tools.',
    type: 'website',
    url: 'https://freetoolbox.app/contact',
  },
  twitter: {
    card: 'summary',
    title: 'Contact Us - Get in Touch with FreeToolBox.app',
    description: 'Have questions, feedback, or feature requests? Contact the FreeToolBox.app team.',
  },
  alternates: {
    canonical: 'https://freetoolbox.app/contact',
  },
};

export default function ContactPage() {
  return <ContactPageClient />;
}
