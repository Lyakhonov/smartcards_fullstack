import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./AuthContext";
import "./styles.css";

console.log("main.tsx: Starting app");
console.log("main.tsx: root element:", document.getElementById("root"));

const root = document.getElementById("root");
if (!root) {
  console.error("main.tsx: root element not found!");
} else {
  console.log("main.tsx: rendering app");
  ReactDOM.createRoot(root).render(
    <AuthProvider>
      <App />
    </AuthProvider>,
  );
}
