import Link from 'next/link'
import { Braces, FileCode, Hash, Clock, Settings, Link2, Regex, FileText, Palette } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <section className="py-24 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-6xl font-bold font-display mb-6 bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
            开发工具箱
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            20+ 实用工具，无需安装，打开浏览器即用。
            <br />
            JSON格式化、Base64编解码、正则表达式测试、时间戳转换等
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/tools"
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-medium hover:shadow-lg transition-all"
            >
              开始使用
            </Link>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3 border border-gray-300 dark:border-gray-600 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
            >
              GitHub
            </a>
          </div>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="py-16 px-4 bg-white dark:bg-gray-900">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold font-display mb-8 text-center">核心工具</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* JSON Formatter */}
            <Link href="/tools/json" className="group">
              <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-xl hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Braces className="h-6 w-6 text-blue-500" />
                </div>
                <h3 className="text-xl font-semibold mb-2">JSON 格式化</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">格式化、压缩、验证 JSON 数据，支持转换为 CSV/XML</p>
              </div>
            </Link>

            {/* Base64 Encoder */}
            <Link href="/tools/base64" className="group">
              <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-xl hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <FileCode className="h-6 w-6 text-green-500" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Base64 编解码</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Base64 编码与解码，支持文本和图片</p>
              </div>
            </Link>

            {/* Timestamp Converter */}
            <Link href="/tools/timestamp" className="group">
              <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-xl hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Clock className="h-6 w-6 text-purple-500" />
                </div>
                <h3 className="text-xl font-semibold mb-2">时间戳转换</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Unix 时间戳与日期时间互转，支持批量转换</p>
              </div>
            </Link>

            {/* Hash & UUID Generator */}
            <Link href="/tools/uuid" className="group">
              <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-xl hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Hash className="h-6 w-6 text-orange-500" />
                </div>
                <h3 className="text-xl font-semibold mb-2">哈希 & UUID</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">MD5/SHA 哈希生成、UUID v4 生成</p>
              </div>
            </Link>

            {/* URL Encoder */}
            <Link href="/tools/url" className="group">
              <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-xl hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer">
                <div className="w-12 h-12 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Link2 className="h-6 w-6 text-cyan-500" />
                </div>
                <h3 className="text-xl font-semibold mb-2">URL 编解码</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">URL 编码、解码与解析</p>
              </div>
            </Link>

            {/* Regex Tester */}
            <Link href="/tools/regex" className="group">
              <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-xl hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer">
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Regex className="h-6 w-6 text-indigo-500" />
                </div>
                <h3 className="text-xl font-semibold mb-2">正则测试</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">实时测试正则表达式</p>
              </div>
            </Link>

            {/* Markdown Editor */}
            <Link href="/tools/markdown" className="group">
              <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-xl hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer">
                <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900/30 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <FileText className="h-6 w-6 text-pink-500" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Markdown</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">实时预览 Markdown 编辑器</p>
              </div>
            </Link>

            {/* Color Converter */}
            <Link href="/tools/color" className="group">
              <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-xl hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 via-pink-500 to-purple-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Palette className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">颜色转换</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">HEX、RGB、HSL 互转</p>
              </div>
            </Link>

            {/* Binary Converter */}
            <Link href="/tools/binary" className="group">
              <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-xl hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer">
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Hash className="h-6 w-6 text-emerald-500" />
                </div>
                <h3 className="text-xl font-semibold mb-2">进制转换</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">二进制、十进制、十六进制</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-gray-200 dark:border-gray-700">
        <div className="container mx-auto text-center text-gray-600 dark:text-gray-400">
          <p>© 2025 DevToolsKit. MIT License.</p>
        </div>
      </footer>
    </div>
  )
}
