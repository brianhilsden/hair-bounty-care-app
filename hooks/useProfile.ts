import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileApi, CreateHairProfileData } from '../lib/api/profile';

export function useProfile() {
  const queryClient = useQueryClient();

  const profileQuery = useQuery({
    queryKey: ['profile'],
    queryFn: profileApi.getProfile,
    retry: 1,
  });

  const createProfileMutation = useMutation({
    mutationFn: (data: CreateHairProfileData) => profileApi.createProfile(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['profile'] }),
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data: Partial<CreateHairProfileData>) => profileApi.updateProfile(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['profile'] }),
  });

  const uploadPhotoMutation = useMutation({
    mutationFn: (uri: string) => profileApi.uploadHairPhoto(uri),
  });

  return {
    profile: profileQuery.data?.data ?? null,
    isLoading: profileQuery.isLoading,
    isError: profileQuery.isError,
    createProfile: createProfileMutation,
    updateProfile: updateProfileMutation,
    uploadPhoto: uploadPhotoMutation,
  };
}
