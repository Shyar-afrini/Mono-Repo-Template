import { CurrentUser } from "@mono-repo-template/types";
import { create } from "zustand";

interface UserStore {
  userInfo: CurrentUser | null;
  setUserInfo: (userInfo: CurrentUser) => void;
  clearUserInfo: () => void;
}

const useUser = create<UserStore>((set) => ({
  userInfo: null,
  setUserInfo: (userInfo: CurrentUser) => set({ userInfo }),
  clearUserInfo: () => set({ userInfo: null }),
}));

export default useUser;
