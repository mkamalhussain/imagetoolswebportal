import type { ToolContent } from "./types";

export const videoToolContent: Record<string, ToolContent> = {
  "video-trimmer": {
    overview:
      "The Short Video Trimmer cuts a video down to the exact segment you want to keep. Social media creators use it to size clips for TikTok, Reels, and Shorts, editors remove dead time from screen recordings, and anyone can shorten a large file without installing editing software. Upload a video, scrub the timeline to find your cut points, fine-tune them with start and end time inputs and frame step buttons, choose an export format and quality, then download the result. Everything runs on your own device in the browser — the video is never uploaded to a server, so private footage stays private.",
    features: [
      "Timeline scrubber with draggable start and end markers",
      "Frame-accurate start and end time inputs",
      "Frame step buttons for exact frame-by-frame control",
      "Export as MP4, WebM, or MOV with quality presets",
      "Keyboard shortcuts for play, frame step, and markers",
      "Real-time processing progress with instant download",
    ],
    steps: [
      {
        title: "Choose your video file",
        text: "Click \"Choose Video File\" and select an MP4, AVI, MOV, or WebM video, with 500MB recommended for smooth processing.",
      },
      {
        title: "Scrub the timeline",
        text: "Play the video and drag the markers on the timeline scrubber to find your cut points.",
      },
      {
        title: "Set precise start and end times",
        text: "Type exact values into the start and end time inputs, or use the frame step buttons for frame-accurate trimming.",
      },
      {
        title: "Pick export format and quality",
        text: "Select MP4 (H.264), WebM (VP9), or MOV (H.264), then choose a quality preset such as High Quality or Smaller File.",
      },
      {
        title: "Trim and download",
        text: "Click \"Trim and Download\" and watch the real-time progress bar until your trimmed video is ready to save.",
      },
    ],
    useCases: [
      "A creator trims a 3-minute take down to 45 seconds for a TikTok post.",
      "A teacher cuts dead time from the start and end of a recorded lecture.",
      "A marketer shortens a product demo to fit a 60-second ad slot.",
      "A gamer clips a highlight from a full-length gameplay recording.",
      "Someone reduces a large video file before sending it to a colleague.",
    ],
    faqs: [
      {
        q: "Where does my video go when I trim it?",
        a: "Nowhere — trimming happens entirely in your browser. Your video file is never uploaded to any server, and the trimmed result downloads straight to your device.",
      },
      {
        q: "What formats and file sizes are supported?",
        a: "You can upload MP4, AVI, MOV, and WebM files, with 500MB recommended for smooth processing. Trimmed videos can be exported as MP4 (H.264), WebM (VP9), or MOV (H.264).",
      },
      {
        q: "Is the Short Video Trimmer free to use?",
        a: "Yes, it is completely free with no signup or account required. There are no usage limits, so you can trim as many videos as you like.",
      },
    ],
  },
  "clip-joiner": {
    overview:
      "The Clip Joiner Tool merges multiple video clips into one continuous video. Vloggers stitch separate scenes into a single episode, editors assemble rough cuts from interview segments, and families combine vacation footage without installing a full video editor. Upload all your clips at once, arrange them with drag and drop or the arrow buttons, trim individual clips with the scissors icon, then choose the output format, quality, and optional transitions before joining. All merging happens locally in your browser: your clips are processed on your own device and never uploaded to a server, so personal footage stays in your hands.",
    features: [
      "Upload multiple video clips at once",
      "Drag and drop or arrow buttons to reorder clips",
      "Trim individual clips with the scissors icon",
      "Fade and Crossfade transition effects between clips",
      "MP4 or WebM output with three quality levels",
      "Automatic clip normalization for smooth merging",
    ],
    steps: [
      {
        title: "Upload your clips",
        text: "Select multiple video files at once; keep the total size under 500MB for the fastest processing.",
      },
      {
        title: "Arrange the clip order",
        text: "Drag and drop clips into place, or use the up and down arrow buttons to reorder the sequence.",
      },
      {
        title: "Trim clips if needed",
        text: "Click the scissors icon on any clip to adjust its start and end points before merging.",
      },
      {
        title: "Set output and transitions",
        text: "Choose MP4 or WebM, pick a High, Medium, or Low quality level, and optionally add Fade or Crossfade transitions.",
      },
      {
        title: "Join and download",
        text: "Click \"Join and Download\" and monitor the progress bar as your clips are processed and merged into one video.",
      },
    ],
    useCases: [
      "A vlogger stitches five separate scenes into one complete episode.",
      "An editor assembles interview segments into a single rough cut.",
      "A parent merges clips from a school recital into one video to share.",
      "A real estate agent combines room walkthroughs into a continuous tour.",
      "A coach joins drill recordings from multiple camera angles for review.",
    ],
    faqs: [
      {
        q: "Are my clips uploaded anywhere to be joined?",
        a: "No. All merging happens locally in your browser on your own device. Your clips never leave your computer, and no copy is stored on any server.",
      },
      {
        q: "How many clips can I join at once?",
        a: "You can add as many clips as you like in one session, though keeping the total under 500MB gives the fastest processing. All clips are normalized automatically so different sources merge cleanly.",
      },
      {
        q: "Do I need an account to join videos?",
        a: "No account or signup is needed, and the tool is completely free. Just open the page, add your clips, and download the merged video.",
      },
    ],
  },
  "gif-maker": {
    overview:
      "The GIF Maker from Video turns a segment of any video into an animated GIF. Social media users, forum posters, and content teams use it to capture reactions, product moments, and short loops that play anywhere without a video player. Upload a video, choose the start and end times for the moment you want, then adjust frame rate, quality, visual style, text overlays, and aspect ratio before generating. A quick preview shows roughly two seconds so you can check your settings first. Processing happens entirely in your browser on your own device — the video is never uploaded to a server, so anything you convert stays private.",
    features: [
      "Trim video segments with start and end times",
      "Frame rate control from 5 to 30 FPS",
      "Quality settings from 50 to 95 percent",
      "Six visual styles including Cinematic and Vintage",
      "Text overlays with custom fonts, colors, and position",
      "Aspect ratios from 16:9 to vertical 9:16",
    ],
    steps: [
      {
        title: "Choose your video file",
        text: "Click \"Choose Video File\" and pick an MP4, AVI, MOV, or other common video format under 500MB.",
      },
      {
        title: "Select the time segment",
        text: "Set the start and end times to capture the moment you want, keeping it under 15 seconds for a manageable file size.",
      },
      {
        title: "Tune frame rate and quality",
        text: "Adjust the frame rate between 5 and 30 FPS and the quality between 50 and 95 percent; 15 FPS balances smoothness and size.",
      },
      {
        title: "Add styles, text, and ratio",
        text: "Pick a visual style such as Normal, Cinematic, or Vintage, add optional text overlays, and choose an aspect ratio like Square (1:1) or Vertical (9:16).",
      },
      {
        title: "Preview and generate",
        text: "Click \"Preview GIF\" to check a short preview, then \"Generate GIF\" and wait for processing to finish.",
      },
    ],
    useCases: [
      "A social media manager turns a product demo moment into a looping GIF for a post.",
      "A gamer captures a funny reaction clip from a stream highlight.",
      "A support team creates a short GIF showing how to complete a key step.",
      "A teacher converts a science experiment clip into a GIF for a slide.",
      "A forum user shares a reaction GIF made from a favorite show clip.",
    ],
    faqs: [
      {
        q: "Does my video get uploaded to make a GIF?",
        a: "No. The conversion runs entirely in your browser, so the video file never leaves your device. Nothing is sent to or stored on any server.",
      },
      {
        q: "What settings keep GIF file sizes reasonable?",
        a: "Keep the segment under 15 seconds and use around 15 FPS with a quality setting between 50 and 95 percent. Longer clips, higher frame rates, and higher quality all increase the final file size.",
      },
      {
        q: "Is this GIF maker free without signup?",
        a: "Yes, it is completely free and requires no account, signup, or subscription. You can convert as many videos as you want, whenever you want.",
      },
    ],
  },
  "speed-changer": {
    overview:
      "Speed Changer Pro adjusts the playback speed of a video, making it slower for dramatic effect or faster to save viewing time, while keeping the audio pitch natural. Tutorial makers use it to condense long demonstrations, coaches slow footage to analyze technique, and creators use it for time-lapse style content. Upload a video, pick a preset such as 0.5x or 2x or set a custom speed, keep Maintain Audio Pitch enabled to avoid chipmunk voices, optionally add a voice effect, then process and download an MP4. Everything happens on your own device: the video is processed locally in your browser and is never uploaded to any server.",
    features: [
      "Preset speeds from 0.5x to 2x",
      "Custom speed control from 0.25x to 4x",
      "Maintain Audio Pitch for natural-sounding voices",
      "Voice effects including Robot, Echo, and Reverb",
      "Preview your speed change before processing",
      "Exports the adjusted video as MP4",
    ],
    steps: [
      {
        title: "Choose your video file",
        text: "Click \"Choose Video File\" and select an MP4, AVI, MOV, or WebM video, with 500MB recommended for smooth processing.",
      },
      {
        title: "Select a speed preset",
        text: "Choose a preset such as 0.5x, 0.75x, 1.25x, 1.5x, or 2x, or set a custom speed between 0.25x and 4x.",
      },
      {
        title: "Enable pitch correction",
        text: "Keep Maintain Audio Pitch enabled so voices stay natural at higher or lower speeds.",
      },
      {
        title: "Preview and add effects",
        text: "Watch the preview to confirm the pacing, and optionally apply a Robot, Echo, or Reverb voice effect.",
      },
      {
        title: "Process and download",
        text: "Click \"Change Speed\" to start processing, then save your speed-adjusted MP4 when it finishes.",
      },
    ],
    useCases: [
      "A tutorial creator doubles a 20-minute walkthrough so viewers finish in 10 minutes.",
      "A coach slows match footage to 0.5x to analyze player technique.",
      "A traveler compresses a long scenic recording into a fast time-lapse clip.",
      "A podcaster speeds up interview segments without chipmunk-sounding voices.",
      "A marketer creates a slow-motion product reveal for a launch video.",
    ],
    faqs: [
      {
        q: "Is my video uploaded to change its speed?",
        a: "No, all processing happens locally in your browser on your own device. The video file is never uploaded to a server, and the finished MP4 downloads directly to you.",
      },
      {
        q: "What speeds and formats does it support?",
        a: "You can choose presets from 0.5x to 2x or set a custom speed between 0.25x and 4x. Videos up to 500MB in MP4, AVI, MOV, or WebM format work best, and the result is saved as MP4.",
      },
      {
        q: "Does Speed Changer Pro cost anything?",
        a: "No, it is completely free with no signup, account, or subscription. You can adjust as many videos as you like without paying.",
      },
    ],
  },
  "subtitle-burner": {
    overview:
      "The Subtitle Burner permanently embeds SRT subtitles into a video file, writing the text into every frame so it cannot be turned off or lost. Video editors use it for platforms without subtitle track support, teachers add translated captions for students, and creators make content accessible to deaf and hard-of-hearing viewers. Upload a video and its matching SRT file, select the correct character encoding, style the font, size, color, and outline, position the text, and preview the first 10 seconds before burning. The entire process runs in your browser: your video and subtitle files are processed on your own device and are never uploaded to any server.",
    features: [
      "Burns SRT subtitles permanently into the video",
      "Encoding options including UTF-8 and Windows-1252",
      "Font, size, color, and outline customization",
      "Classic, Modern, and Bold style presets",
      "Bottom, top, or middle positioning with three alignments",
      "Ten-second preview before processing the full video",
    ],
    steps: [
      {
        title: "Upload video and SRT file",
        text: "Select your video and its matching SRT subtitle file; MP4, AVI, MOV, and WebM videos are supported.",
      },
      {
        title: "Select character encoding",
        text: "Choose the encoding that matches your SRT file, such as UTF-8, Windows-1252, or ISO-8859-1, so the text renders correctly.",
      },
      {
        title: "Style your subtitles",
        text: "Set the font family, size, color, and outline, or apply a Classic, Modern, or Bold preset.",
      },
      {
        title: "Set position and alignment",
        text: "Use the position controls to place subtitles at the bottom, top, or middle, aligned left, center, or right.",
      },
      {
        title: "Preview, then burn",
        text: "Click \"Generate Preview\" to check the first 10 seconds, then \"Burn Subtitles & Download\" to process the full video.",
      },
    ],
    useCases: [
      "An editor hardcodes English subtitles into a film before submitting to a festival portal.",
      "A teacher burns translated captions into lesson videos for multilingual students.",
      "A creator adds permanent captions so viewers can watch with the sound off.",
      "A business embeds subtitles into training videos for accessibility compliance.",
      "A podcaster captions an interview clip before sharing it on social media.",
    ],
    faqs: [
      {
        q: "Where do my video and subtitle files go?",
        a: "They stay on your device. The burning process runs entirely in your browser, so neither file is uploaded to a server, and the finished video downloads straight to you.",
      },
      {
        q: "Which video and subtitle formats are supported?",
        a: "The tool accepts MP4, AVI, MOV, and WebM videos together with SRT subtitle files. If your subtitles appear as gibberish, switching the encoding to Windows-1252 usually fixes it.",
      },
      {
        q: "Can I burn subtitles for free?",
        a: "Yes, the Subtitle Burner is completely free and requires no signup or account. You can subtitle as many videos as you need without any charge.",
      },
    ],
  },
  "frame-grabber": {
    overview:
      "The Frame Grabber pulls still images out of a video, either one frame at a time or automatically at set intervals. YouTubers use it for thumbnail images, analysts extract frames for review, and designers pull reference stills from footage. Upload a video, set the interval between frames, the maximum number of frames, and the output format, then capture a single frame manually or run the automatic extraction to build a gallery. Each captured frame can be downloaded individually or together as a ZIP. Everything runs locally in your browser on your own device — the video is never uploaded to a server, so sensitive footage stays private.",
    features: [
      "Automatic extraction at custom second intervals",
      "Manual capture of the current frame",
      "PNG, JPG, or WebP output with quality control",
      "Maximum frame count to limit extraction",
      "Gallery view with timestamp for each frame",
      "Download frames individually or as a ZIP",
    ],
    steps: [
      {
        title: "Choose your video file",
        text: "Click \"Choose Video File\" and select an MP4, AVI, MOV, or WebM video up to 500MB.",
      },
      {
        title: "Set extraction options",
        text: "Choose the interval between frames in seconds, the maximum number of frames, and the output format: PNG, JPG, or WebP.",
      },
      {
        title: "Capture frames",
        text: "Use \"Capture Current Frame\" to grab a specific moment, or click \"Auto Extract Frames\" to capture at your set intervals.",
      },
      {
        title: "Review the frame gallery",
        text: "Browse the extracted frames in the gallery, where each image shows its timestamp and format.",
      },
      {
        title: "Download your frames",
        text: "Save frames one by one, or use \"Download All\" to get every extracted frame as a ZIP file.",
      },
    ],
    useCases: [
      "A YouTuber pulls a sharp still from gameplay footage for a thumbnail.",
      "A sports analyst extracts frames at one-second intervals to study form.",
      "A designer captures reference frames from an old clip for a mood board.",
      "A researcher documents changes over time with frames from a timelapse video.",
      "A teacher grabs key frames from a documentary for classroom handouts.",
    ],
    faqs: [
      {
        q: "Is my video uploaded to extract frames?",
        a: "No. Frame extraction runs entirely in your browser on your own device. The video is never sent to a server, and the extracted images download directly to you.",
      },
      {
        q: "What formats and limits does Frame Grabber support?",
        a: "It accepts MP4, AVI, MOV, and WebM videos up to 500MB and exports frames as PNG, JPG, or WebP. You control the interval in seconds and the maximum number of frames extracted.",
      },
      {
        q: "Do I need to sign up to grab frames?",
        a: "No signup or account is required, and the tool is completely free. Extract frames from as many videos as you like.",
      },
    ],
  },
  "audio-stripper": {
    overview:
      "The Audio Stripper removes the audio track from a video file and saves it as a standalone audio file. Podcasters use it to rescue interview audio, musicians sample sounds from footage, and students pull lecture audio to listen on the go. Upload any video with a soundtrack, choose an output format — MP3, AAC, WAV, or FLAC — set the bitrate, sample rate, and channels, and optionally normalize volume, remove silence, or trim the start and end. Click the extract button and the audio downloads automatically. The whole conversion happens on your own device in the browser: the video is never uploaded to a server, and nothing is stored online.",
    features: [
      "Extracts audio from MP4, AVI, MOV, and WebM videos",
      "Saves audio as MP3, AAC, WAV, or FLAC",
      "Adjustable bitrate and sample rate settings",
      "Mono or stereo channel selection",
      "Volume normalization, silence removal, and trim points",
      "Automatic download when extraction completes",
    ],
    steps: [
      {
        title: "Choose your video file",
        text: "Click \"Choose Video File\" and select an MP4, AVI, MOV, or WebM video that contains the audio you want.",
      },
      {
        title: "Pick format and quality",
        text: "Choose MP3, AAC, WAV, or FLAC, then set the bitrate and sample rate — MP3 at 192kbps suits most music and speech.",
      },
      {
        title: "Set channels and processing",
        text: "Select Mono or Stereo, choose a sample rate such as 44.1kHz, and enable normalization, silence removal, or trim points if needed.",
      },
      {
        title: "Extract and download",
        text: "Click \"Extract Audio & Download\" and watch the progress bar; your audio file downloads automatically when finished.",
      },
    ],
    useCases: [
      "A podcaster pulls the audio from a video interview recorded on a phone.",
      "A student saves a lecture video's audio to listen during a commute.",
      "A musician extracts a song performance from concert footage.",
      "A journalist archives the audio from a press conference video.",
      "A language learner converts a subtitled video into an audio file for practice.",
    ],
    faqs: [
      {
        q: "Where does my video go during audio extraction?",
        a: "It never leaves your device. Extraction runs entirely in your browser, so the video is not uploaded to any server and the audio file downloads directly to you.",
      },
      {
        q: "Which audio formats can I export?",
        a: "You can save the extracted audio as MP3, AAC, WAV, or FLAC, with MP3 at 192kbps working well for most uses. FLAC is the choice when you need lossless quality.",
      },
      {
        q: "Is the Audio Stripper free to use?",
        a: "Yes, it is completely free with no signup, account, or subscription required. You can extract audio from as many videos as you want.",
      },
    ],
  },
};
