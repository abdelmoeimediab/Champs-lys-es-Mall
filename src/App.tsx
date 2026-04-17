/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef } from 'react';
import { GoogleGenAI, Modality } from "@google/genai";
import { motion, AnimatePresence } from "motion/react";
import { Play, Square, Download, Loader2, Volume2, Sparkles, Building2, MapPin } from 'lucide-react';

const DEFAULT_SCRIPT = `Under World Hotel World Management experience

Every brand enjoys consistent quality, steady footfall

And a premium environment

From F&B, fashion to the administrative spaces

Operate at the next level at the Champs Élysées Mall

Your gateway to a real presence in the New Capital`;

const VOICES = [
  { id: 'Kore', name: 'Kore', description: 'Professional & Warm' },
  { id: 'Zephyr', name: 'Zephyr', description: 'Confident & Smooth' },
  { id: 'Puck', name: 'Puck', description: 'Energetic & Bright' },
  { id: 'Charon', name: 'Charon', description: 'Deep & Authoritative' },
  { id: 'Fenrir', name: 'Fenrir', description: 'Mellow & Calm' },
];

export default function App() {
  const [script, setScript] = useState(DEFAULT_SCRIPT);
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [selectedVoice, setSelectedVoice] = useState('Kore');
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const generateVoiceover = async () => {
    if (!script.trim()) return;
    
    setIsGenerating(true);
    setError(null);
    setAudioUrl(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const prompt = `Generate a premium corporate voice-over in English for a luxury mall promotional reel.
Tone: elegant, confident, warm, and aspirational.
Voice style: professional commercial documentary, smooth pacing, clear pronunciation, neutral international English accent.
Emotion: subtle prestige, trust, and success.
Delivery: not too fast, not dramatic, not overly salesy.
Keep the performance polished and luxurious, suitable for a high-end real estate and retail branding video.
Use natural pauses between lines for a cinematic feel.

Script:
${script}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-tts-preview",
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: selectedVoice },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      
      if (base64Audio) {
        // Gemini TTS returns raw PCM 24kHz mono. 
        // We need to convert it to a WAV file to play it in a standard audio element.
        const wavBlob = createWavBlob(base64Audio, 24000);
        const url = URL.createObjectURL(wavBlob);
        setAudioUrl(url);
      } else {
        throw new Error("No audio data received from the model.");
      }
    } catch (err) {
      console.error("Error generating voiceover:", err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Helper to create a WAV blob from raw PCM data
  const createWavBlob = (base64Data: string, sampleRate: number) => {
    const binaryString = atob(base64Data);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // WAV Header
    const buffer = new ArrayBuffer(44 + bytes.length);
    const view = new DataView(buffer);

    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + bytes.length, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM format
    view.setUint16(22, 1, true); // Mono
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true); // Byte rate
    view.setUint16(32, 2, true); // Block align
    view.setUint16(34, 16, true); // Bits per sample
    writeString(36, 'data');
    view.setUint32(40, bytes.length, true);

    // Copy PCM data
    const output = new Uint8Array(buffer);
    output.set(bytes, 44);

    return new Blob([buffer], { type: 'audio/wav' });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 md:p-12">
      <div className="max-w-4xl w-full space-y-12">
        {/* Header Section */}
        <header className="text-center space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex items-center justify-center gap-3 text-gold-600 mb-2"
          >
            <Building2 size={20} strokeWidth={1.5} />
            <span className="premium-label mb-0">New Capital Development</span>
            <MapPin size={20} strokeWidth={1.5} />
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-7xl font-serif font-light tracking-tight text-stone-900"
          >
            Champs Élysées <span className="italic">Mall</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="text-stone-500 tracking-[0.3em] uppercase text-[10px] font-medium"
          >
            Premium Voice-Over Production Suite
          </motion.p>
        </header>

        {/* Main Content */}
        <main className="grid md:grid-cols-5 gap-8 items-start">
          {/* Left Column: Controls & Script */}
          <section className="md:col-span-3 space-y-8">
            <div className="premium-card p-8 space-y-6">
              <div>
                <label className="premium-label">Voiceover Script</label>
                <textarea
                  value={script}
                  onChange={(e) => setScript(e.target.value)}
                  className="premium-input min-h-[250px] resize-none leading-relaxed"
                  placeholder="Enter your script here..."
                />
              </div>

              <div className="flex flex-wrap gap-4 items-center justify-between pt-4">
                <div className="flex gap-2">
                  {VOICES.slice(0, 3).map((voice) => (
                    <button
                      key={voice.id}
                      onClick={() => setSelectedVoice(voice.id)}
                      className={`px-4 py-2 text-[10px] uppercase tracking-widest border transition-all ${
                        selectedVoice === voice.id
                          ? 'bg-stone-900 text-gold-100 border-stone-900'
                          : 'bg-transparent text-stone-500 border-gold-200 hover:border-gold-400'
                      }`}
                    >
                      {voice.name}
                    </button>
                  ))}
                </div>

                <button
                  onClick={generateVoiceover}
                  disabled={isGenerating || !script.trim()}
                  className="premium-button flex items-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="animate-spin" size={16} />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      Generate Audio
                    </>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-4 bg-red-50 border border-red-100 text-red-600 text-sm font-serif italic"
              >
                {error}
              </motion.div>
            )}
          </section>

          {/* Right Column: Playback & Details */}
          <section className="md:col-span-2 space-y-8">
            <AnimatePresence mode="wait">
              {audioUrl ? (
                <motion.div
                  key="playback"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="premium-card p-8 bg-stone-900 text-gold-100 border-none space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <span className="premium-label text-gold-400">Now Playing</span>
                      <h3 className="font-serif text-xl italic">Premium Narration</h3>
                    </div>
                    <Volume2 className="text-gold-400" size={24} />
                  </div>

                  <div className="py-8 flex justify-center">
                    <audio
                      ref={audioRef}
                      src={audioUrl}
                      controls
                      className="w-full accent-gold-400"
                    />
                  </div>

                  <div className="flex gap-4">
                    <a
                      href={audioUrl}
                      download="champs-elysees-voiceover.wav"
                      className="flex-1 flex items-center justify-center gap-2 border border-gold-400/30 py-3 text-[10px] uppercase tracking-widest hover:bg-gold-400/10 transition-colors"
                    >
                      <Download size={14} />
                      Download Master
                    </a>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="premium-card p-8 border-dashed border-gold-300 flex flex-col items-center justify-center text-center space-y-4 min-h-[300px]"
                >
                  <div className="w-16 h-16 rounded-full bg-gold-50 flex items-center justify-center text-gold-400">
                    <Volume2 size={32} strokeWidth={1} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-serif text-lg text-stone-600 italic">Awaiting Generation</h3>
                    <p className="text-xs text-stone-400 max-w-[200px] leading-relaxed">
                      Refine your script and select a voice to produce your premium narration.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="premium-card p-6 space-y-4">
              <h4 className="premium-label">Production Details</h4>
              <ul className="space-y-3 text-[11px] text-stone-500 uppercase tracking-wider">
                <li className="flex justify-between border-b border-gold-100 pb-2">
                  <span>Model</span>
                  <span className="text-stone-800">Gemini 3.1 Flash TTS</span>
                </li>
                <li className="flex justify-between border-b border-gold-100 pb-2">
                  <span>Sample Rate</span>
                  <span className="text-stone-800">24.0 kHz</span>
                </li>
                <li className="flex justify-between border-b border-gold-100 pb-2">
                  <span>Bit Depth</span>
                  <span className="text-stone-800">16-bit PCM</span>
                </li>
                <li className="flex justify-between">
                  <span>Accent</span>
                  <span className="text-stone-800">Neutral International</span>
                </li>
              </ul>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="pt-12 border-t border-gold-200 text-center">
          <p className="text-[10px] text-gold-600 uppercase tracking-[0.4em] font-light">
            Excellence in every syllable.
          </p>
        </footer>
      </div>
    </div>
  );
}
