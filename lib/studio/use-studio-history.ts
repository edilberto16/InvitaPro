"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type Dispatch, type MutableRefObject, type SetStateAction } from "react";
import type { StudioSnapshot, StudioState } from "@/lib/studio/studio-types";

type UseStudioHistoryOptions = {
  snapshot: StudioSnapshot;
  setStudioState: Dispatch<SetStateAction<StudioState>>;
  limit?: number;
  debounceMs?: number;
};

type StudioHistoryController = {
  canUndo: boolean;
  canRedo: boolean;
  historyIndex: number;
  historyLength: number;
  isApplyingHistoryRef: MutableRefObject<boolean>;
  resetHistory: (snapshot: StudioSnapshot) => void;
  undo: () => boolean;
  redo: () => boolean;
};

function cloneSnapshot(snapshot: StudioSnapshot): StudioSnapshot {
  return {
    ...snapshot,
    gallery: [...snapshot.gallery],
    visibility: { ...snapshot.visibility },
    sectionOrder: [...snapshot.sectionOrder],
    blockVisibility: { ...snapshot.blockVisibility },
    blockVariants: { ...snapshot.blockVariants },
  };
}

export function useStudioHistory({
  snapshot,
  setStudioState,
  limit = 50,
  debounceMs = 300,
}: UseStudioHistoryOptions): StudioHistoryController {
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [historyLength, setHistoryLength] = useState(0);
  const historyRef = useRef<StudioSnapshot[]>([]);
  const historyIndexRef = useRef(-1);
  const initializedRef = useRef(false);
  const isApplyingHistoryRef = useRef(false);
  const snapshotSignature = useMemo(() => JSON.stringify(snapshot), [snapshot]);

  const applySnapshot = useCallback((nextSnapshot: StudioSnapshot) => {
    isApplyingHistoryRef.current = true;
    setStudioState(cloneSnapshot(nextSnapshot));
    window.setTimeout(() => {
      isApplyingHistoryRef.current = false;
    }, 0);
  }, [setStudioState]);

  const resetHistory = useCallback((initialSnapshot: StudioSnapshot) => {
    const normalized = cloneSnapshot(initialSnapshot);
    historyRef.current = [normalized];
    historyIndexRef.current = 0;
    initializedRef.current = true;
    setHistoryIndex(0);
    setHistoryLength(1);
  }, []);

  const undo = useCallback(() => {
    const nextIndex = historyIndexRef.current - 1;
    if (nextIndex < 0) return false;
    historyIndexRef.current = nextIndex;
    setHistoryIndex(nextIndex);
    applySnapshot(historyRef.current[nextIndex]);
    return true;
  }, [applySnapshot]);

  const redo = useCallback(() => {
    const nextIndex = historyIndexRef.current + 1;
    if (nextIndex >= historyRef.current.length) return false;
    historyIndexRef.current = nextIndex;
    setHistoryIndex(nextIndex);
    applySnapshot(historyRef.current[nextIndex]);
    return true;
  }, [applySnapshot]);

  useEffect(() => {
    if (!initializedRef.current || isApplyingHistoryRef.current) return;

    const timer = window.setTimeout(() => {
      const current = historyRef.current[historyIndexRef.current];
      if (current && JSON.stringify(current) === snapshotSignature) return;

      const nextHistory = historyRef.current.slice(0, historyIndexRef.current + 1);
      nextHistory.push(cloneSnapshot(snapshot));
      if (nextHistory.length > limit) nextHistory.shift();

      historyRef.current = nextHistory;
      historyIndexRef.current = nextHistory.length - 1;
      setHistoryIndex(historyIndexRef.current);
      setHistoryLength(nextHistory.length);
    }, debounceMs);

    return () => window.clearTimeout(timer);
  }, [debounceMs, limit, snapshot, snapshotSignature]);

  return {
    canUndo: historyIndex > 0,
    canRedo: historyIndex >= 0 && historyIndex < historyLength - 1,
    historyIndex,
    historyLength,
    isApplyingHistoryRef,
    resetHistory,
    undo,
    redo,
  };
}
