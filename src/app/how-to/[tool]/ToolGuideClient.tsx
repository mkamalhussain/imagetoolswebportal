"use client";

"use client";

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { modules } from '../../../data/modules';
import { audioModules } from '../../../data/audioModules';
import { videoModules } from '../../../data/videoModules';
import { pdfModules } from '../../../data/pdfModules';

// Sample guide data - in a real app, this would come from a database or CMS
const toolGuides: Record<string, {
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  timeRequired: string;
  steps: Array<{
    title: string;
    description: string;
    tip?: string;
    image?: string;
  }>;
  tips: string[];
  relatedTools: string[];
}> = {
  'animated-gif-maker': {
    title: 'How to Create Animated GIFs',
    description: 'Learn how to convert videos into high-quality animated GIFs with custom timing and effects.',
    difficulty: 'Beginner',
    timeRequired: '5-10 minutes',
    steps: [
      {
        title: 'Upload Your Video',
        description: 'Click "Choose Video File" and select the video you want to convert to GIF format.',
        tip: 'Supported formats: MP4, AVI, MOV, WebM (max 500MB recommended)',
      },
      {
        title: 'Set Timing',
        description: 'Use the start and end time sliders to select the specific portion of your video you want to convert.',
        tip: 'For optimal file size, keep GIFs under 15 seconds',
      },
      {
        title: 'Adjust Quality Settings',
        description: 'Choose frame rate (5-30 FPS) and quality (50-95%) based on your needs. Higher quality = larger files.',
        tip: '15 FPS is usually perfect for GIFs and keeps file sizes reasonable',
      },
      {
        title: 'Add Visual Effects',
        description: 'Apply style presets like Cinematic, Vintage, or High Contrast to enhance your GIF.',
        tip: 'Try different styles to see what works best with your content',
      },
      {
        title: 'Include Text Overlays',
        description: 'Add custom text with fonts, colors, and positioning. Perfect for memes and captions.',
        tip: 'Use the position controls (X/Y) to place text exactly where you want it',
      },
      {
        title: 'Preview and Generate',
        description: 'Click "Preview GIF" for a quick look, then "Generate GIF" to create your final animated GIF.',
        tip: 'Preview first to avoid long waits for unsatisfactory results',
      },
    ],
    tips: [
      'Keep GIFs short (3-10 seconds) for better performance',
      'Use 15-20 FPS for smooth animation without large file sizes',
      'Test different quality settings to find the best balance',
      'Add text overlays before generating for best results',
      'Consider aspect ratio - square GIFs work well for social media',
    ],
    relatedTools: ['video-trimmer', 'gif-maker', 'image-resizer'],
  },
  'video-trimmer': {
    title: 'How to Trim Videos Precisely',
    description: 'Master the art of video trimming with frame-accurate controls and professional editing features.',
    difficulty: 'Intermediate',
    timeRequired: '10-15 minutes',
    steps: [
      {
        title: 'Upload Your Video',
        description: 'Select your video file using the upload button. Supported formats include MP4, AVI, MOV, and WebM.',
        tip: 'Videos up to 500MB work well for smooth processing',
      },
      {
        title: 'Preview and Scrub',
        description: 'Watch your video and use the timeline scrubber to find the exact start and end points.',
        tip: 'Use the video player controls or click directly on the timeline',
      },
      {
        title: 'Set Precise Timings',
        description: 'Use the start/end time inputs or drag the markers on the timeline for frame-accurate trimming.',
        tip: 'Use the frame step buttons (±Frame) for pixel-perfect precision',
      },
      {
        title: 'Choose Export Settings',
        description: 'Select output format (MP4/WebM/MOV) and quality settings. Higher quality = larger files.',
        tip: 'MP4 with 80% quality is usually perfect for most use cases',
      },
      {
        title: 'Trim and Download',
        description: 'Click "Trim and Download" and wait for processing. Progress is shown in real-time.',
        tip: 'Processing time depends on video length and quality settings',
      },
    ],
    tips: [
      'Use keyboard shortcuts: Space (play/pause), ←/→ (frame step), I/O (set markers)',
      'For social media, trim videos to optimal lengths (15-60 seconds for TikTok/Reels)',
      'Consider file size - shorter clips process faster and are easier to share',
      'Test different quality settings to balance file size vs. visual quality',
      'Use the preview feature to verify your trim before final processing',
    ],
    relatedTools: ['gif-maker', 'video-speed-changer', 'audio-stripper'],
  },
  'gif-maker': {
    title: 'How to Create GIFs from Videos',
    description: 'Transform video clips into engaging animated GIFs with advanced customization options.',
    difficulty: 'Beginner',
    timeRequired: '5-8 minutes',
    steps: [
      {
        title: 'Select Your Video',
        description: 'Upload your video file. The tool supports MP4, AVI, MOV, and other common formats.',
        tip: 'Videos under 500MB process fastest',
      },
      {
        title: 'Choose Time Segment',
        description: 'Set start and end times to capture the perfect moment for your GIF.',
        tip: 'Keep GIFs under 15 seconds for optimal file sizes',
      },
      {
        title: 'Configure Quality',
        description: 'Adjust frame rate (5-30 FPS) and quality (50-95%). Higher settings = better quality but larger files.',
        tip: '15 FPS usually provides the best balance for GIFs',
      },
      {
        title: 'Apply Visual Styles',
        description: 'Choose from Normal, Cinematic, Vintage, High Contrast, Cool, or Warm presets.',
        tip: 'Different styles work better with different types of content',
      },
      {
        title: 'Add Text & Effects',
        description: 'Include text overlays with custom fonts, colors, sizes, and positioning.',
        tip: 'Position text carefully - use the X/Y controls for precision',
      },
      {
        title: 'Choose Aspect Ratio',
        description: 'Select Original, 16:9, 4:3, Square (1:1), or Vertical (9:16) formats.',
        tip: 'Square format works great for social media posts',
      },
      {
        title: 'Generate Your GIF',
        description: 'Click "Generate GIF" and wait for processing. Preview first to save time!',
        tip: 'Processing time varies based on video length and quality settings',
      },
    ],
    tips: [
      'Use Preview first to avoid waiting for unsatisfactory results',
      '15-20 FPS provides smooth animation without huge file sizes',
      'Square or vertical formats work best for social media',
      'Add text overlays before generating for best quality',
      'Test different visual styles to enhance your content',
    ],
    relatedTools: ['video-trimmer', 'animated-gif-maker', 'meme-generator'],
  },
  'clip-joiner': {
    title: 'How to Join Video Clips Together',
    description: 'Combine multiple video clips into one seamless video with advanced merging options.',
    difficulty: 'Intermediate',
    timeRequired: '15-20 minutes',
    steps: [
      {
        title: 'Upload Video Clips',
        description: 'Select multiple video files to join. You can upload them all at once.',
        tip: 'All clips should ideally be in the same format for best results',
      },
      {
        title: 'Arrange Clip Order',
        description: 'Drag and drop clips to reorder them, or use the up/down arrow buttons.',
        tip: 'Think about your story flow when arranging clips',
      },
      {
        title: 'Trim Individual Clips',
        description: 'Click the ✂️ icon on any clip to trim its start and end points before joining.',
        tip: 'Trimming clips individually gives you more control over the final result',
      },
      {
        title: 'Configure Output Settings',
        description: 'Choose export format (MP4/WebM) and quality settings (High/Medium/Low).',
        tip: 'MP4 format is most widely compatible across platforms',
      },
      {
        title: 'Apply Transitions (Optional)',
        description: 'Select transition effects like Fade or Crossfade between clips.',
        tip: 'Transitions increase processing time but create smoother joins',
      },
      {
        title: 'Join and Download',
        description: 'Click "Join and Download" and monitor the progress as clips are processed and merged.',
        tip: 'Processing time depends on number of clips, their lengths, and quality settings',
      },
    ],
    tips: [
      'Keep total input size under 500MB for best performance',
      'All clips are normalized to ensure compatibility',
      'Use transitions sparingly - they increase processing time significantly',
      'Trim clips before joining to remove unwanted footage',
      'Test with a few clips first to understand processing times',
    ],
    relatedTools: ['video-trimmer', 'video-speed-changer', 'gif-maker'],
  },
  'speed-pitch-adjuster': {
    title: 'How to Change Video Speed & Pitch',
    description: 'Adjust playback speed and audio pitch for creative effects or practical modifications.',
    difficulty: 'Beginner',
    timeRequired: '5-10 minutes',
    steps: [
      {
        title: 'Upload Your Video',
        description: 'Select the video file you want to modify. Supports MP4, AVI, MOV, and other formats.',
        tip: 'Videos up to 500MB work well for speed adjustments',
      },
      {
        title: 'Choose Speed Preset',
        description: 'Select from preset speeds (0.25x to 4x) or use custom speed controls.',
        tip: '0.5x creates slow-motion, 2x creates time-lapse effects',
      },
      {
        title: 'Adjust Speed & Pitch',
        description: 'Fine-tune speed (0.25x to 4x) and choose whether to maintain original pitch.',
        tip: 'Maintaining pitch prevents "chipmunk" voice effects at high speeds',
      },
      {
        title: 'Preview Changes',
        description: 'Use "Preview Before/After" to hear and see the speed changes before processing.',
        tip: 'Preview helps you find the perfect speed for your needs',
      },
      {
        title: 'Apply and Download',
        description: 'Click "Apply Speed Change" and download your modified video.',
        tip: 'Processing time depends on video length and complexity',
      },
    ],
    tips: [
      'Use 0.5x speed for dramatic slow-motion effects',
      '2x speed works great for condensing long videos',
      'Maintain pitch for natural-sounding results',
      'Preview before processing to save time',
      'Higher speeds may affect video quality slightly',
    ],
    relatedTools: ['video-trimmer', 'clip-joiner', 'gif-maker'],
  },
  'noise-cleaner': {
    title: 'How to Remove Background Noise',
    description: 'Clean up audio recordings by removing unwanted background noise and hiss.',
    difficulty: 'Intermediate',
    timeRequired: '8-12 minutes',
    steps: [
      {
        title: 'Upload Audio File',
        description: 'Select your audio file (MP3, WAV, M4A, etc.) that contains background noise.',
        tip: 'Works best with clear speech recordings with moderate background noise',
      },
      {
        title: 'Choose Noise Type',
        description: 'Select the type of noise: Auto-detect, Hiss, Hum, Wind, or Background noise.',
        tip: 'Auto-detect works well for most scenarios',
      },
      {
        title: 'Adjust Cleaning Intensity',
        description: 'Set cleaning intensity from 10% (light) to 100% (aggressive).',
        tip: 'Start with 30-50% intensity and adjust based on results',
      },
      {
        title: 'Select Algorithm',
        description: 'Choose from Spectral Subtraction, High-Pass Filter, Adaptive, or Combined methods.',
        tip: 'Combined algorithm works best for most noise types',
      },
      {
        title: 'Preview Results',
        description: 'Use "Play cleaned" to preview the noise reduction results.',
        tip: 'Compare before and after to ensure speech remains clear',
      },
      {
        title: 'Download Clean Audio',
        description: 'Click "Download cleaned audio" to save your noise-reduced file.',
        tip: 'Processing time depends on audio length and complexity',
      },
    ],
    tips: [
      'Work with high-quality original recordings for best results',
      'Don\'t over-clean - too much noise reduction can make speech sound unnatural',
      'Use the frequency spectrum to identify the type of noise',
      'Test different algorithms with the same intensity to find what works best',
      'Clean audio is especially important for podcasts and voiceovers',
    ],
    relatedTools: ['podcast-clip-cutter', 'voice-memo-transcriber', 'multi-track-mixer'],
  },
  'tag-editor-pro': {
    title: 'How to Edit Audio Metadata Tags',
    description: 'Add, edit, and manage ID3 tags, album art, and metadata in your audio files.',
    difficulty: 'Intermediate',
    timeRequired: '5-8 minutes',
    steps: [
      {
        title: 'Upload Audio File',
        description: 'Select your audio file (MP3, M4A, FLAC, etc.) to edit its metadata.',
        tip: 'MP3 files have the best ID3 tag support',
      },
      {
        title: 'Review Existing Tags',
        description: 'The tool automatically reads and displays existing metadata from your file.',
        tip: 'All existing information is preserved and can be edited',
      },
      {
        title: 'Edit Basic Information',
        description: 'Update title, artist, album, year, genre, and other standard metadata fields.',
        tip: 'Use consistent formatting for professional results',
      },
      {
        title: 'Add Album Art',
        description: 'Upload or select album artwork. Supports JPEG, PNG, and other image formats.',
        tip: 'Square images (500x500 or larger) work best for album art',
      },
      {
        title: 'Set Advanced Tags',
        description: 'Configure track number, disc number, composer, lyrics, and comments.',
        tip: 'Lyrics can be added as plain text or synchronized',
      },
      {
        title: 'Use Auto-Fill Feature',
        description: 'Extract information from filename using "Auto-fill from filename" for batch processing.',
        tip: 'Works well with consistently named files (Artist - Title.mp3)',
      },
      {
        title: 'Save Changes',
        description: 'Click "Save Tags" to embed all metadata into your audio file.',
        tip: 'The file is updated in place - no quality loss occurs',
      },
    ],
    tips: [
      'Always include artist and title for proper media player display',
      'Album art should be at least 500x500 pixels for best quality',
      'Use consistent genre naming across your music library',
      'Include track numbers for proper album playback order',
      'Test metadata changes by reloading the file in your media player',
    ],
    relatedTools: ['multi-track-mixer', 'podcast-clip-cutter', 'voice-memo-transcriber'],
  },
  'multi-track-mixer': {
    title: 'How to Mix Multiple Audio Tracks',
    description: 'Combine and balance multiple audio tracks with professional mixing controls.',
    difficulty: 'Advanced',
    timeRequired: '15-25 minutes',
    steps: [
      {
        title: 'Upload Audio Tracks',
        description: 'Add multiple audio files to mix together. Each file becomes a separate track.',
        tip: 'All tracks should ideally be in the same format and sample rate',
      },
      {
        title: 'Adjust Track Levels',
        description: 'Use volume sliders to balance each track. Monitor the level meters for clipping.',
        tip: 'Keep overall levels below 0dB to avoid distortion',
      },
      {
        title: 'Apply Effects',
        description: 'Adjust stereo panning, mute tracks, or apply fade in/out effects.',
        tip: 'Panning helps create spatial separation between tracks',
      },
      {
        title: 'Set Track Timing',
        description: 'Use start time controls to align tracks precisely.',
        tip: 'Zoom in on waveforms for precise alignment',
      },
      {
        title: 'Configure Output',
        description: 'Choose output format (MP3/WAV), quality, and whether to mix to stereo or mono.',
        tip: 'MP3 is smaller but WAV preserves more quality',
      },
      {
        title: 'Mix and Export',
        description: 'Click "Mix and Download" to combine all tracks into a single audio file.',
        tip: 'Longer sessions may take time to process',
      },
    ],
    tips: [
      'Start with all faders at -12dB to avoid clipping',
      'Use panning to create stereo separation',
      'Listen in context - solo tracks to check individual performance',
      'Consider frequency content to avoid masking',
      'Export at higher quality for further processing',
    ],
    relatedTools: ['noise-cleaner', 'podcast-clip-cutter', 'tag-editor-pro'],
  },
  'podcast-clip-cutter': {
    title: 'How to Edit Podcasts and Audio',
    description: 'Trim, cut, and enhance podcast episodes and audio recordings with precision tools.',
    difficulty: 'Intermediate',
    timeRequired: '10-15 minutes',
    steps: [
      {
        title: 'Upload Podcast/Audio File',
        description: 'Select your podcast episode or audio recording to edit.',
        tip: 'Works with MP3, WAV, M4A, and other audio formats',
      },
      {
        title: 'Visualize Audio Waveform',
        description: 'View the audio waveform to identify sections to cut or trim.',
        tip: 'Zoom in for precise editing at the sample level',
      },
      {
        title: 'Set Cut Points',
        description: 'Use start and end time controls or drag markers to select audio segments.',
        tip: 'Listen while marking to ensure smooth transitions',
      },
      {
        title: 'Apply Fade Effects',
        description: 'Add fade in/out effects to smooth rough cut transitions.',
        tip: 'Fade duration of 0.5-2 seconds usually works best',
      },
      {
        title: 'Choose Export Settings',
        description: 'Select output format, quality, and whether to normalize audio levels.',
        tip: 'MP3 at 192kbps is usually perfect for podcasts',
      },
      {
        title: 'Process and Download',
        description: 'Click "Cut and Download" to process your edited podcast.',
        tip: 'Processing time depends on audio length and effects applied',
      },
    ],
    tips: [
      'Always listen to cuts to ensure smooth transitions',
      'Use fade effects to avoid jarring audio jumps',
      'Keep original quality settings for best results',
      'Normalize levels if the original audio has volume inconsistencies',
      'Test cuts on headphones for precise editing',
    ],
    relatedTools: ['noise-cleaner', 'multi-track-mixer', 'tag-editor-pro'],
  },
};

interface ToolGuideClientProps {
  toolSlug: string;
}

interface ToolGuideClientProps {
  toolSlug: string;
}

export default function ToolGuideClient({ toolSlug }: ToolGuideClientProps) {
  // Get tool info from all modules
  const allModules = [
    ...modules,
    ...audioModules,
    ...videoModules,
    ...pdfModules,
  ];

  const tool = allModules.find(m => m.slug === toolSlug);
  const guide = toolGuides[toolSlug];

  if (!tool || !guide) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Guide Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            We haven't created a guide for this tool yet.
          </p>
          <Link
            href="/how-to"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            ← Back to All Guides
          </Link>
        </div>
      </div>
    );
  }

  const relatedTools = guide.relatedTools
    .map(slug => [modules, audioModules, videoModules, pdfModules].flat().find(m => m.slug === slug))
    .filter(Boolean);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Google AdSense Top Banner */}
        <div className="w-full mb-8">
          <div className="bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center">
            <p className="text-gray-500 dark:text-gray-400">📢 Google AdSense Placeholder</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">728x90 Banner Ad</p>
          </div>
        </div>

        {/* Breadcrumb */}
        <nav className="mb-8">
          <Link
            href="/how-to"
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
          >
            How To Guides
          </Link>
          <span className="mx-2 text-gray-400">→</span>
          <span className="text-gray-600 dark:text-gray-400">{tool.title}</span>
        </nav>

        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8">
          <div className="flex items-start space-x-6">
            <div
              className="flex-shrink-0 w-16 h-16 rounded-xl flex items-center justify-center bg-blue-50 dark:bg-blue-900/20"
              dangerouslySetInnerHTML={{ __html: tool.icon || '' }}
            />
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {guide.title}
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                {guide.description}
              </p>
              <div className="flex flex-wrap gap-4 text-sm">
                <span className={`px-3 py-1 rounded-full ${
                  guide.difficulty === 'Beginner' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                  guide.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                  'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                }`}>
                  {guide.difficulty}
                </span>
                <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                  {guide.timeRequired}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Step-by-Step Guide
          </h2>
          <div className="space-y-8">
            {guide.steps.map((step, index) => (
              <div key={index} className="flex space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-3">
                    {step.description}
                  </p>
                  {step.tip && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        <strong>💡 Tip:</strong> {step.tip}
                      </p>
                    </div>
                  )}
                  {step.image && (
                    <div className="mt-4">
                      <img
                        src={step.image}
                        alt={step.title}
                        className="rounded-lg border border-gray-200 dark:border-gray-700"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tips */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            💡 Pro Tips
          </h2>
          <ul className="space-y-3">
            {guide.tips.map((tip, index) => (
              <li key={index} className="flex items-start space-x-3">
                <span className="flex-shrink-0 w-6 h-6 bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center text-sm font-semibold">
                  ✓
                </span>
                <span className="text-gray-600 dark:text-gray-400">{tip}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Related Tools */}
        {relatedTools.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Related Tools
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {relatedTools.map((relatedTool) => {
                if (!relatedTool) return null;
                return (
                  <Link
                    key={relatedTool.slug}
                    href={`/how-to/${relatedTool.slug}`}
                    className="flex items-center space-x-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
                  >
                    <div
                      className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
                      dangerouslySetInnerHTML={{ __html: relatedTool.icon || '' }}
                    />
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {relatedTool.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {relatedTool.description}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Google AdSense Bottom Banner */}
        <div className="w-full my-12">
          <div className="bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center">
            <p className="text-gray-500 dark:text-gray-400">📢 Google AdSense Placeholder</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">728x90 Banner Ad</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href={`/${tool.slug.includes('video') ? 'video' : tool.slug.includes('audio') ? 'audio' : tool.slug.includes('pdf') ? 'pdf' : 'modules'}/${tool.slug}`}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            Try {tool.title} Now
          </Link>
          <Link
            href="/how-to"
            className="inline-flex items-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-base font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            View All Guides
          </Link>
        </div>
      </div>
    </div>
  );
}
