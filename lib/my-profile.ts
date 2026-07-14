export const DEFAULT_MY_PROFILE_IMAGE_SRC = "/figma/assets/nav-profile.png";
export const MY_PROFILE_USERNAME = "user_123";
export const DEFAULT_MY_PROFILE_BIO =
  "감정선이 살아있는 캐릭터 일러스트와 판타지 세계관 작업을 올립니다.";
export const MY_PROFILE_BIO_STORAGE_KEY = "artroom:my-profile-bio";
export const MY_PROFILE_BIO_UPDATED_EVENT = "artroom:my-profile-bio-updated";
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

export function readStoredProfileBio(fallbackBio = DEFAULT_MY_PROFILE_BIO) {
  if (typeof window === "undefined") {
    return fallbackBio;
  }

  return window.localStorage.getItem(MY_PROFILE_BIO_STORAGE_KEY) ?? fallbackBio;
}

export function saveStoredProfileBio(bio: string) {
  const normalizedBio = bio.trim();

  if (normalizedBio) {
    window.localStorage.setItem(MY_PROFILE_BIO_STORAGE_KEY, normalizedBio);
  } else {
    window.localStorage.removeItem(MY_PROFILE_BIO_STORAGE_KEY);
  }

  window.dispatchEvent(
    new CustomEvent(MY_PROFILE_BIO_UPDATED_EVENT, {
      detail: normalizedBio,
    }),
  );
}

export function subscribeProfileBioChange(callback: () => void) {
  const handleProfileBioUpdated = () => {
    callback();
  };
  const handleStorage = (event: StorageEvent) => {
    if (event.key === MY_PROFILE_BIO_STORAGE_KEY) {
      callback();
    }
  };

  window.addEventListener(MY_PROFILE_BIO_UPDATED_EVENT, handleProfileBioUpdated);
  window.addEventListener("storage", handleStorage);

  return () => {
    window.removeEventListener(
      MY_PROFILE_BIO_UPDATED_EVENT,
      handleProfileBioUpdated,
    );
    window.removeEventListener("storage", handleStorage);
  };
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
