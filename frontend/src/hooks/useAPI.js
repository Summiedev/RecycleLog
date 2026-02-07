import { useState, useCallback, useEffect } from "react";
const useGetApi = (url, duration = 50000) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(undefined);
  const [error, setError] = useState(null); // ✅ Add error state

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getData(url);
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [url]);

  const refetch = useCallback(() => {
    // ✅ Manual refetch
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();

    if (duration) {
      const fetchInterval = setInterval(fetchData, duration);
      return () => clearInterval(fetchInterval);
    }
  }, [fetchData, duration]);

  return [data, loading, error, refetch]; // ✅ Object return for flexibility
};
export { useGetApi };
export const getData = async (url) => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Fetch Failed With HTTP Status ${response.status}`);
    }
    const result = await response.json();
    return result;
  } catch (error) {
    throw new Error(error);
  }
};
