import api from "../../api/axios";

export const getNotifications = () => 
    api.get("/client/notification/");

export const markNotificationAsViewed = (id) => {
  return api.post(`/notifications/${id}`);
};