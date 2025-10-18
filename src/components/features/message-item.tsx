import { Badge } from "@/components/ui/badge";
import { getInitials } from "../../lib/initial";

interface MessageItemProps {
  name: string, // probably should be formatted
  time: string; // may require formatting
  message: string;
  originalLangCode: string;
}

const userLangCode = "EN"

const MessageItem: React.FC<MessageItemProps> = ({ name, time, message, originalLangCode }) => {

  const isSameLangCode = userLangCode === originalLangCode;

  return (
    <div className="flex gap-3">

      <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
        <span className="text-sm font-bold text-accent-foreground">{getInitials(name)}</span>
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-sm">{name} </span>
          <span className="text-xs text-muted-foreground">{time}</span>
          {!isSameLangCode &&
            <Badge variant="outline" className="text-xs">Translated from ES</Badge>}
        </div>
        <p className="text-sm leading-relaxed">
          {message}
        </p>
      </div>
    </div>
  )
}

export default MessageItem;