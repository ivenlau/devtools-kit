import Link from 'next/link'
import { tools } from '@/lib/constants/tools'

export default function ToolsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-3xl font-bold font-display">开发工具</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            20+ 实用工具，提升开发效率
          </p>
        </div>
      </header>

      {/* Tools Grid */}
      <main className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => (
            <Link key={tool.id} href={tool.path} className="group">
              <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-xl hover:shadow-xl hover:border-blue-300 transition-all cursor-pointer h-full">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  {/* Icon placeholder - will add actual icons later */}
                  <span className="text-white text-xl font-bold">{tool.name[0]}</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">{tool.name}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {tool.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}
