/**
 * AvatarUpload Component
 * 
 * Allows students to upload and manage their profile avatar.
 * Uploads to Supabase storage and updates profile.avatar_url.
 */

import { useState, useRef } from 'react';
import { Camera, Loader2, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface AvatarUploadProps {
  currentAvatarUrl?: string | null;
  onAvatarChange?: (url: string) => void;
  size?: 'sm' | 'md' | 'lg';
}

export function AvatarUpload({ 
  currentAvatarUrl, 
  onAvatarChange,
  size = 'lg' 
}: AvatarUploadProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(currentAvatarUrl);

  const sizeClasses = {
    sm: 'h-12 w-12',
    md: 'h-16 w-16',
    lg: 'h-24 w-24',
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      toast({
        variant: 'destructive',
        title: 'Invalid file',
        description: 'Please select an image file.',
      });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast({
        variant: 'destructive',
        title: 'File too large',
        description: 'Please select an image under 2MB.',
      });
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `avatar.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { 
          upsert: true,
          contentType: file.type 
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const newAvatarUrl = `${urlData.publicUrl}?t=${Date.now()}`;

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: newAvatarUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setAvatarUrl(newAvatarUrl);
      onAvatarChange?.(newAvatarUrl);

      toast({
        title: 'Avatar updated',
        description: 'Your profile picture has been updated.',
      });
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast({
        variant: 'destructive',
        title: 'Upload failed',
        description: error.message || 'Failed to upload avatar.',
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative group">
        <Avatar className={`${sizeClasses[size]} border-2 border-muted`}>
          <AvatarImage src={avatarUrl || undefined} alt="Profile" />
          <AvatarFallback className="bg-primary/10">
            <User className="h-8 w-8 text-primary" />
          </AvatarFallback>
        </Avatar>
        <Button
          variant="secondary"
          size="icon"
          className="absolute bottom-0 right-0 h-8 w-8 rounded-full shadow-md"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Camera className="h-4 w-4" />
          )}
        </Button>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      <p className="text-xs text-muted-foreground">
        Click to upload (max 2MB)
      </p>
    </div>
  );
}
