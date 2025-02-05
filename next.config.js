/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Avisa sobre os erros mas não impede o build
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig 