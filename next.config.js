/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,

  // 环境变量
  env: {
    NEXT_PUBLIC_APP_NAME: 'DevToolsKit',
    NEXT_PUBLIC_APP_VERSION: '1.0.0',
  },

  // 图片优化
  images: {
    unoptimized: true,
  },

  // 输出配置
  output: 'export',
  trailingSlash: true,

  // GitHub Pages 部署配置
  // 如果部署到 https://<user>.github.io/<repo>/，需要设置 basePath 为 /<repo>
  basePath: process.env.REPO_NAME ? `/${process.env.REPO_NAME}` : '',
  assetPrefix: process.env.REPO_NAME ? `/${process.env.REPO_NAME}/` : '',
};

module.exports = nextConfig;
