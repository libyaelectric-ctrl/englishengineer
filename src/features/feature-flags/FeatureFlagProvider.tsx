import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
} from 'react';

interface FeatureFlags {
  [key: string]: boolean;
}

interface FeatureFlagContextValue {
  isEnabled: (flag: string) => boolean;
  setFlag: (flag: string, enabled: boolean) => void;
}

const FeatureFlagContext = createContext<FeatureFlagContextValue | null>(null);

const STORAGE_KEY = 'eos_feature_flags';

const DEFAULT_FLAGS: FeatureFlags = {
  showNewDashboard: false,
  enableAICoachV2: false,
  enableBetaFeatures: false,
};

const loadFlags = (): FeatureFlags => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? { ...DEFAULT_FLAGS, ...JSON.parse(stored) } : DEFAULT_FLAGS;
  } catch {
    return DEFAULT_FLAGS;
  }
};

const saveFlags = (flags: FeatureFlags): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(flags));
  } catch {
    // ignore
  }
};

export const FeatureFlagProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [flags, setFlags] = useState<FeatureFlags>(loadFlags);

  useEffect(() => {
    saveFlags(flags);
  }, [flags]);

  const contextValue = useMemo<FeatureFlagContextValue>(
    () => ({
      isEnabled: (flag: string) => flags[flag] ?? false,
      setFlag: (flag: string, enabled: boolean) =>
        setFlags((prev) => ({ ...prev, [flag]: enabled })),
    }),
    [flags]
  );

  return (
    <FeatureFlagContext.Provider value={contextValue}>
      {children}
    </FeatureFlagContext.Provider>
  );
};

export const useFeatureFlag = (flagName: string): boolean => {
  const ctx = useContext(FeatureFlagContext);
  if (!ctx) return false;
  return ctx.isEnabled(flagName);
};
