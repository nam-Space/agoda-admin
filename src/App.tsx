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
import { fetchAccount, setLogoutAction, setRefreshTokenAction } from "./redux/slice/accountSlide";
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
import { ROLE } from "./constants/role";
import CarTimetablePage from "./pages/Timetable/CarTimetablePage";
import ActivityTimetablePage from "./pages/Timetable/ActivityTimetablePage";
import RoomTimetablePage from "./pages/Timetable/RoomTimetablePage";
import HandbookPage from "./pages/Dashboard/HandbookPage";
import AirlinePage from "./pages/Dashboard/AirlinePage";
import AircraftPage from "./pages/Dashboard/AircraftPage";
import FlightPage from "./pages/Dashboard/FlightPage";
import RoomPage from "./pages/Dashboard/RoomPage";
import RoomPromotionPage from "./pages/Promotion/RoomPromotionPage";
import CarPromotionPage from "./pages/Promotion/CarPromotionPage";
import FlightPromotionPage from "./pages/Promotion/FlightPromotionPage";
import ActivityPromotionPage from "./pages/Promotion/ActivityPromotionPage";
import FlightTimetablePage from "./pages/Timetable/FlightTimetablePage";
import CarJourneyPage from "./pages/Dashboard/CarJourneyPage";

export default function App() {
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector((state) => state.account.isLoading);
  const errorRefreshToken = useAppSelector(state => state.account.errorRefreshToken);
  const user = useAppSelector(state => state.account.user)

  useEffect(() => {
    if (errorRefreshToken) {
      dispatch(setLogoutAction({}))
    }
  }, [errorRefreshToken])

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

  const protectedRoutes = [
    {
      path: "/",
      element: <HomePage />,
      index: true
    },
    ...(user.role === ROLE.ADMIN ? [{
      path: "/user",
      element: <UserPage />,
      index: true
    }] : []),
    ...(user.role === ROLE.ADMIN ? [{
      path: "/country",
      element: <CountryPage />,
      index: true
    }] : []),
    ...(user.role === ROLE.ADMIN ? [{
      path: "/city",
      element: <CityPage />,
      index: true
    }] : []),
    ...((user.role === ROLE.ADMIN || user.role === ROLE.OWNER) ? [{
      path: "/hotel",
      element: <HotelPage />,
      index: true
    }] : []),
    ...((user.role === ROLE.ADMIN || user.role === ROLE.OWNER) ? [{
      path: "/room",
      element: <RoomPage />,
      index: true
    }] : []),
    ...(user.role === ROLE.ADMIN ? [{
      path: "/airport",
      element: <AirportPage />,
      index: true
    }] : []),
    ...((user.role === ROLE.ADMIN || user.role === ROLE.FLIGHT_OPERATION_STAFF) ? [{
      path: "/airline",
      element: <AirlinePage />,
      index: true
    }] : []),
    ...((user.role === ROLE.ADMIN || user.role === ROLE.FLIGHT_OPERATION_STAFF) ? [{
      path: "/aircraft",
      element: <AircraftPage />,
      index: true
    }] : []),
    ...((user.role === ROLE.ADMIN || user.role === ROLE.FLIGHT_OPERATION_STAFF || user.role === ROLE.AIRLINE_TICKETING_STAFF) ? [{
      path: "/flight",
      element: <FlightPage />,
      index: true
    }] : []),
    ...((user.role === ROLE.ADMIN || user.role === ROLE.DRIVER) ? [{
      path: "/car",
      element: <CarPage />,
      index: true
    }] : []),
    ...((user.role === ROLE.ADMIN || user.role === ROLE.DRIVER) ? [{
      path: "/car-journey",
      element: <CarJourneyPage />,
      index: true
    }] : []),
    ...((user.role === ROLE.ADMIN || user.role === ROLE.EVENT_ORGANIZER) ? [{
      path: "/activity",
      element: <ActivityPage />,
      index: true
    }] : []),
    ...((user.role === ROLE.ADMIN || user.role === ROLE.EVENT_ORGANIZER) ? [{
      path: "/activity-package",
      element: <ActivityPackagePage />,
      index: true
    }] : []),
    ...((user.role === ROLE.ADMIN || user.role === ROLE.EVENT_ORGANIZER) ? [{
      path: "/activity-date",
      element: <ActivityDatePage />,
      index: true
    }] : []),
    ...(user.role !== ROLE.CUSTOMER ? [{
      path: "/chat",
      element: <ChatPage />,
      index: true
    }] : []),
    ...((user.role === ROLE.ADMIN || user.role === ROLE.OWNER || user.role === ROLE.HOTEL_STAFF || user.role === ROLE.MARKETING_MANAGER) ? [{
      path: "/room-payment",
      element: <RoomPaymentPage />,
      index: true
    }] : []),
    ...((user.role === ROLE.ADMIN || user.role === ROLE.EVENT_ORGANIZER || user.role === ROLE.MARKETING_MANAGER) ? [{
      path: "/activity-payment",
      element: <ActivityPaymentPage />,
      index: true
    }] : []),
    ...((user.role === ROLE.ADMIN || user.role === ROLE.DRIVER || user.role === ROLE.MARKETING_MANAGER) ? [{
      path: "/car-payment",
      element: <CarPaymentPage />,
      index: true
    }] : []),
    ...((user.role === ROLE.ADMIN || user.role === ROLE.FLIGHT_OPERATION_STAFF || user.role === ROLE.AIRLINE_TICKETING_STAFF || user.role === ROLE.MARKETING_MANAGER) ? [{
      path: "/flight-payment",
      element: <FlightPaymentPage />,
      index: true
    }] : []),
    ...((user.role === ROLE.ADMIN || user.role === ROLE.OWNER || user.role === ROLE.HOTEL_STAFF) ? [{
      path: "/room-timetable",
      element: <RoomTimetablePage />,
      index: true
    }] : []),
    ...((user.role === ROLE.ADMIN || user.role === ROLE.DRIVER) ? [{
      path: "/car-timetable",
      element: <CarTimetablePage />,
      index: true
    }] : []),
    ...((user.role === ROLE.ADMIN || user.role === ROLE.EVENT_ORGANIZER) ? [{
      path: "/activity-timetable",
      element: <ActivityTimetablePage />,
      index: true
    }] : []),
    ...((user.role === ROLE.ADMIN || user.role === ROLE.FLIGHT_OPERATION_STAFF || user.role === ROLE.AIRLINE_TICKETING_STAFF) ? [{
      path: "/flight-timetable",
      element: <FlightTimetablePage />,
      index: true
    }] : []),
    ...((user.role === ROLE.ADMIN || user.role === ROLE.OWNER || user.role === ROLE.HOTEL_STAFF || user.role === ROLE.EVENT_ORGANIZER || user.role === ROLE.MARKETING_MANAGER) ? [{
      path: "/handbook",
      element: <HandbookPage />,
      index: true
    }] : []),
    ...((user.role === ROLE.ADMIN || user.role === ROLE.OWNER || user.role === ROLE.HOTEL_STAFF || user.role === ROLE.MARKETING_MANAGER) ? [{
      path: "/room-promotion",
      element: <RoomPromotionPage />,
      index: true
    }] : []),
    ...((user.role === ROLE.ADMIN || user.role === ROLE.DRIVER || user.role === ROLE.MARKETING_MANAGER) ? [{
      path: "/car-promotion",
      element: <CarPromotionPage />,
      index: true
    }] : []),
    ...((user.role === ROLE.ADMIN || user.role === ROLE.FLIGHT_OPERATION_STAFF || user.role === ROLE.AIRLINE_TICKETING_STAFF || user.role === ROLE.MARKETING_MANAGER) ? [{
      path: "/flight-promotion",
      element: <FlightPromotionPage />,
      index: true
    }] : []),
    ...((user.role === ROLE.ADMIN || user.role === ROLE.EVENT_ORGANIZER || user.role === ROLE.MARKETING_MANAGER) ? [{
      path: "/activity-promotion",
      element: <ActivityPromotionPage />,
      index: true
    }] : []),
    {
      path: "/profile",
      element: <UserProfiles />,
    },
    {
      path: "/calendar",
      element: <Calendar />,
    },
    {
      path: "/blank",
      element: <Blank />,
    },
    {
      path: "/form-elements",
      element: <FormElements />,
    },
    {
      path: "/basic-tables",
      element: <BasicTables />,
    },
    {
      path: "/alerts",
      element: <Alerts />,
    },
    {
      path: "/avatars",
      element: <Avatars />,
    },
    {
      path: "/badge",
      element: <Badges />
    },
    {
      path: "/buttons",
      element: <Buttons />
    },
    {
      path: "/images",
      element: <Images />
    },
    {
      path: "/videos",
      element: <Videos />
    },
    {
      path: "/line-chart",
      element: <LineChart />
    },
    {
      path: "/bar-chart",
      element: <BarChart />
    },
  ]

  return (
    <Router>
      <ScrollToTop />

      <Routes>
        {/* Dashboard Layout */}
        <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route index path="/" element={<HomePage />} />
          {protectedRoutes.map((route) => {
            return (
              <Route {...(route.index ? { index: true } : {})} path={route.path} element={route.element} />
            )
          }
          )}
        </Route>

        {/* Auth Layout */}
        <Route path="/login" element={<SignIn />} />

        {/* Fallback Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}
