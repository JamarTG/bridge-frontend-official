import { ScrollArea } from '@/components/ui/scroll-area';
import { useScrollToBottom } from '@/hooks/useScrollToBottom';
import PanelLayout from './layout';

export interface Transcription {
  socketId: string;
  username: string;
  transcript: string;
  isFinal: boolean;
  timestamp: string;
  sourceLanguage?: string;
  translatedText?: string | null;
}

interface TranscriptTabProps {
  transcriptions?: Transcription[];
  language?: string;
  streamingTranslation?: string;
  currentTranslatingId?: string | null;
}

const TranscriptTab = ({ 
  transcriptions = [], 
  language = "en", 
  streamingTranslation = "", 
  currentTranslatingId = null 
}: TranscriptTabProps) => {
  const messagesEndRef = useScrollToBottom([transcriptions]);

  console.log('TranscriptTab render:', {
    transcriptionCount: transcriptions.length,
    language,
    streamingTranslation,
    currentTranslatingId,
    transcriptions
  });

  return (
    <PanelLayout>
      <ScrollArea className="flex-1 w-80 sm:w-[95%] border rounded-md">
        <div className="h-120 space-y-2 px-4 py-4">
          {transcriptions.length === 0 ? (
            <div className="h-full flex flex-col justify-center items-center text-center py-8 text-muted-foreground text-sm">
              <p>No transcriptions yet.</p>
              <p className="mt-2 text-xs">Click "Start Transcription" in the controls to begin.</p>
            </div>
          ) : (
            transcriptions.map((trans, idx) => {
              const needsTranslation =
                trans.sourceLanguage && trans.sourceLanguage !== language;
              const translationId = `${trans.socketId}-${trans.timestamp}`;
              const isCurrentlyTranslating = currentTranslatingId === translationId;
              const hasStreamingTranslation =
                isCurrentlyTranslating && streamingTranslation;

              // Don't render foreign interim (non-final) text
              if (!trans.isFinal && needsTranslation) {
                console.log('Skipping interim foreign transcription:', trans);
                return null;
              }

              // Determine what text to show
              let displayText = trans.transcript;
              let showTranslationIndicator = false;

              if (needsTranslation) {
                showTranslationIndicator = true;
                if (trans.translatedText) {
                  displayText = trans.translatedText;
                } else if (hasStreamingTranslation) {
                  displayText = streamingTranslation + "...";
                } else {
                  displayText = "Translating...";
                }
              }

              return (
                <div
                  key={`${trans.socketId}-${trans.timestamp}-${idx}`}
                  className={`${
                    trans.isFinal ? 'bg-background' : 'bg-muted/50'
                  } p-3 rounded-lg border ${
                    trans.isFinal ? 'border-border' : 'border-muted'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-semibold text-sm text-foreground">
                      {trans.username}
                    </span>
                    <div className="flex gap-1 items-center">
                      {!trans.isFinal && (
                        <span className="text-xs bg-muted px-2 py-0.5 rounded">
                          interim
                        </span>
                      )}
                      {showTranslationIndicator && trans.isFinal && (
                        <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded">
                          🌐 translated
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {new Date(trans.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-foreground leading-relaxed">
                    {displayText}
                  </p>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
    </PanelLayout>
  );
};

export default TranscriptTab;