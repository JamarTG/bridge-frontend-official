import { Card } from "@/components/ui/card"
import { FileText } from "lucide-react"

interface DocumentProps {
  title: string;
  type: string;
  size: string;
  onDownload?: () => void;
}

const Document: React.FC<DocumentProps> = ({ title, type, size, onDownload }) => {
  return (
    <Card 
      className="min-w-96 p-3 hover:bg-accent/5 cursor-pointer transition-colors"
      onClick={onDownload}
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded flex items-center justify-center flex-shrink-0">
          <FileText className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm mb-1">{title}</p>
          <p className="text-xs text-muted-foreground">{type} · {size}</p>
        </div>
      </div>
    </Card>
  )
}

export default Document