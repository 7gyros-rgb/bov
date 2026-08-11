import { useEffect, useRef, useState } from "react";

// Polls /api/state on an interval and only triggers a re-render when the
// data actually changed, so overlay elements don't flicker/re-mount.
export function useScoreboard(intervalMs = 1000) {
  const [state, setState] = useState(null);
  const [error, setError] = useState(null);
  const lastJson = useRef(null);

  useEffect(() => {
    let stopped = false;

    async function poll() {
      try {
        const res = await fetch("/api/state", { cache: "no-store" });
        if (!res.ok) throw new Error("Request failed");
        const data = await res.json();
        const json = JSON.stringify(data);
        if (json !== lastJson.current) {
          lastJson.current = json;
          if (!stopped) setState(data);
        }
        if (!stopped) setError(null);
      } catch (e) {
        if (!stopped) setError(e.message || "Failed to load");
      }
    }

    poll();
    const id = setInterval(poll, intervalMs);
    return () => {
      stopped = true;
      clearInterval(id);
    };
  }, [intervalMs]);

  return { state, error };
}
