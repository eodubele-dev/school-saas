/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        serverActions: {
            allowedOrigins: ["localhost:3000", "localhost:3001", "*.localhost:3000", "*.localhost:3001"],
            allowedDevOrigins: ["http://*.localhost:3000", "http://*.localhost:3001", "https://*.localhost:3000"],
            bodySizeLimit: '5mb',
        },
    },
    images: {
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
