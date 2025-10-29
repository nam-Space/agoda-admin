import { BrowserRouter as Router, Routes, Route } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";
import Calendar from "./pages/Calendar";
import BasicTables from "./pages/Tables/BasicTables";
import FormElements from "./pages/Forms/FormElements";
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import HomePage from "./pages/Dashboard/HomePage";
import UserPage from "./pages/Dashboard/UserPage";
import { useAppDispatch, useAppSelector } from "./redux/hooks";
import { useEffect } from "react";
import { fetchAccount, setRefreshTokenAction } from "./redux/slice/accountSlide";
import { onEvent } from "./utils/eventEmitter";
import { LoadingOutlined } from '@ant-design/icons';
import { Spin } from 'antd';
import ProtectedRoute from "./components/auth/ProtectedRoute";
import CountryPage from "./pages/Dashboard/CountryPage";
import CityPage from "./pages/Dashboard/CityPage";
import HotelPage from "./pages/Dashboard/HotelPage";
import AirportPage from "./pages/Dashboard/AirportPage";
import CarPage from "./pages/Dashboard/CarPage";
import ActivityPage from "./pages/Dashboard/ActivityPage";
import ActivityPackagePage from "./pages/Dashboard/ActivityPackagePage";
import ActivityDatePage from "./pages/Dashboard/ActivityDatePage";
import ChatPage from "./pages/Dashboard/ChatPage";
import RoomPaymentPage from "./pages/Payment/RoomPaymentPage";
import ActivityPaymentPage from "./pages/Payment/ActivityPaymentPage";
import CarPaymentPage from "./pages/Payment/CarPaymentPage";
import FlightPaymentPage from "./pages/Payment/FlightPaymentPage";

export default function App() {
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector((state) => state.account.isLoading);

  useEffect(() => {
    dispatch(fetchAccount())
  }, [])

  useEffect(() => {
    const unsubscribe = onEvent("REFRESH_TOKEN_FAILED", (data) => {
      dispatch(setRefreshTokenAction({ status: true, message: data }));
    });

    return () => {
      unsubscribe();
    };
  }, []);

  if (isLoading) {
    return (
      <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} fullscreen />
    )
  }


  return (
    <Router>
      <ScrollToTop />

      <Routes>
        {/* Dashboard Layout */}
        <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route index path="/" element={<HomePage />} />
          <Route index path="/user" element={<UserPage />} />
          <Route index path="/country" element={<CountryPage />} />
          <Route index path="/city" element={<CityPage />} />
          <Route index path="/hotel" element={<HotelPage />} />
          <Route index path="/airport" element={<AirportPage />} />
          <Route index path="/car" element={<CarPage />} />
          <Route index path="/activity" element={<ActivityPage />} />
          <Route index path="/activity-package" element={<ActivityPackagePage />} />
          <Route index path="/activity-date" element={<ActivityDatePage />} />
          <Route index path="/chat" element={<ChatPage />} />

          {/* Đơn thanh toán Page */}
          <Route index path="/room-payment" element={<RoomPaymentPage />} />
          <Route index path="/activity-payment" element={<ActivityPaymentPage />} />
          <Route index path="/car-payment" element={<CarPaymentPage />} />
          <Route index path="/flight-payment" element={<FlightPaymentPage />} />

          {/* Others Page */}
          <Route path="/profile" element={<UserProfiles />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/blank" element={<Blank />} />

          {/* Forms */}
          <Route path="/form-elements" element={<FormElements />} />

          {/* Tables */}
          <Route path="/basic-tables" element={<BasicTables />} />

          {/* Ui Elements */}
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/avatars" element={<Avatars />} />
          <Route path="/badge" element={<Badges />} />
          <Route path="/buttons" element={<Buttons />} />
          <Route path="/images" element={<Images />} />
          <Route path="/videos" element={<Videos />} />

          {/* Charts */}
          <Route path="/line-chart" element={<LineChart />} />
          <Route path="/bar-chart" element={<BarChart />} />
        </Route>

        {/* Auth Layout */}
        <Route path="/login" element={<SignIn />} />

        {/* Fallback Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}
