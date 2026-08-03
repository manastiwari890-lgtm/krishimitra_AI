import { useContext } from "react";

import { FarmStateContext } from "../context/FarmStateProvider";

export function useFarmState() {
  const context = useContext(FarmStateContext);

  if (!context) {
    throw new Error(
      "useFarmState must be used inside FarmStateProvider",
    );
  }

  return context;
}