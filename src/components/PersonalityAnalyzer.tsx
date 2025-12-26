"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Button from "@/components/Button";

type Trait = {
  name: string;
  value: number;
  category: string;
  description: string;
};

type AnalysisResult = {
  traits: Trait[];
  overallPersonality: string;
  strengths: string[];
  weaknesses: string[];
  suggestions: { trait: string; suggestion: string }[];
  confidence: number;
  detailedInsights?: {
    communicationStyle: string;
    workStyle: string;
    careerSuggestions: string[];
    leadershipPotential: number;
    creativityIndex: number;
    stressIndicators: string[];
    relationshipCompatibility: string;
    letterFormations: string;
    loops: string;
    iDots: string;
    tBars: string;
    // Extended detailed insights
    cognitiveStyle: string;
    decisionMakingStyle: string;
    learningStyle: string;
    conflictResolutionStyle: string;
    emotionalIntelligence: number;
    riskTolerance: string;
    timeManagementStyle: string;
    motivationFactors: string[];
    workEnvironmentPreference: string;
    teamRole: string;
    communicationChannels: string[];
    problemSolvingApproach: string;
    innovationTendency: string;
    adaptabilityScore: number;
    attentionToDetail: string;
    handwritingZones: {
      upperZone: string;
      middleZone: string;
      lowerZone: string;
    };
    letterConnections: string;
    writingRhythm: string;
    signatureAnalysis: string;
    healthIndicators: string[];
    socialEnergyLevel: string;
    introversionExtraversionBalance: string;
    assertivenessLevel: string;
    trustLevel: string;
    perfectionismTendency: string;
    procrastinationRisk: string;
    multitaskingAbility: string;
    focusDuration: string;
    memoryStyle: string;
    intuitionVsLogic: string;
  };
};

export default function PersonalityAnalyzer() {
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [pdfReady, setPdfReady] = useState(false);
  const [reportMode, setReportMode] = useState<"summary" | "detailed">("summary");
  const [showTraitInfo, setShowTraitInfo] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const originalImgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    return () => { if (sourceUrl) URL.revokeObjectURL(sourceUrl); };
  }, [sourceUrl]);

  // Load jsPDF from CDN
  useEffect(() => {
    if (typeof window !== "undefined" && !(window as any).jspdf) {
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
      script.async = true;
      script.onload = () => setPdfReady(true);
      document.head.appendChild(script);
    } else if ((window as any).jspdf) {
      setPdfReady(true);
    }
  }, []);

  const analyzeHandwriting = useCallback(async () => {
    const canvas = canvasRef.current;
    const img = originalImgRef.current;
    if (!canvas || !img || !sourceUrl) return;

    setIsProcessing(true);
    await new Promise(r => setTimeout(r, 500));

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const w = img.naturalWidth;
    const h = img.naturalHeight;
    canvas.width = w;
    canvas.height = h;
    ctx.drawImage(img, 0, 0);

    const imgData = ctx.getImageData(0, 0, w, h);
    const data = imgData.data;

    // Convert to grayscale and threshold for handwriting detection
    // Sample pixels to avoid processing millions of pixels
    const sampleRate = Math.max(1, Math.floor(Math.sqrt(w * h) / 500));
    const grayData = new Uint8ClampedArray(w * h);
    for (let i = 0; i < data.length; i += 4) {
      const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      grayData[i / 4] = gray;
    }

    // Threshold to find handwriting (darker pixels) - sample to avoid stack overflow
    const threshold = 128;
    const handwritingPixels: { x: number; y: number }[] = [];
    for (let y = 0; y < h; y += sampleRate) {
      for (let x = 0; x < w; x += sampleRate) {
        const idx = y * w + x;
        if (grayData[idx] < threshold) {
          handwritingPixels.push({ x, y });
        }
      }
    }

    // Limit to maximum 10000 pixels to prevent stack overflow
    if (handwritingPixels.length > 10000) {
      const step = Math.ceil(handwritingPixels.length / 10000);
      const sampledPixels: { x: number; y: number }[] = [];
      for (let i = 0; i < handwritingPixels.length; i += step) {
        sampledPixels.push(handwritingPixels[i]);
      }
      handwritingPixels.length = 0;
      handwritingPixels.push(...sampledPixels);
    }

    if (handwritingPixels.length === 0) {
      setIsProcessing(false);
      alert("Could not detect handwriting in the image. Please ensure the image contains clear handwriting.");
      return;
    }

    // Analyze graphology features
    const features = analyzeGraphologyFeatures(handwritingPixels, w, h, grayData);
    const result = generatePersonalityAnalysis(features);
    
    setAnalysisResult(result);
    setIsProcessing(false);
  }, [sourceUrl]);

  const analyzeGraphologyFeatures = (
    pixels: { x: number; y: number }[],
    width: number,
    height: number,
    grayData: Uint8ClampedArray
  ) => {
    if (pixels.length === 0) {
      return {
        slant: 0.5,
        size: 0.5,
        pressure: 0.5,
        spacing: 0.5,
        baselineStability: 0.5,
        margins: 0.5
      };
    }

    // Calculate baseline (average Y position) - optimized
    let sumY = 0;
    for (let i = 0; i < pixels.length; i++) {
      sumY += pixels[i].y;
    }
    const avgY = sumY / pixels.length;
    
    // Analyze slant (direction of strokes) - sample every Nth pixel
    const slantStep = Math.max(1, Math.floor(pixels.length / 1000));
    let rightSlant = 0, leftSlant = 0, vertical = 0;
    for (let i = slantStep; i < pixels.length; i += slantStep) {
      const prevIdx = i - slantStep;
      const dx = pixels[i].x - pixels[prevIdx].x;
      const dy = pixels[i].y - pixels[prevIdx].y;
      if (Math.abs(dx) > 1) {
        const angle = Math.atan2(dy, dx) * 180 / Math.PI;
        if (angle > 10 && angle < 80) rightSlant++;
        else if (angle > 100 && angle < 170) leftSlant++;
        else if (Math.abs(angle) < 10 || Math.abs(angle) > 170) vertical++;
      }
    }
    const totalSlants = rightSlant + leftSlant + vertical || 1;
    const slantRatio = rightSlant / totalSlants;

    // Analyze size (average character height) - optimized
    let minY = pixels[0].y, maxY = pixels[0].y;
    for (let i = 1; i < pixels.length; i++) {
      if (pixels[i].y < minY) minY = pixels[i].y;
      if (pixels[i].y > maxY) maxY = pixels[i].y;
    }
    const charHeight = (maxY - minY) / Math.max(1, Math.floor((maxY - minY) / 50));
    const sizeRatio = Math.min(1, charHeight / 100);

    // Analyze pressure (darkness/intensity) - sample pixels
    const pressureStep = Math.max(1, Math.floor(pixels.length / 5000));
    let totalIntensity = 0;
    let intensityCount = 0;
    for (let i = 0; i < pixels.length; i += pressureStep) {
      const idx = pixels[i].y * width + pixels[i].x;
      if (idx >= 0 && idx < grayData.length) {
        totalIntensity += 255 - grayData[idx];
        intensityCount++;
      }
    }
    const avgPressure = intensityCount > 0 ? (totalIntensity / intensityCount / 255) : 0.5;

    // Analyze spacing (horizontal distribution) - sample
    const spacingStep = Math.max(1, Math.floor(pixels.length / 2000));
    let spacingVariance = 0;
    let spacingCount = 0;
    for (let i = spacingStep; i < pixels.length; i += spacingStep) {
      spacingVariance += Math.abs(pixels[i].x - pixels[i - spacingStep].x);
      spacingCount++;
    }
    const avgSpacing = spacingCount > 0 ? (spacingVariance / spacingCount) : 1;
    const spacingRatio = Math.min(1, avgSpacing / 10);

    // Analyze baseline (vertical variation) - optimized
    let baselineVariationSum = 0;
    for (let i = 0; i < pixels.length; i++) {
      baselineVariationSum += Math.abs(pixels[i].y - avgY);
    }
    const baselineVariation = baselineVariationSum / pixels.length;
    const baselineStability = 1 - Math.min(1, baselineVariation / 50);

    // Analyze margins (text position on page) - optimized
    let minX = pixels[0].x, maxX = pixels[0].x, minY_margin = pixels[0].y;
    for (let i = 1; i < pixels.length; i++) {
      if (pixels[i].x < minX) minX = pixels[i].x;
      if (pixels[i].x > maxX) maxX = pixels[i].x;
      if (pixels[i].y < minY_margin) minY_margin = pixels[i].y;
    }
    const leftMargin = minX / width;
    const rightMargin = 1 - (maxX / width);
    const topMargin = minY_margin / height;
    const avgMargin = (leftMargin + rightMargin + topMargin) / 3;

    // Analyze letter formations (curves vs angles)
    const formationStep = Math.max(1, Math.floor(pixels.length / 1500));
    let curves = 0, angles = 0;
    for (let i = formationStep * 2; i < pixels.length; i += formationStep) {
      const p1 = pixels[i - formationStep * 2];
      const p2 = pixels[i - formationStep];
      const p3 = pixels[i];
      const angle1 = Math.atan2(p2.y - p1.y, p2.x - p1.x);
      const angle2 = Math.atan2(p3.y - p2.y, p3.x - p2.x);
      const angleDiff = Math.abs(angle2 - angle1);
      if (angleDiff > Math.PI / 3) angles++;
      else if (angleDiff < Math.PI / 6) curves++;
    }
    const totalFormations = curves + angles || 1;
    const formationRatio = curves / totalFormations;

    // Analyze loops (closed shapes in letters like 'a', 'o', 'g')
    let loops = 0;
    const loopStep = Math.max(1, Math.floor(pixels.length / 2000));
    for (let i = loopStep * 5; i < pixels.length; i += loopStep) {
      const centerX = pixels[i].x;
      const centerY = pixels[i].y;
      let nearbyCount = 0;
      for (let j = Math.max(0, i - loopStep * 3); j < Math.min(pixels.length, i + loopStep * 3); j += Math.floor(loopStep / 2)) {
        const dist = Math.sqrt(Math.pow(pixels[j].x - centerX, 2) + Math.pow(pixels[j].y - centerY, 2));
        if (dist < 20) nearbyCount++;
      }
      if (nearbyCount > 5) loops++;
    }
    const loopRatio = Math.min(1, loops / (pixels.length / loopStep / 10));

    // Analyze handwriting zones (upper, middle, lower)
    const zoneStep = Math.max(1, Math.floor(pixels.length / 1000));
    let upperZone = 0, middleZone = 0, lowerZone = 0;
    const zoneThreshold = height / 3;
    for (let i = 0; i < pixels.length; i += zoneStep) {
      const y = pixels[i].y;
      if (y < zoneThreshold) upperZone++;
      else if (y < zoneThreshold * 2) middleZone++;
      else lowerZone++;
    }
    const totalZones = upperZone + middleZone + lowerZone || 1;
    const upperZoneRatio = upperZone / totalZones;
    const middleZoneRatio = middleZone / totalZones;
    const lowerZoneRatio = lowerZone / totalZones;

    // Analyze letter connections (connected vs disconnected)
    const connectionStep = Math.max(1, Math.floor(pixels.length / 1500));
    let connected = 0, disconnected = 0;
    for (let i = connectionStep; i < pixels.length; i += connectionStep) {
      const dist = Math.sqrt(
        Math.pow(pixels[i].x - pixels[i - connectionStep].x, 2) + 
        Math.pow(pixels[i].y - pixels[i - connectionStep].y, 2)
      );
      if (dist < 15) connected++;
      else if (dist > 30) disconnected++;
    }
    const totalConnections = connected + disconnected || 1;
    const connectionRatio = connected / totalConnections;

    // Analyze writing rhythm (consistency of spacing)
    const rhythmStep = Math.max(1, Math.floor(pixels.length / 2000));
    let rhythmVariance = 0;
    let rhythmCount = 0;
    for (let i = rhythmStep * 2; i < pixels.length; i += rhythmStep) {
      const dist1 = Math.abs(pixels[i - rhythmStep].x - pixels[i - rhythmStep * 2].x);
      const dist2 = Math.abs(pixels[i].x - pixels[i - rhythmStep].x);
      rhythmVariance += Math.abs(dist1 - dist2);
      rhythmCount++;
    }
    const avgRhythmVariance = rhythmCount > 0 ? (rhythmVariance / rhythmCount) : 0;
    const rhythmConsistency = 1 - Math.min(1, avgRhythmVariance / 20);

    return {
      slant: slantRatio,
      size: sizeRatio,
      pressure: avgPressure,
      spacing: spacingRatio,
      baselineStability,
      margins: avgMargin,
      formationRatio,
      loopRatio,
      upperZoneRatio,
      middleZoneRatio,
      lowerZoneRatio,
      connectionRatio,
      rhythmConsistency
    };
  };

  const generatePersonalityAnalysis = (features: any): AnalysisResult => {
    const traits: Trait[] = [];

    // Openness (based on size and spacing)
    const openness = (features.size * 0.6 + features.spacing * 0.4) * 100;
    traits.push({
      name: "Openness to Experience",
      value: Math.round(openness),
      category: "Cognitive",
      description: openness > 60 ? "Creative, curious, and open to new ideas" : openness > 40 ? "Balanced between tradition and innovation" : "Prefer familiar routines and established methods"
    });

    // Conscientiousness (based on baseline stability and margins)
    const conscientiousness = (features.baselineStability * 0.7 + features.margins * 0.3) * 100;
    traits.push({
      name: "Conscientiousness",
      value: Math.round(conscientiousness),
      category: "Work Style",
      description: conscientiousness > 60 ? "Highly organized, disciplined, and reliable" : conscientiousness > 40 ? "Moderately organized with good planning skills" : "Flexible and spontaneous approach"
    });

    // Extraversion (based on size and pressure)
    const extraversion = (features.size * 0.5 + features.pressure * 0.5) * 100;
    traits.push({
      name: "Extraversion",
      value: Math.round(extraversion),
      category: "Social",
      description: extraversion > 60 ? "Outgoing, energetic, and sociable" : extraversion > 40 ? "Balanced social energy" : "Prefer quiet, introspective activities"
    });

    // Agreeableness (based on slant and spacing)
    const agreeableness = (features.slant * 0.6 + (1 - features.spacing) * 0.4) * 100;
    traits.push({
      name: "Agreeableness",
      value: Math.round(agreeableness),
      category: "Interpersonal",
      description: agreeableness > 60 ? "Cooperative, trusting, and empathetic" : agreeableness > 40 ? "Balanced between cooperation and assertiveness" : "Independent and direct in communication"
    });

    // Neuroticism (based on baseline stability and pressure variation)
    const neuroticism = ((1 - features.baselineStability) * 0.7 + (1 - features.pressure) * 0.3) * 100;
    traits.push({
      name: "Emotional Stability",
      value: Math.round(100 - neuroticism),
      category: "Emotional",
      description: neuroticism < 40 ? "Calm, resilient, and emotionally stable" : neuroticism < 60 ? "Generally stable with occasional stress" : "May experience higher emotional sensitivity"
    });

    // Determine strengths and weaknesses
    const strengths = traits.filter(t => t.value > 60).map(t => t.name);
    const weaknesses = traits.filter(t => t.value < 40).map(t => t.name);

    // Generate suggestions
    const suggestions = traits
      .filter(t => t.value < 50)
      .map(trait => ({
        trait: trait.name,
        suggestion: getSuggestionForTrait(trait.name, trait.value)
      }));

    // Overall personality summary
    const dominantTrait = traits.reduce((max, t) => t.value > max.value ? t : max);
    const overallPersonality = generateOverallPersonality(traits, dominantTrait);

    // Calculate confidence (based on handwriting clarity)
    const confidence = Math.min(95, Math.max(60, Math.round(
      (features.baselineStability * 30 + features.pressure * 30 + features.margins * 20 + 20)
    )));

    // Generate detailed insights
    const communicationStyle = features.slant > 0.6 
      ? "Expressive and open communicator, tends to share emotions freely"
      : features.slant < 0.4
      ? "Reserved communicator, prefers logical and structured expression"
      : "Balanced communicator, adapts style to context";

    const workStyle = features.baselineStability > 0.7
      ? "Methodical and detail-oriented, thrives in structured environments"
      : features.baselineStability < 0.5
      ? "Flexible and adaptive, excels in dynamic, creative environments"
      : "Versatile worker, comfortable in both structured and flexible settings";

    const careerSuggestions = [];
    if (openness > 60 && features.formationRatio > 0.6) {
      careerSuggestions.push("Creative fields: Graphic Design, Writing, Art Direction");
    }
    if (conscientiousness > 60) {
      careerSuggestions.push("Organized roles: Project Management, Accounting, Engineering");
    }
    if (extraversion > 60) {
      careerSuggestions.push("People-oriented: Sales, Marketing, Human Resources");
    }
    if (features.loopRatio > 0.5) {
      careerSuggestions.push("Social services: Counseling, Teaching, Healthcare");
    }
    if (careerSuggestions.length === 0) {
      careerSuggestions.push("General business roles with growth potential");
    }

    const leadershipPotential = Math.round(
      (conscientiousness * 0.3 + extraversion * 0.3 + (100 - neuroticism) * 0.2 + features.baselineStability * 100 * 0.2)
    );

    const creativityIndex = Math.round(
      (openness * 0.4 + features.formationRatio * 100 * 0.3 + features.size * 100 * 0.3)
    );

    const stressIndicators = [];
    if (features.baselineStability < 0.5) stressIndicators.push("Irregular baseline suggests possible stress or emotional fluctuations");
    if (features.pressure > 0.7) stressIndicators.push("Heavy pressure may indicate tension or intensity");
    if (features.spacing < 0.3) stressIndicators.push("Tight spacing could suggest feeling constrained or overwhelmed");
    if (stressIndicators.length === 0) {
      stressIndicators.push("No significant stress indicators detected - handwriting appears balanced");
    }

    const relationshipCompatibility = agreeableness > 60 && features.slant > 0.5
      ? "High compatibility - empathetic and emotionally expressive, values harmony in relationships"
      : agreeableness < 40
      ? "Independent nature - values autonomy, may need partners who respect personal space"
      : "Balanced approach - seeks mutual respect and understanding in relationships";

    const letterFormations = features.formationRatio > 0.6
      ? "Curved formations dominate - indicates creativity, flexibility, and emotional expression"
      : features.formationRatio < 0.4
      ? "Angular formations dominate - suggests logical thinking, precision, and analytical approach"
      : "Mixed formations - balanced between creativity and structure";

    const loops = features.loopRatio > 0.5
      ? "Well-formed loops - indicates social awareness, emotional depth, and connection to others"
      : features.loopRatio < 0.3
      ? "Minimal loops - suggests independence, directness, and efficiency-focused thinking"
      : "Moderate loops - balanced social and independent tendencies";

    const iDots = features.pressure > 0.6 && features.size > 0.5
      ? "Consistent i-dots - shows attention to detail, conscientiousness, and focus"
      : features.pressure < 0.4
      ? "Light i-dots - suggests creative thinking, flexibility, and less rigid attention to detail"
      : "Balanced i-dots - moderate attention to detail";

    const tBars = features.baselineStability > 0.7 && features.pressure > 0.6
      ? "Strong t-bars - indicates determination, goal-oriented mindset, and self-confidence"
      : features.baselineStability < 0.5
      ? "Variable t-bars - suggests flexibility in goals and adaptable ambition"
      : "Moderate t-bars - balanced determination and flexibility";

    // Extended detailed insights
    const cognitiveStyle = features.formationRatio > 0.6
      ? "Holistic thinker - processes information as interconnected wholes, sees patterns and relationships easily, prefers big-picture understanding over details"
      : features.formationRatio < 0.4
      ? "Analytical thinker - breaks down information into components, processes sequentially, prefers structured and logical approaches"
      : "Balanced thinker - combines holistic and analytical approaches, adapts thinking style to the situation";

    const decisionMakingStyle = features.baselineStability > 0.7 && features.pressure > 0.6
      ? "Decisive decision-maker - makes decisions quickly and confidently, trusts intuition, comfortable with commitment"
      : features.baselineStability < 0.5
      ? "Flexible decision-maker - considers multiple options, adapts decisions as new information emerges, comfortable with change"
      : "Balanced decision-maker - weighs options carefully but makes timely decisions, combines analysis with intuition";

    const learningStyle = features.size > 0.6 && features.spacing > 0.5
      ? "Visual and experiential learner - learns best through seeing and doing, benefits from demonstrations and hands-on practice"
      : features.baselineStability > 0.7
      ? "Structured learner - prefers organized information, sequential learning, clear instructions and step-by-step processes"
      : "Adaptive learner - flexible learning approach, combines visual, auditory, and kinesthetic methods";

    const conflictResolutionStyle = agreeableness > 60 && features.slant > 0.5
      ? "Collaborative resolver - seeks win-win solutions, values harmony, focuses on understanding all perspectives"
      : agreeableness < 40
      ? "Direct resolver - addresses conflicts head-on, values honesty and clarity, prefers straightforward communication"
      : "Balanced resolver - adapts approach to the situation, combines collaboration with assertiveness as needed";

    const emotionalIntelligence = Math.round(
      (agreeableness * 0.3 + (100 - neuroticism) * 0.3 + features.baselineStability * 100 * 0.2 + features.slant * 100 * 0.2)
    );

    const riskTolerance = features.baselineStability < 0.5 && features.size > 0.6
      ? "High risk tolerance - comfortable with uncertainty, willing to take calculated risks, embraces change and new opportunities"
      : features.baselineStability > 0.7 && features.margins > 0.6
      ? "Low risk tolerance - prefers stability and predictability, makes careful decisions, values security"
      : "Moderate risk tolerance - evaluates risks carefully, takes calculated risks when benefits are clear";

    const timeManagementStyle = features.baselineStability > 0.7 && features.margins > 0.6
      ? "Structured time manager - plans ahead, maintains schedules, values punctuality and deadlines"
      : features.baselineStability < 0.5
      ? "Flexible time manager - adapts to changing priorities, comfortable with spontaneity, may struggle with rigid schedules"
      : "Balanced time manager - combines planning with flexibility, adapts to circumstances while maintaining priorities";

    const motivationFactors: string[] = [];
    if (openness > 60) motivationFactors.push("Creative challenges and novel experiences");
    if (conscientiousness > 60) motivationFactors.push("Achievement and recognition for hard work");
    if (extraversion > 60) motivationFactors.push("Social interaction and collaboration");
    if (features.pressure > 0.6) motivationFactors.push("Intensity and meaningful work");
    if (features.loopRatio > 0.5) motivationFactors.push("Helping others and making a difference");
    if (motivationFactors.length === 0) motivationFactors.push("Personal growth and development");

    const workEnvironmentPreference = features.baselineStability > 0.7 && features.margins > 0.6
      ? "Structured environment - prefers clear roles, established processes, quiet spaces for focused work, minimal interruptions"
      : features.baselineStability < 0.5 && features.size > 0.6
      ? "Dynamic environment - thrives in fast-paced settings, enjoys variety and change, comfortable with open spaces and collaboration"
      : "Balanced environment - adapts to different settings, values both structure and flexibility";

    const teamRole = conscientiousness > 60 && features.baselineStability > 0.7
      ? "Organizer/Planner - excels at structuring projects, maintaining timelines, ensuring quality and completion"
      : extraversion > 60 && features.slant > 0.5
      ? "Collaborator/Communicator - facilitates team communication, builds relationships, energizes the group"
      : openness > 60 && features.formationRatio > 0.6
      ? "Innovator/Creative - generates new ideas, challenges assumptions, brings creative solutions"
      : "Supporter/Contributor - reliable team member, provides steady contribution, supports team goals";

    const communicationChannels: string[] = [];
    if (extraversion > 60) communicationChannels.push("Face-to-face meetings");
    if (features.slant > 0.6) communicationChannels.push("Emotional and expressive communication");
    if (conscientiousness > 60) communicationChannels.push("Written documentation");
    if (openness > 60) communicationChannels.push("Visual presentations");
    if (communicationChannels.length === 0) communicationChannels.push("Direct and clear communication");

    const problemSolvingApproach = features.formationRatio > 0.6
      ? "Creative problem solver - explores multiple solutions, thinks outside the box, comfortable with ambiguity"
      : features.formationRatio < 0.4
      ? "Systematic problem solver - follows logical steps, analyzes thoroughly, prefers proven methods"
      : "Adaptive problem solver - combines creative and systematic approaches, selects method based on problem type";

    const innovationTendency = openness > 60 && features.formationRatio > 0.6
      ? "High innovation tendency - naturally questions status quo, generates novel ideas, comfortable with experimentation"
      : openness < 40
      ? "Practical innovation - focuses on improving existing solutions, values proven approaches with incremental enhancements"
      : "Balanced innovation - open to new ideas while valuing practical application";

    const adaptabilityScore = Math.round(
      ((1 - features.baselineStability) * 40 + features.formationRatio * 30 + openness * 0.3)
    );

    const attentionToDetail = features.baselineStability > 0.7 && features.pressure > 0.6
      ? "High attention to detail - notices small errors, values precision, thorough in work"
      : features.baselineStability < 0.5
      ? "Big-picture focus - focuses on overall goals, may miss minor details, prioritizes main objectives"
      : "Balanced attention - maintains focus on both details and overall picture";

    const handwritingZones = {
      upperZone: features.upperZoneRatio > 0.4
        ? "Large upper zone - indicates strong intellectual curiosity, imagination, spiritual interests, and focus on ideas and concepts"
        : features.upperZoneRatio < 0.2
        ? "Small upper zone - suggests practical focus, grounded thinking, preference for concrete over abstract"
        : "Balanced upper zone - combines intellectual interests with practical application",
      middleZone: features.middleZoneRatio > 0.5
        ? "Prominent middle zone - indicates strong sense of self, social awareness, focus on present reality and daily life"
        : features.middleZoneRatio < 0.3
        ? "Small middle zone - suggests introversion, focus on internal world, may struggle with social situations"
        : "Balanced middle zone - healthy self-awareness and social engagement",
      lowerZone: features.lowerZoneRatio > 0.3
        ? "Large lower zone - indicates strong physical energy, material interests, focus on practical matters and security"
        : features.lowerZoneRatio < 0.1
        ? "Small lower zone - suggests less focus on material concerns, may prioritize ideas over physical needs"
        : "Balanced lower zone - healthy balance between material and spiritual concerns"
    };

    const letterConnections = features.connectionRatio > 0.6
      ? "Connected writing - indicates logical thinking, sequential processing, structured thought patterns, good flow of ideas"
      : features.connectionRatio < 0.4
      ? "Disconnected writing - suggests creative thinking, intuitive leaps, independent ideas, may think in non-linear patterns"
      : "Mixed connections - balanced between logical and creative thinking";

    const writingRhythm = features.rhythmConsistency > 0.7
      ? "Consistent rhythm - indicates emotional stability, reliability, steady energy, predictable patterns"
      : features.rhythmConsistency < 0.5
      ? "Variable rhythm - suggests emotional sensitivity, adaptability, changing energy levels, creative flow"
      : "Balanced rhythm - stable with natural variations";

    const signatureAnalysis = features.margins > 0.6 && features.baselineStability > 0.7
      ? "Formal signature style - indicates professionalism, respect for tradition, structured self-presentation"
      : features.margins < 0.4 && features.size > 0.6
      ? "Expressive signature style - suggests creativity, individuality, personal expression, less concern with convention"
      : "Balanced signature style - professional yet personal, maintains identity while respecting context";

    const healthIndicators: string[] = [];
    if (features.baselineStability < 0.5) healthIndicators.push("Irregular baseline may indicate stress or fatigue - consider rest and stress management");
    if (features.pressure > 0.7) healthIndicators.push("Heavy pressure suggests possible tension - consider relaxation techniques");
    if (features.spacing < 0.3) healthIndicators.push("Tight spacing may indicate feeling constrained - ensure adequate personal space");
    if (features.baselineStability > 0.7 && features.pressure > 0.5 && features.pressure < 0.7) {
      healthIndicators.push("Balanced handwriting indicators suggest good overall health and emotional well-being");
    }

    const socialEnergyLevel = extraversion > 60
      ? "High social energy - gains energy from interactions, enjoys being around people, needs social time to recharge"
      : extraversion < 40
      ? "Low social energy - needs alone time to recharge, prefers smaller groups, values deep connections over quantity"
      : "Balanced social energy - enjoys both social time and solitude, adapts energy to the situation";

    const introversionExtraversionBalance = extraversion > 60
      ? "Extraverted orientation - outgoing, expressive, energized by social interaction, comfortable being the center of attention"
      : extraversion < 40
      ? "Introverted orientation - reflective, reserved, energized by solitude, prefers meaningful one-on-one interactions"
      : "Ambiverted orientation - balanced between extraversion and introversion, adapts to context";

    const assertivenessLevel = agreeableness < 40 && features.pressure > 0.6
      ? "High assertiveness - direct communication, comfortable expressing opinions, takes charge when needed"
      : agreeableness > 60
      ? "Low assertiveness - prefers harmony, may avoid conflict, values cooperation over personal agenda"
      : "Balanced assertiveness - expresses needs while respecting others, assertive when necessary";

    const trustLevel = agreeableness > 60 && features.slant > 0.5
      ? "High trust - trusting nature, assumes good intentions, open to others, may be vulnerable to manipulation"
      : agreeableness < 40
      ? "Low trust - cautious with others, values independence, may take time to build trust"
      : "Balanced trust - trusts appropriately, evaluates situations, maintains healthy boundaries";

    const perfectionismTendency = conscientiousness > 60 && features.baselineStability > 0.7
      ? "High perfectionism - sets high standards, attention to detail, may struggle with completion due to perfectionism"
      : conscientiousness < 40
      ? "Low perfectionism - comfortable with 'good enough', focuses on progress over perfection"
      : "Balanced perfectionism - maintains standards without being paralyzed by perfectionism";

    const procrastinationRisk = conscientiousness < 40 && features.baselineStability < 0.5
      ? "Higher procrastination risk - may delay tasks, benefits from external deadlines and accountability"
      : conscientiousness > 60
      ? "Low procrastination risk - self-motivated, completes tasks on time, good self-discipline"
      : "Moderate procrastination risk - generally timely but may delay less appealing tasks";

    const multitaskingAbility = features.baselineStability < 0.5 && features.rhythmConsistency < 0.6
      ? "Good multitasking ability - comfortable switching between tasks, adapts to interruptions, flexible focus"
      : features.baselineStability > 0.7
      ? "Prefers single-tasking - works best with focused attention, may struggle with interruptions, deep work preferred"
      : "Balanced multitasking - can handle multiple tasks but prefers focused work when possible";

    const focusDuration = features.baselineStability > 0.7 && features.pressure > 0.6
      ? "Long focus duration - can maintain concentration for extended periods, deep work capability"
      : features.baselineStability < 0.5
      ? "Shorter focus duration - benefits from breaks, may need variety, prefers shorter work sessions"
      : "Moderate focus duration - can focus when needed but benefits from periodic breaks";

    const memoryStyle = features.baselineStability > 0.7
      ? "Structured memory - remembers through organization and patterns, benefits from categorization"
      : features.formationRatio > 0.6
      ? "Associative memory - remembers through connections and relationships, visual and contextual memory"
      : "Balanced memory - combines structured and associative approaches";

    const intuitionVsLogic = features.formationRatio > 0.6 && features.slant > 0.5
      ? "Intuitive preference - relies on gut feelings, patterns, and hunches, trusts first impressions"
      : features.formationRatio < 0.4
      ? "Logical preference - relies on facts, analysis, and systematic reasoning, values evidence"
      : "Balanced approach - combines intuition and logic, uses both appropriately";

    return {
      traits,
      overallPersonality,
      strengths: strengths.length > 0 ? strengths : ["Balanced personality traits"],
      weaknesses: weaknesses.length > 0 ? weaknesses : ["No significant weaknesses detected"],
      suggestions,
      confidence,
      detailedInsights: {
        communicationStyle,
        workStyle,
        careerSuggestions,
        leadershipPotential,
        creativityIndex,
        stressIndicators,
        relationshipCompatibility,
        letterFormations,
        loops,
        iDots,
        tBars,
        cognitiveStyle,
        decisionMakingStyle,
        learningStyle,
        conflictResolutionStyle,
        emotionalIntelligence,
        riskTolerance,
        timeManagementStyle,
        motivationFactors,
        workEnvironmentPreference,
        teamRole,
        communicationChannels,
        problemSolvingApproach,
        innovationTendency,
        adaptabilityScore,
        attentionToDetail,
        handwritingZones,
        letterConnections,
        writingRhythm,
        signatureAnalysis,
        healthIndicators,
        socialEnergyLevel,
        introversionExtraversionBalance,
        assertivenessLevel,
        trustLevel,
        perfectionismTendency,
        procrastinationRisk,
        multitaskingAbility,
        focusDuration,
        memoryStyle,
        intuitionVsLogic
      }
    };
  };

  const getSuggestionForTrait = (traitName: string, value: number): string => {
    const suggestions: Record<string, string[]> = {
      "Openness to Experience": [
        "Try new hobbies or activities outside your comfort zone",
        "Read books from different genres or cultures",
        "Engage in creative projects like writing, art, or music",
        "Travel to new places or explore different neighborhoods"
      ],
      "Conscientiousness": [
        "Use a planner or digital calendar to organize tasks",
        "Break large projects into smaller, manageable steps",
        "Set specific deadlines and stick to them",
        "Create a daily routine and follow it consistently"
      ],
      "Extraversion": [
        "Join social groups or clubs that interest you",
        "Practice initiating conversations with new people",
        "Attend networking events or community gatherings",
        "Share your thoughts and ideas more openly"
      ],
      "Agreeableness": [
        "Practice active listening in conversations",
        "Show appreciation and gratitude to others",
        "Volunteer for community service activities",
        "Work on building trust in relationships"
      ],
      "Emotional Stability": [
        "Practice mindfulness and meditation techniques",
        "Develop stress management strategies",
        "Maintain a regular sleep schedule",
        "Consider talking to a counselor or therapist"
      ]
    };

    const traitSuggestions = suggestions[traitName] || ["Focus on personal growth in this area"];
    return traitSuggestions[Math.floor(Math.random() * traitSuggestions.length)];
  };

  const generateOverallPersonality = (traits: Trait[], dominant: Trait): string => {
    const highTraits = traits.filter(t => t.value > 60);
    const lowTraits = traits.filter(t => t.value < 40);

    if (highTraits.length >= 3) {
      return `You exhibit a strong and well-rounded personality with ${highTraits.map(t => t.name.toLowerCase()).join(", ")} as prominent traits. Your ${dominant.name.toLowerCase()} suggests you're ${dominant.description.split(",")[0]}.`;
    } else if (lowTraits.length >= 3) {
      return `Your personality shows a more reserved and thoughtful approach, with ${lowTraits.map(t => t.name.toLowerCase()).join(", ")}. This indicates a preference for ${dominant.description.split(",")[0]}.`;
    } else {
      return `You have a balanced personality profile with ${dominant.name.toLowerCase()} as your most prominent trait. This suggests you're ${dominant.description.split(",")[0]}.`;
    }
  };

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file.");
      return;
    }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      originalImgRef.current = img;
      setSourceUrl(url);
      setFileName(file.name);
      setAnalysisResult(null);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      alert("Failed to load image.");
    };
    img.src = url;
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  };

  const downloadPDF = () => {
    if (!analysisResult || !pdfReady || !(window as any).jspdf) {
      alert("PDF generation is not ready. Please wait a moment and try again.");
      return;
    }

    const { jsPDF } = (window as any).jspdf;
    const doc = new jsPDF();
    const isDetailed = reportMode === "detailed" && analysisResult.detailedInsights;
    
    doc.setFontSize(20);
    doc.text(`${isDetailed ? "Detailed " : "Comprehensive "}Personality Analysis Report`, 105, 20, { align: "center" });
    
    doc.setFontSize(12);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 105, 30, { align: "center" });
    doc.text(`Confidence: ${analysisResult.confidence}%`, 105, 37, { align: "center" });
    
    // Add a line separator
    doc.setLineWidth(0.5);
    doc.line(20, 45, 190, 45);

    let yPos = 50;
    
    doc.setFontSize(16);
    doc.text("Overall Personality", 20, yPos);
    yPos += 10;
    doc.setFontSize(11);
    const overallLines = doc.splitTextToSize(analysisResult.overallPersonality, 170);
    doc.text(overallLines, 20, yPos);
    yPos += overallLines.length * 6 + 10;

    doc.setFontSize(16);
    doc.text("Personality Traits", 20, yPos);
    yPos += 10;
    doc.setFontSize(11);

    analysisResult.traits.forEach((trait, idx) => {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      doc.setFontSize(12);
      doc.text(`${trait.name}: ${trait.value}%`, 20, yPos);
      yPos += 7;
      doc.setFontSize(10);
      const descLines = doc.splitTextToSize(trait.description, 170);
      doc.text(descLines, 25, yPos);
      yPos += descLines.length * 5 + 5;
    });

    // Add enhanced summary insights if not in detailed mode
    if (!isDetailed && analysisResult.detailedInsights) {
      if (yPos > 220) {
        doc.addPage();
        yPos = 20;
      }
      // Add separator line
      doc.setLineWidth(0.3);
      doc.line(20, yPos - 2, 190, yPos - 2);
      yPos += 5;
      
      doc.setFontSize(16);
      doc.text("Key Insights", 20, yPos);
      yPos += 10;
      doc.setFontSize(11);

      // Key Metrics
      doc.setFontSize(12);
      doc.text("Key Metrics", 20, yPos);
      yPos += 7;
      doc.setFontSize(10);
      doc.text(`Leadership Potential: ${analysisResult.detailedInsights.leadershipPotential}%`, 25, yPos);
      yPos += 5;
      doc.text(`Creativity Index: ${analysisResult.detailedInsights.creativityIndex}%`, 25, yPos);
      yPos += 5;
      doc.text(`Emotional Intelligence: ${analysisResult.detailedInsights.emotionalIntelligence}%`, 25, yPos);
      yPos += 8;

      // Quick Insights
      doc.setFontSize(12);
      doc.text("Quick Insights", 20, yPos);
      yPos += 7;
      doc.setFontSize(10);
      
      doc.setFontSize(11);
      doc.text("Communication Style", 25, yPos);
      yPos += 6;
      doc.setFontSize(10);
      const commLines = doc.splitTextToSize(analysisResult.detailedInsights.communicationStyle, 165);
      doc.text(commLines, 25, yPos);
      yPos += commLines.length * 5 + 4;

      doc.setFontSize(11);
      doc.text("Work Style", 25, yPos);
      yPos += 6;
      doc.setFontSize(10);
      const workLines = doc.splitTextToSize(analysisResult.detailedInsights.workStyle, 165);
      doc.text(workLines, 25, yPos);
      yPos += workLines.length * 5 + 4;

      doc.setFontSize(11);
      doc.text("Decision-Making Style", 25, yPos);
      yPos += 6;
      doc.setFontSize(10);
      const decisionLines = doc.splitTextToSize(analysisResult.detailedInsights.decisionMakingStyle, 165);
      doc.text(decisionLines, 25, yPos);
      yPos += decisionLines.length * 5 + 4;

      doc.setFontSize(11);
      doc.text("Relationship Compatibility", 25, yPos);
      yPos += 6;
      doc.setFontSize(10);
      const relLines = doc.splitTextToSize(analysisResult.detailedInsights.relationshipCompatibility, 165);
      doc.text(relLines, 25, yPos);
      yPos += relLines.length * 5 + 8;

      // Career Suggestions
      if (analysisResult.detailedInsights.careerSuggestions.length > 0) {
        if (yPos > 240) {
          doc.addPage();
          yPos = 20;
        }
        doc.setFontSize(12);
        doc.text("Career Suggestions", 20, yPos);
        yPos += 7;
        doc.setFontSize(10);
        analysisResult.detailedInsights.careerSuggestions.slice(0, 3).forEach(career => {
          if (yPos > 250) {
            doc.addPage();
            yPos = 20;
          }
          doc.text(`• ${career}`, 25, yPos);
          yPos += 5;
        });
        yPos += 5;
      }

      // Behavioral Highlights
      if (yPos > 240) {
        doc.addPage();
        yPos = 20;
      }
      doc.setFontSize(12);
      doc.text("Behavioral Highlights", 20, yPos);
      yPos += 7;
      doc.setFontSize(10);
      
      doc.setFontSize(11);
      doc.text("Risk Tolerance", 25, yPos);
      yPos += 6;
      doc.setFontSize(10);
      const riskLines = doc.splitTextToSize(analysisResult.detailedInsights.riskTolerance.split(' - ')[0], 165);
      doc.text(riskLines, 25, yPos);
      yPos += riskLines.length * 5 + 4;

      doc.setFontSize(11);
      doc.text("Team Role", 25, yPos);
      yPos += 6;
      doc.setFontSize(10);
      const teamRoleLines = doc.splitTextToSize(analysisResult.detailedInsights.teamRole.split(' - ')[0], 165);
      doc.text(teamRoleLines, 25, yPos);
      yPos += teamRoleLines.length * 5 + 5;
    }

    // Add Strengths and Weaknesses (for both modes)
    if (yPos > 240) {
      doc.addPage();
      yPos = 20;
    }
    // Add separator line
    doc.setLineWidth(0.3);
    doc.line(20, yPos - 2, 190, yPos - 2);
    yPos += 5;
    
    doc.setFontSize(16);
    doc.text("Strengths & Areas for Growth", 20, yPos);
    yPos += 10;
    doc.setFontSize(11);

    if (analysisResult.strengths.length > 0) {
      doc.setFontSize(12);
      doc.text("Strengths", 20, yPos);
      yPos += 7;
      doc.setFontSize(10);
      analysisResult.strengths.forEach((strength, idx) => {
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(`• ${strength}`, 25, yPos);
        yPos += 5;
      });
      yPos += 5;
    }

    if (analysisResult.weaknesses.length > 0) {
      doc.setFontSize(12);
      doc.text("Areas to Improve", 20, yPos);
      yPos += 7;
      doc.setFontSize(10);
      analysisResult.weaknesses.forEach((weakness, idx) => {
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(`• ${weakness}`, 25, yPos);
        yPos += 5;
      });
      yPos += 5;
    }

    // Add detailed insights if in detailed mode
    if (isDetailed && analysisResult.detailedInsights) {
      if (yPos > 220) {
        doc.addPage();
        yPos = 20;
      }
      doc.setFontSize(16);
      doc.text("Detailed Insights", 20, yPos);
      yPos += 10;
      doc.setFontSize(11);

      // Communication & Work Style
      doc.setFontSize(12);
      doc.text("Communication Style", 20, yPos);
      yPos += 7;
      doc.setFontSize(10);
      const commLines = doc.splitTextToSize(analysisResult.detailedInsights.communicationStyle, 170);
      doc.text(commLines, 25, yPos);
      yPos += commLines.length * 5 + 5;

      doc.setFontSize(12);
      doc.text("Work Style", 20, yPos);
      yPos += 7;
      doc.setFontSize(10);
      const workLines = doc.splitTextToSize(analysisResult.detailedInsights.workStyle, 170);
      doc.text(workLines, 25, yPos);
      yPos += workLines.length * 5 + 5;

      // Leadership & Creativity
      doc.setFontSize(12);
      doc.text(`Leadership Potential: ${analysisResult.detailedInsights.leadershipPotential}%`, 20, yPos);
      yPos += 7;
      doc.setFontSize(12);
      doc.text(`Creativity Index: ${analysisResult.detailedInsights.creativityIndex}%`, 20, yPos);
      yPos += 10;

      // Career Suggestions
      doc.setFontSize(12);
      doc.text("Career Suggestions", 20, yPos);
      yPos += 7;
      doc.setFontSize(10);
      analysisResult.detailedInsights.careerSuggestions.forEach(career => {
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(`• ${career}`, 25, yPos);
        yPos += 5;
      });
      yPos += 5;

      // Relationship Compatibility
      doc.setFontSize(12);
      doc.text("Relationship Compatibility", 20, yPos);
      yPos += 7;
      doc.setFontSize(10);
      const relLines = doc.splitTextToSize(analysisResult.detailedInsights.relationshipCompatibility, 170);
      doc.text(relLines, 25, yPos);
      yPos += relLines.length * 5 + 5;

      // Graphology Features
      doc.setFontSize(12);
      doc.text("Graphology Features", 20, yPos);
      yPos += 7;
      doc.setFontSize(10);
      const features = [
        `Letter Formations: ${analysisResult.detailedInsights.letterFormations}`,
        `Loops: ${analysisResult.detailedInsights.loops}`,
        `I-Dots: ${analysisResult.detailedInsights.iDots}`,
        `T-Bars: ${analysisResult.detailedInsights.tBars}`
      ];
      features.forEach(feature => {
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }
        const featureLines = doc.splitTextToSize(feature, 170);
        doc.text(featureLines, 25, yPos);
        yPos += featureLines.length * 5 + 3;
      });
      yPos += 5;

      // Stress Indicators
      doc.setFontSize(12);
      doc.text("Stress Indicators", 20, yPos);
      yPos += 7;
      doc.setFontSize(10);
      analysisResult.detailedInsights.stressIndicators.forEach(indicator => {
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }
        const indLines = doc.splitTextToSize(`• ${indicator}`, 170);
        doc.text(indLines, 25, yPos);
        yPos += indLines.length * 5 + 3;
      });

      // Cognitive & Learning
      if (yPos > 220) {
        doc.addPage();
        yPos = 20;
      }
      doc.setFontSize(14);
      doc.text("Cognitive & Learning", 20, yPos);
      yPos += 10;
      doc.setFontSize(10);
      const cognitiveSections = [
        `Cognitive Style: ${analysisResult.detailedInsights.cognitiveStyle}`,
        `Learning Style: ${analysisResult.detailedInsights.learningStyle}`,
        `Decision-Making: ${analysisResult.detailedInsights.decisionMakingStyle}`,
        `Problem-Solving: ${analysisResult.detailedInsights.problemSolvingApproach}`,
        `Memory Style: ${analysisResult.detailedInsights.memoryStyle}`,
        `Intuition vs Logic: ${analysisResult.detailedInsights.intuitionVsLogic}`
      ];
      cognitiveSections.forEach(section => {
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }
        const lines = doc.splitTextToSize(section, 170);
        doc.text(lines, 25, yPos);
        yPos += lines.length * 5 + 3;
      });

      // Work & Career
      if (yPos > 220) {
        doc.addPage();
        yPos = 20;
      }
      doc.setFontSize(14);
      doc.text("Work & Career", 20, yPos);
      yPos += 10;
      doc.setFontSize(10);
      const workSections = [
        `Work Environment: ${analysisResult.detailedInsights.workEnvironmentPreference}`,
        `Team Role: ${analysisResult.detailedInsights.teamRole}`,
        `Time Management: ${analysisResult.detailedInsights.timeManagementStyle}`,
        `Attention to Detail: ${analysisResult.detailedInsights.attentionToDetail}`,
        `Multitasking: ${analysisResult.detailedInsights.multitaskingAbility}`,
        `Focus Duration: ${analysisResult.detailedInsights.focusDuration}`,
        `Adaptability: ${analysisResult.detailedInsights.adaptabilityScore}%`,
        `Emotional Intelligence: ${analysisResult.detailedInsights.emotionalIntelligence}%`,
        `Innovation: ${analysisResult.detailedInsights.innovationTendency}`
      ];
      workSections.forEach(section => {
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }
        const lines = doc.splitTextToSize(section, 170);
        doc.text(lines, 25, yPos);
        yPos += lines.length * 5 + 3;
      });
      doc.setFontSize(11);
      doc.text("Motivation Factors:", 20, yPos);
      yPos += 6;
      doc.setFontSize(10);
      analysisResult.detailedInsights.motivationFactors.forEach(factor => {
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(`• ${factor}`, 25, yPos);
        yPos += 5;
      });
      doc.setFontSize(11);
      doc.text("Communication Channels:", 20, yPos);
      yPos += 6;
      doc.setFontSize(10);
      analysisResult.detailedInsights.communicationChannels.forEach(channel => {
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(`• ${channel}`, 25, yPos);
        yPos += 5;
      });

      // Social & Relationships
      if (yPos > 220) {
        doc.addPage();
        yPos = 20;
      }
      doc.setFontSize(14);
      doc.text("Social & Relationships", 20, yPos);
      yPos += 10;
      doc.setFontSize(10);
      const socialSections = [
        `Social Energy: ${analysisResult.detailedInsights.socialEnergyLevel}`,
        `Introversion/Extraversion: ${analysisResult.detailedInsights.introversionExtraversionBalance}`,
        `Assertiveness: ${analysisResult.detailedInsights.assertivenessLevel}`,
        `Trust Level: ${analysisResult.detailedInsights.trustLevel}`,
        `Conflict Resolution: ${analysisResult.detailedInsights.conflictResolutionStyle}`,
        `Risk Tolerance: ${analysisResult.detailedInsights.riskTolerance}`
      ];
      socialSections.forEach(section => {
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }
        const lines = doc.splitTextToSize(section, 170);
        doc.text(lines, 25, yPos);
        yPos += lines.length * 5 + 3;
      });

      // Behavioral Patterns
      if (yPos > 220) {
        doc.addPage();
        yPos = 20;
      }
      doc.setFontSize(14);
      doc.text("Behavioral Patterns", 20, yPos);
      yPos += 10;
      doc.setFontSize(10);
      const behaviorSections = [
        `Perfectionism: ${analysisResult.detailedInsights.perfectionismTendency}`,
        `Procrastination Risk: ${analysisResult.detailedInsights.procrastinationRisk}`
      ];
      behaviorSections.forEach(section => {
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }
        const lines = doc.splitTextToSize(section, 170);
        doc.text(lines, 25, yPos);
        yPos += lines.length * 5 + 3;
      });

      // Advanced Graphology
      if (yPos > 220) {
        doc.addPage();
        yPos = 20;
      }
      doc.setFontSize(14);
      doc.text("Advanced Graphology", 20, yPos);
      yPos += 10;
      doc.setFontSize(10);
      const graphologySections = [
        `Letter Connections: ${analysisResult.detailedInsights.letterConnections}`,
        `Writing Rhythm: ${analysisResult.detailedInsights.writingRhythm}`,
        `Signature: ${analysisResult.detailedInsights.signatureAnalysis}`,
        `Upper Zone: ${analysisResult.detailedInsights.handwritingZones.upperZone}`,
        `Middle Zone: ${analysisResult.detailedInsights.handwritingZones.middleZone}`,
        `Lower Zone: ${analysisResult.detailedInsights.handwritingZones.lowerZone}`
      ];
      graphologySections.forEach(section => {
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }
        const lines = doc.splitTextToSize(section, 170);
        doc.text(lines, 25, yPos);
        yPos += lines.length * 5 + 3;
      });

      // Health & Well-being
      if (yPos > 220) {
        doc.addPage();
        yPos = 20;
      }
      doc.setFontSize(14);
      doc.text("Health & Well-being", 20, yPos);
      yPos += 10;
      doc.setFontSize(10);
      analysisResult.detailedInsights.healthIndicators.forEach(indicator => {
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }
        const lines = doc.splitTextToSize(`• ${indicator}`, 170);
        doc.text(lines, 25, yPos);
        yPos += lines.length * 5 + 3;
      });
    }

    if (analysisResult.suggestions.length > 0) {
      if (yPos > 240) {
        doc.addPage();
        yPos = 20;
      }
      // Add separator line
      doc.setLineWidth(0.3);
      doc.line(20, yPos - 2, 190, yPos - 2);
      yPos += 5;
      
      doc.setFontSize(16);
      doc.text("Suggestions for Growth", 20, yPos);
      yPos += 10;
      doc.setFontSize(11);
      analysisResult.suggestions.forEach(s => {
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }
        doc.setFontSize(11);
        doc.text(`• ${s.trait}`, 20, yPos);
        yPos += 6;
        doc.setFontSize(10);
        const suggLines = doc.splitTextToSize(s.suggestion, 170);
        doc.text(suggLines, 25, yPos);
        yPos += suggLines.length * 5 + 5;
      });
    }

    doc.save(`personality-analysis-${isDetailed ? 'detailed-' : ''}${fileName?.split('.')[0] || 'report'}.pdf`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-purple-950/10 dark:to-pink-950/10 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-200 dark:bg-purple-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-pink-200 dark:bg-pink-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Personality Analyzer
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Discover hidden personality traits through the science of graphology. Upload handwriting samples for instant psychological insights.
          </p>
        </div>

        {/* Upload Section - Always visible at top */}
        {!analysisResult && (
          <div className="mb-10">
            <div
              className={`bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border-2 transition-all duration-300 max-w-2xl mx-auto ${
                dragOver ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20" : "border-dashed border-gray-300 dark:border-gray-700 hover:border-gray-400"
              }`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button variant="primary" as="label">
                    Browse Image
                    <input type="file" accept="image/*" onChange={onFileChange} className="hidden" />
                  </Button>
                  {sourceUrl && <Button variant="secondary" onClick={() => { setSourceUrl(null); setFileName(null); setAnalysisResult(null); }}>Clear</Button>}
                </div>
                <p className="mt-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
                  {fileName || "Load an image with Handwriting for the person you wish to have a personality analysis"}
                </p>
              </div>
            </div>

            {sourceUrl && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 max-w-2xl mx-auto mt-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white border-b dark:border-gray-700 pb-2 mb-4">Image Preview</h3>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 p-4">
                  <img 
                    src={sourceUrl} 
                    alt="Handwriting sample" 
                    className="max-w-full h-auto rounded-lg shadow-lg"
                  />
                </div>
                <Button 
                  variant="primary" 
                  className="w-full mt-6 py-4 shadow-lg flex items-center justify-center gap-3" 
                  onClick={analyzeHandwriting}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      Analyze Personality
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Results Layout - When analysis is complete */}
        {analysisResult && (
          <div className="grid lg:grid-cols-12 gap-6 mb-10">
            {/* Left Sidebar: Preview & Controls */}
            <div className="lg:col-span-3 space-y-4">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 sticky top-4">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white border-b dark:border-gray-700 pb-2 mb-3">Image Preview</h3>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700 p-2 mb-3">
                  <img 
                    src={sourceUrl || ''} 
                    alt="Handwriting sample" 
                    className="max-w-full h-auto rounded-lg"
                  />
                </div>
                <Button 
                  variant="secondary" 
                  className="w-full py-2 text-sm flex items-center justify-center gap-2" 
                  onClick={() => { setSourceUrl(null); setFileName(null); setAnalysisResult(null); }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  New Analysis
                </Button>
              </div>
            </div>

            {/* Main Content: Results */}
            <div className="lg:col-span-9 space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Analysis Results</h3>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                        <button
                          onClick={() => setReportMode("summary")}
                          className={`px-3 py-1 text-xs font-bold rounded transition-all ${
                            reportMode === "summary"
                              ? "bg-purple-600 text-white shadow-md"
                              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                          }`}
                        >
                          Summary
                        </button>
                        <button
                          onClick={() => setReportMode("detailed")}
                          className={`px-3 py-1 text-xs font-bold rounded transition-all ${
                            reportMode === "detailed"
                              ? "bg-purple-600 text-white shadow-md"
                              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                          }`}
                        >
                          Detailed
                        </button>
                      </div>
                      <span className="text-[10px] font-black text-purple-600 uppercase tracking-widest bg-purple-50 dark:bg-purple-900/20 px-2 py-1 rounded">
                        {analysisResult.confidence}% Confidence
                      </span>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-100 dark:border-purple-800">
                      <p className="text-sm font-bold text-gray-700 dark:text-gray-300 leading-relaxed">
                        {analysisResult.overallPersonality}
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest">Personality Traits</h4>
                        <button
                          onClick={() => setShowTraitInfo(!showTraitInfo)}
                          className="text-xs text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-semibold flex items-center gap-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {showTraitInfo ? "Hide Info" : "What do these mean?"}
                        </button>
                      </div>

                      {/* Trait Information Panel */}
                      {showTraitInfo && (
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800 space-y-4">
                          <div>
                            <h5 className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-2">Understanding the Percentages</h5>
                            <div className="space-y-2 text-xs text-gray-700 dark:text-gray-300">
                              <div className="flex items-start gap-2">
                                <span className="font-bold text-blue-600 dark:text-blue-400">0-20%:</span>
                                <span>Very low - extreme preference for the opposite characteristic, may indicate highly specialized personality style</span>
                              </div>
                              <div className="flex items-start gap-2">
                                <span className="font-bold text-blue-600 dark:text-blue-400">21-40%:</span>
                                <span>Low - clear preference for the opposite characteristic</span>
                              </div>
                              <div className="flex items-start gap-2">
                                <span className="font-bold text-blue-600 dark:text-blue-400">41-60%:</span>
                                <span>Average range - balanced approach, adaptable to different situations</span>
                              </div>
                              <div className="flex items-start gap-2">
                                <span className="font-bold text-blue-600 dark:text-blue-400">61-80%:</span>
                                <span>High - strong preference for this characteristic</span>
                              </div>
                              <div className="flex items-start gap-2">
                                <span className="font-bold text-blue-600 dark:text-blue-400">81-100%:</span>
                                <span>Very high - extreme preference, may indicate highly specialized personality style</span>
                              </div>
                            </div>
                            <div className="mt-3 p-2 bg-blue-100 dark:bg-blue-900/30 rounded text-xs text-gray-700 dark:text-gray-300">
                              <strong>Note on Extreme Scores (0% or 100%):</strong> Very extreme scores may reflect temporary states (stress, mood), handwriting style variations, or a highly specialized personality. Consider these results as insights rather than absolute measurements, and remember that personality traits can vary across different contexts.
                            </div>
                          </div>

                          <div className="pt-3 border-t border-blue-200 dark:border-blue-700">
                            <h5 className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-3">The Big Five Personality Traits</h5>
                            <div className="space-y-3">
                              <div>
                                <h6 className="text-xs font-bold text-gray-900 dark:text-white mb-1">Openness to Experience</h6>
                                <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                                  Measures creativity, curiosity, and willingness to try new things. High scores indicate imaginative, creative individuals who enjoy exploring ideas and experiences. Low scores suggest preference for familiar routines and practical approaches.
                                </p>
                              </div>
                              <div>
                                <h6 className="text-xs font-bold text-gray-900 dark:text-white mb-1">Conscientiousness</h6>
                                <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                                  Reflects organization, discipline, and reliability. High scores (61-100%) indicate well-organized, detail-oriented individuals who plan ahead and follow through. Low scores (0-40%) suggest flexibility, spontaneity, and adaptability. <strong>Very low scores (0-20%)</strong> may indicate a highly spontaneous, free-spirited approach to life, preference for living in the moment, resistance to rigid structures, and creative/artistic tendencies. This can be a strength in creative fields but may require external support for structured tasks.
                                </p>
                              </div>
                              <div>
                                <h6 className="text-xs font-bold text-gray-900 dark:text-white mb-1">Extraversion</h6>
                                <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                                  Measures social energy and assertiveness. High scores indicate outgoing, energetic individuals who gain energy from social interactions. Low scores suggest preference for quiet, introspective activities and smaller social circles.
                                </p>
                              </div>
                              <div>
                                <h6 className="text-xs font-bold text-gray-900 dark:text-white mb-1">Agreeableness</h6>
                                <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                                  Reflects cooperation, trust, and empathy. High scores indicate cooperative, trusting individuals who value harmony and helping others. Low scores suggest independence, directness, and competitive nature.
                                </p>
                              </div>
                              <div>
                                <h6 className="text-xs font-bold text-gray-900 dark:text-white mb-1">Emotional Stability</h6>
                                <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                                  Measures emotional resilience and stress management. High scores indicate calm, resilient individuals who handle stress well. Lower scores suggest higher emotional sensitivity and reactivity to stress.
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="pt-3 border-t border-blue-200 dark:border-blue-700">
                            <p className="text-xs text-gray-600 dark:text-gray-400 italic">
                              <strong>Note:</strong> These traits are based on graphology (handwriting analysis) and provide insights into personality characteristics. No single trait is "better" than another - each has its own strengths and applications in different contexts.
                            </p>
                          </div>
                        </div>
                      )}

                      {analysisResult.traits.map((trait, idx) => (
                        <div key={idx} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-bold text-gray-900 dark:text-white">{trait.name}</span>
                            <span className="text-xs font-black text-purple-600">{trait.value}%</span>
                          </div>
                          <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                              style={{ width: `${trait.value}%` }}
                            />
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">{trait.description}</p>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t dark:border-gray-700">
                      <div>
                        <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Strengths</h4>
                        <ul className="space-y-1">
                          {analysisResult.strengths.map((s, i) => (
                            <li key={i} className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                              {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Areas to Improve</h4>
                        <ul className="space-y-1">
                          {analysisResult.weaknesses.map((w, i) => (
                            <li key={i} className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                              {w}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Key Insights - Summary Mode */}
                    {reportMode === "summary" && analysisResult.detailedInsights && (
                      <>
                        {/* Key Metrics */}
                        <div className="pt-4 border-t dark:border-gray-700">
                          <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">Key Metrics</h4>
                          <div className="grid grid-cols-3 gap-3">
                            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-100 dark:border-purple-800">
                              <div className="text-center mb-2">
                                <div className="text-lg font-black text-purple-600 dark:text-purple-400">{analysisResult.detailedInsights.leadershipPotential}%</div>
                                <div className="text-[10px] font-bold text-gray-600 dark:text-gray-400 mt-1">Leadership</div>
                              </div>
                              <div className="w-full h-1.5 bg-purple-100 dark:bg-purple-900/50 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                                  style={{ width: `${analysisResult.detailedInsights.leadershipPotential}%` }}
                                />
                              </div>
                            </div>
                            <div className="p-3 bg-pink-50 dark:bg-pink-900/20 rounded-xl border border-pink-100 dark:border-pink-800">
                              <div className="text-center mb-2">
                                <div className="text-lg font-black text-pink-600 dark:text-pink-400">{analysisResult.detailedInsights.creativityIndex}%</div>
                                <div className="text-[10px] font-bold text-gray-600 dark:text-gray-400 mt-1">Creativity</div>
                              </div>
                              <div className="w-full h-1.5 bg-pink-100 dark:bg-pink-900/50 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-500"
                                  style={{ width: `${analysisResult.detailedInsights.creativityIndex}%` }}
                                />
                              </div>
                            </div>
                            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800">
                              <div className="text-center mb-2">
                                <div className="text-lg font-black text-emerald-600 dark:text-emerald-400">{analysisResult.detailedInsights.emotionalIntelligence}%</div>
                                <div className="text-[10px] font-bold text-gray-600 dark:text-gray-400 mt-1">EQ</div>
                              </div>
                              <div className="w-full h-1.5 bg-emerald-100 dark:bg-emerald-900/50 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
                                  style={{ width: `${analysisResult.detailedInsights.emotionalIntelligence}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Quick Insights */}
                        <div className="pt-4 border-t dark:border-gray-700">
                          <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">Quick Insights</h4>
                          <div className="grid md:grid-cols-2 gap-3">
                            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                              <h5 className="text-xs font-bold text-blue-600 dark:text-blue-400 mb-1">Communication</h5>
                              <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed line-clamp-2">
                                {analysisResult.detailedInsights.communicationStyle}
                              </p>
                            </div>
                            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-800">
                              <h5 className="text-xs font-bold text-green-600 dark:text-green-400 mb-1">Work Style</h5>
                              <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed line-clamp-2">
                                {analysisResult.detailedInsights.workStyle}
                              </p>
                            </div>
                            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800">
                              <h5 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-1">Decision-Making</h5>
                              <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed line-clamp-2">
                                {analysisResult.detailedInsights.decisionMakingStyle}
                              </p>
                            </div>
                            <div className="p-3 bg-rose-50 dark:bg-rose-900/20 rounded-xl border border-rose-100 dark:border-rose-800">
                              <h5 className="text-xs font-bold text-rose-600 dark:text-rose-400 mb-1">Relationships</h5>
                              <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed line-clamp-2">
                                {analysisResult.detailedInsights.relationshipCompatibility}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Career Suggestions */}
                        {analysisResult.detailedInsights.careerSuggestions.length > 0 && (
                          <div className="pt-4 border-t dark:border-gray-700">
                            <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-3">Career Suggestions</h4>
                            <div className="flex flex-wrap gap-2">
                              {analysisResult.detailedInsights.careerSuggestions.slice(0, 3).map((career, idx) => (
                                <span key={idx} className="px-3 py-1.5 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 text-xs font-semibold rounded-lg border border-amber-200 dark:border-amber-800">
                                  {career.split(':')[0]}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Behavioral Highlights */}
                        <div className="pt-4 border-t dark:border-gray-700">
                          <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-3">Behavioral Highlights</h4>
                          <div className="grid md:grid-cols-2 gap-3">
                            <div className="p-3 bg-violet-50 dark:bg-violet-900/20 rounded-xl border border-violet-100 dark:border-violet-800">
                              <div className="flex items-center justify-between mb-1">
                                <h5 className="text-xs font-bold text-violet-600 dark:text-violet-400">Risk Tolerance</h5>
                              </div>
                              <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                                {analysisResult.detailedInsights.riskTolerance.split(' - ')[0]}
                              </p>
                            </div>
                            <div className="p-3 bg-violet-50 dark:bg-violet-900/20 rounded-xl border border-violet-100 dark:border-violet-800">
                              <div className="flex items-center justify-between mb-1">
                                <h5 className="text-xs font-bold text-violet-600 dark:text-violet-400">Team Role</h5>
                              </div>
                              <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                                {analysisResult.detailedInsights.teamRole.split(' - ')[0]}
                              </p>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Trait Comparison Chart */}
                  <div className="mt-6 pt-6 border-t dark:border-gray-700">
                    <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">Trait Comparison</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {analysisResult.traits.map((trait, idx) => (
                        <div key={idx} className="relative">
                          <div className="text-center">
                            <div className="text-xs font-bold text-gray-900 dark:text-white mb-1 truncate" title={trait.name}>
                              {trait.name.split(' ')[0]}
                            </div>
                            <div className="relative w-full h-20 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                              <div 
                                className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-purple-500 to-pink-500 transition-all duration-500 flex items-end justify-center"
                                style={{ height: `${trait.value}%` }}
                              >
                                <span className="text-[10px] font-black text-white mb-1">{trait.value}%</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Detailed Insights Section */}
                  {reportMode === "detailed" && analysisResult.detailedInsights && (
                    <div className="mt-6 pt-6 border-t dark:border-gray-700 space-y-6">
                      <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest">Detailed Insights</h4>
                      
                      {/* Communication & Work Style */}
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                          <h5 className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-2">Communication Style</h5>
                          <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                            {analysisResult.detailedInsights.communicationStyle}
                          </p>
                        </div>
                        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-800">
                          <h5 className="text-xs font-black text-green-600 dark:text-green-400 uppercase tracking-widest mb-2">Work Style</h5>
                          <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                            {analysisResult.detailedInsights.workStyle}
                          </p>
                        </div>
                      </div>

                      {/* Leadership & Creativity */}
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-100 dark:border-purple-800">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="text-xs font-black text-purple-600 dark:text-purple-400 uppercase tracking-widest">Leadership Potential</h5>
                            <span className="text-xs font-black text-purple-600">{analysisResult.detailedInsights.leadershipPotential}%</span>
                          </div>
                          <div className="w-full h-2 bg-purple-100 dark:bg-purple-900/50 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                              style={{ width: `${analysisResult.detailedInsights.leadershipPotential}%` }}
                            />
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                            {analysisResult.detailedInsights.leadershipPotential > 70 
                              ? "Strong leadership qualities with natural influence"
                              : analysisResult.detailedInsights.leadershipPotential > 50
                              ? "Moderate leadership potential with growth opportunities"
                              : "Prefers collaborative or supportive roles"}
                          </p>
                        </div>
                        <div className="p-4 bg-pink-50 dark:bg-pink-900/20 rounded-xl border border-pink-100 dark:border-pink-800">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="text-xs font-black text-pink-600 dark:text-pink-400 uppercase tracking-widest">Creativity Index</h5>
                            <span className="text-xs font-black text-pink-600">{analysisResult.detailedInsights.creativityIndex}%</span>
                          </div>
                          <div className="w-full h-2 bg-pink-100 dark:bg-pink-900/50 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-500"
                              style={{ width: `${analysisResult.detailedInsights.creativityIndex}%` }}
                            />
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                            {analysisResult.detailedInsights.creativityIndex > 70 
                              ? "Highly creative with innovative thinking"
                              : analysisResult.detailedInsights.creativityIndex > 50
                              ? "Balanced creativity with practical application"
                              : "Prefer structured and proven approaches"}
                          </p>
                        </div>
                      </div>

                      {/* Career Suggestions */}
                      <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-100 dark:border-amber-800">
                        <h5 className="text-xs font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest mb-3">Career Suggestions</h5>
                        <div className="space-y-2">
                          {analysisResult.detailedInsights.careerSuggestions.map((career, idx) => (
                            <div key={idx} className="flex items-start gap-2">
                              <svg className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              <p className="text-xs text-gray-700 dark:text-gray-300">{career}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Relationship Compatibility */}
                      <div className="p-4 bg-rose-50 dark:bg-rose-900/20 rounded-xl border border-rose-100 dark:border-rose-800">
                        <h5 className="text-xs font-black text-rose-600 dark:text-rose-400 uppercase tracking-widest mb-2">Relationship Compatibility</h5>
                        <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                          {analysisResult.detailedInsights.relationshipCompatibility}
                        </p>
                      </div>

                      {/* Graphology Features */}
                      <div className="space-y-3">
                        <h5 className="text-xs font-black text-gray-400 uppercase tracking-widest">Graphology Features</h5>
                        <div className="grid md:grid-cols-2 gap-3">
                          <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-100 dark:border-gray-700">
                            <h6 className="text-xs font-bold text-gray-900 dark:text-white mb-1">Letter Formations</h6>
                            <p className="text-xs text-gray-600 dark:text-gray-400">{analysisResult.detailedInsights.letterFormations}</p>
                          </div>
                          <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-100 dark:border-gray-700">
                            <h6 className="text-xs font-bold text-gray-900 dark:text-white mb-1">Loops</h6>
                            <p className="text-xs text-gray-600 dark:text-gray-400">{analysisResult.detailedInsights.loops}</p>
                          </div>
                          <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-100 dark:border-gray-700">
                            <h6 className="text-xs font-bold text-gray-900 dark:text-white mb-1">I-Dots</h6>
                            <p className="text-xs text-gray-600 dark:text-gray-400">{analysisResult.detailedInsights.iDots}</p>
                          </div>
                          <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-100 dark:border-gray-700">
                            <h6 className="text-xs font-bold text-gray-900 dark:text-white mb-1">T-Bars</h6>
                            <p className="text-xs text-gray-600 dark:text-gray-400">{analysisResult.detailedInsights.tBars}</p>
                          </div>
                        </div>
                      </div>

                      {/* Stress Indicators */}
                      <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-800">
                        <h5 className="text-xs font-black text-red-600 dark:text-red-400 uppercase tracking-widest mb-2">Stress Indicators</h5>
                        <div className="space-y-1">
                          {analysisResult.detailedInsights.stressIndicators.map((indicator, idx) => (
                            <p key={idx} className="text-xs text-gray-700 dark:text-gray-300 flex items-start gap-2">
                              <span className="text-red-500 mt-0.5">•</span>
                              {indicator}
                            </p>
                          ))}
                        </div>
                      </div>

                      {/* Cognitive & Learning Section */}
                      <div className="space-y-4 pt-4 border-t dark:border-gray-700">
                        <h5 className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Cognitive & Learning</h5>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800">
                            <h6 className="text-xs font-bold text-indigo-700 dark:text-indigo-300 mb-2">Cognitive Style</h6>
                            <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">{analysisResult.detailedInsights.cognitiveStyle}</p>
                          </div>
                          <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800">
                            <h6 className="text-xs font-bold text-indigo-700 dark:text-indigo-300 mb-2">Learning Style</h6>
                            <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">{analysisResult.detailedInsights.learningStyle}</p>
                          </div>
                          <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800">
                            <h6 className="text-xs font-bold text-indigo-700 dark:text-indigo-300 mb-2">Decision-Making Style</h6>
                            <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">{analysisResult.detailedInsights.decisionMakingStyle}</p>
                          </div>
                          <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800">
                            <h6 className="text-xs font-bold text-indigo-700 dark:text-indigo-300 mb-2">Problem-Solving Approach</h6>
                            <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">{analysisResult.detailedInsights.problemSolvingApproach}</p>
                          </div>
                          <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800">
                            <h6 className="text-xs font-bold text-indigo-700 dark:text-indigo-300 mb-2">Memory Style</h6>
                            <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">{analysisResult.detailedInsights.memoryStyle}</p>
                          </div>
                          <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800">
                            <h6 className="text-xs font-bold text-indigo-700 dark:text-indigo-300 mb-2">Intuition vs Logic</h6>
                            <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">{analysisResult.detailedInsights.intuitionVsLogic}</p>
                          </div>
                        </div>
                      </div>

                      {/* Work & Career Section */}
                      <div className="space-y-4 pt-4 border-t dark:border-gray-700">
                        <h5 className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Work & Career</h5>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800">
                            <h6 className="text-xs font-bold text-emerald-700 dark:text-emerald-300 mb-2">Work Environment</h6>
                            <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">{analysisResult.detailedInsights.workEnvironmentPreference}</p>
                          </div>
                          <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800">
                            <h6 className="text-xs font-bold text-emerald-700 dark:text-emerald-300 mb-2">Team Role</h6>
                            <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">{analysisResult.detailedInsights.teamRole}</p>
                          </div>
                          <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800">
                            <h6 className="text-xs font-bold text-emerald-700 dark:text-emerald-300 mb-2">Time Management</h6>
                            <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">{analysisResult.detailedInsights.timeManagementStyle}</p>
                          </div>
                          <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800">
                            <h6 className="text-xs font-bold text-emerald-700 dark:text-emerald-300 mb-2">Attention to Detail</h6>
                            <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">{analysisResult.detailedInsights.attentionToDetail}</p>
                          </div>
                          <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800">
                            <h6 className="text-xs font-bold text-emerald-700 dark:text-emerald-300 mb-2">Multitasking Ability</h6>
                            <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">{analysisResult.detailedInsights.multitaskingAbility}</p>
                          </div>
                          <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800">
                            <h6 className="text-xs font-bold text-emerald-700 dark:text-emerald-300 mb-2">Focus Duration</h6>
                            <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">{analysisResult.detailedInsights.focusDuration}</p>
                          </div>
                        </div>
                        <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800">
                          <h6 className="text-xs font-bold text-emerald-700 dark:text-emerald-300 mb-2">Motivation Factors</h6>
                          <div className="space-y-1 mt-2">
                            {analysisResult.detailedInsights.motivationFactors.map((factor, idx) => (
                              <p key={idx} className="text-xs text-gray-700 dark:text-gray-300 flex items-start gap-2">
                                <span className="text-emerald-600 mt-0.5">•</span>
                                {factor}
                              </p>
                            ))}
                          </div>
                        </div>
                        <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800">
                          <h6 className="text-xs font-bold text-emerald-700 dark:text-emerald-300 mb-2">Communication Channels</h6>
                          <div className="space-y-1 mt-2">
                            {analysisResult.detailedInsights.communicationChannels.map((channel, idx) => (
                              <p key={idx} className="text-xs text-gray-700 dark:text-gray-300 flex items-start gap-2">
                                <span className="text-emerald-600 mt-0.5">•</span>
                                {channel}
                              </p>
                            ))}
                          </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800">
                            <div className="flex items-center justify-between mb-2">
                              <h6 className="text-xs font-bold text-emerald-700 dark:text-emerald-300">Adaptability Score</h6>
                              <span className="text-xs font-black text-emerald-600">{analysisResult.detailedInsights.adaptabilityScore}%</span>
                            </div>
                            <div className="w-full h-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
                                style={{ width: `${analysisResult.detailedInsights.adaptabilityScore}%` }}
                              />
                            </div>
                          </div>
                          <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800">
                            <div className="flex items-center justify-between mb-2">
                              <h6 className="text-xs font-bold text-emerald-700 dark:text-emerald-300">Emotional Intelligence</h6>
                              <span className="text-xs font-black text-emerald-600">{analysisResult.detailedInsights.emotionalIntelligence}%</span>
                            </div>
                            <div className="w-full h-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
                                style={{ width: `${analysisResult.detailedInsights.emotionalIntelligence}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Social & Relationships Section */}
                      <div className="space-y-4 pt-4 border-t dark:border-gray-700">
                        <h5 className="text-xs font-black text-rose-600 dark:text-rose-400 uppercase tracking-widest">Social & Relationships</h5>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="p-4 bg-rose-50 dark:bg-rose-900/20 rounded-xl border border-rose-100 dark:border-rose-800">
                            <h6 className="text-xs font-bold text-rose-700 dark:text-rose-300 mb-2">Social Energy Level</h6>
                            <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">{analysisResult.detailedInsights.socialEnergyLevel}</p>
                          </div>
                          <div className="p-4 bg-rose-50 dark:bg-rose-900/20 rounded-xl border border-rose-100 dark:border-rose-800">
                            <h6 className="text-xs font-bold text-rose-700 dark:text-rose-300 mb-2">Introversion/Extraversion</h6>
                            <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">{analysisResult.detailedInsights.introversionExtraversionBalance}</p>
                          </div>
                          <div className="p-4 bg-rose-50 dark:bg-rose-900/20 rounded-xl border border-rose-100 dark:border-rose-800">
                            <h6 className="text-xs font-bold text-rose-700 dark:text-rose-300 mb-2">Assertiveness Level</h6>
                            <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">{analysisResult.detailedInsights.assertivenessLevel}</p>
                          </div>
                          <div className="p-4 bg-rose-50 dark:bg-rose-900/20 rounded-xl border border-rose-100 dark:border-rose-800">
                            <h6 className="text-xs font-bold text-rose-700 dark:text-rose-300 mb-2">Trust Level</h6>
                            <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">{analysisResult.detailedInsights.trustLevel}</p>
                          </div>
                          <div className="p-4 bg-rose-50 dark:bg-rose-900/20 rounded-xl border border-rose-100 dark:border-rose-800">
                            <h6 className="text-xs font-bold text-rose-700 dark:text-rose-300 mb-2">Conflict Resolution</h6>
                            <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">{analysisResult.detailedInsights.conflictResolutionStyle}</p>
                          </div>
                          <div className="p-4 bg-rose-50 dark:bg-rose-900/20 rounded-xl border border-rose-100 dark:border-rose-800">
                            <h6 className="text-xs font-bold text-rose-700 dark:text-rose-300 mb-2">Risk Tolerance</h6>
                            <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">{analysisResult.detailedInsights.riskTolerance}</p>
                          </div>
                        </div>
                      </div>

                      {/* Behavioral Patterns Section */}
                      <div className="space-y-4 pt-4 border-t dark:border-gray-700">
                        <h5 className="text-xs font-black text-violet-600 dark:text-violet-400 uppercase tracking-widest">Behavioral Patterns</h5>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="p-4 bg-violet-50 dark:bg-violet-900/20 rounded-xl border border-violet-100 dark:border-violet-800">
                            <h6 className="text-xs font-bold text-violet-700 dark:text-violet-300 mb-2">Perfectionism Tendency</h6>
                            <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">{analysisResult.detailedInsights.perfectionismTendency}</p>
                          </div>
                          <div className="p-4 bg-violet-50 dark:bg-violet-900/20 rounded-xl border border-violet-100 dark:border-violet-800">
                            <h6 className="text-xs font-bold text-violet-700 dark:text-violet-300 mb-2">Procrastination Risk</h6>
                            <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">{analysisResult.detailedInsights.procrastinationRisk}</p>
                          </div>
                          <div className="p-4 bg-violet-50 dark:bg-violet-900/20 rounded-xl border border-violet-100 dark:border-violet-800">
                            <h6 className="text-xs font-bold text-violet-700 dark:text-violet-300 mb-2">Innovation Tendency</h6>
                            <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">{analysisResult.detailedInsights.innovationTendency}</p>
                          </div>
                        </div>
                      </div>

                      {/* Advanced Graphology Section */}
                      <div className="space-y-4 pt-4 border-t dark:border-gray-700">
                        <h5 className="text-xs font-black text-cyan-600 dark:text-cyan-400 uppercase tracking-widest">Advanced Graphology</h5>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="p-4 bg-cyan-50 dark:bg-cyan-900/20 rounded-xl border border-cyan-100 dark:border-cyan-800">
                            <h6 className="text-xs font-bold text-cyan-700 dark:text-cyan-300 mb-2">Letter Connections</h6>
                            <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">{analysisResult.detailedInsights.letterConnections}</p>
                          </div>
                          <div className="p-4 bg-cyan-50 dark:bg-cyan-900/20 rounded-xl border border-cyan-100 dark:border-cyan-800">
                            <h6 className="text-xs font-bold text-cyan-700 dark:text-cyan-300 mb-2">Writing Rhythm</h6>
                            <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">{analysisResult.detailedInsights.writingRhythm}</p>
                          </div>
                          <div className="p-4 bg-cyan-50 dark:bg-cyan-900/20 rounded-xl border border-cyan-100 dark:border-cyan-800">
                            <h6 className="text-xs font-bold text-cyan-700 dark:text-cyan-300 mb-2">Signature Analysis</h6>
                            <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">{analysisResult.detailedInsights.signatureAnalysis}</p>
                          </div>
                        </div>
                        <div className="p-4 bg-cyan-50 dark:bg-cyan-900/20 rounded-xl border border-cyan-100 dark:border-cyan-800">
                          <h6 className="text-xs font-bold text-cyan-700 dark:text-cyan-300 mb-3">Handwriting Zones</h6>
                          <div className="space-y-2">
                            <div>
                              <div className="text-xs font-semibold text-gray-900 dark:text-white mb-1">Upper Zone</div>
                              <p className="text-xs text-gray-700 dark:text-gray-300">{analysisResult.detailedInsights.handwritingZones.upperZone}</p>
                            </div>
                            <div>
                              <div className="text-xs font-semibold text-gray-900 dark:text-white mb-1">Middle Zone</div>
                              <p className="text-xs text-gray-700 dark:text-gray-300">{analysisResult.detailedInsights.handwritingZones.middleZone}</p>
                            </div>
                            <div>
                              <div className="text-xs font-semibold text-gray-900 dark:text-white mb-1">Lower Zone</div>
                              <p className="text-xs text-gray-700 dark:text-gray-300">{analysisResult.detailedInsights.handwritingZones.lowerZone}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Health & Well-being Section */}
                      <div className="space-y-4 pt-4 border-t dark:border-gray-700">
                        <h5 className="text-xs font-black text-orange-600 dark:text-orange-400 uppercase tracking-widest">Health & Well-being</h5>
                        <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-100 dark:border-orange-800">
                          <h6 className="text-xs font-bold text-orange-700 dark:text-orange-300 mb-2">Health Indicators</h6>
                          <div className="space-y-1 mt-2">
                            {analysisResult.detailedInsights.healthIndicators.map((indicator, idx) => (
                              <p key={idx} className="text-xs text-gray-700 dark:text-gray-300 flex items-start gap-2">
                                <span className="text-orange-600 mt-0.5">•</span>
                                {indicator}
                              </p>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white border-b dark:border-gray-700 pb-2 mb-4">Growth Suggestions</h3>
                  <div className="space-y-4">
                    {analysisResult.suggestions.length > 0 ? (
                      analysisResult.suggestions.map((s, idx) => (
                        <div key={idx} className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-700">
                          <h4 className="text-sm font-bold text-purple-600 dark:text-purple-400 mb-2">{s.trait}</h4>
                          <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{s.suggestion}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                        Your personality traits are well-balanced! Continue maintaining your positive qualities.
                      </p>
                    )}
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white border-b dark:border-gray-700 pb-2 mb-4">Export Report</h3>
                  <Button 
                    variant="primary" 
                    className="w-full py-4 shadow-lg flex items-center justify-center gap-3" 
                    onClick={downloadPDF}
                    disabled={!pdfReady}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download Analysis PDF
                  </Button>
                </div>
              </div>
            </div>
        )}

        {/* Google Ads Pane */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mt-10">
          <div className="text-center">
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Advertisement</p>
            <div className="bg-gray-100 dark:bg-gray-900 rounded-xl p-12 border-2 border-dashed border-gray-300 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Google Ads Space - 728 x 90
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                This space is reserved for Google AdSense advertisements
              </p>
            </div>
          </div>
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
      `}</style>
    </div>
  );
}

