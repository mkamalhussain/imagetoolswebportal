import AboutPageClient from './AboutPageClient';
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
  return <AboutPageClient />;
}
