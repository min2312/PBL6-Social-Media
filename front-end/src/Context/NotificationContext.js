import React, { createContext, useEffect, useRef, useState, useContext } from "react";
import { GetNotificationsByUserId } from "../services/apiService";
import { UserContext } from "./UserProvider";
import { io } from "socket.io-client";

const NotificationContext = createContext({
  // make context safe even if used before provider mounts
  notifications: [],
  unread: 0,
  setNotifications: () => {},
  setUnread: () => {},
});

export const NotificationProvider = ({ children }) => {
  const { user } = useContext(UserContext);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const socketRef = useRef(null);

  useEffect(() => {
    // Guard: need user id and token
    if (!user?.account?.id) return;

    // Fetch initial notifications
    const fetchData = async () => {
      try {
        const res = await GetNotificationsByUserId(user.account.id);
        // support both axios-like { data: {...} } and plain {...}
        const data = res?.data && typeof res.data === "object" ? res.data : res;

        if (data?.errCode === 0) {
          const list = Array.isArray(data.notifications) ? data.notifications : [];
          const unreadCount = typeof data.unread === "number" ? data.unread : 0;
          setNotifications(list);
          setUnread(unreadCount);
        } else {
          setNotifications([]);
          setUnread(0);
        }
      } catch {
        setNotifications([]);
        setUnread(0);
      }
    };
    fetchData();

    // Initialize socket with token auth
    socketRef.current = io("http://localhost:8081", {
      transports: ["websocket"],
      auth: { token: user.token },
    });

    const socket = socketRef.current;

    // Join user-specific room on connect
    socket.on("connect", () => {
      const roomId = `user_${user.account.id}`;
      socket.emit("joinRoom", roomId);
    });

    // Listen for notifications updates { notifications, unread }
    const onNotificationUpdated = (payload) => {
      if (!payload) return;
      if (Array.isArray(payload.notifications)) {
        setNotifications(payload.notifications);
      }
      if (typeof payload.unread === "number") {
        setUnread(payload.unread);
      }
    };
    socket.on("notificationUpdated", onNotificationUpdated);

    return () => {
      socket.off("notificationUpdated", onNotificationUpdated);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user?.account?.id, user?.token]);

  return (
    <NotificationContext.Provider value={{ notifications, unread, setNotifications, setUnread }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
