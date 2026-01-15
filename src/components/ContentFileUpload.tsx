/**
 * ContentFileUpload Component
 * 
 * Handles file uploads for images and PDFs to Supabase Storage.
 * Shows upload progress and preview.
 */

import { useState, useRef } from 'react';
import { Upload, X, FileText, Image as ImageIcon, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface ContentFileUploadProps {
  type: 'image' | 'pdf';
  value?: string;
  onChange: (url: string | null) => void;
  className?: string;
}

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_PDF_TYPES = ['application/pdf'];
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export function ContentFileUpload({ type, value, onChange, className }: ContentFileUploadProps) {
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(value || null);

  const allowedTypes = type === 'image' ? ALLOWED_IMAGE_TYPES : ALLOWED_PDF_TYPES;
  const acceptString = type === 'image' ? '.jpg,.jpeg,.png,.webp,.gif' : '.pdf';

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!allowedTypes.includes(file.type)) {
      toast({
        variant: 'destructive',
        title: 'Invalid File Type',
        description: type === 'image' 
          ? 'Please upload a JPG, PNG, WEBP, or GIF image.'
          : 'Please upload a PDF file.',
      });
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      toast({
        variant: 'destructive',
        title: 'File Too Large',
        description: 'Maximum file size is 50MB.',
      });
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop()?.toLowerCase() || '';
      const fileName = `${type}/${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('content-files')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('content-files')
        .getPublicUrl(data.path);

      const publicUrl = urlData.publicUrl;

      // Set preview and notify parent
      if (type === 'image') {
        setPreviewUrl(publicUrl);
      } else {
        setPreviewUrl(file.name); // Show filename for PDF
      }
      
      onChange(publicUrl);
      setUploadProgress(100);

      toast({
        title: 'File Uploaded',
        description: `${type === 'image' ? 'Image' : 'PDF'} uploaded successfully.`,
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        variant: 'destructive',
        title: 'Upload Failed',
        description: 'Failed to upload file. Please try again.',
      });
    } finally {
      setUploading(false);
      // Reset input
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    onChange(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const hasFile = previewUrl || value;

  return (
    <div className={cn("space-y-3", className)}>
      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept={acceptString}
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading}
      />

      {/* Upload area or preview */}
      {!hasFile ? (
        <div
          onClick={() => !uploading && inputRef.current?.click()}
          className={cn(
            "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
            "hover:border-primary hover:bg-primary/5",
            uploading && "pointer-events-none opacity-50"
          )}
        >
          {uploading ? (
            <div className="space-y-3">
              <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Uploading...</p>
              <Progress value={uploadProgress} className="h-2 max-w-xs mx-auto" />
            </div>
          ) : (
            <>
              {type === 'image' ? (
                <ImageIcon className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              ) : (
                <FileText className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              )}
              <p className="text-sm font-medium">
                Click to upload {type === 'image' ? 'an image' : 'a PDF'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {type === 'image' 
                  ? 'JPG, PNG, WEBP or GIF (max 50MB)' 
                  : 'PDF file (max 50MB)'}
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {type === 'image' && (previewUrl || value) ? (
                <img
                  src={previewUrl || value}
                  alt="Preview"
                  className="h-16 w-16 object-cover rounded-lg border"
                />
              ) : (
                <div className="h-16 w-16 rounded-lg border bg-muted flex items-center justify-center">
                  <FileText className="h-8 w-8 text-red-500" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                  <p className="text-sm font-medium truncate">
                    {type === 'image' ? 'Image uploaded' : 'PDF uploaded'}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground truncate mt-1">
                  {typeof previewUrl === 'string' && previewUrl.includes('content-files')
                    ? 'Stored in cloud'
                    : (previewUrl || value)?.substring(0, 50) + '...'}
                </p>
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => inputRef.current?.click()}
                disabled={uploading}
              >
                <Upload className="h-4 w-4 mr-1" />
                Replace
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemove}
                className="text-destructive hover:text-destructive"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
