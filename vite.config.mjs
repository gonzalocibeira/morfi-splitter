import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), "REACT_APP_");
    return {
        plugins: [react()],
        define: {
            // Keep the existing Netlify and local Firebase configuration working.
            "process.env.REACT_APP_FIREBASE_API_KEY": JSON.stringify(env.REACT_APP_FIREBASE_API_KEY || "")
        },
        build: { outDir: "build", sourcemap: false }
    };
});
