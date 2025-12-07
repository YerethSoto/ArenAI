import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

export type AvatarType = "capybara" | "sloth";

interface AvatarAssets {
  open: string;
  closed: string;
  wink: string;
}

interface AvatarContextType {
  currentAvatar: AvatarType;
  setAvatar: (avatar: AvatarType) => void;
  getAvatarAssets: () => AvatarAssets;
}

const AvatarContext = createContext<AvatarContextType | undefined>(undefined);

export const AvatarProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [currentAvatar, setCurrentAvatar] = useState<AvatarType>("capybara");

  useEffect(() => {
    const saved = localStorage.getItem("user_avatar");
    if (saved === "sloth" || saved === "capybara") {
      setCurrentAvatar(saved);
    }
  }, []);

  const setAvatar = (avatar: AvatarType) => {
    setCurrentAvatar(avatar);
    localStorage.setItem("user_avatar", avatar);
  };

  const getAvatarAssets = (): AvatarAssets => {
    if (currentAvatar === "sloth") {
      return {
        open: "/assets/profile_picture_sloth_eyes_open.png",
        closed: "/assets/profile_picture_sloth_eyes_closed.png",
        wink: "/assets/profile_picture_sloth_winking.png",
      };
    }
    // Default Capybara
    return {
      open: "/assets/profile_picture_capybara_eyes_open.png",
      closed: "/assets/profile_picture_capybara_eyes_closed.png",
      wink: "/assets/profile_picture_capybara_wink.png",
    };
  };

  return (
    <AvatarContext.Provider
      value={{ currentAvatar, setAvatar, getAvatarAssets }}
    >
      {children}
    </AvatarContext.Provider>
  );
};

export const useAvatar = () => {
  const context = useContext(AvatarContext);
  if (!context) {
    throw new Error("useAvatar must be used within an AvatarProvider");
  }
  return context;
};
