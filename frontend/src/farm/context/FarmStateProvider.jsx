// =====================================================
// KRISHIMITRA AI
// FARM STATE PROVIDER
// =====================================================

import {
  createContext,
  useMemo,
  useState,
} from "react";

import { initialFarmState } from "../state/farmState";
import { FarmController } from "../controller/FarmController";

// =====================================================
// CONTEXT
// =====================================================

export const FarmStateContext = createContext(null);

// =====================================================
// PROVIDER
// =====================================================

export function FarmStateProvider({ children }) {
  const [farmState, setFarmState] = useState(initialFarmState);

  // ===================================================
  // WEATHER
  // ===================================================

  function updateWeather(update) {
    setFarmState((previous) => ({
      ...previous,

      weather: {
        ...previous.weather,
        ...update,
      },
    }));
  }

  // ===================================================
  // PLOTS
  // ===================================================

  function updatePlot(plotId, update) {
    setFarmState((previous) => ({
      ...previous,

      plots: previous.plots.map((plot) =>
        plot.id === plotId
          ? {
              ...plot,
              ...update,
            }
          : plot,
      ),
    }));
  }

  // ===================================================
  // CONTEXT
  // ===================================================

  const contextValue = useMemo(
    () => ({
      farmState,

      updateWeather,

      updatePlot,
    }),
    [farmState],
  );

  // ===================================================
  // SINGLE CONTROLLER
  // ===================================================

  const controller = useMemo(
    () => new FarmController(contextValue),
    [contextValue],
  );

  return (
    <FarmStateContext.Provider
      value={{
        ...contextValue,
        controller,
      }}
    >
      {children}
    </FarmStateContext.Provider>
  );
}