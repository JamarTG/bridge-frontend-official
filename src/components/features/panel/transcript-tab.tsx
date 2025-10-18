import { ScrollArea } from '@/components/ui/scroll-area';
import { useScrollToBottom } from '@/hooks/useScrollToBottom';
import MessageItem from '../message-item';
import PanelLayout from './layout';

const transcriptMessages = [
  {
    name: "Jamari McFarlane",
    message: "We need to do the homework",
    originalLanguageCode: "FR",
    time: "2:34 PM"
  },
  {
    originalLanguageCode: "FR",
    name: "Jordan Campbell",
    message: "Yes I agree",
    time: "2:34 PM",
  },
  {
    originalLanguageCode: "EN",
    name: "Micheal Webb",
    message: "No, we do not have time",
    time: "2:35 PM"
  },
  {
    originalLanguageCode: "FR",
    name: "Jordan Campbell",
    message: "Yes I agree",
    time: "2:34 PM",
  },
  {
    originalLanguageCode: "EN",
    name: "Micheal Webb",
    message: "No, we do not have time",
    time: "2:35 PM"
  },
  {
    originalLanguageCode: "FR",
    name: "Jordan Campbell",
    message: "Yes I agree",
    time: "2:34 PM",
  },
  {
    originalLanguageCode: "EN",
    name: "Micheal Webb",
    message: "No, we do not have time",
    time: "2:35 PM"
  },
];

const TranscriptTab = () => {
  const messagesEndRef = useScrollToBottom(transcriptMessages);

  return (
    <PanelLayout>
  
      <ScrollArea className="flex-1 h-96 w-[95%] border rounded-md">
        <div className="space-y-2 px-4 py-4">
          {transcriptMessages.map((msg, index) => (
            <MessageItem
              key={index}
              name={msg.name}
              time={msg.time}
              message={msg.message}
              originalLangCode={msg.originalLanguageCode}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
    </PanelLayout>
  );
};

export default TranscriptTab;