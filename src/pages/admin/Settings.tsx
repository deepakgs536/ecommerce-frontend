import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '@/store';
import { loginSuccess } from '@/store/slices/authSlice';
import { UserAPI, MediaAPI } from '@/api/services';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { toast } from 'sonner';
import { Camera, Save, Loader2, User as UserIcon } from 'lucide-react';

export const AdminSettings = () => {
  const { user, token } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    role: '',
    profile_image_url: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) return;
      try {
        const res = await UserAPI.getProfile(user.id);
        const data = res.data.data || res.data;
        
        let signedImageUrl = data.profile_image_url;
        // If there's an image key, resolve its signed URL for display
        if (signedImageUrl && !signedImageUrl.startsWith('http')) {
          try {
            const mediaRes = await MediaAPI.getDownloadUrl(signedImageUrl);
            signedImageUrl = mediaRes.data.url;
          } catch (e) {
            console.error('Failed to resolve profile image URL', e);
          }
        }
        
        setProfileData({
          name: data.name || user.name || '',
          email: data.email || user.email || '',
          role: data.role || user.role || '',
          profile_image_url: signedImageUrl || ''
        });
      } catch (error) {
        toast.error('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setImageUploading(true);
    try {
      // 1. Get presigned upload URL
      const { data } = await MediaAPI.getUploadUrl({
        folder: `profiles/${user.id}`,
        fileName: file.name.replace(/\s+/g, '-'),
        contentType: file.type
      });

      // 2. Upload directly to S3
      await MediaAPI.uploadToS3(data.uploadUrl, file);

      // 3. Immediately save the new image key to the user profile
      const s3Key = data.key;
      await UserAPI.updateProfile(user.id, { profile_image_url: s3Key });
      
      // 4. Fetch the download URL so we can display it right now
      const mediaRes = await MediaAPI.getDownloadUrl(s3Key);
      
      setProfileData(prev => ({ ...prev, profile_image_url: mediaRes.data.url }));
      toast.success('Profile picture updated successfully');
    } catch (error) {
      toast.error('Failed to upload image');
      console.error(error);
    } finally {
      setImageUploading(false);
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    if (!user?.id) return;
    setSaving(true);
    try {
      await UserAPI.updateProfile(user.id, {
        name: profileData.name
      });
      
      // Update Redux state with new name
      if (token) {
        dispatch(loginSuccess({
          user: { ...user, name: profileData.name },
          token
        }));
      }
      
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Settings</h1>
        <p className="text-slate-500 mt-1">Manage your account settings and profile preferences.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_2fr]">
        <Card className="shadow-sm border-slate-100">
          <CardHeader>
            <CardTitle>Profile Picture</CardTitle>
            <CardDescription>Click the image to upload a new one.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-6">
            <div 
              className="relative group cursor-pointer w-40 h-40 rounded-full overflow-hidden border-4 border-white shadow-lg bg-slate-100 flex items-center justify-center"
              onClick={handleImageClick}
            >
              {profileData.profile_image_url ? (
                <img 
                  src={profileData.profile_image_url} 
                  alt="Profile" 
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
              ) : (
                <UserIcon className="w-16 h-16 text-slate-300" />
              )}
              
              <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                {imageUploading ? (
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                ) : (
                  <>
                    <Camera className="w-8 h-8 text-white mb-2" />
                    <span className="text-white text-xs font-semibold">Change Photo</span>
                  </>
                )}
              </div>
            </div>
            
            <input 
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleImageChange}
            />
            
            <p className="text-xs text-slate-400 mt-6 text-center max-w-[200px]">
              Supported formats: JPEG, PNG, WEBP. Max size: 5MB.
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-100">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your personal details here.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium leading-none">Full Name</label>
              <Input 
                id="name"
                value={profileData.name}
                onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                className="h-11"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium leading-none">Email Address</label>
              <Input 
                id="email"
                value={profileData.email}
                disabled
                className="h-11 bg-slate-50 text-slate-500 cursor-not-allowed"
              />
              <p className="text-xs text-slate-400">Email addresses cannot be changed.</p>
            </div>

            <div className="space-y-2">
              <label htmlFor="role" className="text-sm font-medium leading-none">Account Role</label>
              <div className="h-11 px-4 py-2 bg-slate-50 border border-slate-200 rounded-md text-slate-700 capitalize font-medium flex items-center">
                {profileData.role}
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <Button onClick={handleSave} disabled={saving} className="h-11 px-8 rounded-xl shadow-lg shadow-primary/20">
                {saving ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
                ) : (
                  <><Save className="mr-2 h-4 w-4" /> Save Changes</>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
