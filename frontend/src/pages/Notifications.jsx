import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";
import { getNotifications, markNotificationAsViewed } from "../context/services/notificationService";

export default function NotificationsPage() {
  const [notification, setNotification] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resN = await getNotifications();
        const data = resN.data.notifications;
        setNotification(Array.isArray(data) ? data : []);
      } catch (err) {
        console.log(err);
        toast.error("Error fetching data");
      }
    };

    fetchData();
  }, [location.key]);

  const sortedNotifications = useMemo(() => {
    if (!Array.isArray(notification)) return [];

    return [...notification].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );
  }, [notification]);

  // normalize link
  const normalizeLink = (link) => {
    if (!link) return null;

    if (link.startsWith("http:/") && !link.startsWith("http://")) {
      link = link.replace("http:/", "http://");
    }

    return link;
  };

  const handleMarkAsViewed = async (notif) => {
    try {
      await markNotificationAsViewed(notif.id);

      setNotification((prev) =>
        prev.map((n) =>
          n.id === notif.id ? { ...n, viewed: true } : n
        )
      );

      const normalizedLink = normalizeLink(notif.link);
      if (normalizedLink) {
        if (normalizedLink.startsWith("http")) {
          // eslint-disable-next-line react-hooks/immutability
          window.location.href = normalizedLink; // external
        } else {
          navigate(normalizedLink); // internal
        }
      }
    } catch (err) {
      console.log(err);
      toast.error("Failed to update notification");
    }
  };

  return (
    <div className="p-6 flex justify-center relative z-10">
      <div className="w-full max-w-3xl flex flex-col gap-4">

        <h1 className="text-white text-xl font-bold">Notifications</h1>

        <div className="flex flex-col gap-3">
          {sortedNotifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => handleMarkAsViewed(notif)}
              className={`rounded-xl p-4 border transition cursor-pointer
                ${notif.viewed
                  ? "bg-black/40 border-white/10 hover:bg-black/60"
                  : "bg-black/60 border-blue-500/40 hover:bg-black/70"
                }`}
            >
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-sm font-semibold text-white truncate">
                  {notif.title}
                </h2>

                <span className="text-[11px] text-gray-400">
                  {new Date(notif.date).toLocaleString()}
                </span>
              </div>

              <p className="text-xs text-gray-300 line-clamp-2">
                {notif.content}
              </p>

              {!notif.viewed && (
                <div className="mt-2">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-600 text-white">
                    New
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}