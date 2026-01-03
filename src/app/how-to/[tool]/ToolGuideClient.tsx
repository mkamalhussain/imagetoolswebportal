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
  'subtitle-burner': {
    title: 'How to Burn Subtitles into Videos',
    description: 'Learn to permanently embed SRT subtitles into videos with custom styling, positioning, and encoding support.',
    difficulty: 'Intermediate',
    timeRequired: '10-15 minutes',
    steps: [
      {
        title: 'Upload Video and Subtitle Files',
        description: 'Select your video file and corresponding SRT subtitle file. Supported video formats: MP4, AVI, MOV, WebM.',
        tip: 'Ensure your SRT file timing matches your video exactly',
      },
      {
        title: 'Configure Character Encoding',
        description: 'Select the correct text encoding for your subtitle file. Common options: UTF-8, Windows-1252, ISO-8859-1.',
        tip: 'If subtitles appear as gibberish, try a different encoding like Windows-1252',
      },
      {
        title: 'Customize Subtitle Styling',
        description: 'Choose font family, size, color, and outline settings. Use style presets (Classic, Modern, Bold) for quick setup.',
        tip: 'White text with black outline provides excellent readability on most videos',
      },
      {
        title: 'Adjust Position and Alignment',
        description: 'Set subtitle position (bottom/top/middle) and alignment (left/center/right) using the position controls.',
        tip: 'Bottom center position works best for most videos to avoid covering important content',
      },
      {
        title: 'Generate Preview (Optional)',
        description: 'Click "Generate Preview" to see how subtitles will look in the first 10 seconds of your video.',
        tip: 'Use preview to verify styling before processing the full video',
      },
      {
        title: 'Burn Subtitles and Download',
        description: 'Click "Burn Subtitles & Download" to permanently embed subtitles into your entire video.',
        tip: 'Processing time depends on video length - longer videos may take several minutes',
      },
    ],
    tips: [
      'Always use correctly timed SRT files for best results',
      'Test different encodings if subtitles appear corrupted',
      'Choose contrasting colors (white text, black outline) for readability',
      'Position subtitles to avoid covering faces or important visual elements',
      'Use preview feature to verify styling before full processing',
      'MP4 output maintains video quality while embedding subtitles permanently',
    ],
    relatedTools: ['video-trimmer', 'gif-maker', 'clip-joiner'],
  },
  'frame-grabber': {
    title: 'How to Extract Frames from Videos',
    description: 'Master frame extraction with automatic capture, manual selection, and batch processing for thumbnails and analysis.',
    difficulty: 'Beginner',
    timeRequired: '5-10 minutes',
    steps: [
      {
        title: 'Upload Your Video',
        description: 'Select your video file using the upload button. Supported formats: MP4, AVI, MOV, WebM.',
        tip: 'Videos up to 500MB work well - longer videos may take more time to process',
      },
      {
        title: 'Configure Extraction Settings',
        description: 'Set interval between frames (seconds), maximum frames to extract, output format (PNG/JPG/WebP), and quality.',
        tip: '1-second intervals work well for most videos - adjust based on your needs',
      },
      {
        title: 'Manual Frame Capture (Optional)',
        description: 'Play your video and click "Capture Current Frame" at any point to grab specific frames manually.',
        tip: 'Use this for extracting key moments, thumbnails, or specific scenes',
      },
      {
        title: 'Automatic Frame Extraction',
        description: 'Click "🤖 Auto Extract Frames" to automatically extract frames at your specified intervals.',
        tip: 'This creates a gallery of frames you can download individually or all at once',
      },
      {
        title: 'Review Extracted Frames',
        description: 'Browse through your captured frames in the gallery view. Each frame shows timestamp and format.',
        tip: 'Frames are sorted by capture time for easy navigation',
      },
      {
        title: 'Download Frames',
        description: 'Download individual frames or use "Download All" to get a ZIP of all extracted frames.',
        tip: 'PNG format preserves quality, JPG/WebP offer smaller file sizes',
      },
    ],
    tips: [
      'Use 1-2 second intervals for overview frames of longer videos',
      'PNG format gives highest quality but larger file sizes',
      'Extract keyframes for video thumbnails and previews',
      'Use manual capture for specific moments (goals, highlights, etc.)',
      'Consider video frame rate when setting extraction intervals',
      'Batch extraction is perfect for creating video thumbnails',
    ],
    relatedTools: ['video-trimmer', 'gif-maker', 'image-resizer'],
  },
  'audio-stripper': {
    title: 'How to Extract Audio from Videos',
    description: 'Learn to strip audio tracks from videos with multiple format support, quality settings, and processing options.',
    difficulty: 'Beginner',
    timeRequired: '5-15 minutes',
    steps: [
      {
        title: 'Upload Your Video',
        description: 'Select a video file containing the audio you want to extract. Supported formats: MP4, AVI, MOV, WebM.',
        tip: 'Any video with an audio track will work - even silent videos can be processed',
      },
      {
        title: 'Configure Audio Format',
        description: 'Choose output format (MP3/AAC/WAV/FLAC) and adjust quality settings like bitrate and sample rate.',
        tip: 'MP3 at 192kbps provides excellent quality for most music/audio applications',
      },
      {
        title: 'Set Audio Properties',
        description: 'Select channels (Mono/Stereo), sample rate (44.1kHz recommended), and other audio parameters.',
        tip: 'Keep stereo for music, mono for voice recordings to save space',
      },
      {
        title: 'Apply Processing Options',
        description: 'Enable audio normalization, silence removal, or set custom trim points for start/end times.',
        tip: 'Normalization ensures consistent volume levels across the extracted audio',
      },
      {
        title: 'Extract Audio',
        description: 'Click "Extract Audio & Download" to begin processing. Progress bar shows extraction status.',
        tip: 'Processing time depends on video length and selected quality settings',
      },
      {
        title: 'Download and Verify',
        description: 'Your audio file will download automatically. Check the file in your preferred audio player.',
        tip: 'Verify audio quality and length match your expectations before using',
      },
    ],
    tips: [
      'FLAC format provides lossless quality for archival purposes',
      'MP3/AAC formats offer good compression with minimal quality loss',
      'Use normalization for consistent volume across different source videos',
      'Trim functionality allows extracting specific audio segments',
      'Higher bitrates = better quality but larger file sizes',
      '44.1kHz sample rate matches CD quality standards',
    ],
    relatedTools: ['video-trimmer', 'noise-cleaner', 'tag-editor-pro'],
  },
  'waveform-generator': {
    title: 'How to Generate Audio Waveform Images',
    description: 'Create visual waveform representations of your audio files as PNG images for thumbnails, previews, and analysis.',
    difficulty: 'Beginner',
    timeRequired: '3-5 minutes',
    steps: [
      {
        title: 'Upload Your Audio File',
        description: 'Select an audio file (MP3, WAV, M4A, etc.) to generate a waveform visualization.',
        tip: 'Files up to 50MB work well for clear waveform generation',
      },
      {
        title: 'Configure Waveform Settings',
        description: 'Adjust width, height, colors, and style options for your waveform image.',
        tip: 'Default settings (800x200) work well for most social media platforms',
      },
      {
        title: 'Choose Color Scheme',
        description: 'Select foreground and background colors, or use preset themes.',
        tip: 'High contrast colors (dark on light) provide the best visibility',
      },
      {
        title: 'Generate Waveform',
        description: 'Click "Generate Waveform" to create your visual audio representation.',
        tip: 'Processing is usually instant for most audio files',
      },
      {
        title: 'Download Your Waveform',
        description: 'Download the generated PNG image for use in your projects.',
        tip: 'PNG format preserves quality and supports transparency',
      },
    ],
    tips: [
      'Use waveforms as podcast thumbnails or video previews',
      'Experiment with different colors to match your brand',
      'Higher resolution works better for professional presentations',
      'Waveforms help users visualize audio content before playing',
      'Consider aspect ratio for different social media platforms',
    ],
    relatedTools: ['audio-stripper', 'noise-cleaner', 'tag-editor-pro'],
  },
  'voice-memo-transcriber': {
    title: 'How to Transcribe Voice Memos',
    description: 'Convert spoken audio recordings into written text using advanced speech recognition technology.',
    difficulty: 'Beginner',
    timeRequired: '2-5 minutes',
    steps: [
      {
        title: 'Prepare Your Audio',
        description: 'Upload a clear voice recording (MP3, WAV, M4A) under 10 minutes.',
        tip: 'Clear speech with minimal background noise provides best results',
      },
      {
        title: 'Select Audio Quality',
        description: 'Choose the appropriate quality setting based on your audio clarity.',
        tip: 'Use "High Quality" for important recordings, "Standard" for quick transcriptions',
      },
      {
        title: 'Start Transcription',
        description: 'Click "Transcribe Audio" to begin the speech-to-text conversion.',
        tip: 'Processing time depends on audio length and quality settings',
      },
      {
        title: 'Review and Edit',
        description: 'Review the generated text and make any necessary corrections.',
        tip: 'The system works best with clear, natural speech patterns',
      },
      {
        title: 'Download Transcript',
        description: 'Export your transcription as plain text or formatted document.',
        tip: 'Save both audio and transcript for complete documentation',
      },
    ],
    tips: [
      'Speak clearly and at a moderate pace for best results',
      'Minimize background noise and echoes',
      'Use headphones when recording to avoid feedback',
      'Review transcriptions for accuracy, especially technical terms',
      'Keep recordings under 5 minutes for faster processing',
      'Consider speaker identification for multi-person recordings',
    ],
    relatedTools: ['noise-cleaner', 'tag-editor-pro', 'podcast-clip-cutter'],
  },
  'custom-card-maker': {
    title: 'How to Create Custom Cards and Badges',
    description: 'Design personalized cards, badges, and certificates with custom text, colors, and layouts.',
    difficulty: 'Intermediate',
    timeRequired: '10-15 minutes',
    steps: [
      {
        title: 'Choose Card Template',
        description: 'Select from predefined card types (business card, ID badge, certificate, etc.).',
        tip: 'Start with a template that matches your intended use',
      },
      {
        title: 'Customize Dimensions',
        description: 'Set the card size, orientation, and resolution for your specific needs.',
        tip: 'Standard business card size is 3.5" x 2", but customize as needed',
      },
      {
        title: 'Add Text Elements',
        description: 'Enter your text content with font selection, size, and positioning.',
        tip: 'Use hierarchy - larger fonts for titles, smaller for details',
      },
      {
        title: 'Design Layout',
        description: 'Arrange text, images, and shapes using the drag-and-drop interface.',
        tip: 'Leave adequate white space for professional appearance',
      },
      {
        title: 'Apply Styling',
        description: 'Choose colors, borders, backgrounds, and decorative elements.',
        tip: 'Maintain brand consistency with colors and fonts',
      },
      {
        title: 'Preview and Export',
        description: 'Review your design and download as PNG, PDF, or print-ready format.',
        tip: 'Always preview at actual size before printing',
      },
    ],
    tips: [
      'Use high-resolution images (300 DPI) for print quality',
      'Choose readable fonts - avoid decorative fonts for body text',
      'Maintain proper contrast between text and background',
      'Include all necessary information without overcrowding',
      'Test print quality on your intended printer',
      'Save your design template for future use',
    ],
    relatedTools: ['image-resizer', 'image-to-cartoon', 'favicon-maker'],
  },
  'favicon-maker': {
    title: 'How to Create Website Favicons',
    description: 'Generate professional favicons from images with automatic optimization for all devices and browsers.',
    difficulty: 'Beginner',
    timeRequired: '3-5 minutes',
    steps: [
      {
        title: 'Upload Source Image',
        description: 'Select a square image (PNG, JPG, or SVG) at least 512x512 pixels.',
        tip: 'Use your logo or a simple, recognizable icon for best results',
      },
      {
        title: 'Configure Output Settings',
        description: 'Choose favicon sizes and formats needed for your website.',
        tip: 'Generate multiple sizes (16x16, 32x32, 48x48, etc.) for comprehensive browser support',
      },
      {
        title: 'Apply Background (Optional)',
        description: 'Add a solid background color if your logo has transparency.',
        tip: 'Choose a color that complements your website design',
      },
      {
        title: 'Generate Favicon Package',
        description: 'Click "Generate Favicons" to create all required sizes and formats.',
        tip: 'The system automatically generates ICO, PNG, and Apple Touch Icon formats',
      },
      {
        title: 'Download Favicon Kit',
        description: 'Download the complete favicon package with implementation instructions.',
        tip: 'Includes HTML code snippets for easy website integration',
      },
    ],
    tips: [
      'Use a square image for best results across all platforms',
      'Keep designs simple and recognizable at small sizes',
      'Test favicons in different browsers and devices',
      'Include both light and dark mode variations if needed',
      'Update favicon when rebranding your website',
      'Compress favicon files for faster website loading',
    ],
    relatedTools: ['image-resizer', 'custom-card-maker', 'image-format-converter'],
  },
  'image-ascii-art-converter': {
    title: 'How to Convert Images to ASCII Art',
    description: 'Transform photographs into text-based art using ASCII characters for retro computer aesthetics.',
    difficulty: 'Beginner',
    timeRequired: '2-4 minutes',
    steps: [
      {
        title: 'Upload Your Image',
        description: 'Select any image file (JPG, PNG, WebP) to convert to ASCII art.',
        tip: 'High contrast images work best for clear ASCII conversion',
      },
      {
        title: 'Choose Character Set',
        description: 'Select from different ASCII character sets (standard, extended, blocks).',
        tip: 'Extended character set provides more detail and shading',
      },
      {
        title: 'Adjust Size Settings',
        description: 'Set width and height to control the ASCII art dimensions.',
        tip: '80-120 characters width works well for most displays',
      },
      {
        title: 'Configure Style Options',
        description: 'Choose color output, inversion, and brightness settings.',
        tip: 'Color ASCII art works better for modern displays',
      },
      {
        title: 'Generate ASCII Art',
        description: 'Click "Convert to ASCII" to transform your image.',
        tip: 'Processing is instant for most images',
      },
      {
        title: 'Copy or Download',
        description: 'Copy the ASCII text or download as an image file.',
        tip: 'Use monospaced fonts when sharing ASCII art',
      },
    ],
    tips: [
      'High contrast images (black & white) produce the best results',
      'Experiment with different character sets for unique effects',
      'ASCII art works best with simple, bold imagery',
      'Use for retro gaming aesthetics or artistic expression',
      'Consider font choice when displaying ASCII art',
      'Smaller sizes maintain readability while larger sizes show more detail',
    ],
    relatedTools: ['image-pixel-sorter', 'image-dithering-tool', 'image-to-cartoon'],
  },
  'image-background-changer': {
    title: 'How to Change or Remove Image Backgrounds',
    description: 'Automatically detect and remove backgrounds, or replace them with solid colors, gradients, or transparency.',
    difficulty: 'Beginner',
    timeRequired: '3-8 minutes',
    steps: [
      {
        title: 'Upload Image',
        description: 'Select an image with a distinct foreground subject.',
        tip: 'Images with clear contrast between subject and background work best',
      },
      {
        title: 'Choose Removal Method',
        description: 'Select automatic AI detection or manual selection tools.',
        tip: 'Auto mode works well for simple backgrounds, manual for complex images',
      },
      {
        title: 'Refine Selection (Optional)',
        description: 'Use brushes to include/exclude areas if auto-detection needs adjustment.',
        tip: 'Zoom in for precise edge selection around hair, fur, or fine details',
      },
      {
        title: 'Choose Background Type',
        description: 'Select solid color, gradient, transparency, or upload a new background image.',
        tip: 'Transparency works well for logos and graphics',
      },
      {
        title: 'Apply and Preview',
        description: 'Preview the result and make final adjustments before processing.',
        tip: 'Check edges for any remaining background artifacts',
      },
      {
        title: 'Download Result',
        description: 'Export your image with the new background as PNG (for transparency) or JPG.',
        tip: 'Use PNG format to preserve transparency',
      },
    ],
    tips: [
      'Clear subject-background contrast improves auto-detection accuracy',
      'Manual refinement tools help with complex edges (hair, fur, glass)',
      'Test different background types to find what works best',
      'Use transparency for flexible image composition',
      'Consider subject isolation for product photography',
      'Save original images before making changes',
    ],
    relatedTools: ['image-resizer', 'image-format-converter', 'watermark-remover'],
  },
  'image-dithering-tool': {
    title: 'How to Apply Image Dithering Effects',
    description: 'Create retro pixel art effects using various dithering algorithms for artistic image processing.',
    difficulty: 'Intermediate',
    timeRequired: '3-5 minutes',
    steps: [
      {
        title: 'Upload Source Image',
        description: 'Select any image file to apply dithering effects.',
        tip: 'Photographs work well, but simple images show dithering patterns clearly',
      },
      {
        title: 'Choose Dithering Algorithm',
        description: 'Select from various algorithms: Floyd-Steinberg, Ordered, Atkinson, etc.',
        tip: 'Floyd-Steinberg provides the most natural-looking results',
      },
      {
        title: 'Set Color Depth',
        description: 'Choose number of colors (2-256) for the dithering effect.',
        tip: 'Lower color counts (2-16) create more pronounced dithering patterns',
      },
      {
        title: 'Adjust Parameters',
        description: 'Fine-tune brightness, contrast, and dithering strength.',
        tip: 'Experiment with different settings to achieve desired artistic effect',
      },
      {
        title: 'Apply Dithering',
        description: 'Click "Apply Dithering" to process your image.',
        tip: 'Processing is usually instant for most images',
      },
      {
        title: 'Download Result',
        description: 'Save your dithered image in PNG format to preserve quality.',
        tip: 'Dithered images work well for retro gaming and pixel art aesthetics',
      },
    ],
    tips: [
      'Dithering works best with continuous tone images (photographs)',
      'Lower color depths create more visible dithering patterns',
      'Different algorithms produce unique visual characteristics',
      'Use for retro gaming aesthetics or artistic expression',
      'Combine with other effects for unique artistic results',
      'PNG format preserves the pixel-perfect nature of dithered images',
    ],
    relatedTools: ['image-pixel-sorter', 'image-ascii-art-converter', 'image-to-cartoon'],
  },
  'image-exif-tool': {
    title: 'How to View and Edit Image EXIF Data',
    description: 'Access, view, and modify EXIF metadata including camera settings, GPS data, timestamps, and copyright information.',
    difficulty: 'Intermediate',
    timeRequired: '5-10 minutes',
    steps: [
      {
        title: 'Upload Image File',
        description: 'Select a JPG or TIFF image file containing EXIF metadata.',
        tip: 'Most digital camera photos and smartphone images contain EXIF data',
      },
      {
        title: 'View EXIF Information',
        description: 'Browse through all available EXIF tags and their values.',
        tip: 'Look for camera model, lens info, exposure settings, and GPS coordinates',
      },
      {
        title: 'Identify Fields to Edit',
        description: 'Determine which metadata fields you want to modify or remove.',
        tip: 'Common edits include copyright, artist name, and GPS location removal',
      },
      {
        title: 'Edit Metadata Values',
        description: 'Update text fields, dates, and other editable EXIF information.',
        tip: 'Be careful when editing technical camera settings',
      },
      {
        title: 'Remove Sensitive Data',
        description: 'Strip GPS coordinates or other private information if needed.',
        tip: 'Always check GPS removal for privacy protection',
      },
      {
        title: 'Save Modified Image',
        description: 'Download your image with updated EXIF metadata.',
        tip: 'Changes are permanently embedded in the image file',
      },
    ],
    tips: [
      'EXIF data is embedded in JPG and TIFF files, not visible in the image itself',
      'GPS coordinates can reveal location privacy - remove if sharing publicly',
      'Copyright and artist information helps protect intellectual property',
      'Some photo editing software strips EXIF data - preserve it when possible',
      'EXIF data includes technical camera settings useful for photography learning',
      'Date/time stamps can be important for legal or evidentiary purposes',
    ],
    relatedTools: ['image-resizer', 'image-format-converter', 'image-ocr-extractor'],
  },
  'image-ocr-extractor': {
    title: 'How to Extract Text from Images',
    description: 'Convert text within images into editable text using advanced optical character recognition technology.',
    difficulty: 'Beginner',
    timeRequired: '2-5 minutes',
    steps: [
      {
        title: 'Upload Image with Text',
        description: 'Select an image containing clear, readable text (JPG, PNG, etc.).',
        tip: 'High contrast text on plain backgrounds provides best OCR results',
      },
      {
        title: 'Choose OCR Language',
        description: 'Select the language(s) used in the text for accurate recognition.',
        tip: 'Multiple language selection helps with mixed content',
      },
      {
        title: 'Configure Processing Options',
        description: 'Adjust settings for text detection and formatting preferences.',
        tip: 'Auto-detect works well for most standard documents',
      },
      {
        title: 'Run OCR Processing',
        description: 'Click "Extract Text" to begin optical character recognition.',
        tip: 'Processing time depends on image size and text complexity',
      },
      {
        title: 'Review Extracted Text',
        description: 'Check the accuracy of extracted text and make corrections if needed.',
        tip: 'OCR works best with printed text, handwritten text is more challenging',
      },
      {
        title: 'Download Results',
        description: 'Export the extracted text as plain text, Word document, or PDF.',
        tip: 'Preserve formatting when possible for better document structure',
      },
    ],
    tips: [
      'Clear, high-contrast text produces the most accurate results',
      'Avoid blurry, distorted, or very small text',
      'Straight, horizontal text works better than curved or vertical text',
      'Clean backgrounds without patterns improve accuracy',
      'Printed fonts are more reliable than decorative or handwritten text',
      'Review and edit extracted text for important documents',
    ],
    relatedTools: ['image-resizer', 'image-background-changer', 'pdf-text-extractor'],
  },
  'image-pixel-sorter': {
    title: 'How to Create Pixel Sorting Art Effects',
    description: 'Apply algorithmic pixel sorting effects to create stunning glitch art and data visualization aesthetics.',
    difficulty: 'Intermediate',
    timeRequired: '3-7 minutes',
    steps: [
      {
        title: 'Select Source Image',
        description: 'Upload an image with interesting color gradients or patterns.',
        tip: 'Images with strong vertical color transitions work best',
      },
      {
        title: 'Choose Sorting Direction',
        description: 'Select horizontal, vertical, or diagonal pixel sorting orientation.',
        tip: 'Vertical sorting often creates the most dramatic effects',
      },
      {
        title: 'Configure Sorting Criteria',
        description: 'Choose what property to sort by: brightness, hue, saturation, or RGB values.',
        tip: 'Brightness sorting creates flowing, organic effects',
      },
      {
        title: 'Set Sorting Parameters',
        description: 'Adjust threshold values, sorting length, and angle settings.',
        tip: 'Experiment with different thresholds to control effect intensity',
      },
      {
        title: 'Apply Pixel Sorting',
        description: 'Click "Apply Pixel Sort" to transform your image.',
        tip: 'Complex images may take longer to process',
      },
      {
        title: 'Download Result',
        description: 'Save your pixel-sorted artwork as a high-quality PNG.',
        tip: 'Use for digital art, album covers, or experimental visuals',
      },
    ],
    tips: [
      'Images with gradual color changes produce the most interesting results',
      'Vertical sorting creates flowing, organic patterns',
      'Lower thresholds create more subtle effects, higher thresholds more dramatic',
      'Combine with other image effects for unique artistic results',
      'Use for glitch art, data visualization, or experimental photography',
      'Different sorting criteria (brightness vs hue) produce different aesthetics',
    ],
    relatedTools: ['image-dithering-tool', 'image-ascii-art-converter', 'image-to-cartoon'],
  },
  'image-puzzle-game': {
    title: 'How to Play the Image Puzzle Game',
    description: 'Challenge yourself with interactive image puzzles - scramble pieces and solve to recreate the original image.',
    difficulty: 'Beginner',
    timeRequired: '5-30 minutes',
    steps: [
      {
        title: 'Choose or Upload Image',
        description: 'Select a puzzle image or upload your own photo.',
        tip: 'Images with distinct features and colors make better puzzles',
      },
      {
        title: 'Select Difficulty Level',
        description: 'Choose puzzle size: 3x3 (easy), 4x4 (medium), or 5x5 (hard).',
        tip: 'Start with smaller puzzles if you are new to the game',
      },
      {
        title: 'Start the Puzzle',
        description: 'Click "Start Puzzle" to scramble the image pieces.',
        tip: 'Take a moment to study the completed image before scrambling',
      },
      {
        title: 'Move Puzzle Pieces',
        description: 'Click on pieces adjacent to the empty space to slide them.',
        tip: 'Only pieces next to the empty space can be moved',
      },
      {
        title: 'Solve the Puzzle',
        description: 'Rearrange all pieces to recreate the original image.',
        tip: 'Work from the edges inward for systematic solving',
      },
      {
        title: 'Complete and Share',
        description: 'Celebrate when solved! Share your solve time with friends.',
        tip: 'Challenge yourself with harder difficulties as you improve',
      },
    ],
    tips: [
      'Start with edge pieces to establish the frame',
      'Look for color and pattern matches when placing pieces',
      'Work systematically from one corner to avoid confusion',
      'Take breaks if stuck - fresh eyes help solve puzzles',
      'Practice with easier puzzles to develop solving strategies',
      'Use the preview feature if you get completely stuck',
    ],
    relatedTools: ['image-resizer', 'image-to-cartoon', 'custom-card-maker'],
  },
  'image-format-converter': {
    title: 'How to Convert Image Formats',
    description: 'Transform images between different file formats (JPG, PNG, WebP, etc.) with quality and compression control.',
    difficulty: 'Beginner',
    timeRequired: '2-4 minutes',
    steps: [
      {
        title: 'Upload Source Image',
        description: 'Select any image file to convert to a different format.',
        tip: 'All common image formats (JPG, PNG, WebP, BMP, TIFF) are supported',
      },
      {
        title: 'Choose Output Format',
        description: 'Select your desired output format from the available options.',
        tip: 'Consider your use case: WebP for web, PNG for transparency, JPG for photos',
      },
      {
        title: 'Adjust Quality Settings',
        description: 'Set compression level and quality for lossy formats like JPG.',
        tip: 'Higher quality = larger files; balance size vs quality needs',
      },
      {
        title: 'Configure Options',
        description: 'Set additional parameters like color depth or metadata preservation.',
        tip: 'Preserve EXIF data if important for your workflow',
      },
      {
        title: 'Convert Image',
        description: 'Click "Convert Format" to process your image.',
        tip: 'Most conversions are instant, large files may take a moment',
      },
      {
        title: 'Download Result',
        description: 'Save your converted image in the new format.',
        tip: 'Verify the result meets your quality and size requirements',
      },
    ],
    tips: [
      'Use JPG for photographs to balance quality and file size',
      'Choose PNG for images needing transparency or sharp edges',
      'WebP offers excellent compression for web use',
      'Consider BMP/TIFF for archival purposes with lossless quality',
      'Higher quality settings preserve more detail but create larger files',
      'Test converted images in your intended application',
    ],
    relatedTools: ['image-resizer', 'image-background-changer', 'image-exif-tool'],
  },
  'image-hidden-message': {
    title: 'How to Hide and Reveal Secret Messages in Images',
    description: 'Use steganography to embed hidden text messages within images, or extract messages from steganographic images.',
    difficulty: 'Advanced',
    timeRequired: '5-10 minutes',
    steps: [
      {
        title: 'Choose Operation Mode',
        description: 'Select whether to hide a message in an image or extract a hidden message.',
        tip: 'Make sure you have the correct password for extraction',
      },
      {
        title: 'Upload Cover Image',
        description: 'For hiding: Select a high-quality image large enough to conceal your message.',
        tip: 'PNG format preserves quality best for steganography',
      },
      {
        title: 'Enter Secret Message',
        description: 'Type the text you want to hide within the image.',
        tip: 'Keep messages reasonably short for reliable concealment',
      },
      {
        title: 'Set Encryption Password',
        description: 'Create a strong password to protect your hidden message.',
        tip: 'Remember this password - it is required for message extraction',
      },
      {
        title: 'Hide or Extract Message',
        description: 'Click "Hide Message" to embed, or "Extract Message" to reveal hidden content.',
        tip: 'The image will look visually identical after message embedding',
      },
      {
        title: 'Save or Share',
        description: 'Download the steganographic image or copy the extracted message.',
        tip: 'Share the password separately from the image for security',
      },
    ],
    tips: [
      'Use high-quality, uncompressed images for best concealment capacity',
      'Strong passwords are essential for message security',
      'Larger images can hide longer messages',
      'The visual appearance of the image remains unchanged',
      'Share images and passwords through separate, secure channels',
      'Test extraction with your password before relying on the technique',
    ],
    relatedTools: ['image-format-converter', 'image-background-changer', 'image-exif-tool'],
  },
  'image-anaglyph-3d': {
    title: 'How to Create 3D Anaglyph Images',
    description: 'Combine left and right eye images to create red-cyan 3D anaglyphs viewable with 3D glasses.',
    difficulty: 'Intermediate',
    timeRequired: '5-10 minutes',
    steps: [
      {
        title: 'Prepare Stereo Pair',
        description: 'Upload left and right eye images taken from slightly different angles.',
        tip: 'Images should be identical in size and framing for best results',
      },
      {
        title: 'Upload Left Eye Image',
        description: 'Select the image intended for the left eye (typically red channel).',
        tip: 'Ensure both images have the same dimensions and orientation',
      },
      {
        title: 'Upload Right Eye Image',
        description: 'Select the image for the right eye (typically cyan/blue channel).',
        tip: 'Slight horizontal offset between images creates the 3D effect',
      },
      {
        title: 'Adjust 3D Parameters',
        description: 'Fine-tune depth, alignment, and color balance for optimal 3D effect.',
        tip: 'Subtle adjustments often produce the most comfortable viewing experience',
      },
      {
        title: 'Generate Anaglyph',
        description: 'Click "Create 3D Anaglyph" to combine the stereo pair.',
        tip: 'Processing combines color channels to create the 3D illusion',
      },
      {
        title: 'Test and Download',
        description: 'View with red-cyan 3D glasses and download your anaglyph image.',
        tip: 'Adjust monitor brightness for optimal 3D depth perception',
      },
    ],
    tips: [
      'Use images with good depth and parallax for compelling 3D effects',
      'Keep the stereo base (distance between camera positions) reasonable',
      'Red-cyan glasses are inexpensive and widely available',
      'Test viewing distance and angle for optimal 3D experience',
      'Avoid excessive depth that causes eye strain',
      'Use for scientific visualization, entertainment, or artistic expression',
    ],
    relatedTools: ['image-resizer', 'image-format-converter', 'image-background-changer'],
  },
  'image-resizer': {
    title: 'How to Resize Images Precisely',
    description: 'Change image dimensions while maintaining quality and aspect ratio, with advanced resizing algorithms.',
    difficulty: 'Beginner',
    timeRequired: '2-4 minutes',
    steps: [
      {
        title: 'Upload Source Image',
        description: 'Select any image file you want to resize.',
        tip: 'All common formats (JPG, PNG, WebP, etc.) are supported',
      },
      {
        title: 'Choose Resize Method',
        description: 'Select by percentage, pixel dimensions, or preset sizes.',
        tip: 'Pixel dimensions give you precise control over final size',
      },
      {
        title: 'Set Dimensions',
        description: 'Enter width and height, or choose from common presets.',
        tip: 'Maintain aspect ratio by locking the ratio or using percentage scaling',
      },
      {
        title: 'Configure Quality Settings',
        description: 'Adjust compression and quality for the output format.',
        tip: 'Higher quality preserves more detail but creates larger files',
      },
      {
        title: 'Apply Resizing',
        description: 'Click "Resize Image" to process your image.',
        tip: 'Advanced algorithms maintain image quality during resizing',
      },
      {
        title: 'Download Result',
        description: 'Save your resized image in the original or chosen format.',
        tip: 'Choose PNG for transparency preservation, JPG for smaller file sizes',
      },
    ],
    tips: [
      'Use percentage scaling to maintain exact proportions',
      'Consider your intended use (web, print, social media) when choosing dimensions',
      'Higher resolution images can be safely reduced in size',
      'PNG format preserves quality for graphics with transparency',
      'JPG works well for photographs where some compression is acceptable',
      'Test resized images in their intended application',
    ],
    relatedTools: ['image-format-converter', 'image-background-changer', 'favicon-maker'],
  },
  'image-to-cartoon': {
    title: 'How to Convert Photos to Cartoon Style',
    description: 'Transform photographs into cartoon or illustration-style images using advanced AI and artistic filters.',
    difficulty: 'Beginner',
    timeRequired: '3-5 minutes',
    steps: [
      {
        title: 'Upload Photo',
        description: 'Select a clear, well-lit photograph for best cartoon conversion.',
        tip: 'Portraits and close-up images work particularly well',
      },
      {
        title: 'Choose Cartoon Style',
        description: 'Select from different artistic styles: classic cartoon, sketch, painting, etc.',
        tip: 'Different styles work better for different types of source images',
      },
      {
        title: 'Adjust Style Intensity',
        description: 'Control how strongly the cartoon effect is applied.',
        tip: 'Subtle settings maintain more of the original photo, strong settings create bold cartoons',
      },
      {
        title: 'Fine-tune Parameters',
        description: 'Adjust edge detection, color simplification, and smoothing settings.',
        tip: 'Experiment with settings to achieve your desired artistic effect',
      },
      {
        title: 'Apply Cartoon Effect',
        description: 'Click "Convert to Cartoon" to process your image.',
        tip: 'AI processing may take a moment for high-quality results',
      },
      {
        title: 'Download Cartoon Image',
        description: 'Save your artistic creation as a high-quality image file.',
        tip: 'Use for social media, digital art, or creative projects',
      },
    ],
    tips: [
      'Clear, well-lit photos produce the best cartoon results',
      'Portraits work particularly well for cartoon conversion',
      'Experiment with different styles to find what suits your image',
      'Use for social media graphics, digital art, or fun photo effects',
      'Combine with other tools for unique artistic creations',
      'Consider the original image composition for best results',
    ],
    relatedTools: ['image-resizer', 'image-pixel-sorter', 'image-dithering-tool'],
  },
  'color-palette-extractor': {
    title: 'How to Extract Color Palettes from Images',
    description: 'Automatically identify and extract dominant colors from images to create custom color palettes for design projects.',
    difficulty: 'Beginner',
    timeRequired: '2-4 minutes',
    steps: [
      {
        title: 'Upload Source Image',
        description: 'Select any image from which you want to extract a color palette.',
        tip: 'Images with diverse, vibrant colors produce the most interesting palettes',
      },
      {
        title: 'Choose Extraction Method',
        description: 'Select color extraction algorithm: dominant colors, k-means clustering, etc.',
        tip: 'Dominant colors work well for most design applications',
      },
      {
        title: 'Set Number of Colors',
        description: 'Choose how many colors to extract (3-10 colors recommended).',
        tip: '5-7 colors typically provide good design flexibility',
      },
      {
        title: 'Configure Extraction',
        description: 'Adjust sensitivity and color space settings if needed.',
        tip: 'Default settings work well for most images',
      },
      {
        title: 'Extract Color Palette',
        description: 'Click "Extract Colors" to analyze your image and generate the palette.',
        tip: 'Processing is usually instant for most images',
      },
      {
        title: 'Copy or Export Palette',
        description: 'Copy color codes (HEX, RGB, HSL) or download palette images.',
        tip: 'Use extracted colors for web design, branding, or digital art',
      },
    ],
    tips: [
      'Use high-quality, colorful images for best palette results',
      'Extract colors from nature photos for organic color schemes',
      'Consider color harmony when selecting palette size',
      'Use extracted palettes for consistent branding and design',
      'Copy color codes in your preferred format (HEX for web, RGB for design)',
      'Save palette images for reference in design projects',
    ],
    relatedTools: ['image-resizer', 'image-background-changer', 'custom-card-maker'],
  },
  'image-upscaler': {
    title: 'How to Upscale and Enhance Images',
    description: 'Increase image resolution and quality using AI-powered upscaling technology for sharper, more detailed results.',
    difficulty: 'Beginner',
    timeRequired: '3-8 minutes',
    steps: [
      {
        title: 'Upload Low-Resolution Image',
        description: 'Select an image that needs higher resolution or quality improvement.',
        tip: 'Images at least 200x200 pixels work best for upscaling',
      },
      {
        title: 'Choose Upscale Factor',
        description: 'Select magnification level: 2x, 4x, or 8x resolution increase.',
        tip: 'Start with 2x for most applications, higher factors for special cases',
      },
      {
        title: 'Select AI Model',
        description: 'Choose from different upscaling algorithms optimized for various content types.',
        tip: 'Photo model works best for photographs, general model for mixed content',
      },
      {
        title: 'Configure Enhancement',
        description: 'Adjust sharpness, noise reduction, and detail enhancement settings.',
        tip: 'Balance enhancement with natural appearance',
      },
      {
        title: 'Apply Upscaling',
        description: 'Click "Upscale Image" to begin AI processing.',
        tip: 'Processing time increases with image size and upscale factor',
      },
      {
        title: 'Download Enhanced Image',
        description: 'Save your high-resolution image with improved quality.',
        tip: 'Compare before/after to verify quality improvement',
      },
    ],
    tips: [
      'AI upscaling works best on natural images and photographs',
      'Results improve with higher quality source images',
      'Do not expect miracles from extremely low-resolution sources',
      'Use for enlarging old photos, improving thumbnails, or preparing for print',
      'Test different models to find what works best for your content',
      'Balance file size with quality for your specific use case',
    ],
    relatedTools: ['image-resizer', 'image-format-converter', 'image-background-changer'],
  },
  'watermark-remover': {
    title: 'How to Remove Watermarks from Images',
    description: 'Automatically detect and remove unwanted watermarks, logos, and text overlays from images using advanced AI technology.',
    difficulty: 'Intermediate',
    timeRequired: '5-15 minutes',
    steps: [
      {
        title: 'Upload Watermarked Image',
        description: 'Select an image containing unwanted watermarks or overlays.',
        tip: 'Clear, high-contrast watermarks are easier to remove than subtle ones',
      },
      {
        title: 'Select Removal Method',
        description: 'Choose automatic AI detection or manual selection tools.',
        tip: 'Auto mode works well for standard watermarks, manual for custom overlays',
      },
      {
        title: 'Define Watermark Area',
        description: 'If using manual mode, draw around the watermark to target removal.',
        tip: 'Be precise with selection to avoid removing desired content',
      },
      {
        title: 'Configure AI Settings',
        description: 'Adjust sensitivity and processing strength for optimal results.',
        tip: 'Start with default settings and adjust based on preview results',
      },
      {
        title: 'Preview and Refine',
        description: 'Review the removal result and make adjustments if needed.',
        tip: 'Zoom in to check edge quality and artifact removal',
      },
      {
        title: 'Apply Final Removal',
        description: 'Process the image with your refined settings.',
        tip: 'Processing may take time for complex watermarks',
      },
      {
        title: 'Download Clean Image',
        description: 'Save your watermark-free image.',
        tip: 'Use PNG format to preserve quality and transparency',
      },
    ],
    tips: [
      'Success depends on watermark complexity and image quality',
      'Simple text watermarks remove more cleanly than complex logos',
      'Manual selection provides more control for difficult cases',
      'Always respect copyright when removing watermarks',
      'Use for personal projects, research, or educational purposes',
      'Consider ethical implications of watermark removal',
    ],
    relatedTools: ['image-background-changer', 'image-resizer', 'image-exif-tool'],
  },
  'pdf-compressor': {
    title: 'How to Compress PDF Files',
    description: 'Reduce PDF file size while maintaining quality using advanced compression algorithms and optimization techniques.',
    difficulty: 'Beginner',
    timeRequired: '3-8 minutes',
    steps: [
      {
        title: 'Upload PDF File',
        description: 'Select the PDF document you want to compress.',
        tip: 'Files up to 100MB are supported, larger files may need more processing time',
      },
      {
        title: 'Choose Compression Level',
        description: 'Select from preset compression levels: Light, Standard, or Maximum.',
        tip: 'Standard compression typically reduces size by 50-70% with minimal quality loss',
      },
      {
        title: 'Configure Advanced Options',
        description: 'Adjust image quality, remove unused elements, and optimize fonts.',
        tip: 'Enable "Remove metadata" to further reduce file size if privacy allows',
      },
      {
        title: 'Preview Compression Results',
        description: 'See estimated file size reduction before processing.',
        tip: 'Balance compression level with acceptable quality reduction',
      },
      {
        title: 'Compress PDF',
        description: 'Click "Compress PDF" to begin the optimization process.',
        tip: 'Processing time depends on PDF complexity and size',
      },
      {
        title: 'Download Optimized PDF',
        description: 'Save your compressed PDF with reduced file size.',
        tip: 'Verify document readability and quality after compression',
      },
    ],
    tips: [
      'Image-heavy PDFs compress much more than text-only documents',
      'Start with Standard compression and adjust based on results',
      'Maximum compression may reduce image quality significantly',
      'Always test compressed PDFs to ensure readability',
      'Consider your distribution method when choosing compression level',
      'Email attachments benefit most from compression',
    ],
    relatedTools: ['pdf-splitter', 'pdf-merger', 'pdf-password'],
  },
  'pdf-merger': {
    title: 'How to Merge Multiple PDF Files',
    description: 'Combine multiple PDF documents into a single file with drag-and-drop reordering and page management.',
    difficulty: 'Beginner',
    timeRequired: '3-5 minutes',
    steps: [
      {
        title: 'Upload PDF Files',
        description: 'Select multiple PDF files to combine.',
        tip: 'You can upload up to 20 PDF files at once',
      },
      {
        title: 'Arrange Page Order',
        description: 'Drag and drop files to reorder them in your desired sequence.',
        tip: 'Files are merged in the order they appear in the list',
      },
      {
        title: 'Review File Details',
        description: 'Check page counts and file sizes before merging.',
        tip: 'Ensure all files are valid PDFs before proceeding',
      },
      {
        title: 'Configure Output Settings',
        description: 'Choose compression level and metadata preservation options.',
        tip: 'Use Standard compression for balanced quality and file size',
      },
      {
        title: 'Merge PDFs',
        description: 'Click "Merge PDFs" to combine all files into one document.',
        tip: 'Processing time depends on total page count and file sizes',
      },
      {
        title: 'Download Merged PDF',
        description: 'Save your combined PDF document.',
        tip: 'Verify the merged document contains all pages in correct order',
      },
    ],
    tips: [
      'Maximum 20 PDF files can be merged at once',
      'Files are combined in the order shown in the upload list',
      'Drag to reorder files before merging',
      'Check page counts to ensure all content is included',
      'Use for combining reports, presentations, or document collections',
      'Consider file size limits for your intended use',
    ],
    relatedTools: ['pdf-splitter', 'pdf-compressor', 'pdf-password'],
  },
  'pdf-splitter': {
    title: 'How to Split PDF Documents',
    description: 'Extract specific pages or divide large PDF files into smaller, more manageable documents.',
    difficulty: 'Beginner',
    timeRequired: '2-5 minutes',
    steps: [
      {
        title: 'Upload PDF File',
        description: 'Select the PDF document you want to split.',
        tip: 'Files up to 100MB are supported for splitting operations',
      },
      {
        title: 'Choose Split Method',
        description: 'Select how to split: by page ranges, individual pages, or even/odd pages.',
        tip: 'Page ranges (e.g., 1-5, 8-12) are most commonly used',
      },
      {
        title: 'Specify Page Ranges',
        description: 'Enter page numbers or ranges to extract.',
        tip: 'Use commas to separate multiple ranges (e.g., 1-3,7-9,15)',
      },
      {
        title: 'Preview Selection',
        description: 'Review which pages will be included in each output file.',
        tip: 'Verify page ranges before processing to avoid errors',
      },
      {
        title: 'Split PDF',
        description: 'Click "Split PDF" to create separate documents.',
        tip: 'Each page range becomes a separate PDF file',
      },
      {
        title: 'Download Split Files',
        description: 'Save your split PDF documents individually or as a ZIP archive.',
        tip: 'Files are automatically named with page ranges for easy identification',
      },
    ],
    tips: [
      'Use page ranges for extracting specific sections',
      'Split large documents for easier sharing or storage',
      'Verify page ranges before splitting to avoid missing content',
      'Use for separating chapters, sections, or individual documents',
      'Split by even/odd pages for double-sided printing',
      'Download as ZIP for multiple output files',
    ],
    relatedTools: ['pdf-merger', 'pdf-compressor', 'pdf-password'],
  },
  'text-to-pdf': {
    title: 'How to Convert Text to PDF',
    description: 'Transform plain text or formatted content into professional PDF documents with custom styling and layout options.',
    difficulty: 'Beginner',
    timeRequired: '3-5 minutes',
    steps: [
      {
        title: 'Enter or Upload Text',
        description: 'Paste text content or upload a text file (.txt, .md, etc.).',
        tip: 'Supports plain text, markdown, and basic HTML formatting',
      },
      {
        title: 'Choose PDF Template',
        description: 'Select from preset document styles: Modern, Classic, Minimal, etc.',
        tip: 'Choose a template that matches your content type and audience',
      },
      {
        title: 'Customize Formatting',
        description: 'Adjust fonts, sizes, colors, margins, and spacing.',
        tip: 'Use consistent typography for professional appearance',
      },
      {
        title: 'Add Headers/Footers',
        description: 'Include page numbers, titles, dates, or custom text.',
        tip: 'Headers/footers help with document organization and branding',
      },
      {
        title: 'Configure Page Settings',
        description: 'Set page size, orientation, and layout options.',
        tip: 'A4/Letter sizes work for most business and academic documents',
      },
      {
        title: 'Generate PDF',
        description: 'Click "Convert to PDF" to create your formatted document.',
        tip: 'Processing is usually instant for text content',
      },
      {
        title: 'Download PDF Document',
        description: 'Save your professionally formatted PDF file.',
        tip: 'Use for reports, documentation, resumes, or any text-based content',
      },
    ],
    tips: [
      'Use markdown formatting for better text structure',
      'Choose appropriate fonts for readability and professionalism',
      'Consider your audience when selecting colors and styling',
      'Add page breaks for better document flow',
      'Use headers and footers for document identification',
      'Test print quality for important documents',
    ],
    relatedTools: ['pdf-compressor', 'pdf-password', 'pdf-merger'],
  },
  'pdf-password': {
    title: 'How to Encrypt and Decrypt PDF Files',
    description: 'Add password protection to PDFs or remove passwords from encrypted documents using AES-256 encryption.',
    difficulty: 'Beginner',
    timeRequired: '2-4 minutes',
    steps: [
      {
        title: 'Choose Operation',
        description: 'Select whether to encrypt (add password) or decrypt (remove password) a PDF.',
        tip: 'You must know the existing password to decrypt protected PDFs',
      },
      {
        title: 'Upload PDF File',
        description: 'Select the PDF document to encrypt or decrypt.',
        tip: 'Files up to 50MB are supported for password operations',
      },
      {
        title: 'Set Password (for Encryption)',
        description: 'Create a strong password for PDF protection.',
        tip: 'Use a combination of letters, numbers, and symbols for security',
      },
      {
        title: 'Enter Password (for Decryption)',
        description: 'Provide the current password to unlock the PDF.',
        tip: 'Passwords are case-sensitive - ensure correct spelling',
      },
      {
        title: 'Configure Permissions',
        description: 'Set access controls: printing, copying, editing permissions.',
        tip: 'Restrict permissions based on your document sharing needs',
      },
      {
        title: 'Process PDF',
        description: 'Click "Encrypt PDF" or "Decrypt PDF" to apply changes.',
        tip: 'Processing is usually quick for most PDF files',
      },
      {
        title: 'Download Result',
        description: 'Save your encrypted or decrypted PDF document.',
        tip: 'Store passwords securely separate from protected files',
      },
    ],
    tips: [
      'Use strong, unique passwords for document protection',
      'AES-256 encryption provides military-grade security',
      'Set appropriate permissions based on document sensitivity',
      'Keep passwords secure and separate from protected files',
      'Use encryption for sensitive business or personal documents',
      'Test password protection before distributing important files',
    ],
    relatedTools: ['pdf-compressor', 'pdf-merger', 'pdf-splitter'],
  },
  'pdf-form-filler': {
    title: 'How to Fill PDF Forms',
    description: 'Automatically detect and fill interactive PDF form fields with text, dates, checkboxes, and dropdown selections.',
    difficulty: 'Beginner',
    timeRequired: '3-8 minutes',
    steps: [
      {
        title: 'Upload PDF Form',
        description: 'Select a PDF document containing interactive form fields.',
        tip: 'Works with fillable PDF forms, applications, and surveys',
      },
      {
        title: 'Review Detected Fields',
        description: 'Check which form fields were automatically detected.',
        tip: 'The system identifies text boxes, checkboxes, radio buttons, and dropdowns',
      },
      {
        title: 'Fill Text Fields',
        description: 'Enter text into detected input fields and text areas.',
        tip: 'Use appropriate formatting for dates, phone numbers, and addresses',
      },
      {
        title: 'Select Options',
        description: 'Choose from dropdown menus, radio buttons, and checkboxes.',
        tip: 'Make selections that match the form requirements',
      },
      {
        title: 'Review Completed Form',
        description: 'Check all filled fields for accuracy and completeness.',
        tip: 'Verify required fields are completed and formatting is correct',
      },
      {
        title: 'Save Filled Form',
        description: 'Download your completed PDF form with all data embedded.',
        tip: 'The filled form maintains all original formatting and structure',
      },
    ],
    tips: [
      'Works with interactive PDF forms containing form fields',
      'All filled data is permanently embedded in the PDF',
      'Review completed forms before submission',
      'Use for applications, surveys, tax forms, and official documents',
      'Ensure all required fields are completed',
      'Save copies of completed forms for your records',
    ],
    relatedTools: ['pdf-password', 'pdf-compressor', 'text-to-pdf'],
  },
  'pdf-text-extractor': {
    title: 'How to Extract Text from PDF Files',
    description: 'Convert PDF documents to editable text format, preserving layout and formatting when possible.',
    difficulty: 'Beginner',
    timeRequired: '2-5 minutes',
    steps: [
      {
        title: 'Upload PDF Document',
        description: 'Select a PDF file containing text content to extract.',
        tip: 'Works best with text-based PDFs rather than image-based scans',
      },
      {
        title: 'Choose Output Format',
        description: 'Select plain text or formatted text with layout preservation.',
        tip: 'Formatted output maintains paragraphs and spacing better',
      },
      {
        title: 'Configure Extraction Options',
        description: 'Set language detection and text processing preferences.',
        tip: 'Multiple language support helps with mixed-content documents',
      },
      {
        title: 'Extract Text',
        description: 'Click "Extract Text" to begin the conversion process.',
        tip: 'Processing time depends on PDF complexity and length',
      },
      {
        title: 'Review Extracted Content',
        description: 'Check the accuracy and formatting of extracted text.',
        tip: 'OCR may be applied to image-based content for better results',
      },
      {
        title: 'Download Text File',
        description: 'Save extracted text as .txt, .docx, or other editable formats.',
        tip: 'Use for content repurposing, accessibility, or data analysis',
      },
    ],
    tips: [
      'Works best with text-based PDFs created from word processors',
      'Image-based PDFs may require OCR for text extraction',
      'Preserve formatting when possible for better document structure',
      'Use for content repurposing, accessibility compliance, or data mining',
      'Review extracted text for accuracy, especially with complex layouts',
      'Consider document structure when choosing output format',
    ],
    relatedTools: ['image-ocr-extractor', 'text-to-pdf', 'pdf-compressor'],
  },

  'personality-analyzer': {
    title: 'How to Use Personality Analyzer',
    description: 'Discover personality traits and psychological insights through handwriting analysis using advanced AI algorithms.',
    difficulty: 'Intermediate',
    timeRequired: '10-15 minutes',
    steps: [
      {
        title: 'Upload Handwriting Sample',
        description: 'Click "Choose Image" and upload a clear photo of handwritten text. Ensure good lighting and high resolution for best results.',
        tip: 'Use at least 200-300 words of natural handwriting for accurate analysis',
      },
      {
        title: 'Select Analysis Type',
        description: 'Choose between Quick Analysis (basic traits) or Detailed Analysis (comprehensive personality profile).',
        tip: 'Detailed analysis takes longer but provides more insights',
      },
      {
        title: 'Wait for Processing',
        description: 'The AI analyzes stroke patterns, pressure, spacing, and other handwriting characteristics to determine personality traits.',
        tip: 'Analysis typically takes 2-3 minutes for detailed reports',
      },
      {
        title: 'Review Personality Insights',
        description: 'Examine the detailed personality profile including traits like openness, conscientiousness, extraversion, agreeableness, and neuroticism.',
        tip: 'Look for patterns in how your traits align with different life situations',
      },
      {
        title: 'Download Report',
        description: 'Save your personality analysis as a PDF report for future reference and sharing.',
        tip: 'Reports include detailed explanations and trait interpretations',
      },
    ],
    tips: [
      'Use cursive handwriting rather than printed text for better analysis',
      'Ensure the handwriting sample is recent and represents your natural writing style',
      'Consider the context - stress or time pressure can affect handwriting',
      'Use high-quality images with good contrast for accurate character recognition',
      'Compare results with self-assessment questionnaires for validation',
    ],
    relatedTools: ['image-ocr-extractor', 'image-mood-analyzer', 'color-palette-extractor'],
  },

  'qr-code-tool': {
    title: 'How to Generate and Scan QR Codes',
    description: 'Create custom QR codes for URLs, text, and data, or scan existing QR codes from images.',
    difficulty: 'Beginner',
    timeRequired: '3-5 minutes',
    steps: [
      {
        title: 'Choose Mode',
        description: 'Select between "Generate QR Code" to create new codes or "Scan QR Code" to read existing ones.',
        tip: 'The tool supports both generation and scanning in one interface',
      },
      {
        title: 'For Generation: Enter Content',
        description: 'Input the URL, text, or data you want to encode. Choose the appropriate content type from the dropdown.',
        tip: 'URLs should include https:// for best compatibility',
      },
      {
        title: 'Customize QR Code',
        description: 'Adjust size, error correction level, and add custom colors or logos if desired.',
        tip: 'Higher error correction allows the code to work even if partially damaged',
      },
      {
        title: 'Generate and Download',
        description: 'Click "Generate QR Code" and download the resulting image in PNG or SVG format.',
        tip: 'PNG format works best for most printing applications',
      },
      {
        title: 'For Scanning: Upload Image',
        description: 'Click "Choose QR Image" and upload a photo containing a QR code.',
        tip: 'Ensure good lighting and focus on the QR code for best results',
      },
      {
        title: 'Scan and View Results',
        description: 'The tool automatically detects and decodes the QR code, displaying the embedded content.',
        tip: 'Results show the type of content and the decoded data',
      },
    ],
    tips: [
      'Test your generated QR codes with multiple devices before mass distribution',
      'Keep QR codes at least 2cm x 2cm for reliable scanning',
      'Avoid using very dark colors that might confuse scanners',
      'Include a call-to-action or border around your QR codes for better visibility',
      'Regular QR codes work better than colored ones for universal compatibility',
    ],
    relatedTools: ['image-ocr-extractor', 'barcode-generator', 'image-format-converter'],
  },

  'image-mood-analyzer': {
    title: 'How to Analyze Image Mood and Emotions',
    description: 'Discover the emotional tone and mood conveyed by your images using advanced AI analysis.',
    difficulty: 'Beginner',
    timeRequired: '5-8 minutes',
    steps: [
      {
        title: 'Upload Your Image',
        description: 'Click "Choose Image" and select the photo you want to analyze. The tool supports JPG, PNG, and WebP formats.',
        tip: 'Higher resolution images provide more accurate analysis',
      },
      {
        title: 'Wait for AI Processing',
        description: 'The AI analyzes colors, composition, lighting, and visual elements to determine the emotional tone.',
        tip: 'Analysis typically takes 30-60 seconds depending on image complexity',
      },
      {
        title: 'Review Mood Analysis',
        description: 'View the detailed breakdown of emotions detected, including primary mood, intensity levels, and contributing factors.',
        tip: 'The tool identifies multiple emotions that can coexist in one image',
      },
      {
        title: 'Explore Visual Insights',
        description: 'See which visual elements contribute to each emotion, such as warm/cool colors, lighting effects, or composition.',
        tip: 'Understanding these insights can help improve your photography skills',
      },
      {
        title: 'Compare Multiple Images',
        description: 'Upload additional images to compare their emotional impact and identify patterns in your work.',
        tip: 'Useful for photographers, marketers, and content creators',
      },
    ],
    tips: [
      'Warm colors (reds, oranges) often convey energy and passion',
      'Cool colors (blues, greens) typically suggest calmness and serenity',
      'Lighting plays a major role - bright images feel more positive than dark ones',
      'Composition affects mood - centered subjects feel stable, off-center ones feel dynamic',
      'Cultural context matters - colors and symbols have different meanings across cultures',
    ],
    relatedTools: ['color-palette-extractor', 'image-histogram-viewer', 'personality-analyzer'],
  },

  'color-blindness-simulator': {
    title: 'How to Simulate Color Blindness',
    description: 'See how your images appear to people with different types of color vision deficiencies.',
    difficulty: 'Beginner',
    timeRequired: '3-5 minutes',
    steps: [
      {
        title: 'Upload Your Image',
        description: 'Click "Choose Image" and select the image you want to test for color accessibility.',
        tip: 'Works best with images containing multiple colors and fine details',
      },
      {
        title: 'Select Color Vision Type',
        description: 'Choose from different types of color blindness: Protanopia, Deuteranopia, Tritanopia, or Achromatopsia.',
        tip: 'Protanopia and Deuteranopia are the most common forms',
      },
      {
        title: 'View Simulation',
        description: 'See how your image appears through the selected color vision deficiency filter.',
        tip: 'The simulation shows how colorblind users perceive your content',
      },
      {
        title: 'Compare All Types',
        description: 'Switch between different color blindness types to understand various accessibility needs.',
        tip: 'Each type affects color perception differently',
      },
      {
        title: 'Make Accessibility Improvements',
        description: 'Use the insights to adjust colors, add patterns, or improve contrast for better accessibility.',
        tip: 'Consider adding text labels or patterns alongside colors',
      },
    ],
    tips: [
      'Always test with real colorblind users when possible',
      'Use high contrast ratios for text and important elements',
      'Avoid relying solely on color to convey important information',
      'Consider adding textures or patterns alongside colors',
      'Test with multiple color blindness types as they vary widely',
      'Use colorblind-friendly color palettes in your designs',
    ],
    relatedTools: ['color-palette-extractor', 'image-histogram-viewer', 'contrast-checker'],
  },

  'image-histogram-viewer': {
    title: 'How to Analyze Image Histograms',
    description: 'Understand color distribution, brightness levels, and exposure quality through histogram analysis.',
    difficulty: 'Intermediate',
    timeRequired: '5-10 minutes',
    steps: [
      {
        title: 'Upload Your Image',
        description: 'Click "Choose Image" and select a photo to analyze. The tool works with JPG, PNG, and other common formats.',
        tip: 'Works best with high-quality images that show a range of tones',
      },
      {
        title: 'View Histogram Display',
        description: 'Examine the RGB histogram showing the distribution of red, green, and blue channels.',
        tip: 'Each channel shows how pixels are distributed across brightness levels',
      },
      {
        title: 'Analyze Brightness Distribution',
        description: 'Look at the overall shape - spikes indicate predominant tones, gaps show missing information.',
        tip: 'A well-exposed image typically has data spread across the histogram',
      },
      {
        title: 'Check Channel Balance',
        description: 'Compare the three color channels to identify color casts or imbalances.',
        tip: 'Ideally, the channels should be well-balanced without extreme spikes',
      },
      {
        title: 'Identify Exposure Issues',
        description: 'Look for data clustered at the left (underexposed) or right (overexposed) edges.',
        tip: 'Clipping at either end indicates loss of detail in shadows or highlights',
      },
      {
        title: 'Apply Corrections',
        description: 'Use the histogram insights to make informed adjustments to exposure, contrast, or color balance.',
        tip: 'This tool helps you understand what photo editing software will show you',
      },
    ],
    tips: [
      'A histogram with data touching both sides indicates good dynamic range',
      'Spikes at the far left indicate underexposed areas with lost shadow detail',
      'Spikes at the far right indicate overexposed areas with lost highlight detail',
      'Gaps in the histogram show missing tonal information',
      'RGB channels should be roughly balanced for natural-looking images',
      'Use histograms to optimize exposure before editing',
    ],
    relatedTools: ['color-palette-extractor', 'image-upscaler', 'contrast-analyzer'],
  },

  'meme-generator': {
    title: 'How to Create Engaging Memes',
    description: 'Design hilarious and shareable memes with popular templates and custom text styling.',
    difficulty: 'Beginner',
    timeRequired: '5-8 minutes',
    steps: [
      {
        title: 'Choose a Template',
        description: 'Browse through popular meme templates or upload your own background image.',
        tip: 'Popular templates like "Distracted Boyfriend" or "This is Fine" work well',
      },
      {
        title: 'Add Top Text',
        description: 'Enter your top text in the designated field. Keep it short and punchy for maximum impact.',
        tip: 'Use ALL CAPS for traditional meme style, but experiment with different cases',
      },
      {
        title: 'Add Bottom Text',
        description: 'Enter your bottom text, which often delivers the punchline in classic meme format.',
        tip: 'Bottom text is typically the humorous twist or conclusion',
      },
      {
        title: 'Customize Text Styling',
        description: 'Adjust font size, color, and positioning. Add outlines or shadows for better readability.',
        tip: 'White text with black outlines provides the best contrast on busy backgrounds',
      },
      {
        title: 'Add Visual Elements',
        description: 'Include arrows, circles, or other graphics to highlight important parts of your meme.',
        tip: 'Use sparingly - too many elements can make the meme confusing',
      },
      {
        title: 'Preview and Adjust',
        description: 'Check how your meme looks and make final adjustments to text placement and styling.',
        tip: 'Test readability on different screen sizes',
      },
      {
        title: 'Download and Share',
        description: 'Save your meme in PNG or JPG format and share it across social media platforms.',
        tip: 'PNG preserves transparency, JPG is smaller for sharing',
      },
    ],
    tips: [
      'Keep text concise - memes should be readable in 3 seconds',
      'Use high-contrast text colors for better readability',
      'Popular meme formats have specific text placement expectations',
      'Timing is crucial - post when your audience is most active',
      'Test your meme on a small group before mass sharing',
      'Consider current trends and cultural relevance',
      'Quality images work better than low-resolution ones',
    ],
    relatedTools: ['custom-card-maker', 'image-to-cartoon', 'background-changer'],
  },

  'image-grid-maker': {
    title: 'How to Create Image Grids and Collages',
    description: 'Combine multiple images into professional-looking grids with uniform spacing and alignment.',
    difficulty: 'Beginner',
    timeRequired: '5-10 minutes',
    steps: [
      {
        title: 'Upload Multiple Images',
        description: 'Click "Choose Images" and select 2-12 images you want to combine into a grid.',
        tip: 'Images are automatically resized to fit the grid layout',
      },
      {
        title: 'Select Grid Layout',
        description: 'Choose from various grid options: 2x2, 3x3, 4x4, or custom aspect ratios.',
        tip: 'Consider your final output - square grids work well for Instagram, rectangular for other uses',
      },
      {
        title: 'Adjust Spacing and Margins',
        description: 'Set the spacing between images and margin around the entire grid.',
        tip: 'Minimal spacing creates a seamless look, larger spacing adds breathing room',
      },
      {
        title: 'Choose Background Color',
        description: 'Select a background color or use transparency for flexible usage.',
        tip: 'White or light gray backgrounds work well for most applications',
      },
      {
        title: 'Reorder Images',
        description: 'Drag and drop images within the grid to arrange them in your desired order.',
        tip: 'Consider visual flow - important images should be prominently placed',
      },
      {
        title: 'Set Output Size',
        description: 'Choose the final dimensions for your grid image.',
        tip: 'Common sizes: 1080x1080px for social media, 1920x1080px for presentations',
      },
      {
        title: 'Generate and Download',
        description: 'Click "Create Grid" and download your professional-looking image grid.',
        tip: 'PNG format preserves quality, JPG is smaller for web use',
      },
    ],
    tips: [
      'Use images of similar quality and style for cohesive grids',
      'Consider the rule of thirds when arranging your images',
      'Maintain consistent aspect ratios within each grid cell',
      'Test different layouts to find what works best for your content',
      'Grid layouts work well for portfolios, product showcases, and event photos',
      'Consider color coordination between adjacent images',
    ],
    relatedTools: ['image-resizer', 'image-format-converter', 'background-remover'],
  },

  'image-size-predictor': {
    title: 'How to Predict Image File Sizes',
    description: 'Estimate compressed file sizes and optimize images for web delivery before processing.',
    difficulty: 'Intermediate',
    timeRequired: '3-5 minutes',
    steps: [
      {
        title: 'Upload Your Image',
        description: 'Click "Choose Image" and select the file you want to analyze. Works with JPG, PNG, WebP, and other formats.',
        tip: 'The tool analyzes the current file and predicts compressed sizes',
      },
      {
        title: 'View Current File Info',
        description: 'See the current file size, dimensions, and format information.',
        tip: 'Understanding the starting point helps with optimization decisions',
      },
      {
        title: 'Select Target Format',
        description: 'Choose your desired output format: JPG, PNG, WebP, or AVIF.',
        tip: 'WebP and AVIF typically provide better compression than JPG',
      },
      {
        title: 'Set Quality Parameters',
        description: 'Adjust quality settings and see real-time size predictions.',
        tip: 'Quality settings affect file size dramatically - find the sweet spot',
      },
      {
        title: 'Configure Dimensions',
        description: 'Set target width/height or use percentage scaling.',
        tip: 'Reducing dimensions has a huge impact on file size',
      },
      {
        title: 'Review Size Predictions',
        description: 'See estimated file sizes for different compression settings.',
        tip: 'Use this to optimize for specific use cases (web, print, email)',
      },
      {
        title: 'Apply Optimal Settings',
        description: 'Use the insights to configure your image processing for the best size/quality balance.',
        tip: 'Consider your target audience and connection speeds',
      },
    ],
    tips: [
      'File size decreases exponentially as you reduce quality settings',
      'WebP format typically reduces file size by 25-50% compared to JPG',
      'Reducing dimensions by 50% reduces file size by about 75%',
      'Consider your use case - thumbnails need smaller files than hero images',
      'Test different settings to find the best quality/size balance',
      'Always compare visual quality when optimizing file sizes',
    ],
    relatedTools: ['image-compressor', 'image-resizer', 'image-format-converter'],
  },

  'infographic-creator': {
    title: 'How to Create Stunning Infographics',
    description: 'Design professional infographics with charts, text, and data visualization elements.',
    difficulty: 'Intermediate',
    timeRequired: '15-25 minutes',
    steps: [
      {
        title: 'Choose Template or Start Blank',
        description: 'Select from pre-designed infographic templates or start with a blank canvas.',
        tip: 'Templates provide structure, but custom designs offer more creativity',
      },
      {
        title: 'Set Canvas Dimensions',
        description: 'Choose appropriate dimensions based on your intended use (social media, print, web).',
        tip: 'Common sizes: 1080x1920px for stories, 1200x630px for social sharing',
      },
      {
        title: 'Add Background Elements',
        description: 'Upload or select background images, gradients, or solid colors.',
        tip: 'Use subtle backgrounds that don\'t compete with your data',
      },
      {
        title: 'Create Charts and Graphs',
        description: 'Add bar charts, pie charts, line graphs, or other data visualizations.',
        tip: 'Keep charts simple - complex charts can confuse viewers',
      },
      {
        title: 'Add Text Elements',
        description: 'Include headlines, body text, and call-to-action text with appropriate styling.',
        tip: 'Use hierarchy - larger fonts for headlines, smaller for details',
      },
      {
        title: 'Incorporate Icons and Graphics',
        description: 'Add relevant icons, illustrations, or decorative elements to enhance visual appeal.',
        tip: 'Use icons sparingly and consistently throughout the design',
      },
      {
        title: 'Review Layout and Flow',
        description: 'Ensure logical information flow from top to bottom, left to right.',
        tip: 'Most people read infographics like a story - guide them through your data',
      },
      {
        title: 'Export Final Design',
        description: 'Download your infographic in high-resolution format for sharing and printing.',
        tip: 'Use PNG for web sharing, PDF for print, JPG for email',
      },
    ],
    tips: [
      'Focus on one key message per infographic',
      'Use high-contrast colors for readability',
      'Limit text to essential information only',
      'Include data sources for credibility',
      'Test readability at different sizes',
      'Use consistent fonts and colors throughout',
      'Consider your audience\'s knowledge level when presenting data',
    ],
    relatedTools: ['meme-generator', 'custom-card-maker', 'image-grid-maker'],
  },

  'perspective-correction': {
    title: 'How to Correct Image Perspective',
    description: 'Fix tilted horizons, keystoning, and perspective distortion in architectural and landscape photos.',
    difficulty: 'Intermediate',
    timeRequired: '8-12 minutes',
    steps: [
      {
        title: 'Upload Your Image',
        description: 'Click "Choose Image" and select a photo with perspective distortion, such as buildings or landscapes.',
        tip: 'Works best with images containing straight lines or geometric elements',
      },
      {
        title: 'Identify Reference Lines',
        description: 'Look for straight lines in your image that should be horizontal or vertical (like building edges or horizons).',
        tip: 'The tool automatically detects these lines, but you can adjust if needed',
      },
      {
        title: 'Set Correction Mode',
        description: 'Choose between automatic correction or manual adjustment using control points.',
        tip: 'Automatic mode works well for most architectural photos',
      },
      {
        title: 'Adjust Control Points (Manual Mode)',
        description: 'Drag the corner points to align with the desired perspective correction.',
        tip: 'Imagine where the lines should be if the perspective was perfect',
      },
      {
        title: 'Preview the Correction',
        description: 'See how the image looks with the applied perspective correction before finalizing.',
        tip: 'Check that straight lines appear straight and proportions look natural',
      },
      {
        title: 'Crop and Refine',
        description: 'Crop out any transparent areas created by the transformation.',
        tip: 'You may need to crop slightly to remove edge artifacts',
      },
      {
        title: 'Download Corrected Image',
        description: 'Save your perspective-corrected image in your preferred format.',
        tip: 'JPG is usually sufficient unless you need transparency',
      },
    ],
    tips: [
      'Shoot with the camera level to minimize needed corrections',
      'Include straight reference lines in your composition',
      'Avoid extreme angles that require heavy correction',
      'Check the histogram after correction for any exposure issues',
      'Use this tool before applying other edits for best results',
      'Consider lens correction in camera settings when possible',
      'Practice on test shots to understand the correction limits',
    ],
    relatedTools: ['image-resizer', 'image-upscaler', 'contrast-enhancer'],
  },

  'panorama-stitcher': {
    title: 'How to Create Panoramic Images',
    description: 'Combine multiple overlapping photos into seamless panoramic images with professional stitching.',
    difficulty: 'Intermediate',
    timeRequired: '10-15 minutes',
    steps: [
      {
        title: 'Capture Source Images',
        description: 'Take multiple overlapping photos (30-50% overlap) while rotating around a central point.',
        tip: 'Use a tripod for best results, keep exposure and focus consistent',
      },
      {
        title: 'Upload Images in Order',
        description: 'Click "Choose Images" and select your panorama sequence in shooting order (left to right or right to left).',
        tip: 'The tool automatically detects the correct sequence, but manual ordering helps',
      },
      {
        title: 'Wait for Analysis',
        description: 'The AI analyzes overlapping areas and identifies matching features between images.',
        tip: 'This process typically takes 1-2 minutes depending on image count and complexity',
      },
      {
        title: 'Review Stitching Preview',
        description: 'Check the automatic stitching result and make adjustments if needed.',
        tip: 'Look for seamless transitions and proper alignment',
      },
      {
        title: 'Adjust Blend Settings',
        description: 'Fine-tune exposure blending and color matching between images.',
        tip: 'The tool automatically handles exposure differences, but you can override',
      },
      {
        title: 'Crop Final Panorama',
        description: 'Crop the stitched image to remove any edge artifacts or unwanted areas.',
        tip: 'Panoramas often have irregular shapes that benefit from cropping',
      },
      {
        title: 'Export High-Resolution Result',
        description: 'Download your panoramic image in high resolution for printing or web use.',
        tip: 'Use TIFF for maximum quality, JPG for web sharing',
      },
    ],
    tips: [
      'Shoot with consistent exposure and white balance',
      'Overlap images by at least 30% for reliable stitching',
      'Use a tripod to avoid parallax errors',
      'Shoot in manual mode to maintain consistent settings',
      'Avoid moving objects that appear in multiple frames',
      'Include reference points in overlapping areas',
      'Shoot during golden hour for best lighting consistency',
      'Process bracketed exposures separately if needed',
    ],
    relatedTools: ['image-resizer', 'perspective-correction', 'image-format-converter'],
  },

  'speed-changer': {
    title: 'How to Change Video Speed (Speed Changer Pro)',
    description: 'Adjust video playback speed while maintaining audio pitch for natural-sounding results.',
    difficulty: 'Beginner',
    timeRequired: '5-8 minutes',
    steps: [
      {
        title: 'Upload Your Video',
        description: 'Click "Choose Video File" and select the video you want to speed up or slow down.',
        tip: 'Supported formats: MP4, AVI, MOV, WebM (max 500MB recommended)',
      },
      {
        title: 'Select Speed Preset',
        description: 'Choose from common presets (0.5x, 0.75x, 1.25x, 1.5x, 2x) or set a custom speed.',
        tip: '0.5x creates slow motion, 2x creates time-lapse effects',
      },
      {
        title: 'Enable Audio Pitch Correction',
        description: 'Keep "Maintain Audio Pitch" enabled for natural-sounding results, or disable for special effects.',
        tip: 'Pitch correction prevents "chipmunk" voices when speeding up',
      },
      {
        title: 'Preview Speed Change',
        description: 'Watch a short preview to see how the speed change affects your video.',
        tip: 'Previews help you choose the perfect speed before full processing',
      },
      {
        title: 'Apply Voice Effects (Optional)',
        description: 'Add voice effects like Robot, Echo, or Reverb to enhance your video.',
        tip: 'Use effects sparingly - they work best when intentional',
      },
      {
        title: 'Start Processing',
        description: 'Click "Change Speed" and wait for the AI to process your video with speed and pitch adjustments.',
        tip: 'Processing time depends on video length and speed change amount',
      },
      {
        title: 'Download Processed Video',
        description: 'Save your speed-adjusted video in MP4 format for sharing or further editing.',
        tip: 'Videos maintain original quality and sync between audio and video',
      },
    ],
    tips: [
      'Speed changes between 0.5x-2x work best for natural results',
      'Very slow speeds (0.25x) may require audio pitch correction adjustments',
      'Test different speeds to find the right pacing for your content',
      'Consider your audience - faster speeds work well for tutorials, slower for dramatic effect',
      'Maintain consistent audio quality by using the pitch correction feature',
      'Use speed changes to emphasize important moments in your video',
      'Preview before full processing to avoid re-rendering',
    ],
    relatedTools: ['video-trimmer', 'clip-joiner', 'subtitle-burner'],
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-16">
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
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
