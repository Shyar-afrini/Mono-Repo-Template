import { create } from "zustand";

interface AdminFilesState {
  profileFiles: File[];
  setProfileFiles: (files: File[]) => void;
  clearProfileFiles: () => void;
}

const useAdminsFilesStore = create<AdminFilesState>((set) => ({
  profileFiles: [],
  setProfileFiles: (files) => set({ profileFiles: files }),
  clearProfileFiles: () => set({ profileFiles: [] }),
}));

export default useAdminsFilesStore;
