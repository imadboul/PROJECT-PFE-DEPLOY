import { createContext, useContext, useEffect, useState } from "react";
import { getNotifications } from "./services/notificationService";
import { handleApiErrors } from "../utils/handleApiErrors";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("accessToken");

      if (!token) return;

      const res = await getNotifications();
      const data = res.data.notifications;

      setNotifications(Array.isArray(data) ? data : []);
    } catch (error) {
      handleApiErrors(error);
    }
  };
  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    if (!token) return;

    fetchNotifications();
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, setNotifications, fetchNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
};


export const useNotifications = () => useContext(NotificationContext);