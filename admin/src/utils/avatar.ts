const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const HOST_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, '');

export function getAvatarUrl(avatarUrl?: string, fullName: string = 'User'): string {
  if (!avatarUrl || avatarUrl.trim() === '') {
    return `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(fullName)}`;
  }
  if (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://') || avatarUrl.startsWith('data:')) {
    return avatarUrl;
  }
  const cleanPath = avatarUrl.startsWith('/') ? avatarUrl : `/${avatarUrl}`;
  return `${HOST_BASE_URL}${cleanPath}`;
}
