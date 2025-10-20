import { type FormEvent, type ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { type LucideIcon } from "lucide-react";

interface ChatButtonProps {
  placeholder: string;
  Icon: LucideIcon;
  value?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  onSubmit?: (e: FormEvent) => void;
  disabled?: boolean;
}

const ChatButton = ({ 
  placeholder, 
  Icon, 
  value = "",
  onChange,
  onSubmit,
  disabled = false
}: ChatButtonProps) => {
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="py-2 w-full sm:w-[95%] border-border">
      <div className="flex items-center gap-2">
        <Input
          type="text"
          placeholder={placeholder}
          className="flex-1"
          value={value}
          onChange={onChange}
          disabled={disabled}
        />
        <Button type="submit" size="icon" disabled={disabled}>
          <Icon className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
};

export default ChatButton;