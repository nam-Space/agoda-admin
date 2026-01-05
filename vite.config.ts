import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import path from "path";

export default defineConfig(({ mode }) => {
    // 🔑 Load env đúng cách
    const env = loadEnv(mode, process.cwd(), "");

    return {
        plugins: [
            react(),
            svgr({
                svgrOptions: {
                    icon: true,
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
                    ws: true,
                    rewrite: (path) => path.replace(/^\/ayd/, ""),
                    configure: (proxy) => {
                        proxy.on("proxyReq", (proxyReq) => {
                            proxyReq.setHeader(
                                "Authorization",
                                `Bearer ${env.VITE_AYD_API_KEY}`
                            );
                        });
                    },
                },
            },
        },

        resolve: {
            alias: {
                "@": path.resolve(__dirname, "./src/"),
            },
        },
    };
});
