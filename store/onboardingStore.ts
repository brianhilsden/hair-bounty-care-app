import { create } from 'zustand';

interface OnboardingState {
  // Whether launched from profile edit (vs first-time onboarding)
  isEditMode: boolean;

  // User info
  ageGroup: string | null;
  gender: string | null;

  // Hair photo
  hairPhotoUri: string | null;

  // Hair quiz results
  curlPattern: string | null;
  density: string | null;
  porosity: string | null;
  strandThickness: string | null;
  scalpType: string | null;

  // Goals
  goals: string[];

  // Actions
  setEditMode: (value: boolean) => void;
  setAgeGroup: (ageGroup: string) => void;
  setGender: (gender: string) => void;
  setHairPhoto: (uri: string) => void;
  setHairQuiz: (data: {
    curlPattern?: string;
    density?: string;
    porosity?: string;
    strandThickness?: string;
    scalpType?: string;
  }) => void;
  setGoals: (goals: string[]) => void;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  isEditMode: false,
  ageGroup: null,
  gender: null,
  hairPhotoUri: null,
  curlPattern: null,
  density: null,
  porosity: null,
  strandThickness: null,
  scalpType: null,
  goals: [],

  setEditMode: (value) => set({ isEditMode: value }),
  setAgeGroup: (ageGroup) => set({ ageGroup }),
  setGender: (gender) => set({ gender }),
  setHairPhoto: (uri) => set({ hairPhotoUri: uri }),
  setHairQuiz: (data) => set(data),
  setGoals: (goals) => set({ goals }),
  reset: () =>
    set({
      isEditMode: false,
      ageGroup: null,
      gender: null,
      hairPhotoUri: null,
      curlPattern: null,
      density: null,
      porosity: null,
      strandThickness: null,
      scalpType: null,
      goals: [],
    }),
}));
