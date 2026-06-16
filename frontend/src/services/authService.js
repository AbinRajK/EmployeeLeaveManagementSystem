import axiosInstance from "./axiosInstance";

const authService = {
  register: async (userData) => {
    const response =
      await axiosInstance.post(
        "/auth/register",
        userData
      );

    return response.data;
  },

  login: async (userData) => {
    const response =
      await axiosInstance.post(
        "/auth/login",
        userData
      );

    return response.data;
  },
};

export default authService;