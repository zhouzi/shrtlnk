import React from "react";
import axios, { AxiosInstance } from "axios";

export const ClientContext = React.createContext<{ client: AxiosInstance }>({
  client: axios.create({
    baseURL: "/api",
  }),
});
