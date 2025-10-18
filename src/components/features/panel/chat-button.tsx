import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { type LucideProps } from 'lucide-react';

interface ChatButtonProps {
  Icon: React.ComponentType<LucideProps>;
  placeholder?: string;
};

const ChatButton: React.FC<ChatButtonProps> = ({ Icon, placeholder }) => {
  return (
    <div className="py-2 w-[95%]">
      <div className="flex gap-2">
        <Input placeholder={placeholder} className="flex-1" />
        <Button variant="outline" className="cursor-pointer">
          <Icon className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default ChatButton;
