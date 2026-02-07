import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { useEffect, useState } from "react";
import ZonePieChart from "../components/PieChart";
import BarChart from "../components/BarChart";
import { useGetApi } from "../hooks/useAPI";
import BinPulseLoader from "../components/loader";
import { useSelector } from "react-redux";

const Analytics = () => {
  const [chartData, setChartData] = useState({
    pieData: [],
    barData: [],
  });
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const insights = useSelector((state) => state.insights.data);
  const [data, loading] = useGetApi(
    "http://localhost:5000/api/analytics/distribution",
    10000
  );

  useEffect(() => {
    if (data) {
      setChartData({
        pieData: data.pieData.map((item) => ({
          name: item.wasteType,
          value: item.count,
        })),
        barData: data.barData.map((item) => ({
          name: item.ward,
          value: item.totalWasteEntries,
        })),
      });

      // Mark first load as complete after data is received
      setIsFirstLoad(false);
    }
  }, [data]);

  const newInsights = insights.insights;

  // Show loader only on first load
  const showLoader = isFirstLoad && loading;

  return (
    <div className="flex h-screen bg-gray-50 relative md:static">
      <Sidebar />
      <main className="flex-1 overflow-y-auto ml-16 md:ml-0">
        <Topbar title="AI Analytics" />

        <div className="flex flex-col lg:flex-row gap-6 px-6 py-6">
          {/* Charts Column */}
          <div className="flex flex-col gap-6 w-full lg:w-2/3">
            {/* Bar Chart */}
            <div className="h-[350px] bg-white rounded-lg shadow p-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Total waste per ward
              </h2>
              {showLoader ? (
                <div className="flex items-center justify-center h-[280px]">
                  <BinPulseLoader
                    text="Loading Bar Chart...."
                    variant="pulse"
                  />
                </div>
              ) : (
                <BarChart data={chartData.barData} title="" height="280px" />
              )}
            </div>

            {/* Pie Chart */}
            <div className="bg-[#e5f0e2] rounded-lg p-4 shadow h-[450px]">
              <h2 className="text-lg font-semibold text-green-900 mb-4">
                Distribution of Wastes
              </h2>
              {showLoader ? (
                <div className="flex items-center justify-center h-[380px]">
                  <BinPulseLoader text="Loading Pie Chart..." />
                </div>
              ) : (
                <ZonePieChart pieData={chartData.pieData} />
              )}
            </div>
          </div>

          {/* Insights Column */}
          <div className="bg-[#e3f4c6] rounded-lg p-4 shadow w-full lg:w-1/3 h-fit max-h-[720px] overflow-y-auto">
            <h2 className="text-lg font-semibold text-green-900 mb-4">
              Daily Insights
            </h2>

            {/* Loading state for insights */}
            {insights.insights && insights.insights.length === 0 ? (
              <div className="flex items-center justify-center h-32">
                <BinPulseLoader />
              </div>
            ) : (
              <ul className="list-disc list-inside space-y-2 text-sm text-green-900">
                {newInsights.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Analytics;
