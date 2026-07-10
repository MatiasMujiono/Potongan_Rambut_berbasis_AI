import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

type SidebarStore = {
  isOpen: boolean;
  isCollapsed: boolean;
  isMobile: boolean;
  toggleMobile: () => void;
  toggleDesktop: () => void;
  closeMobile: () => void;
  checkScreenSize: () => void;
};
interface DashboardStore {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
  isMobile: boolean;
  setMobile: (isMobile: boolean) => void;
}

export const useDashboardStore = create<DashboardStore>((set) => ({
  activeTab: "overview",
  setActiveTab: (tab) => set({ activeTab: tab }),
  isSidebarOpen: false,
  toggleSidebar: () =>
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  closeSidebar: () => set({ isSidebarOpen: false }),
  isMobile: false,
  setMobile: (isMobile) => set({ isMobile }),
}));

export const useSidebarStore = create<SidebarStore>()(
  subscribeWithSelector((set, get) => ({
    isOpen: true,
    isCollapsed: false,
    isMobile: typeof window !== "undefined" && window.innerWidth < 768,

    toggleMobile: () => set((state) => ({ isOpen: !state.isOpen })),

    toggleDesktop: () =>
      set((state) => {
        if (state.isMobile) return { isOpen: !state.isOpen };
        return { isCollapsed: !state.isCollapsed };
      }),

    closeMobile: () => set({ isOpen: false }),

    checkScreenSize: () => {
      if (typeof window === "undefined") return;
      const isMobile = window.innerWidth < 768;

      set({
        isMobile,
        isOpen: isMobile ? false : get().isOpen,
        isCollapsed: isMobile ? false : get().isCollapsed,
      });
    },
  })),
);

if (typeof window !== "undefined") {
  window.addEventListener("resize", () => {
    useSidebarStore.getState().checkScreenSize();
  });

  useSidebarStore.getState().checkScreenSize();
}