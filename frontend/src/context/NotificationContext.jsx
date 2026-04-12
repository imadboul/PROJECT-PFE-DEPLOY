import { createContext, useContext, useEffect, useState } from "react";
import { getNotifications } from "./services/notificationService";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const fetchNotifications = async () => {
    try {
      const res = await getNotifications();
      const data = res.data.data.results;
      setNotifications(Array.isArray(data) ? data : []);
    }catch (error) {
        const msg =
        error.response?.data?.error ||
        "Error fatching data";

      toast.error(msg);
      }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, setNotifications, fetchNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
};


export const useNotifications = () => useContext(NotificationContext);