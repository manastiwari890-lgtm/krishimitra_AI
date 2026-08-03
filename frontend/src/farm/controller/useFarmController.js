// =====================================================
// KRISHIMITRA AI
// FARM CONTROLLER HOOK
// =====================================================

import { useFarmState } from "../hooks/useFarmState";

export function useFarmController() {
  const { controller } = useFarmState();

  return controller;
}