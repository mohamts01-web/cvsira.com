import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import {ThemeProvider} from "./theme/ThemeProvider";

import "./anchor/anchor-source.css";
import "./style.css";
import "./refinements.css";
import "./inline.css";
import './billing.css';
import "./anchor/anchor-theme.css";
import "./anchor/anchor-surfaces.css";
import "./theme/theme-tokens.css";
import "./components/eldoraui/shiny-button.css";
import "./components/eldoraui/product-components.css";
import "./anchor/steps-path.css";
import "./anchor/workspace.css";
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>

    <ThemeProvider><App /></ThemeProvider>
  </React.StrictMode>,
);
