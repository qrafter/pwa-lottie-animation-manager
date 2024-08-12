import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

import { registerSW } from "virtual:pwa-register";
import { BrowserRouter as Router } from "react-router-dom";

registerSW();

ReactDOM.createRoot(document.getElementById("root")!).render(
    <Router>
      <App />
    </Router>
);
