import { useMemo, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useScopedLocalStorage } from './use-scoped-local-storage';
import { getDefaultCircleSettings, type CircleSetting } from '@/lib/circle-settings';

type DbCircle = {
  id: string;
  userId: string;
  name: string;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
};

/**
 * Unified hook for circles that automatically switches between demo and live data
 *
 * - Logged out: Uses localStorage with "demo_" prefix
 * - Logged in: Uses server API with user-specific React Query cache keys
 */
export function useCircles() {
  const { data: session, status } = useSession();
  const queryClient = useQueryClient();
  const userId = session?.user?.email || session?.user?.id || '';

  // Demo mode localStorage
  const {
    value: demoCircles,
    setValue: setDemoCircles,
    isLoaded: isDemoLoaded,
  } = useScopedLocalStorage<CircleSetting[]>({
    demoKey: 'demo_circle_settings',
    liveKeyPrefix: 'live_circle_settings_',
    initialValue: getDefaultCircleSettings(),
  });

  // User-specific cache key for circles
  const circlesKey = ['circles', 'user', userId];

  // Fetch circles from server
  const {
    data: dbCircles,
    isLoading: isDbLoading,
  } = useQuery({
    queryKey: circlesKey,
    queryFn: async () => {
      // First try to get circles
      const response = await fetch('/api/circles');
      if (!response.ok) {
        throw new Error('Failed to fetch circles');
      }
      const circles = await response.json() as DbCircle[];

      // If no circles exist, initialize them
      if (circles.length === 0) {
        const initResponse = await fetch('/api/circles/init', {
          method: 'POST',
        });
        if (initResponse.ok) {
          const data = await initResponse.json();
          return data.circles as DbCircle[];
        }
      }

      return circles;
    },
    enabled: !!userId && status === 'authenticated',
  });

  // Update circles mutation
  const updateCirclesMutation = useMutation({
    mutationFn: async (circles: CircleSetting[]) => {
      const response = await fetch('/api/circles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          circles: circles.map((c, index) => ({
            name: c.name,
            isActive: c.isActive,
            order: index,
          })),
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to update circles');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: circlesKey });
    },
  });

  const isLiveMode = status === 'authenticated' && !!session && !!userId;
  const isLoading = status === 'loading' || (isLiveMode && isDbLoading);

  // Memoize circles to prevent infinite re-render loops
  const circles = useMemo(() => {
    if (status === 'loading') {
      return getDefaultCircleSettings();
    }

    if (isLiveMode) {
      // Convert DB circles to CircleSetting format
      const sorted = (dbCircles || [])
        .sort((a, b) => a.order - b.order)
        .map((c): CircleSetting => ({
          id: c.id,
          name: c.name,
          isActive: c.isActive,
        }));

      // Ensure we always have 10 circle slots (pad with empty ones if needed)
      const paddedCircles: CircleSetting[] = [...sorted];
      for (let i = sorted.length; i < 10; i++) {
        paddedCircles.push({
          id: `circle-${i + 1}`,
          name: '',
          isActive: false,
        });
      }

      return paddedCircles.length > 0 ? paddedCircles : getDefaultCircleSettings();
    }

    // Demo mode
    return demoCircles;
  }, [status, isLiveMode, dbCircles, demoCircles]);

  // Memoize setCircles to prevent unnecessary re-renders
  const setCircles = useCallback(async (newCircles: CircleSetting[]) => {
    if (isLiveMode) {
      // Filter out empty circles for saving
      const circlesToSave = newCircles.filter(c => c.name.trim());
      await updateCirclesMutation.mutateAsync(circlesToSave);
    } else {
      setDemoCircles(newCircles);
    }
  }, [isLiveMode, updateCirclesMutation, setDemoCircles]);

  return {
    circles,
    isLoading,
    setCircles,
    isDemo: !isLiveMode,
  };
}
