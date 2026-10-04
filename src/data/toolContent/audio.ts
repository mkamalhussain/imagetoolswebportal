import type { ToolContent } from "./types";

export const audioToolContent: Record<string, ToolContent> = {
  "podcast-clip-cutter": {
    overview:
      "The Podcast Clip Cutter trims audio files by start and end time so podcasters, radio editors, and content marketers can pull short highlights out of long episodes. You upload a recording, view the waveform, and drag the start and end markers on the timeline, or fine-tune the selection with the Start Time and End Time controls. The Preview Trim button lets you check the cut before you export. Click Trim & Download and the finished clip saves to your device. Everything runs in your browser using the Web Audio API: your files are processed locally and never uploaded to a server, so unaired episodes and private recordings stay on your machine.",
    features: [
      "Trim audio with draggable start and end markers",
      "Fine-tune cut points with Start Time and End Time controls",
      "Preview the trimmed selection before exporting",
      "Fade in/out effects smooth rough cut transitions",
      "Export with format, quality, and normalization options",
      "MP3 at 192kbps recommended for podcast distribution",
    ],
    steps: [
      {
        title: "Upload Your Audio File",
        text: "Select your podcast episode or recording with the file picker. MP3, WAV, M4A, and other common audio formats are supported.",
      },
      {
        title: "Set Start and End Points",
        text: "Drag the start and end markers on the timeline, or use the Start Time and End Time controls to fine-tune the selection.",
      },
      {
        title: "Preview the Trim",
        text: "Click Preview Trim to listen to the selected segment and confirm the cut points sound clean.",
      },
      {
        title: "Apply Fade Effects",
        text: "Add fade in/out to smooth the transitions at the cut points. A fade of 0.5 to 2 seconds works well for most clips.",
      },
      {
        title: "Trim and Download",
        text: "Click Trim & Download to process the clip and save it to your device in your chosen format and quality.",
      },
    ],
    useCases: [
      "A podcaster cuts a 60-second highlight from a two-hour interview to share on social media.",
      "A radio producer trims dead air and mistakes from a recorded segment before broadcast.",
      "A content marketer pulls quotable moments from a webinar recording for promo clips.",
      "A student trims a recorded lecture down to the section they need to review.",
      "A musician extracts a short excerpt from a rehearsal recording to send to bandmates.",
    ],
    faqs: [
      {
        q: "Where does my audio go when I use this tool?",
        a: "Nowhere. The cutting is done entirely in your browser with the Web Audio API, and your file is never uploaded to a server. The trimmed clip is saved directly to your own device.",
      },
      {
        q: "What audio formats can I cut with this tool?",
        a: "MP3, WAV, M4A, and other standard formats your browser can decode are supported. You can choose the output format and quality, and MP3 at 192kbps is a solid choice for podcast clips.",
      },
      {
        q: "Is the Podcast Clip Cutter free to use?",
        a: "Yes, it is completely free with no signup, account, or watermark. There are no usage limits, and your files stay private on your device.",
      },
    ],
  },
  "multi-track-mixer": {
    overview:
      "The Multi-Track Mixer combines several audio files into one balanced stereo or mono mix. Podcasters, musicians, and video producers use it to layer voiceover over music, blend separately recorded stems, or assemble a rough mix without installing a full DAW. Each uploaded file becomes a track with its own volume slider, pan control, mute and solo buttons, and start time offset, while level meters warn you when the output is clipping. When the balance sounds right, you render a single MP3 or WAV file. All mixing happens locally in your browser through the Web Audio API, so none of your tracks are uploaded and client material and demos remain private.",
    features: [
      "Mix multiple audio tracks into one file",
      "Per-track volume sliders with level meters",
      "Stereo panning, mute, and solo controls",
      "Start time offsets align tracks precisely",
      "Export mixes as MP3 or WAV",
      "Fade in/out effects for smooth transitions",
    ],
    steps: [
      {
        title: "Upload Your Audio Tracks",
        text: "Add each audio file you want to combine. Every file loads as a separate track in the mixer.",
      },
      {
        title: "Balance Track Levels",
        text: "Use the volume sliders to set each track's level and watch the level meters to keep the overall mix below 0dB and avoid clipping.",
      },
      {
        title: "Pan and Arrange Tracks",
        text: "Use the pan controls for stereo placement and the start time controls to line tracks up. Mute or solo tracks to check individual parts.",
      },
      {
        title: "Configure the Output",
        text: "Choose MP3 or WAV output, set the quality, and decide whether the final mix should be stereo or mono.",
      },
      {
        title: "Mix and Download",
        text: "Click Mix to MP3 or Mix to WAV to render the combined track and download it to your device.",
      },
    ],
    useCases: [
      "A podcaster blends an intro music bed under their spoken voiceover for a finished-sounding episode.",
      "A musician layers a guitar part, bass line, and drum track recorded separately into one demo.",
      "A video editor prepares a mixed audio bed of sound effects and music before importing it into an edit.",
      "A language teacher combines dialogue tracks and a music cue for a classroom listening exercise.",
      "A choir director merges individual section recordings into a single reference mix.",
    ],
    faqs: [
      {
        q: "Are my tracks uploaded anywhere during mixing?",
        a: "No. Mixing runs entirely in your browser with the Web Audio API, and your audio files never leave your device. The rendered mix downloads straight to your computer.",
      },
      {
        q: "What formats can I mix and export?",
        a: "You can load standard browser-supported audio such as MP3, WAV, and M4A. The finished mix can be exported as MP3 for smaller files or WAV for maximum quality.",
      },
      {
        q: "Do I need an account or subscription to mix tracks?",
        a: "No. The mixer is completely free with no signup and no watermarks, and you can mix as many sessions as you like.",
      },
    ],
  },
  "speed-pitch-adjuster": {
    overview:
      "The Speed/Pitch Adjuster changes how fast an audio file plays and shifts its pitch independently, so speech slows down or speeds up without the usual draggy or chipmunk voice effects. Transcribers, language learners, musicians, and podcast editors use it to make speech easier to follow or to match a backing track to a singer's range. Load a file, set playback speed between 0.5x and 2x, adjust pitch in semitones or pick a preset effect, then preview the result before downloading the processed audio. All processing runs locally in your browser with the Web Audio API, and your file is never uploaded, so interviews, practice takes, and private recordings stay on your device.",
    features: [
      "Adjust playback speed from 0.5x to 2x",
      "Shift pitch independently in semitones",
      "Quick presets for common speed and pitch combinations",
      "Voice and creative effect presets",
      "Real-time preview with before/after comparison",
      "Downloads the processed audio to your device",
    ],
    steps: [
      {
        title: "Upload Your Audio File",
        text: "Click Choose Audio File and select the recording you want to modify. Duration and file size are shown once it loads.",
      },
      {
        title: "Pick a Preset or Set Values",
        text: "Use the Quick Presets, Voice Effects, or Creative Effects buttons for one-click settings, or move the Speed and Pitch sliders manually.",
      },
      {
        title: "Fine-Tune Speed and Pitch",
        text: "Set playback speed anywhere from 0.5x to 2x and shift pitch in semitones independently of the speed.",
      },
      {
        title: "Preview the Changes",
        text: "Use the built-in preview to compare the original and processed audio before committing to your settings.",
      },
      {
        title: "Download the Result",
        text: "Process the file, then download the adjusted audio from the Processed Audio section to your device.",
      },
    ],
    useCases: [
      "A transcriptionist slows an interview recording to 0.75x to catch every word accurately.",
      "A language learner reduces playback speed to practice listening without changing the speaker's voice.",
      "A musician shifts a backing track by a few semitones to match their vocal range.",
      "A podcast editor speeds up a long episode to 1.5x for a quick review pass.",
      "A content creator applies a voice effect preset for a character voice in a short skit.",
    ],
    faqs: [
      {
        q: "Is my audio uploaded to a server for processing?",
        a: "No. All speed and pitch processing runs in your browser using the Web Audio API. Your file never leaves your device and the result downloads locally.",
      },
      {
        q: "What speed and pitch ranges are supported?",
        a: "Playback speed can be set from 0.5x to 2x. Pitch can be shifted independently in semitones, so you can change one without affecting the other.",
      },
      {
        q: "Does this tool cost anything or require signup?",
        a: "No. It is completely free to use with no account, no subscription, and no watermarks on your output.",
      },
    ],
  },
  "noise-cleaner": {
    overview:
      "The Noise Cleaner Tool removes background noise — hiss, hum, wind, and general room noise — from audio recordings. Podcasters, interviewers, and voiceover artists use it to rescue takes recorded in imperfect spaces. Upload a file, choose a noise type or let Auto-detect analyze it, set the cleaning intensity from 10% to 100%, and pick an algorithm such as Spectral Subtraction or Combined. A before/after preview lets you confirm the speech still sounds natural, and then you download the cleaned file. All processing runs locally in your browser using the Web Audio API; your recording is never uploaded to a server, which matters when source material is confidential or embargoed.",
    features: [
      "Auto-detect or choose hiss, hum, wind, background noise",
      "Cleaning intensity adjustable from 10% to 100%",
      "Algorithms: Spectral Subtraction, High-Pass, Adaptive, Combined",
      "Before and after audio comparison",
      "Play cleaned preview before downloading",
      "Downloads cleaned audio as a new file",
    ],
    steps: [
      {
        title: "Upload Your Audio File",
        text: "Select the recording you want to clean. MP3, WAV, M4A, and similar formats are supported.",
      },
      {
        title: "Choose the Noise Type",
        text: "Pick Auto-detect, Hiss, Hum, Wind, or Background noise, depending on what you hear in the recording.",
      },
      {
        title: "Set Intensity and Algorithm",
        text: "Move the intensity slider between 10% and 100% and select an algorithm such as Spectral Subtraction or Combined.",
      },
      {
        title: "Preview the Cleaned Audio",
        text: "Use the before/after comparison and the Play cleaned button to confirm the speech stays clear.",
      },
      {
        title: "Download Cleaned Audio",
        text: "Click Download cleaned audio to save the noise-reduced file to your device.",
      },
    ],
    useCases: [
      "A podcaster cleans up hiss from an episode recorded in a home office.",
      "An interviewer reduces air-conditioning hum from a conference room recording.",
      "A voiceover artist removes wind noise from outdoor narration.",
      "A student cleans a recorded lecture captured on a laptop microphone.",
      "A journalist preps a phone interview by reducing background traffic noise.",
    ],
    faqs: [
      {
        q: "Where are my recordings processed?",
        a: "Entirely in your browser. The noise reduction runs locally with the Web Audio API and your file is never uploaded, which keeps sensitive interviews and unreleased episodes private.",
      },
      {
        q: "Which audio formats work with the noise cleaner?",
        a: "Common formats like MP3, WAV, and M4A are supported. Processing time depends on the length of the recording and the intensity you apply.",
      },
      {
        q: "Is the noise cleaner free?",
        a: "Yes, it is completely free with no signup and no limits on how many files you clean.",
      },
    ],
  },
  "waveform-generator": {
    overview:
      "The Waveform Generator turns an audio file into a PNG image of its waveform. Podcasters, video editors, and social media managers use these images as episode thumbnails, video previews, and track artwork that signal audio content before anyone presses play. Upload a file up to 50MB, adjust the width, height, colors, and style or pick a preset theme, then render the image and download the PNG. Everything is drawn on a canvas in your browser, so the audio is decoded locally and never uploaded to a server, a useful guarantee when you are working with unreleased music or private recordings.",
    features: [
      "Generates waveform images from audio files",
      "Adjustable width, height, colors, and style",
      "Preset color themes for quick styling",
      "Default 800x200 size suits social previews",
      "Exports a downloadable PNG image",
      "High-contrast output for clear visibility",
    ],
    steps: [
      {
        title: "Upload Your Audio File",
        text: "Select an MP3, WAV, M4A, or similar file. Files up to 50MB work well for clear waveform generation.",
      },
      {
        title: "Configure the Image Settings",
        text: "Set the width and height, or start from the default 800x200 size that suits most social platforms.",
      },
      {
        title: "Choose Colors or a Theme",
        text: "Pick foreground and background colors or a preset theme. High-contrast combinations are easiest to read.",
      },
      {
        title: "Generate the Waveform",
        text: "Click Generate Waveform to render the visualization from your audio.",
      },
      {
        title: "Download the PNG",
        text: "Click Download PNG to save the waveform image for use in your project.",
      },
    ],
    useCases: [
      "A podcaster creates a waveform thumbnail for an episode posted to social media.",
      "A video editor adds a waveform graphic to the preview of an audio-driven video.",
      "A musician generates artwork-style visuals for a track published on a streaming page.",
      "A teacher includes a waveform image in slides so students can see the audio structure.",
      "A sound designer documents a sample library with visual previews of each file.",
    ],
    faqs: [
      {
        q: "Does my audio get uploaded anywhere?",
        a: "No. The waveform is drawn on a canvas inside your browser and your file is never sent to a server. Only the finished PNG image is saved to your device.",
      },
      {
        q: "What audio files can I turn into waveforms?",
        a: "Standard formats such as MP3, WAV, and M4A are supported. Files up to 50MB produce clear, detailed results.",
      },
      {
        q: "Do I have to pay or sign up to generate waveforms?",
        a: "No. The generator is free, requires no account, and puts no watermark on your images.",
      },
    ],
  },
  "tag-editor-pro": {
    overview:
      "Tag Editor Pro views and edits ID3 metadata in audio files: title, artist, album, year, genre, track and disc numbers, composer, lyrics, and embedded album art. Collectors, podcasters, and musicians use it to keep music libraries organized and to make sure files display correctly in media players. Open a file and its existing tags are read into the form, make your changes or use Auto-fill from filename to parse names like Artist - Title.mp3, attach square artwork of 500x500 pixels or larger, then click Save Tags to write everything back. Editing happens locally in your browser and the file is updated in place, so nothing is uploaded and no audio quality is lost.",
    features: [
      "Edit title, artist, album, year, and genre",
      "Track, disc, composer, and lyrics fields",
      "Embed album art in JPEG or PNG formats",
      "Auto-fill from filename for quick tagging",
      "Reads and preserves existing metadata",
      "Saves tags in place without quality loss",
    ],
    steps: [
      {
        title: "Upload Your Audio File",
        text: "Open an MP3, M4A, FLAC, or similar file. MP3 offers the most complete ID3 tag support.",
      },
      {
        title: "Review the Existing Tags",
        text: "The tool reads the file and displays its current metadata, which is preserved and ready for editing.",
      },
      {
        title: "Edit the Metadata Fields",
        text: "Update the title, artist, album, year, genre, track number, composer, lyrics, and other fields.",
      },
      {
        title: "Add Album Artwork",
        text: "Attach a JPEG or PNG image. Square artwork of 500x500 pixels or larger displays best in media players.",
      },
      {
        title: "Auto-Fill and Save Tags",
        text: "Use Auto-fill from filename to parse names like Artist - Title.mp3, then click Save Tags to write the changes.",
      },
    ],
    useCases: [
      "A music collector fixes misspelled artist names across a ripped CD library.",
      "A podcaster adds show title and episode numbers to published MP3 files.",
      "A musician embeds album art and composer credits in demo tracks before sending them out.",
      "A DJ tags a folder of downloaded tracks so DJ software displays them correctly.",
      "An archivist adds year and genre tags to field recordings for a searchable library.",
    ],
    faqs: [
      {
        q: "Is my music uploaded when I edit tags?",
        a: "No. Tags are read and written directly in your browser, and the updated file saves to your device. Your audio never touches a server.",
      },
      {
        q: "Which file and image formats are supported?",
        a: "MP3, M4A, and FLAC files work, with the most complete ID3 support on MP3. Album art can be JPEG, PNG, or another common image format.",
      },
      {
        q: "Does tag editing require an account or payment?",
        a: "No. It is completely free with no signup, and saving tags updates the file in place without re-encoding or degrading your audio.",
      },
    ],
  },
  "voice-memo-transcriber": {
    overview:
      "The Voice Memo Transcriber converts spoken audio into written text using your browser's built-in speech recognition. Students, journalists, meeting note-takers, and podcasters use it to turn memos, interviews, and quick thoughts into editable, searchable text. Upload an MP3, WAV, or M4A file of under about 10 minutes, or record directly with the Start Recording button after choosing a language; the transcript appears as you speak, with interim results shown live, and you can review and edit the text before downloading it as a .txt file. Recognition runs entirely on your device through the Web Speech API, so your voice is never uploaded to a transcription server.",
    features: [
      "Transcribes speech to text in the browser",
      "Record directly or upload audio files",
      "Language selection for recognition",
      "Live interim results as you speak",
      "Edit the transcript before exporting",
      "Download the transcript as a .txt file",
    ],
    steps: [
      {
        title: "Choose Your Language",
        text: "Select the language that matches your recording so recognition handles it correctly.",
      },
      {
        title: "Record or Upload Audio",
        text: "Use Start Recording and Stop Recording to capture a memo live, or upload an MP3, WAV, or M4A file under about 10 minutes.",
      },
      {
        title: "Start the Transcription",
        text: "Click Transcribe Audio and watch the text appear, including interim results while recognition is running.",
      },
      {
        title: "Review and Edit the Text",
        text: "Read through the generated transcript and correct any mistakes, especially names or technical terms.",
      },
      {
        title: "Download the Transcript",
        text: "Save the final text as a .txt file with timestamps for your notes or records.",
      },
    ],
    useCases: [
      "A student records a lecture segment and converts it into notes for studying.",
      "A journalist transcribes a short phone interview while working in the field.",
      "A project manager turns voice memos from a walkthrough into written action items.",
      "A podcaster drafts show notes by transcribing the episode intro.",
      "A writer captures a story idea spoken into the mic as editable text.",
    ],
    faqs: [
      {
        q: "Where does my voice recording go during transcription?",
        a: "It stays on your device. Recognition runs through your browser's built-in Web Speech API, and no audio file is uploaded to our servers.",
      },
      {
        q: "What audio formats and lengths are supported?",
        a: "You can upload MP3, WAV, or M4A files, or record directly in the browser. Keep recordings under about 10 minutes for reliable results, since shorter clips also process faster.",
      },
      {
        q: "Is the transcriber free?",
        a: "Yes, it is completely free with no signup and no limits on how many memos you transcribe.",
      },
    ],
  },
};
