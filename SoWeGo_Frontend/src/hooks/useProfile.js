import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext'; 

export const useProfile = () => {
  const { currentUser } = useAuth();
  const storageKey = currentUser ? `sowego_profile_${currentUser.email}` : null;

  const [profile, setProfile] = useState(null);
  const [isProfileLoaded, setIsProfileLoaded] = useState(false);

  // 🔥 UPDATED: Extracted to a stable callback
  const loadProfile = useCallback(() => {
    if (storageKey) {
      const saved = localStorage.getItem(storageKey);
      setProfile(saved ? JSON.parse(saved) : null);
    } else {
      setProfile(null);
    }
    setIsProfileLoaded(true);
  }, [storageKey]);

  // 🔥 UPDATED: Now listens for cross-component sync events
  useEffect(() => {
    loadProfile();
    window.addEventListener('storage', loadProfile);
    window.addEventListener('profileSync', loadProfile); // Custom global event
    
    return () => {
      window.removeEventListener('storage', loadProfile);
      window.removeEventListener('profileSync', loadProfile);
    };
  }, [loadProfile]);

  // 🔥 UPDATED: Dispatches the global event whenever data changes
  const updateProfile = useCallback((newData) => {
    setProfile(newData);
    if (storageKey) {
      localStorage.setItem(storageKey, JSON.stringify(newData));
      window.dispatchEvent(new Event('profileSync')); 
    }
  }, [storageKey]);

  const clearProfile = useCallback(() => {
    setProfile(null);
    if (storageKey) {
      localStorage.removeItem(storageKey);
      window.dispatchEvent(new Event('profileSync'));
    }
  }, [storageKey]);

  return { 
    profile, 
    updateProfile, 
    clearProfile, 
    hasProfile: !!profile,
    isProfileLoaded 
  };
};