/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack(config) {
        // 添加对 .svg 文件的处理
        config.module.rules.push({
            test: /\.svg$/,
            use: ['@svgr/webpack'],
        });

        return config;
    },
    output: 'standalone'
};

export default nextConfig;
