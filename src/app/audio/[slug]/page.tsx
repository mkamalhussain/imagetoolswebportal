import AudioModuleRenderer from "@/components/AudioModuleRenderer";
import { audioModules } from "@/data/audioModules";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const module = audioModules.find(m => m.slug === slug);

  if (!module) {
    return {
      title: "Tool Not Found | FreeToolBox.app",
      description: "The requested tool could not be found.",
    };
  }

  // Unique meta descriptions for each audio tool
  const toolDescriptions: Record<string, string> = {
    'podcast-clip-cutter': "Trim and cut podcast episodes with precision timing controls. Extract the best moments from long-form audio content for sharing and highlights.",
    'multi-track-mixer': "Mix multiple audio tracks professionally with individual volume controls and panning. Create polished audio productions with advanced mixing capabilities.",
    'speed-pitch-adjuster': "Change audio speed and pitch independently while maintaining natural sound quality. Perfect for language learning, music production, and content creation.",
    'noise-cleaner': "Remove background noise and unwanted sounds from audio recordings. Clean up interviews, podcasts, and voice recordings with advanced noise reduction.",
    'waveform-generator': "Create visual waveform representations of audio files. Generate PNG waveform images for video thumbnails, podcast artwork, and audio visualization.",
    'tag-editor-pro': "Edit and manage ID3 metadata tags in audio files. Update artist information, album details, cover art, and organize your music library professionally.",
    'voice-memo-transcriber': "Convert voice recordings to text using advanced speech recognition. Transcribe meetings, notes, and audio content into editable text format.",
  };

  const toolKeywords: Record<string, string[]> = {
    'podcast-clip-cutter': ["podcast cutter", "audio trimmer", "clip extractor", "podcast editing", "audio cutter online", "extract audio clips"],
    'multi-track-mixer': ["audio mixer", "track mixer", "audio production", "sound mixing", "multi track audio", "professional mixing"],
    'speed-pitch-adjuster': ["speed changer", "pitch shifter", "tempo adjuster", "audio speed control", "voice changer", "speed up audio"],
    'noise-cleaner': ["noise reduction", "audio cleaner", "background noise remover", "audio enhancement", "sound cleaning", "noise removal"],
    'waveform-generator': ["audio waveform", "sound visualization", "waveform image", "audio graphics", "sound wave", "audio thumbnail"],
    'tag-editor-pro': ["id3 editor", "metadata editor", "audio tags", "music metadata", "tag manager", "audio information"],
    'voice-memo-transcriber': ["speech to text", "voice transcription", "audio to text", "voice recorder transcription", "speech recognition", "voice notes"],
  };

  const description = toolDescriptions[slug] || module.description;
  const additionalKeywords = toolKeywords[slug] || [];

  return {
    title: `${module.title} - Free Online Audio Tool | FreeToolBox.app`,
    description,
    keywords: [
      ...additionalKeywords,
      module.title.toLowerCase(),
      "free online tool",
      "audio processing",
      slug.replace(/-/g, ' '),
      "online tool",
      "free tool",
      "no signup required",
      "browser based",
      "web tool",
      "audio editor"
    ],
    openGraph: {
      title: `${module.title} - Free Online Audio Tool`,
      description,
      type: 'website',
      url: `https://freetoolbox.app/audio/${slug}`,
    },
    twitter: {
      card: 'summary',
      title: `${module.title} - Free Online Audio Tool`,
      description,
    },
    alternates: {
      canonical: `https://freetoolbox.app/audio/${slug}`,
    },
  };
}

export default async function AudioToolPage({ params }: PageProps) {
  const { slug } = await params;
  const module = audioModules.find(m => m.slug === slug);

  if (!module) {
    return <AudioModuleRenderer slug={slug} />;
  }

  // Schema markup for SoftwareApplication
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": module.title,
    "description": module.description,
    "url": `https://freetoolbox.app/audio/${slug}`,
    "applicationCategory": "MultimediaApplication",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "creator": {
      "@type": "Organization",
      "name": "FreeToolBox.app",
      "url": "https://freetoolbox.app"
    },
    "featureList": [
      "Free audio processing",
      "No signup required",
      "Browser-based editing",
      "High-quality results",
      "Multiple audio formats",
      "Professional tools"
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />
      <AudioModuleRenderer slug={slug} />
    </>
  );
}

export async function generateStaticParams() {
  const slugs = [
    'podcast-clip-cutter',
    'multi-track-mixer',
    'speed-pitch-adjuster',
    'noise-cleaner',
    'waveform-generator',
    'tag-editor-pro',
    'voice-memo-transcriber'
  ];

  return slugs.map((slug) => ({
    slug,
  }));
}
