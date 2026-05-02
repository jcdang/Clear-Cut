// Tiny pub-sub for offline-readiness state. main.tsx drives it (SW
// registration + imgly preload progress); the header pill subscribes.

export type OfflineStatus =
  | { kind: "idle" }
  | { kind: "registering" }
  | { kind: "downloading"; progress: number } // 0–100
  | { kind: "ready" }
  | { kind: "error"; message: string };

type Listener = (s: OfflineStatus) => void;

let current: OfflineStatus = { kind: "idle" };
const listeners = new Set<Listener>();

export function getOfflineStatus(): OfflineStatus {
  return current;
}

export function setOfflineStatus(next: OfflineStatus) {
  current = next;
  listeners.forEach((l) => l(next));
}

export function subscribeOfflineStatus(l: Listener): () => void {
  listeners.add(l);
  return () => listeners.delete(l);
}
