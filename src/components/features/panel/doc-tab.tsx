import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Document from "./document";
import PanelLayout from "./layout";

interface DocumentItem {
  title: string;
  type: string;
  size: string;
  id?: string;
}

interface DocsTabProps {
  meetingId?: string;
}

const DocsTab = ({ meetingId }: DocsTabProps) => {
  const [documents, setDocuments] = useState<DocumentItem[]>([
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
  ]);
  
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileType = (filename: string): string => {
    const ext = filename.split('.').pop()?.toUpperCase() || 'FILE';
    return ext;
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File too large", {
        description: "File size must be less than 10MB"
      });
      return;
    }

    // Validate file type (common document types)
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Invalid file type", {
        description: "Please upload PDF, DOC, DOCX, TXT, XLS, XLSX, PPT, or PPTX files."
      });
      return;
    }

    setIsUploading(true);

    // Show uploading toast
    const uploadingToast = toast.loading("Uploading document...", {
      description: file.name
    });

    try {
      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      formData.append('meeting_id', meetingId || window.location.pathname.split('/').pop() || 'default-room');

      // Upload to API
      const response = await fetch('https://r5m2o3uxbfo3sr-8010.proxy.runpod.net/api/embedding/document', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail?.[0]?.msg || `Upload failed: ${response.statusText}`);
      }

      const documentId = await response.text();
      console.log('Document uploaded successfully:', documentId);

      // Add document to list
      const newDocument: DocumentItem = {
        id: documentId,
        title: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
        type: getFileType(file.name),
        size: formatFileSize(file.size)
      };

      setDocuments(prev => [newDocument, ...prev]);

      // Show success toast
      toast.success("Document uploaded successfully!", {
        description: `${file.name} has been added to the meeting`,
        id: uploadingToast
      });

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (error) {
      console.error('Upload error:', error);
      
      // Show error toast
      toast.error("Upload failed", {
        description: error instanceof Error ? error.message : 'Failed to upload document. Please try again.',
        id: uploadingToast
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <PanelLayout>
      <ScrollArea className="flex-1 w-80 sm:w-[95%] border rounded-md">
        <div className="h-120 xs:w-72 flex flex-col items-start justify-start space-y-2 pl-2 py-4">
          {documents.length === 0 ? (
            <div className="w-full text-center py-8 text-muted-foreground text-sm">
              No documents yet. Upload a document to get started.
            </div>
          ) : (
            documents.map((doc, index) => (
              <Document 
                key={doc.id || index}
                title={doc.title} 
                type={doc.type} 
                size={doc.size} 
              />
            ))
          )}
        </div>
      </ScrollArea>

      <div className="py-2 w-full sm:w-[95%] border-border">
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx"
          onChange={handleFileChange}
          disabled={isUploading}
        />
        <Button 
          variant="outline" 
          className="w-full cursor-pointer"
          onClick={handleFileSelect}
          disabled={isUploading}
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Attach Document
            </>
          )}
        </Button>
      </div>
    </PanelLayout>
  );
};

export default DocsTab;