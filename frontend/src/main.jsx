import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { Theme } from "@radix-ui/themes";
import { Provider } from "react-redux";
import store from "./store/redux.js";
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Theme>
      <Provider store={store}>
        <App />
      </Provider>
    </Theme>
  </StrictMode>
);
