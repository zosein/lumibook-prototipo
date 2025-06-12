import { useState, useEffect } from 'react';
import { getUserById } from '../services/profileService';
import { getUserAvatar } from '../services/avatarService';
import { getAuthToken } from '../utils/authUtils';

export function useUserProfile(user, isLoggedIn) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUserProfile() {
      if (!isLoggedIn || !user || !user.id) {
        setProfile(null);
        setLoading(false);
        return;
      }
      try {
        const profileData = await getUserById(user.id, getAuthToken());
        setProfile(profileData);
      } catch (error) {
        setProfile({
          avatar: await getUserAvatar(user.id, getAuthToken()),
          statusConta: "ativa",
          membroDesde: "Janeiro 2024",
          tipoLogin: user.papel === "aluno" ? "matrícula" : "email",
        });
      } finally {
        setLoading(false);
      }
    }
    fetchUserProfile();
  }, [user, user?.id, user?.papel, isLoggedIn]);

  return { profile, loading };
} 