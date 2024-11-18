import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "../src/components/App/App.jsx";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./firebase/contexts/authContexts/index.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <App />
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>
);
