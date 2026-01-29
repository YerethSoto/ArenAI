import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { getApiUrl } from "../config/api";

// Profile picture definitions - easily extendable
export const PROFILE_PICTURES = [
  {
    id: "axolotl",
    name: "Ajolote",
    path: "/assets/AXOL.jpg",
  },
  {
    id: "fox",
    name: "Zorro",
    path: "/assets/FOX.jpg",
  },
  {
    id: "owl",
    name: "Búho",
    path: "/assets/OWL.JPG",
  },
  // Add new profile pictures here in the future
];

interface ProfilePictureContextType {
  currentProfilePic: string;
  setProfilePic: (id: string) => void;
  getProfilePicPath: (id?: string) => string;
}

const ProfilePictureContext = createContext<
  ProfilePictureContextType | undefined
>(undefined);

export const ProfilePictureProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [currentProfilePic, setCurrentProfilePic] = useState<string>("axolotl");

  useEffect(() => {
    // 1. Try to load from localStorage userData (Backend Sync Source of Truth)
    try {
      const userData = localStorage.getItem("userData");
      if (userData) {
        const user = JSON.parse(userData);
        if (
          user.profilePicture && // Check new field first
          PROFILE_PICTURES.some((p) => p.id === user.profilePicture)
        ) {
          setCurrentProfilePic(user.profilePicture);
          return;
        }
        if (
          user.profile_picture_name && // Fallback to raw DB field name if present
          PROFILE_PICTURES.some((p) => p.id === user.profile_picture_name)
        ) {
          setCurrentProfilePic(user.profile_picture_name);
          return;
        }
      }
    } catch (e) {
      console.error("Failed to load profile picture from userData:", e);
    }

    // 2. Fallback to local preference
    const saved = localStorage.getItem("user_profile_picture");
    if (saved && PROFILE_PICTURES.some((p) => p.id === saved)) {
      setCurrentProfilePic(saved);
    }
  }, []);

  const setProfilePic = async (id: string) => {
    setCurrentProfilePic(id);
    localStorage.setItem("user_profile_picture", id);

    // Update userData locally
    try {
      const userDataStr = localStorage.getItem("userData");
      if (userDataStr) {
        const user = JSON.parse(userDataStr);
        user.profilePicture = id;
        user.profile_picture_name = id;
        localStorage.setItem("userData", JSON.stringify(user));
      }
    } catch (e) {
      console.error("Failed to update userData profile picture:", e);
    }

    // Persist to Backend
    try {
      const authToken = localStorage.getItem("authToken");

      if (authToken) {
        fetch(getApiUrl("/api/users/profile"), {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({ profilePicture: id }),
        }).catch((err) =>
          console.error("Failed to sync profile pic API:", err),
        );
      }
    } catch (error) {
      console.error("Failed to sync profile pic to backend", error);
    }
  };

  const getProfilePicPath = (id?: string): string => {
    const picId = id || currentProfilePic;
    const pic = PROFILE_PICTURES.find((p) => p.id === picId);
    return pic?.path || PROFILE_PICTURES[0].path;
  };

  return (
    <ProfilePictureContext.Provider
      value={{ currentProfilePic, setProfilePic, getProfilePicPath }}
    >
      {children}
    </ProfilePictureContext.Provider>
  );
};

export const useProfilePicture = () => {
  const context = useContext(ProfilePictureContext);
  if (!context) {
    throw new Error(
      "useProfilePicture must be used within a ProfilePictureProvider",
    );
  }
  return context;
};

// Utility function for getting path without context (for other users' pictures)
export const getProfilePicturePath = (id?: string): string => {
  if (!id) return PROFILE_PICTURES[0].path;
  const pic = PROFILE_PICTURES.find((p) => p.id === id);
  return pic?.path || PROFILE_PICTURES[0].path;
};
