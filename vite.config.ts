import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        react(),
        svgr({
            svgrOptions: {
                icon: true,
                // This will transform your SVG to a React component
                exportType: "named",
                namedExport: "ReactComponent",
            },
        }),
    ],
    server: {
        proxy: {
            "/ayd": {
                target: "https://www.askyourdatabase.com",
                changeOrigin: true,
                secure: true,
                rewrite: (path) => path.replace(/^\/ayd/, ""),
            },
        },
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src/"),
        },
    },
});
