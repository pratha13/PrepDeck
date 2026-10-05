import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { store } from "./store";
import App from "./App";
import "./index.css";
createRoot(document.getElementById("root")).render(<StrictMode>
    <HelmetProvider>
      <Provider store={store}>
        <BrowserRouter><App /></BrowserRouter>
      </Provider>
    </HelmetProvider>
  </StrictMode>);
