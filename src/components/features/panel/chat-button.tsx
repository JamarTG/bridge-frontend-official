import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { type LucideProps } from 'lucide-react';

interface ChatButtonProps {
  Icon: React.ComponentType<LucideProps>;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit?: (e: React.FormEvent) => void;
  disabled?: boolean;
}

const ChatButton: React.FC<ChatButtonProps> = ({ 
  Icon, 
  placeholder = "Type a message...", 
  value, 
  onChange, 
  onSubmit, 
  disabled = false 
}) => {
  // Ensure value is always a string
  const inputValue = value ?? "";
  
  const handleSubmit = (e: React.MouseEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !disabled && onSubmit) {
      const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
      onSubmit(fakeEvent);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (inputValue.trim() && !disabled && onSubmit) {
        const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
        onSubmit(fakeEvent);
      }
    }
  };

  return (
    <div className="py-2 w-[95%]">
      <div className="flex gap-2">
        <Input 
          placeholder={placeholder} 
          className="flex-1" 
          value={inputValue}
          onChange={onChange}
          onKeyDown={handleKeyDown}
          disabled={disabled}
        />
        <Button 
          variant="outline" 
          className="cursor-pointer"
          onClick={handleSubmit}
          disabled={disabled || !inputValue.trim()}
        >
          <Icon className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default ChatButton;