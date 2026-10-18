import { useEffect, useRef, useState, useCallback } from "react";
import { usePageVisibility } from "./usePageVisibility";

export interface SmartIntervalOptions {
  /** Maximum idle time before exponential backoff kicks in (seconds). Default: 120 (2 mins) */
  maxIdleSeconds?: number;
  /** Factor to multiply interval when user is idle. Default: 1.5 */
  backoffFactor?: number;
  /** Upper bound for backed-off interval (ms). Default: 60000 (1 min) */
  maxDelay?: number;
  /** Whether to trigger an immediate refetch when returning from hidden to visible */
  immediateOnVisible?: boolean;
}

/**
 * Smart interval hook with Page Visibility pausing and User Inactivity Exponential Backoff.
 * - Pauses polling when browser tab is hidden (document.hidden === true).
 * - Multiplies interval when user is inactive for > maxIdleSeconds.
 * - Resets to baseline interval immediately upon user activity or tab reactivation.
 */
export function useSmartInterval(
  callback: () => void,
  delay: number | null,
  options: SmartIntervalOptions = {}
) {
  const {
    maxIdleSeconds = 120,
    backoffFactor = 1.5,
    maxDelay = 60000,
    immediateOnVisible = true,
  } = options;

  const savedCallback = useRef(callback);
  const isVisible = usePageVisibility();
  const lastActiveRef = useRef<number>(Date.now());
  const [currentDelay, setCurrentDelay] = useState<number | null>(delay);
  const wasHiddenRef = useRef<boolean>(false);

  // Remember latest callback
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Track user activity to reset idle timer
  const recordActivity = useCallback(() => {
    lastActiveRef.current = Date.now();
    if (delay !== null) {
      setCurrentDelay(delay);
    }
  }, [delay]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const events = ["mousedown", "mousemove", "keydown", "touchstart", "scroll"];
    const handleEvent = () => recordActivity();

    events.forEach((evt) => window.addEventListener(evt, handleEvent, { passive: true }));
    return () => {
      events.forEach((evt) => window.removeEventListener(evt, handleEvent));
    };
  }, [recordActivity]);

  // Handle visibility changes
  useEffect(() => {
    if (!isVisible) {
      wasHiddenRef.current = true;
      setCurrentDelay(null); // Pause interval
    } else {
      if (wasHiddenRef.current && immediateOnVisible && delay !== null) {
        savedCallback.current();
      }
      wasHiddenRef.current = false;
      recordActivity();
    }
  }, [isVisible, immediateOnVisible, delay, recordActivity]);

  // Smart interval execution loop with exponential backoff
  useEffect(() => {
    if (delay === null || !isVisible) {
      return;
    }

    let timerId: NodeJS.Timeout | null = null;

    const tick = () => {
      savedCallback.current();

      // Check if idle threshold reached
      const idleSeconds = (Date.now() - lastActiveRef.current) / 1000;
      if (idleSeconds >= maxIdleSeconds) {
        const nextDelay = Math.min((currentDelay || delay) * backoffFactor, maxDelay);
        setCurrentDelay(nextDelay);
      } else {
        setCurrentDelay(delay);
      }
    };

    const effectiveDelay = currentDelay ?? delay;
    timerId = setTimeout(function run() {
      tick();
      if (timerId !== null) {
        timerId = setTimeout(run, currentDelay ?? delay);
      }
    }, effectiveDelay);

    return () => {
      if (timerId) clearTimeout(timerId);
    };
  }, [delay, isVisible, currentDelay, maxIdleSeconds, backoffFactor, maxDelay]);

  return { isVisible, currentDelay };
}
