export const DEFAULT_MY_PROFILE_IMAGE_SRC = "/figma/assets/nav-profile.png";
export const MY_PROFILE_IMAGE_STORAGE_KEY = "artroom:my-profile-image";
export const MY_PROFILE_IMAGE_UPDATED_EVENT = "artroom:my-profile-image-updated";

export function readStoredProfileImage() {
  if (typeof window === "undefined") {
    return DEFAULT_MY_PROFILE_IMAGE_SRC;
  }

  return (
    window.localStorage.getItem(MY_PROFILE_IMAGE_STORAGE_KEY) ??
    DEFAULT_MY_PROFILE_IMAGE_SRC
  );
}

export function saveStoredProfileImage(src: string) {
  window.localStorage.setItem(MY_PROFILE_IMAGE_STORAGE_KEY, src);
  window.dispatchEvent(
    new CustomEvent(MY_PROFILE_IMAGE_UPDATED_EVENT, { detail: src }),
  );
}

export function clearStoredProfileImage() {
  window.localStorage.removeItem(MY_PROFILE_IMAGE_STORAGE_KEY);
  window.dispatchEvent(
    new CustomEvent(MY_PROFILE_IMAGE_UPDATED_EVENT, {
      detail: DEFAULT_MY_PROFILE_IMAGE_SRC,
    }),
  );
}

export function subscribeProfileImageChange(callback: (src: string) => void) {
  const handleProfileImageUpdated = (event: Event) => {
    callback(
      event instanceof CustomEvent
        ? String(event.detail)
        : readStoredProfileImage(),
    );
  };
  const handleStorage = (event: StorageEvent) => {
    if (event.key === MY_PROFILE_IMAGE_STORAGE_KEY) {
      callback(event.newValue ?? DEFAULT_MY_PROFILE_IMAGE_SRC);
    }
  };

  window.addEventListener(MY_PROFILE_IMAGE_UPDATED_EVENT, handleProfileImageUpdated);
  window.addEventListener("storage", handleStorage);

  return () => {
    window.removeEventListener(
      MY_PROFILE_IMAGE_UPDATED_EVENT,
      handleProfileImageUpdated,
    );
    window.removeEventListener("storage", handleStorage);
  };
}
