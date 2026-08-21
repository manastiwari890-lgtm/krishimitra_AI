// =====================================================
// KRISHIMITRA AI
// FARM STATE PROVIDER
// =====================================================

import {
  createContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { initialFarmState } from "../state/farmState";
import { FarmController } from "../controller/FarmController";
import { DigitalTwinEngine } from "../engine/DigitalTwinEngine";
import { SimulationEngine } from "../simulation/SimulationEngine";

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

  const controllerRef = useRef(null);

  if (!controllerRef.current) {
    controllerRef.current = new FarmController(contextValue);
  }

  const controller = controllerRef.current;

  // Always give the controller the latest farm context.
  controller.farm = contextValue;

  // ===================================================
  // DIGITAL TWIN
  // ===================================================

  const digitalTwin = useMemo(
    () => new DigitalTwinEngine(controller),
    [controller],
  );

  // ===================================================
  // SIMULATION ENGINE
  // ===================================================

  const simulationEngine = useMemo(
    () => new SimulationEngine(
      controller,
      digitalTwin,
    ),
    [controller, digitalTwin],
  );

  // ===================================================
  // START SIMULATION
  // ===================================================

  useEffect(() => {
    simulationEngine.start();

    return () => {
      simulationEngine.stop();
    };
  }, [simulationEngine]);

  // ===================================================
  // PROVIDER
  // ===================================================

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