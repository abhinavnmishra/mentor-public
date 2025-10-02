import { createContext, useEffect, useReducer, useCallback } from "react";
import { useAxios } from './AxiosContext';

const reducer = (state, action) => {
  switch (action.type) {
    case "LOAD_NOTIFICATIONS": {
      return { ...state, notifications: action.payload };
    }

    case "DELETE_NOTIFICATION": {
      return { 
        ...state, 
        notifications: state.notifications.filter(n => n.id !== action.payload) 
      };
    }

    case "CLEAR_NOTIFICATIONS": {
      return { ...state, notifications: [] };
    }

    default:
      return state;
  }
};

const NotificationContext = createContext({
  notifications: [],
  deleteNotification: () => {},
  clearNotifications: () => {},
  getNotifications: () => {}
});

export const NotificationProvider = ({ children }) => {
  const axios = useAxios();
  const [state, dispatch] = useReducer(reducer, { notifications: [] });

  const deleteNotification = async (notificationID) => {
    try {
      await axios.get(`/api/notifications/close/${notificationID}`);
      dispatch({ type: "DELETE_NOTIFICATION", payload: notificationID });
    } catch (e) {
      console.error("Error deleting notification:", e);
    }
  };

  const clearNotifications = async () => {
    try {
      await axios.get("/api/notifications/close");
      dispatch({ type: "CLEAR_NOTIFICATIONS" });
    } catch (e) {
      console.error("Error clearing notifications:", e);
    }
  };

  const getNotifications = useCallback(async () => {
    try {
      const res = await axios.get("/api/notifications/fetch");
      dispatch({ type: "LOAD_NOTIFICATIONS", payload: res.data });
    } catch (e) {
      console.error("Error fetching notifications:", e);
    }
  }, [axios]);

  useEffect(() => {
    getNotifications();
    
    // Set up polling to check for new notifications every minute
    const intervalId = setInterval(() => {
      getNotifications();
    }, 60000);
    
    return () => clearInterval(intervalId);
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        getNotifications,
        deleteNotification,
        clearNotifications,
        notifications: state.notifications || []
      }}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;
