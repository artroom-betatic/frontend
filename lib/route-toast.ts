export const ROUTE_TOAST_STORAGE_KEY = "artroom:route-toast";
export const ROUTE_TOAST_UPDATED_EVENT = "artroom:route-toast-updated";

export function readRouteToast() {
  if (typeof window === "undefined") {
    return "";
  }

  return window.localStorage.getItem(ROUTE_TOAST_STORAGE_KEY) ?? "";
}

export function writeRouteToast(message: string) {
  window.localStorage.setItem(ROUTE_TOAST_STORAGE_KEY, message);
  window.dispatchEvent(new CustomEvent(ROUTE_TOAST_UPDATED_EVENT));
}

export function clearRouteToast() {
  window.localStorage.removeItem(ROUTE_TOAST_STORAGE_KEY);
  window.dispatchEvent(new CustomEvent(ROUTE_TOAST_UPDATED_EVENT));
}

export function subscribeRouteToastChange(callback: () => void) {
  const handleRouteToastUpdated = () => {
    callback();
  };
  const handleStorage = (event: StorageEvent) => {
    if (event.key === ROUTE_TOAST_STORAGE_KEY) {
      callback();
    }
  };

  window.addEventListener(ROUTE_TOAST_UPDATED_EVENT, handleRouteToastUpdated);
  window.addEventListener("storage", handleStorage);

  return () => {
    window.removeEventListener(
      ROUTE_TOAST_UPDATED_EVENT,
      handleRouteToastUpdated,
    );
    window.removeEventListener("storage", handleStorage);
  };
}
