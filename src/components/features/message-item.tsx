import { useState } from 'react';
import { Languages, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

interface MessageItemProps {
  name: string;
  time: string;
  message: string;
  originalLangCode: string;
  messageId: string;
  onTranslate?: (messageId: string, originalText: string) => void;
  translation?: string;
  isTranslating?: boolean;
}

const MessageItem: React.FC<MessageItemProps> = ({ 
  name, 
  time, 
  message, 
  originalLangCode,
  messageId,
  onTranslate,
  translation,
  isTranslating
}) => {
  const [showTranslation, setShowTranslation] = useState(false);

  const handleTranslateClick = () => {
    if (!translation && onTranslate && !isTranslating) {
      onTranslate(messageId, message);
    }
    setShowTranslation(!showTranslation);
  };

  const isSystemMessage = originalLangCode === "SYSTEM";
  const canTranslate = !isSystemMessage && onTranslate;

  return (
    <div className="flex gap-3 group">
      <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
        <span className="text-sm font-bold text-accent-foreground">
          {getInitials(name)}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-sm">{name}</span>
          <span className="text-xs text-muted-foreground">{time}</span>
        </div>
        <div className="flex items-start gap-2">
          <p className="text-sm leading-relaxed flex-1">
            {showTranslation && translation ? translation : message}
          </p>
          {canTranslate && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={handleTranslateClick}
              disabled={isTranslating}
            >
              {isTranslating ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Languages className="w-3 h-3" />
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageItem;