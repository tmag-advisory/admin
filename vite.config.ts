import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
    plugins: [react(), tailwindcss()],
    server: {
        port: 3002,
    },
    resolve: {
        alias: {
            "@": "/src",
        },
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (!id.includes("node_modules")) return;
                    if (id.includes("react") || id.includes("scheduler")) return "vendor-react";
                    if (id.includes("recharts") || id.includes("d3-")) return "vendor-charts";
                    if (id.includes("framer-motion") || id.includes("motion-dom") || id.includes("motion-utils")) return "vendor-motion";
                    if (id.includes("lucide-react")) return "vendor-icons";
                    if (id.includes("@tanstack") || id.includes("axios") || id.includes("js-cookie") || id.includes("zustand")) return "vendor-data";
                    return "vendor";
                },
            },
        },
    },
});
