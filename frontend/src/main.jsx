import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import AppRouter from "./router/router";
import AuthProvider from "../src/context/AuthContext.js";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  </React.StrictMode>
);
