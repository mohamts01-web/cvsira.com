import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import BrandMotion from "./BrandMotion";
import "./ui.css";
import "./style.css";
import "./refinements.css";
import "./inline.css";
import './billing.css';
import './cv-refresh.css';
import './identity.css';
import './home.css';
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrandMotion />
    <App />
  </React.StrictMode>,
);
