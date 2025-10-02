import { createContext, useEffect, useReducer } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import {AxiosProvider, useAxios} from "./AxiosContext.jsx";
// GLOBAL CUSTOM COMPONENTS
import Loading from "app/components/MatxLoading";

const initialState = {
  user: null,
  isInitialized: false,
  isAuthenticated: false
};


const isValidToken = (accessToken) => {
  if (!accessToken) return false;

  try {
    const decodedToken = jwtDecode(accessToken);

    const currentTime = Date.now() / 1000; // Convert to seconds
    if (decodedToken.exp <= currentTime) {
      return false;  // Token has expired
    }

    return !!decodedToken?.jti; // Return true if jti exists
  } catch (error) {
    return false;  // If decoding fails, token is invalid
  }
};

const setSession = (accessToken, axiosInstance) => {
  if (accessToken) {
    localStorage.setItem("accessToken", accessToken);
    axiosInstance.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
    axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
  } else {
    localStorage.removeItem("accessToken");
    delete axiosInstance.defaults.headers.common.Authorization;
    delete axios.defaults.headers.common.Authorization;
  }
};

const reducer = (state, action) => {
  switch (action.type) {
    case "INIT": {
      const { isAuthenticated, user } = action.payload;
      return { ...state, user, isAuthenticated, isInitialized: true };
    }
    case "LOGIN": {
      const { user } = action.payload;
      return { ...state, user, isAuthenticated: true };
    }
    case "LOGOUT": {
      return { ...state, isAuthenticated: false, user: null };
    }
    case "REGISTER": {
      const { user } = action.payload;
      return { ...state, isAuthenticated: true, user };
    }
    default: {
      return state;
    }
  }
};

const AuthContext = createContext({
  ...initialState,
  method: "JWT"
});

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const axiosInstance = useAxios();


  const login = async (username, password) => {
    const { data } = await axiosInstance.post("/auth/login", { username, password });
    const { accessToken, user } = data;

    setSession(accessToken, axiosInstance);
    dispatch({ type: "LOGIN", payload: { user } });
  };

  const register = async (username, password, firstName, lastName) => {
    const { data } = await axiosInstance.post("/auth/register", {username: username, password: password,firstName: firstName,lastName: lastName});
    const { accessToken, user } = data;

    setSession(accessToken, axiosInstance);
    dispatch({ type: "REGISTER", payload: { user } });
  };

  const logout = () => {
    setSession(null, axiosInstance);
    dispatch({ type: "LOGOUT" });
  };

  useEffect(() => {
    (async () => {
      try {
        const accessToken = window.localStorage.getItem("accessToken");
        if (accessToken && isValidToken(accessToken)) {
          setSession(accessToken, axiosInstance);
          const response = await axiosInstance.get("/auth/profile");
          const { user } = response.data;

          dispatch({
            type: "INIT",
            payload: { isAuthenticated: true, user }
          });
        } else {
          dispatch({
            type: "INIT",
            payload: { isAuthenticated: false, user: null }
          });
        }
      } catch (err) {
        console.log(err);

        dispatch({
          type: "INIT",
          payload: { isAuthenticated: false, user: null }
        });
      }
    })();
  }, []);

  if (!state.isInitialized) return <Loading />;

  return (
    <AuthContext.Provider value={{ ...state, method: "JWT", login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
