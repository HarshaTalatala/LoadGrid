import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/load": "http://localhost:8080",
      "/bid": "http://localhost:8080",
      "/booking": "http://localhost:8080",
      "/transporter": "http://localhost:8080",
      "/v1": "http://localhost:8080",
      "/swagger-ui": "http://localhost:8080"
    }
  }
});