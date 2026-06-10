import { create } from "zustand";
import axios from "axios";

export const useAuthStore = create((set) => ({
    loading: false,
    user: null,

    login: async (payload) => {

        set({ loading: true });

        try {

            const response = await axios.post(
                "/api/v1/auth/login",
                payload,
                {
                    withCredentials: true,
                }
            );

            set({ loading: false });

            return response.data;

        } catch (error) {

            set({ loading: false });

            throw error;
        }
    },

    verifyOtp: async (payload) => {
        set({ loading: true });

        try {
            const response = await axios.post(
                "/api/v1/auth/verify-otp",
                payload,
                {
                    withCredentials: true,
                }
            );

            set({
                loading: false,
                user: response.data.user,
            });

            return response.data;

        } catch (error) {
            set({ loading: false });
            throw error;
        }
    },

    fetchMe: async () => {

        try {

            const response = await axios.get(
                "/api/v1/auth/me",
                {
                    withCredentials: true,
                }
            );

            set({
                user: response.data.user,
            });

        } catch {

            set({
                user: null,
            });
        }
    },

    logout: async () => {

        await axios.post(
            "/api/v1/auth/logout",
            {},
            {
                withCredentials: true,
            }
        );

        set({
            user: null,
        });
    },
}));