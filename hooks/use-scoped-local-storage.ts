import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";

type ScopedLocalStorageOptions<T> = {
  demoKey: string;
  liveKeyPrefix: string;
  initialValue: T;
};

export function useScopedLocalStorage<T>({
  demoKey,
  liveKeyPrefix,
  initialValue,
}: ScopedLocalStorageOptions<T>) {
  const { data: session, status } = useSession();
  const initialRef = useRef(initialValue);
  const storageKey = useMemo(() => {
    if (status === "loading") {
      return null;
    }
    const email = session?.user?.email;
    return email ? `${liveKeyPrefix}${email}` : demoKey;
  }, [demoKey, liveKeyPrefix, session?.user?.email, status]);
  const [value, setValue] = useState<T>(initialRef.current);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(false);
    if (!storageKey) {
      return;
    }
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        setValue(JSON.parse(stored));
      } else {
        setValue(initialRef.current);
      }
    } catch {
      setValue(initialRef.current);
    } finally {
      setIsLoaded(true);
    }
  }, [storageKey]);

  const setStoredValue = useCallback(
    (nextValue: T | ((current: T) => T)) => {
      setValue((current) => {
        const resolved =
          typeof nextValue === "function"
            ? (nextValue as (currentValue: T) => T)(current)
            : nextValue;
        if (storageKey) {
          try {
            localStorage.setItem(storageKey, JSON.stringify(resolved));
          } catch {
            // Ignore storage errors, keep in-memory state.
          }
        }
        return resolved;
      });
    },
    [storageKey]
  );

  return {
    value,
    setValue: setStoredValue,
    isLoaded,
    storageKey,
  };
}
