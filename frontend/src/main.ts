import "./styles/global.css";
import { mountApp } from "./App";

const app = document.querySelector<HTMLDivElement>("#app");

if (!app) {
  throw new Error("App root not found");
}

mountApp(app);
