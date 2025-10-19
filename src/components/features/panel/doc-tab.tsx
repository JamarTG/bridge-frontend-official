import { useState, useRef, useEffect } from "react";
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

interface ApiFile {
  file_id: string;
  size: number;
  created_at: string;
}

interface ApiResponse {
  meeting_id: string;
  files: ApiFile[];
}

const DocsTab = ({ meetingId }: DocsTabProps) => {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentMeetingId = meetingId || window.location.pathname.split('/').pop() || 'default-room';

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

  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`https://r5m2o3uxbfo3sr-8010.proxy.runpod.net/api/serve/list/${currentMeetingId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch documents: ${response.statusText}`);
      }

      const data: ApiResponse = await response.json();
      
      const mappedDocuments: DocumentItem[] = data.files.map((file: ApiFile) => ({
        id: file.file_id,
        title: file.file_id.replace(/\.[^/.]+$/, ""),
        type: getFileType(file.file_id),
        size: formatFileSize(file.size)
      }));

      setDocuments(mappedDocuments);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error("Failed to load documents", {
        description: error instanceof Error ? error.message : 'Could not load documents for this meeting.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [currentMeetingId]);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File too large", {
        description: "File size must be less than 10MB"
      });
      return;
    }

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

    const uploadingToast = toast.loading("Uploading document...", {
      description: file.name
    });

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`https://r5m2o3uxbfo3sr-8010.proxy.runpod.net/api/serve/upload/${currentMeetingId}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail?.[0]?.msg || `Upload failed: ${response.statusText}`);
      }

      const documentId = await response.text();
      console.log('Document uploaded successfully:', documentId);

      toast.success("Document uploaded successfully!", {
        description: `${file.name} has been added to the meeting`,
        id: uploadingToast
      });

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      await fetchDocuments();

    } catch (error) {
      console.error('Upload error:', error);
      
      toast.error("Upload failed", {
        description: error instanceof Error ? error.message : 'Failed to upload document. Please try again.',
        id: uploadingToast
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = async (documentId: string, title: string) => {
    try {
      const response = await fetch(`https://r5m2o3uxbfo3sr-8010.proxy.runpod.net/api/serve/download/${currentMeetingId}/${documentId}`);
      
      if (!response.ok) {
        throw new Error(`Download failed: ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = documentId;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Download started", {
        description: `${title} is being downloaded`
      });
    } catch (error) {
      console.error('Download error:', error);
      toast.error("Download failed", {
        description: error instanceof Error ? error.message : 'Failed to download document.'
      });
    }
  };

  return (
    <PanelLayout>
      <ScrollArea className="flex-1 w-80 sm:w-[95%] border rounded-md">
        <div className="h-120 xs:w-72 flex flex-col items-start justify-start space-y-2 pl-2 py-4">
          {isLoading ? (
            <div className="flex flex-col justify-center items-centerh-full w-full text-center py-8 text-muted-foreground text-sm">
              <Loader2 className="mx-auto h-6 w-6 animate-spin mb-2" />
              Loading documents...
            </div>
          ) : documents.length === 0 ? (
            <div className="h-full flex justify-center items-center w-full text-center py-8 text-muted-foreground text-sm">
              No documents yet. Upload one to get started.
            </div>
          ) : (
            documents.map((doc, index) => (
              <Document 
                key={doc.id || index}
                title={doc.title} 
                type={doc.type} 
                size={doc.size}
                onDownload={() => handleDownload(doc.id!, doc.title)}
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