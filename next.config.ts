import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  experimental: {
    // 音声ファイルアップロード用（デフォルト10MB → 500MB に引き上げ）
    proxyClientMaxBodySize: '500mb',
  },
}

export default nextConfig
