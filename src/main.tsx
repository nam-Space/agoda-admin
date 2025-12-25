import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "swiper/swiper-bundle.css";
import "flatpickr/dist/flatpickr.css";
import '@mdxeditor/editor/style.css'
import 'react-toastify/dist/ReactToastify.css';
import 'react-loading-skeleton/dist/skeleton.css'
import "leaflet/dist/leaflet.css";
import App from "./App.tsx";
import { AppWrapper } from "./components/common/PageMeta.tsx";
import { ThemeProvider } from "./context/ThemeContext.tsx";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import { ToastContainer } from 'react-toastify';
import { SocketProvider } from "./context/SocketProvider.tsx";

createRoot(document.getElementById("root") as HTMLElement).render(
  // <StrictMode>
  <Provider store={store}>
    <SocketProvider>
      <ThemeProvider>
        <AppWrapper>
          <App />
          <ToastContainer />
        </AppWrapper>
      </ThemeProvider>
    </SocketProvider>
  </Provider>
  // </StrictMode>,
);