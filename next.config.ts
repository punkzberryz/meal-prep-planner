import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "*.pic.in.th",
				pathname: "**",
			},
		],
	},
};

export default nextConfig;
