import { useState, useEffect, useRef } from "react";

// Map simple language codes to Google Cloud Speech language codes
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


export const useTranscription = (emit, on, off, connected, roomId, userLanguage = 'en') => {
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcriptions, setTranscriptions] = useState([]);
  const audioContextRef = useRef(null);
  const processorRef = useRef(null);
  const streamRef = useRef(null);
  const isProcessingRef = useRef(false);

  useEffect(() => {
    if (!connected) return;

    const handleTranscriptionResult = ({ 
      socketId, 
      username, 
      transcript, 
      isFinal, 
      timestamp,
      sourceLanguage
    }) => {
      console.log('📝 Transcription result:', { socketId, username, transcript, isFinal, sourceLanguage });
      
      setTranscriptions(prev => {
        if (!isFinal) {
          // Interim result - replace any existing interim for this socket
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
          // Final result - remove any interim and add final
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
    }) => {
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

    const handleTranscriptionError = ({ error }) => {
      console.error('Transcription error:', error);
      alert('Transcription error: ' + error);
    };

    const handleSpeakingStatus = ({ isSpeaking: speaking }) => {
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

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      console.log('✅ Got audio stream:', stream.getAudioTracks()[0].label);

      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = audioContext;
      console.log('✅ AudioContext created with sample rate:', audioContext.sampleRate);

      const source = audioContext.createMediaStreamSource(stream);
      console.log('✅ Audio source created');

      const bufferSize = 4096;
      const processor = audioContext.createScriptProcessor(bufferSize, 1, 1);
      processorRef.current = processor;

      let chunkCount = 0;
      processor.onaudioprocess = (e) => {
        chunkCount++;
        
        if (!isProcessingRef.current) {
          console.log('⏸️ Processing stopped by ref');
          return;
        }

        const inputData = e.inputBuffer.getChannelData(0);
        
        const targetSampleRate = 16000;
        const sourceSampleRate = audioContext.sampleRate;
        const ratio = sourceSampleRate / targetSampleRate;
        const outputLength = Math.floor(inputData.length / ratio);
        const outputData = new Float32Array(outputLength);
        
        for (let i = 0; i < outputLength; i++) {
          const sourceIndex = Math.floor(i * ratio);
          outputData[i] = inputData[sourceIndex];
        }
        
        const int16Data = new Int16Array(outputLength);
        for (let i = 0; i < outputLength; i++) {
          const s = Math.max(-1, Math.min(1, outputData[i]));
          int16Data[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }

        if (chunkCount % 100 === 0) {
          console.log(`📤 Sending audio chunk #${chunkCount} to server (${int16Data.length} samples)`);
        }

        emit('audio-data', int16Data.buffer);
      };

      source.connect(processor);
      processor.connect(audioContext.destination);
      console.log('✅ Audio processor connected to pipeline');

      // Use the user's language for transcription
      const googleLanguageCode = languageCodeMap[userLanguage] || 'en-US';
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
      alert('Failed to start transcription: ' + error.message);
    }
  };

  const stopTranscription = () => {
    console.log('Stopping transcription...');

    isProcessingRef.current = false;

    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
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