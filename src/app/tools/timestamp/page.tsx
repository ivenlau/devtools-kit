'use client'

import { useState, useEffect } from 'react'
import { Clock, Copy } from 'lucide-react'
import dayjs from 'dayjs'

export default function TimestampToolPage() {
  const [currentTimestamp, setCurrentTimestamp] = useState(0)
  const [inputTimestamp, setInputTimestamp] = useState('')
  const [outputDate, setOutputDate] = useState('')
  const [inputDate, setInputDate] = useState('')
  const [outputTimestamp, setOutputTimestamp] = useState('')

  // 更新当前时间
  useEffect(() => {
    const update = () => {
      setCurrentTimestamp(Math.floor(Date.now() / 1000))
    }
    update()
    const timer = setInterval(update, 1000)
    return () => clearInterval(timer)
  }, [])

  // 时间戳转日期
  const handleTimestampToDate = () => {
    if (!inputTimestamp.trim()) return

    try {
      const timestamp = parseInt(inputTimestamp)
      if (isNaN(timestamp)) {
        throw new Error('无效的时间戳')
      }

      const ts = timestamp.toString().length === 10 ? timestamp * 1000 : timestamp
      const date = dayjs(ts).format('YYYY-MM-DD HH:mm:ss')
      setOutputDate(date)
    } catch (error: any) {
      setOutputDate(error.message || '转换失败')
    }
  }

  // 日期转时间戳
  const handleDateToTimestamp = () => {
    if (!inputDate.trim()) return

    try {
      const ts = dayjs(inputDate).valueOf()
      const seconds = Math.floor(ts / 1000)
      const milliseconds = ts
      setOutputTimestamp(`${seconds} (秒) / ${milliseconds} (毫秒)`)
    } catch (error: any) {
      setOutputTimestamp(error.message || '转换失败')
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text.toString())
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-display">时间戳转换</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Unix 时间戳与日期时间互转
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* 当前时间戳 */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-medium opacity-90 mb-2">当前时间戳</h2>
              <div className="flex items-baseline gap-4">
                <button
                  onClick={() => copyToClipboard(currentTimestamp)}
                  className="text-4xl font-bold cursor-pointer hover:opacity-80 transition-opacity"
                >
                  {currentTimestamp}
                </button>
                <span className="text-lg opacity-90">秒</span>
              </div>
              <div className="mt-2 text-sm opacity-90">
                {dayjs().format('YYYY-MM-DD HH:mm:ss')}
              </div>
            </div>
            <Clock className="h-16 w-16 opacity-50" />
          </div>
        </div>

        {/* 时间戳转日期 */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">时间戳 → 日期</h3>
          <div className="space-y-4">
            <input
              type="text"
              value={inputTimestamp}
              onChange={(e) => setInputTimestamp(e.target.value)}
              placeholder="例如: 1706610000"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              onClick={handleTimestampToDate}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:shadow-lg transition-all"
            >
              转换
            </button>
            {outputDate && (
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg flex items-center justify-between">
                <code className="text-lg">{outputDate}</code>
                <button
                  onClick={() => copyToClipboard(outputDate)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all text-sm flex items-center gap-2"
                >
                  <Copy className="h-4 w-4" />
                  复制
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 日期转时间戳 */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">日期 → 时间戳</h3>
          <div className="space-y-4">
            <input
              type="datetime-local"
              value={inputDate}
              onChange={(e) => setInputDate(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              onClick={handleDateToTimestamp}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:shadow-lg transition-all"
            >
              转换
            </button>
            {outputTimestamp && (
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg flex items-center justify-between">
                <code className="text-lg">{outputTimestamp}</code>
                <button
                  onClick={() => copyToClipboard(outputTimestamp.split(' ')[0])}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all text-sm flex items-center gap-2"
                >
                  <Copy className="h-4 w-4" />
                  复制
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4 py-3">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            💡 支持秒级和毫秒级时间戳，点击当前时间戳可快速复制
          </div>
        </div>
      </div>
    </div>
  )
}
