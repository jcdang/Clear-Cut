import { useEffect, useState } from "react";
import { CheckCircle2, Download, AlertCircle } from "lucide-react";
import {
  getOfflineStatus,
  subscribeOfflineStatus,
  type OfflineStatus,
} from "@/lib/offline-status";
import { cn } from "@/lib/utils";

export function OfflineStatusPill() {
  const [status, setStatus] = useState<OfflineStatus>(getOfflineStatus);

  useEffect(() => subscribeOfflineStatus(setStatus), []);

  // Idle / registering: nothing to show — avoids flicker on a quick
  // cache hit where the model is already cached.
  if (status.kind === "idle" || status.kind === "registering") return null;

  if (status.kind === "downloading") {
    const pct = status.progress;
    return (
      <span
        className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground"
        title="Downloading the AI model so the app works offline next time"
      >
        <Download className="w-3.5 h-3.5 animate-pulse" />
        <span>Caching for offline… {pct}%</span>
      </span>
    );
  }

  if (status.kind === "ready") {
    return (
      <span
        className={cn(
          "hidden sm:flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400",
        )}
        title="Model and assets are cached — works offline"
      >
        <CheckCircle2 className="w-3.5 h-3.5" />
        <span>Ready offline</span>
      </span>
    );
  }

  return (
    <span
      className="hidden sm:flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400"
      title={status.message}
    >
      <AlertCircle className="w-3.5 h-3.5" />
      <span>Offline cache failed</span>
    </span>
  );
}
