// @ts-check

/** @type {import('next').NextConfig} */
const nextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "easylearnapp.s3.amazonaws.com",
				pathname: "/**",
			},
		],
	},
};

module.exports = nextConfig;
