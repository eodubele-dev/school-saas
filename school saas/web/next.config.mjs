/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        serverActions: {
            allowedOrigins: [
                "localhost:3000", 
                "*.localhost:3000", 
                "localhost:3001", 
                "*.localhost:3001", 
                "tauri://localhost", 
                "http://localhost:3000", 
                "http://*.localhost:3000", 
                "https://tauri.localhost", 
                "http://tauri.localhost",
                "tauri.localhost"
            ],
            bodySizeLimit: '5mb',
        },
    },
    images: {
        unoptimized: true,
        remotePatterns: [
            {
                protocol: "https",
                hostname: "jggcixrapxccbxckuofw.supabase.co",
            },
        ],
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
};

export default nextConfig;
