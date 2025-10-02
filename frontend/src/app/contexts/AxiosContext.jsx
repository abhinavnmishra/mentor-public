// src/AxiosContext.jsx
import React, { createContext, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import useAuth from "../hooks/useAuth.js";

const AxiosContext = createContext();

export const AxiosProvider = ({ children }) => {
    const backendBaseUrl = import.meta.env.VITE_BACKEND_BASE_URL;
    const navigate = useNavigate();
    const { logout } = useAuth();

    const axiosInstance = axios.create({
        baseURL: backendBaseUrl, // Replace with your API base URL
        timeout: 130000,
        headers: {
            'Content-Type': 'application/json',
        },
    });

    // Add request interceptor to modify timeout for AI endpoints
    axiosInstance.interceptors.request.use(
        (config) => {
            // Set longer timeout for AI-related endpoints
            if (config.url?.includes('/api/ai/')) {
                config.timeout = 60000; // 60 seconds timeout for AI requests
            }
            return config;
        },
        (error) => {
            return Promise.reject(error);
        }
    );

    axiosInstance.interceptors.response.use(
        (response) => {
            return response;
        },
        async (error) => {
            if (error.code === 'ECONNABORTED') {
                // Handle timeout error
                error.message = 'Request timed out. Please try again.';
            } else if (error.response?.status === 401) {
                // Handle unauthorized error
                try {
                    navigate('/session/signin'); // Redirect to login page
                } catch (logoutError) {
                    console.error('Error during logout:', logoutError);
                }
            } else if (error.response?.status === 403) {
                // Handle forbidden error
                try {
                    error.response.message = ' You do not have sufficient access';
                    error.message = ' You do not have sufficient access'
                } catch (logoutError) {
                    console.error('Error during 403 processing:', logoutError);
                }
            }
            return Promise.reject(error);
        }
    );

    return (
        <AxiosContext.Provider value={axiosInstance}>
            {children}
        </AxiosContext.Provider>
    );
};

export const useAxios = () => {
    return useContext(AxiosContext);
};