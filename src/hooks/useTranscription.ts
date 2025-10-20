// useTranscription.ts
import type { Transcription } from "@/components/features/panel/transcript-tab";
import { useState, useEffect, useRef } from "react";

const languageCodeMap = {
  'en': 'en-US',
  'es': 'es-ES',
  'fr': 'fr-FR',
  'de': 'de-DE',
  'it': 'it-IT',
  'pt': 'pt-BR',
  'ru': 'ru-RU',
  'ja': 'ja-JP',
  'zh': 'zh-CN',
  'ko': 'ko-KR',
  'ar': 'ar-SA',
  'hi': 'hi-IN',
};

interface TranslationResult { 
  socketId: string, 
  timestamp: string, 
  translatedText: string 
}

export const useTranscription = (
  emit: any, 
  on: any, 
  off: any, 
  connected: boolean, 
  roomId: string, 
  userLanguage = 'en'
) => {
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcriptions, setTranscriptions] = useState<Transcription[]>([]);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const workletNodeRef = useRef<AudioWorkletNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const isProcessingRef = useRef<boolean>(false);
  const chunkCountRef = useRef<number>(0);

  useEffect(() => {
    if (!connected) return;

    const handleTranscriptionResult = ({ 
      socketId, 
      username, 
      transcript, 
      isFinal, 
      timestamp,
      sourceLanguage
    }: Transcription) => {
      console.log('📝 Transcription result:', { socketId, username, transcript, isFinal, sourceLanguage });
      
      setTranscriptions(prev => {
        if (!isFinal) {
          const filtered = prev.filter(t => !(t.socketId === socketId && !t.isFinal));
          return [...filtered, { 
            socketId, 
            username, 
            transcript, 
            isFinal, 
            timestamp,
            sourceLanguage 
          }];
        } else {
          const filtered = prev.filter(t => t.socketId !== socketId || t.isFinal);
          return [...filtered, { 
            socketId, 
            username, 
            transcript, 
            isFinal, 
            timestamp,
            sourceLanguage,
            translatedText: null
          }];
        }
      });
    };

    const handleTranslationComplete = ({ 
      socketId, 
      timestamp, 
      translatedText 
    }: TranslationResult) => {
      console.log('🌐 Translation complete received:', { socketId, timestamp, translatedText });
      
      setTranscriptions(prev => 
        prev.map(t => {
          if (t.socketId === socketId && t.timestamp === timestamp && t.isFinal) {
            console.log('✅ Updated transcription with translation');
            return { ...t, translatedText };
          }
          return t;
        })
      );
    };

    const handleTranscriptionError = ({ error }: any) => {
      console.error('Transcription error:', error);
      alert('Transcription error: ' + error);
    };

    const handleSpeakingStatus = ({ isSpeaking: speaking }: {isSpeaking: boolean}) => {
      setIsSpeaking(speaking);
    };

    on('transcription-result', handleTranscriptionResult);
    on('translation-complete', handleTranslationComplete);
    on('transcription-error', handleTranscriptionError);
    on('speaking-status', handleSpeakingStatus);

    return () => {
      off('transcription-result', handleTranscriptionResult);
      off('translation-complete', handleTranslationComplete);
      off('transcription-error', handleTranscriptionError);
      off('speaking-status', handleSpeakingStatus);
    };
  }, [connected, on, off]);

  const startTranscription = async () => {
    try {
      console.log('Starting transcription...');

      setIsTranscribing(true);
      isProcessingRef.current = true;
      chunkCountRef.current = 0;

      // Request RAW audio without processing (Google's recommendation)
      // See: https://cloud.google.com/speech-to-text/docs/best-practices
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: false,      // Disabled per Google recommendation
          noiseSuppression: false,       // Disabled per Google recommendation
          autoGainControl: false,        // Disabled per Google recommendation
          // channelCount: 1,               // Mono audio
          sampleRate: 16000,             // Native 16kHz (no resampling needed)
        } 
      });
      streamRef.current = stream;
      
      const audioTrack = stream.getAudioTracks()[0];
      const settings = audioTrack.getSettings();
      
      console.log('✅ Got audio stream:', audioTrack.label);
      console.log('✅ Audio settings:', {
        sampleRate: settings.sampleRate,
        channelCount: settings.channelCount,
        echoCancellation: settings.echoCancellation,
        noiseSuppression: settings.noiseSuppression,
        autoGainControl: settings.autoGainControl
      });

      const audioContext = new ((window.AudioContext || (window as any).webkitAudioContext) as typeof AudioContext)();
      audioContextRef.current = audioContext;
      console.log('✅ AudioContext created with sample rate:', audioContext.sampleRate);

      // Load the audio worklet
      await audioContext.audioWorklet.addModule('/audio-processor.js');
      console.log('✅ Audio worklet module loaded');

      const source = audioContext.createMediaStreamSource(stream);
      console.log('✅ Audio source created');

      const workletNode = new AudioWorkletNode(audioContext, 'audio-processor');
      workletNodeRef.current = workletNode;

      // Handle messages from the worklet
      workletNode.port.onmessage = (event) => {
        if (!isProcessingRef.current) {
          return;
        }

        const { audioData, rms, dbFS, chunkCount, sampleRate, resampled } = event.data;
        chunkCountRef.current = chunkCount;

        // One-time log to confirm settings
        if (chunkCount === 1) {
          console.log(`🎤 Audio pipeline initialized:`, {
            sampleRate,
            resampled,
            bufferSize: event.data.length
          });
        }

        // Log audio levels periodically
        if (chunkCount % 50 === 0) {
          const level = rms > 0.01 ? '🔊 Good' : rms > 0.001 ? '🔉 Okay' : '🔇 Too quiet!';
          console.log(`🎤 Audio level: ${dbFS.toFixed(2)} dBFS, RMS: ${rms.toFixed(4)} ${level}`);
        }

        // Warn if consistently too quiet
        if (rms < 0.001 && chunkCount % 100 === 0) {
          console.warn('⚠️ Audio levels very low - increase microphone volume or get closer to mic!');
        }

        if (chunkCount % 100 === 0) {
          console.log(`📤 Sending audio chunk #${chunkCount} to server`);
        }

        emit('audio-data', audioData);
      };

      source.connect(workletNode);
      workletNode.connect(audioContext.destination);
      console.log('✅ Audio worklet connected to pipeline');

      const googleLanguageCode = (languageCodeMap as Record<string, string>)[userLanguage] || 'en-US';
      console.log(`🌍 Starting transcription with language: ${googleLanguageCode} (user preference: ${userLanguage})`);
      
      emit('start-transcription', { 
        roomId, 
        languageCode: googleLanguageCode 
      });

      console.log('✅ Transcription started - audio pipeline active');
    } catch (error) {
      console.error('❌ Error starting transcription:', error);
      setIsTranscribing(false);
      isProcessingRef.current = false;
      
      // More helpful error messages
      if ((error as any).name === 'NotAllowedError') {
        alert('Microphone access denied. Please allow microphone permissions and try again.');
      } else if ((error as any).name === 'NotFoundError') {
        alert('No microphone found. Please connect a microphone and try again.');
      } else {
        alert((error as any).message || "Failed to start transcription");
      }
    }
  };

  const stopTranscription = () => {
    console.log('Stopping transcription...');

    isProcessingRef.current = false;

    if (workletNodeRef.current) {
      workletNodeRef.current.disconnect();
      workletNodeRef.current.port.close();
      workletNodeRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    emit('stop-transcription');
    setIsTranscribing(false);
    setIsSpeaking(false);
    console.log('Transcription stopped');
  };

  const toggleTranscription = () => {
    if (isTranscribing) {
      stopTranscription();
    } else {
      startTranscription();
    }
  };

  useEffect(() => {
    return () => {
      if (isProcessingRef.current) {
        stopTranscription();
      }
    };
  }, []);

  return {
    isTranscribing,
    isSpeaking,
    transcriptions,
    toggleTranscription,
    startTranscription,
    stopTranscription,
  };
};