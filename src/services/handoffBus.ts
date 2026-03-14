import type { HandoffTarget } from "./deepLinks";

type Listener = (target: HandoffTarget | null) => void;

const listeners = new Set<Listener>();
let currentTarget: HandoffTarget | null = null;

function emit(target: HandoffTarget | null) {
  currentTarget = target;
  listeners.forEach((listener) => listener(target));
}

export function getCurrentHandoffTarget() {
  return currentTarget;
}

export function triggerHandoffTarget(target: HandoffTarget) {
  emit(target);
}

export function clearHandoffTarget() {
  emit(null);
}

export function subscribeToHandoffTarget(listener: Listener) {
  listeners.add(listener);
  listener(currentTarget);
  return () => {
    listeners.delete(listener);
  };
}
