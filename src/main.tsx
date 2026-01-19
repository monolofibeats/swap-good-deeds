import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Initialize theme from localStorage or default to dark
const savedTheme = localStorage.getItem('swap-theme');
if (savedTheme === 'light') {
  document.documentElement.classList.remove('dark');
} else {
  document.documentElement.classList.add('dark');
}

createRoot(document.getElementById("root")!).render(<App />);
