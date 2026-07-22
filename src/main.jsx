import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import NutriAI from "./NutriAI.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <NutriAI />
  </StrictMode>,
);
