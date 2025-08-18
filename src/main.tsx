import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "swiper/swiper-bundle.css";
import "flatpickr/dist/flatpickr.css";
import '@mdxeditor/editor/style.css'
import 'react-toastify/dist/ReactToastify.css';
import App from "./App.tsx";
import { AppWrapper } from "./components/common/PageMeta.tsx";
import { ThemeProvider } from "./context/ThemeContext.tsx";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import { ToastContainer } from 'react-toastify';

createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <Provider store={store}>
      <ThemeProvider>
        <AppWrapper>
          <App />
          <ToastContainer />
        </AppWrapper>
      </ThemeProvider>
    </Provider>
  </StrictMode>,
);