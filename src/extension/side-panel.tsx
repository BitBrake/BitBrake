import { createRoot } from "react-dom/client";
import App from "../app/App";
import "../styles/index.css";
import "./side-panel.css";

createRoot(document.getElementById("root")!).render(<App />);
