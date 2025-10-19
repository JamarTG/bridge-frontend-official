import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import Document from "./document";
import PanelLayout from "./layout";

const documents = [
  {
    title: "Area Map - Sector S",
    type: "DOCX",
    size: "1.8 MB"
  },
  {
    title: "Contact Directory",
    type: "DOCX",
    size: "124 KB"
  }
];

const DocsTab = () => {
  return (
    <PanelLayout>
      <ScrollArea className="flex-1 w-80 sm:w-[95%] border rounded-md">
        <div className="h-120 xs:w-72  flex flex-col items-start justify-start space-y-2 pl-2 py-4">
          {documents.map((doc, index) => (
            <Document 
              key={index}
              title={doc.title} 
              type={doc.type} 
              size={doc.size} 
            />
          ))}
        </div>
      </ScrollArea>

      <div className="py-2 w-full sm:w-[95%] border-border">
        <Button variant="outline" className="w-full cursor-pointer">
          <span className="mr-2">+</span>
          Attach Document
        </Button>
      </div>
    </PanelLayout>
  );
};

export default DocsTab;