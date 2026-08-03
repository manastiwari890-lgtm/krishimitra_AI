import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./index.css";

import App from "./App.jsx";

import { FarmStateProvider } from "./farm/context/FarmStateProvider";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <FarmStateProvider>
      <App />
    </FarmStateProvider>
  </StrictMode>,
);