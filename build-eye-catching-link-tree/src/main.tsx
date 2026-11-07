import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { fetchPublished } from "./data/published";

// visitors opening a plain link: start fetching the published page right away, before React renders
if (/^#live(\/(pro|freelance|both))?$/.test(window.location.hash)) void fetchPublished();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
