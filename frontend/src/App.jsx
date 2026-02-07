import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import "./App.css";
import LandingPage from "./pages/LandingPage.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Rankings from "./pages/Rankings.jsx";
import Analytics from "./pages/Analytics.jsx";
import { useDispatch } from "react-redux";
import { useEffect } from "react";
import { fetchMapData } from "./store/map-slice";
import { fetchInsights } from "./store/insight-slice";
import BinPulseLoader from "./components/loader";
const MapPage = lazy(() => import("./pages/Map.jsx"));

const App = () => {
  const dispatch = useDispatch();
  // Poling Logic and Initial Fetch
  useEffect(() => {
    dispatch(fetchInsights());
    dispatch(fetchMapData());

    const fetchInterval = setInterval(() => {
      dispatch(fetchMapData());
    }, 20000);

    return () => clearInterval(fetchInterval);
  }, [dispatch]);
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route
          path="/map"
          element={
            <Suspense
              fallback={
                <div className="flex items-center justify-center h-screen">
                  <BinPulseLoader />
                </div>
              }
            >
              <MapPage />
            </Suspense>
          }
        />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/rankings" element={<Rankings />} />
      </Routes>
    </Router>
  );
};

export default App;
