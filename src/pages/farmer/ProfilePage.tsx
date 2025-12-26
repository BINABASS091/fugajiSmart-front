import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { authApi, API_BASE_URL } from '../../lib/api';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  User as UserIcon,
  Building2,
  MapPin,
  Phone,
  Award,
  Save,
  Camera,
  Mail,
  ShieldCheck,
  ChevronRight,
  UserCheck,
  Zap,
  Star,
  Globe,
  X,
  Check
} from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';

// Helper function to get full avatar URL
const getAvatarUrl = (avatarUrl: string | null | undefined): string | null => {
  if (!avatarUrl) return null;
  // If it's already a full URL, return it
  if (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://') || avatarUrl.startsWith('data:')) {
    return avatarUrl;
  }
  // If it's a relative URL, prepend the API base URL
  const baseUrl = API_BASE_URL.replace('/api/v1', '');
  return `${baseUrl}${avatarUrl.startsWith('/') ? avatarUrl : '/' + avatarUrl}`;
};

export function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [profileData, setProfileData] = useState({
    full_name: '',
    email: '',
    business_name: '',
    location: '',
    phone_number: '',
    experience_years: 0,
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        full_name: (user.first_name || '') + ' ' + (user.last_name || ''),
        email: user.email || '',
        business_name: (user as any).farmer_profile?.business_name || '',
        location: (user as any).farmer_profile?.location || '',
        phone_number: user.phone || '',
        experience_years: (user as any).farmer_profile?.experience_years || 0,
      });
      
      // Set avatar preview from user data
      const avatarUrl = getAvatarUrl((user as any).farmer_profile?.avatar_url || user.avatar_url);
      if (avatarUrl) {
        setAvatarPreview(avatarUrl);
        } else {
        // Fallback to localStorage if no avatar from backend
          const stored = localStorage.getItem('profile_avatar');
          if (stored) setAvatarPreview(stored);
        }
      
      setLoading(false);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    
    try {
      // Update profile via API
      const response = await authApi.getCurrentUser(); // Get current user first to check structure
      
      if (response.error) {
        throw new Error(response.error);
      }

      // Update user profile
      const updateResponse = await fetch(`${API_BASE_URL}/auth/profile/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
        phone: profileData.phone_number,
          business_name: profileData.business_name,
          location: profileData.location,
          experience_years: profileData.experience_years,
        }),
      });

      if (!updateResponse.ok) {
        const errorData = await updateResponse.text();
        throw new Error(errorData || 'Failed to update profile');
      }

      // Refresh user data to get updated profile
      await refreshUser();
      
      setMessage({ text: 'Profile updated successfully!', type: 'success' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({ 
        text: error.message || 'Failed to update profile. Please try again.', 
        type: 'error' 
      });
      setTimeout(() => setMessage(null), 5000);
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setMessage({ text: 'Please select a valid image file (JPG, PNG, etc.)', type: 'error' });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setMessage({ text: 'Image size must be less than 5MB', type: 'error' });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    // Show preview immediately
    const reader = new FileReader();
    reader.onload = () => {
      setAvatarPreview(String(reader.result || ''));
    };
    reader.readAsDataURL(file);

    // Upload to server
    try {
      setUploadingAvatar(true);
      setMessage(null);
      
      const res = await authApi.uploadAvatar(file);
      
      if (res.error) {
        setMessage({ text: res.error || 'Failed to upload avatar', type: 'error' });
        // Revert to previous avatar on error
        const avatarUrl = getAvatarUrl((user as any)?.farmer_profile?.avatar_url || (user as any)?.avatar_url);
        setAvatarPreview(avatarUrl || null);
      } else if (res.data?.avatar_url) {
        // Get full URL
        const fullAvatarUrl = getAvatarUrl(res.data.avatar_url);
        setAvatarPreview(fullAvatarUrl);
        
        // Store in localStorage as backup
        try {
          if (fullAvatarUrl) {
            localStorage.setItem('profile_avatar', fullAvatarUrl);
          }
        } catch (err) {
          // Ignore localStorage errors
        }
        
        // Refresh user data to get updated avatar
        await refreshUser();
        
        setMessage({ text: 'Profile picture updated successfully!', type: 'success' });
        setTimeout(() => setMessage(null), 3000);
      } else {
        throw new Error('No avatar URL returned from server');
      }
    } catch (err: any) {
      setMessage({ 
        text: err.message || 'Failed to upload avatar. Please try again.', 
        type: 'error' 
      });
      
      // Revert to previous avatar on error
      const avatarUrl = getAvatarUrl((user as any)?.farmer_profile?.avatar_url || (user as any)?.avatar_url);
      setAvatarPreview(avatarUrl || null);
      
      setTimeout(() => setMessage(null), 5000);
    } finally {
      setUploadingAvatar(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] animate-pulse">
        <div className="w-16 h-16 border-4 border-gray-50 border-t-gray-900 rounded-full animate-spin mb-6"></div>
        <p className="text-gray-400 font-black uppercase tracking-widest text-sm">Identity Matrix Decoding...</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-20 max-w-6xl mx-auto">
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-4 border-b border-gray-100">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-900 text-white rounded-xl">
              <UserCheck className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Security Credentials</span>
          </div>
          <h1 className="text-5xl font-black text-gray-900 tracking-tighter uppercase leading-none">
            {t('profile.title')} <span className="text-gray-400">/ 0x{user?.id?.slice(0, 4) || 'NULL'}</span>
          </h1>
          <p className="text-gray-500 font-bold text-lg">{t('profile.subtitle')}</p>
        </div>
        <div className="flex items-center gap-4">
          {message && (
            <div className={`px-4 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest animate-[fadeIn_0.3s_ease-out] flex items-center gap-2 ${
              message.type === 'success'
              ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                : 'bg-rose-50 text-rose-600 border-rose-100'
            }`}>
              {message.type === 'success' ? (
                <Check className="w-3 h-3" />
              ) : (
                <X className="w-3 h-3" />
              )}
              {message.text}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Profile Card / Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="bg-gray-900 rounded-[40px] p-8 shadow-2xl shadow-gray-200 text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 bg-white/10 rounded-full group-hover:scale-150 transition-transform duration-700"></div>

            <div className="relative z-10 flex flex-col items-center">
              <div className="relative group/avatar">
                <div className="w-40 h-40 rounded-[2.5rem] overflow-hidden border-4 border-white/20 shadow-2xl relative">
                  {avatarPreview ? (
                    <img 
                      src={avatarPreview} 
                      alt="Profile Avatar" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback to initials if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          const fallback = document.createElement('div');
                          fallback.className = 'w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-4xl font-black text-white';
                          fallback.textContent = (profileData.full_name || 'U')[0].toUpperCase();
                          parent.appendChild(fallback);
                        }
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-4xl font-black text-white">
                      {(profileData.full_name || user?.email || 'U')[0].toUpperCase()}
                    </div>
                  )}
                  {uploadingAvatar && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                  <div 
                    className="absolute inset-0 bg-black/40 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center cursor-pointer" 
                    onClick={handleAvatarClick}
                    title="Click to upload new profile picture"
                  >
                    <Camera className="w-8 h-8 text-white" />
                  </div>
                </div>
                <button
                  onClick={handleAvatarClick}
                  disabled={uploadingAvatar}
                  className="absolute -bottom-2 -right-2 w-12 h-12 bg-white text-gray-900 rounded-2xl shadow-xl flex items-center justify-center hover:scale-110 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Upload profile picture"
                >
                  {uploadingAvatar ? (
                    <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                  <Camera className="w-5 h-5" />
                  )}
                </button>
              </div>

              <div className="mt-8 text-center space-y-1">
                <h3 className="text-2xl font-black uppercase tracking-tight">{profileData.full_name}</h3>
                <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">{user?.role || 'Operational Chief'}</p>
              </div>

              <div className="w-full mt-10 pt-10 border-t border-white/10 space-y-4">
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                  <span className="opacity-40">System Access</span>
                  <span className="text-emerald-400">Authorized</span>
                </div>
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                  <span className="opacity-40">Active Since</span>
                  <span>{new Date(user?.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="bg-white border border-gray-100 rounded-[40px] p-8 shadow-xl shadow-gray-200/40 divide-y divide-gray-50">
            <div className="pb-4 mb-4">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-600 mb-6 flex items-center gap-2">
                <Zap className="w-3 h-3" />
                Performance Metrics
              </h4>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none">Experience</p>
                    <p className="text-sm font-black text-gray-800">{profileData.experience_years} Cycles</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none">Account Status</p>
                    <p className="text-sm font-black text-gray-800">Verified Operator</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Form Area */}
        <div className="lg:col-span-8">
          <Card className="bg-white border border-gray-100 rounded-[40px] shadow-xl shadow-gray-200/40 p-10">
            <form onSubmit={handleSubmit} className="space-y-10">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase">Operational Data</h2>
                <div className="flex items-center gap-2 group cursor-pointer">
                  <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Encryption Level 4</span>
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <UserIcon className="w-3 h-3 text-indigo-600" />
                    {t('profileSettings.fullName')}
                  </Label>
                  <Input
                    value={profileData.full_name}
                    onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                    required
                    className="py-7 rounded-2xl border-none bg-gray-50 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 text-sm font-bold transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <Mail className="w-3 h-3 text-indigo-600" />
                    {t('profileSettings.email')}
                  </Label>
                  <Input
                    value={profileData.email}
                    disabled
                    className="py-7 rounded-2xl border-none bg-gray-100 text-gray-400 text-sm font-bold cursor-not-allowed"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <Building2 className="w-3 h-3 text-indigo-600" />
                    Enterprise Entity
                  </Label>
                  <Input
                    value={profileData.business_name}
                    onChange={(e) => setProfileData({ ...profileData, business_name: e.target.value })}
                    className="py-7 rounded-2xl border-none bg-gray-50 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 text-sm font-bold transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <Globe className="w-3 h-3 text-indigo-600" />
                    Strategic Location
                  </Label>
                  <Input
                    value={profileData.location}
                    onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                    className="py-7 rounded-2xl border-none bg-gray-50 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 text-sm font-bold transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <Phone className="w-3 h-3 text-indigo-600" />
                    Communication Uplink
                  </Label>
                  <Input
                    value={profileData.phone_number}
                    onChange={(e) => setProfileData({ ...profileData, phone_number: e.target.value })}
                    className="py-7 rounded-2xl border-none bg-gray-50 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 text-sm font-bold transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <Award className="w-3 h-3 text-indigo-600" />
                    Experience Vector (Years)
                  </Label>
                  <Input
                    type="number"
                    value={profileData.experience_years}
                    onChange={(e) => setProfileData({ ...profileData, experience_years: parseInt(e.target.value) || 0 })}
                    className="py-7 rounded-2xl border-none bg-gray-50 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 text-sm font-bold transition-all"
                  />
                </div>
              </div>

              <div className="pt-10 border-t border-gray-50">
                <Button
                  type="submit"
                  disabled={saving}
                  className="w-full md:w-auto px-12 py-8 bg-gray-900 border-none hover:bg-black text-white rounded-3xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl transition-all hover:-translate-y-1 active:scale-95 flex items-center gap-4"
                >
                  {saving ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Syncing Data...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Synchronize Profile Configuration
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Card>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
            className="hidden"
            onChange={handleAvatarChange}
            disabled={uploadingAvatar}
          />
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
