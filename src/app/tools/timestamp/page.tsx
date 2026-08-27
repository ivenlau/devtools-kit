'use client'

import { useCallback, useEffect, useState } from 'react'
import { Clock, Copy } from 'lucide-react'
import {
  formatTimestampDate,
  formatTimestampMilliseconds,
  formatTimestampSeconds,
  parseDateInput,
  parseTimestampInput,
} from '@/lib/timestamp'
import { useTransferData } from '@/lib/useTransferData'

interface TimestampOutput {
  seconds: string
  milliseconds: string
}

export default function TimestampToolPage() {
  const [currentTimeMs, setCurrentTimeMs] = useState(0)
  const [inputTimestamp, setInputTimestamp] = useState('')
  const [outputDate, setOutputDate] = useState('')
  const [inputDate, setInputDate] = useState('')
  const [outputTimestamp, setOutputTimestamp] = useState<TimestampOutput | null>(null)
  const [timestampError, setTimestampError] = useState('')
  const [dateError, setDateError] = useState('')

  const receiveTransferredData = useCallback((content: string) => {
    if (parseTimestampInput(content)) {
      setInputTimestamp(content)
      setInputDate('')
      return
    }
    setInputDate(content)
    setInputTimestamp('')
  }, [])

  useTransferData(receiveTransferredData)

  useEffect(() => {
    const update = () => setCurrentTimeMs(Date.now())
    update()
    const timer = setInterval(update, 100)
    return () => clearInterval(timer)
  }, [])

  const handleTimestampToDate = () => {
    const parsed = parseTimestampInput(inputTimestamp)
    if (!parsed) {
      setOutputDate('')
      setTimestampError('无效的时间戳，请输入秒级或毫秒级数字')
      return
    }

    setTimestampError('')
    setOutputDate(formatTimestampDate(parsed.milliseconds))
  }

  const handleDateToTimestamp = () => {
    const parsed = parseDateInput(inputDate)
    if (!parsed) {
      setOutputTimestamp(null)
      setDateError('无法识别该时间格式，请检查日期、时间和时区')
      return
    }

    const milliseconds = parsed.valueOf()
    setDateError('')
    setOutputTimestamp({
      seconds: formatTimestampSeconds(milliseconds),
      milliseconds: formatTimestampMilliseconds(milliseconds),
    })
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <header className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-display">时间戳转换</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Unix 时间戳与日期时间互转，支持毫秒级精度
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <h2 className="text-sm font-medium opacity-90 mb-2">当前时间戳</h2>
              <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
                <button
                  onClick={() => copyToClipboard(formatTimestampSeconds(currentTimeMs))}
                  className="text-4xl font-bold cursor-pointer hover:opacity-80 transition-opacity"
                  title="复制秒级时间戳"
                >
                  {formatTimestampSeconds(currentTimeMs)}
                </button>
                <span className="text-lg opacity-90">秒</span>
                <button
                  onClick={() => copyToClipboard(formatTimestampMilliseconds(currentTimeMs))}
                  className="text-xl font-semibold cursor-pointer hover:opacity-80 transition-opacity"
                  title="复制毫秒级时间戳"
                >
                  {formatTimestampMilliseconds(currentTimeMs)}
                </button>
                <span className="text-sm opacity-90">毫秒</span>
              </div>
              <div className="mt-2 text-sm opacity-90">
                {formatTimestampDate(currentTimeMs)}
              </div>
            </div>
            <Clock className="h-16 w-16 opacity-50 shrink-0" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">时间戳 → 日期</h3>
          <div className="space-y-4">
            <input
              type="text"
              inputMode="decimal"
              value={inputTimestamp}
              onChange={(e) => setInputTimestamp(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleTimestampToDate()}
              placeholder="例如: 1706610000 或 1706610000123.456"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              onClick={handleTimestampToDate}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:shadow-lg transition-all"
            >
              转换
            </button>
            {timestampError && <p className="text-sm text-red-500">{timestampError}</p>}
            {outputDate && (
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">本地时间</p>
                  <code className="text-lg">{outputDate}</code>
                </div>
                <button
                  onClick={() => copyToClipboard(outputDate)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all text-sm flex items-center gap-2 shrink-0"
                >
                  <Copy className="h-4 w-4" />
                  复制
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">日期 → 时间戳</h3>
          <div className="space-y-4">
            <input
              type="text"
              value={inputDate}
              onChange={(e) => setInputDate(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleDateToTimestamp()}
              placeholder="例如: 2024-01-30 12:00:00.123 或 2024年1月30日"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              支持 ISO 8601、`YYYY-MM-DD HH:mm:ss`、斜杠日期、中文日期和带时区的日期格式
            </p>
            <button
              onClick={handleDateToTimestamp}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:shadow-lg transition-all"
            >
              转换
            </button>
            {dateError && <p className="text-sm text-red-500">{dateError}</p>}
            {outputTimestamp && (
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <code>秒：{outputTimestamp.seconds}</code>
                  <button
                    onClick={() => copyToClipboard(outputTimestamp.seconds)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all text-sm flex items-center gap-2 shrink-0"
                  >
                    <Copy className="h-4 w-4" />
                    复制
                  </button>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <code>毫秒：{outputTimestamp.milliseconds}</code>
                  <button
                    onClick={() => copyToClipboard(outputTimestamp.milliseconds)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all text-sm flex items-center gap-2 shrink-0"
                  >
                    <Copy className="h-4 w-4" />
                    复制
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4 py-3">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            💡 支持秒级、毫秒级和小数秒时间戳；主页粘贴时间戳或日期可快速打开本工具
          </div>
        </div>
      </div>
    </div>
  )
}
