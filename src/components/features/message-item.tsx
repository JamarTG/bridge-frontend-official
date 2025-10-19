import { getInitials } from "../../lib/initial";

interface MessageItemProps {
  name: string, 
  time: string;
  message: string;
  originalLangCode: string;
}

const MessageItem: React.FC<MessageItemProps> = ({ name, time, message }) => {
  return (
    <div className="flex gap-3">

      <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
        <span className="text-sm font-bold text-accent-foreground">{getInitials(name)}</span>
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-sm">{name} </span>
          <span className="text-xs text-muted-foreground">{time}</span>
         
        </div>
        <p className="text-sm leading-relaxed">
          {message}
        </p>
      </div>
    </div>
  )
}

export default MessageItem;