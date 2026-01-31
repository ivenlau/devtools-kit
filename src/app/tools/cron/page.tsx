'use client'

import { useState, useEffect } from 'react'
import { Clock, Copy, Calendar } from 'lucide-react'
import cronstrue from 'cronstrue/i18n'

import { CronExpressionParser } from 'cron-parser'

export default function CronGeneratorPage() {
  const defaultCron = '0 0 * * *'
  const [cron, setCron] = useState(defaultCron)
  const [description, setDescription] = useState('每天 0 点执行')
  const [nextRuns, setNextRuns] = useState<string[]>([])
  const [manualMode, setManualMode] = useState(false)
  const [error, setError] = useState('')

  // Manual cron parts - match the default cron
  const [minute, setMinute] = useState('0')
  const [hour, setHour] = useState('0')
  const [day, setDay] = useState('*')
  const [month, setMonth] = useState('*')
  const [weekday, setWeekday] = useState('*')

  // Parse and explain cron
  useEffect(() => {
    if (!cron || cron.trim() === '') {
      setError('请输入 Cron 表达式')
      setDescription('')
      setNextRuns([])
      return
    }

    try {
      // Validate cron format first
      const trimmedCron = cron.trim()
      const parts = trimmedCron.split(/\s+/)

      if (parts.length !== 5) {
        throw new Error(`格式错误: 需要 5 个部分，当前有 ${parts.length} 个`)
      }

      // Parse expression
      let interval
      try {
        interval = CronExpressionParser.parse(trimmedCron)
      } catch (parseError: any) {
        throw new Error(parseError.message || '无法解析表达式')
      }

      // Get description using cronstrue
      try {
        const desc = cronstrue.toString(trimmedCron, { locale: 'zh_CN' })
        setDescription(desc)
      } catch (e) {
        // If cronstrue fails, fallback to the raw expression
        setDescription(trimmedCron)
      }

      // Get next runs
      const runs: string[] = []
      try {
        for (let i = 0; i < 5; i++) {
          const next = interval.next()
          runs.push(next.toString())
        }
      } catch (iterError: any) {
        // If we can't get next runs, at least show the parsed description
        console.warn('Could not get next runs:', iterError)
      }
      setNextRuns(runs)
      setError('')
    } catch (error: any) {
      console.error('Cron parse error:', error)
      setError(`无效: ${error.message}`)
      setDescription('')
      setNextRuns([])
    }
  }, [cron])

  // Update cron from manual inputs
  useEffect(() => {
    if (manualMode) {
      setCron(`${minute} ${hour} ${day} ${month} ${weekday}`)
    }
  }, [minute, hour, day, month, weekday, manualMode])

  // Preset crons
  const presets = [
    { name: '每分钟', cron: '* * * * *' },
    { name: '每小时', cron: '0 * * * *' },
    { name: '每天 0 点', cron: '0 0 * * *' },
    { name: '每天 12 点', cron: '0 12 * * *' },
    { name: '每周一', cron: '0 0 * * 1' },
    { name: '每月 1 号', cron: '0 0 1 * *' },
    { name: '工作日 9 点', cron: '0 9 * * 1-5' },
    { name: '每 5 分钟', cron: '*/5 * * * *' },
    { name: '每 2 小时', cron: '0 */2 * * *' },
    { name: '每天 8-18 点', cron: '0 8-18 * * *' },
  ]

  // Load preset
  const loadPreset = (presetCron: string) => {
    setCron(presetCron)
    const parts = presetCron.split(' ')
    if (parts.length === 5) {
      setMinute(parts[0])
      setHour(parts[1])
      setDay(parts[2])
      setMonth(parts[3])
      setWeekday(parts[4])
    }
  }

  // Copy to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(cron)
  }

  // Common values
  const commonValues = {
    minute: ['*', '0', '*/5', '*/15', '*/30'],
    hour: ['*', '0', '*/2', '*/6', '*/12', '8-18'],
    day: ['*', '1', '15', '1,15'],
    month: ['*', '1', '4,7,10'],
    weekday: ['*', '1', '1-5', '0,6'],
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-display">Cron 表达式生成器</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                生成和解析 Cron 定时任务表达式
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Cron Expression Display */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1">
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-2">
                  Cron 表达式
                </label>
                <input
                  type="text"
                  value={cron}
                  onChange={(e) => {
                    setCron(e.target.value)
                    const parts = e.target.value.split(' ')
                    if (parts.length === 5) {
                      setMinute(parts[0])
                      setHour(parts[1])
                      setDay(parts[2])
                      setMonth(parts[3])
                      setWeekday(parts[4])
                    }
                  }}
                  className="w-full px-4 py-3 font-mono text-lg border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  placeholder="* * * * *"
                />
              </div>
              <button
                onClick={copyToClipboard}
                className="mt-6 px-4 py-3 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-all flex items-center gap-2"
              >
                <Copy className="h-4 w-4" />
                复制
              </button>
            </div>

            {/* Description */}
            <div className={`p-4 rounded-lg border ${
              error
                ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                : 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800'
            }`}>
              <div className="flex items-center gap-2 mb-1">
                <Calendar className={`h-4 w-4 ${error ? 'text-red-500' : 'text-rose-500'}`} />
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {error ? '错误' : '说明'}
                </span>
              </div>
              <p className={`text-sm font-semibold ${
                error
                  ? 'text-red-700 dark:text-red-400'
                  : 'text-rose-700 dark:text-rose-400'
              }`}>
                {error || description}
              </p>
            </div>
          </div>

          {/* Manual Builder */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold">手动配置</h3>
              <button
                onClick={() => setManualMode(!manualMode)}
                className={`px-3 py-1 text-xs rounded transition-all ${
                  manualMode
                    ? 'bg-rose-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600'
                }`}
              >
                {manualMode ? '已启用' : '点击启用'}
              </button>
            </div>

            <div className="grid grid-cols-5 gap-3">
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-2">
                  分钟 (0-59)
                </label>
                <input
                  type="text"
                  value={minute}
                  onChange={(e) => setMinute(e.target.value)}
                  disabled={!manualMode}
                  className="w-full px-3 py-2 font-mono text-sm border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-500 disabled:opacity-50"
                />
                <div className="mt-2 flex flex-wrap gap-1">
                  {commonValues.minute.map((val) => (
                    <button
                      key={val}
                      onClick={() => manualMode && setMinute(val)}
                      className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-900 rounded hover:bg-gray-200 dark:hover:bg-gray-800 disabled:opacity-50"
                      disabled={!manualMode}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-2">
                  小时 (0-23)
                </label>
                <input
                  type="text"
                  value={hour}
                  onChange={(e) => setHour(e.target.value)}
                  disabled={!manualMode}
                  className="w-full px-3 py-2 font-mono text-sm border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-500 disabled:opacity-50"
                />
                <div className="mt-2 flex flex-wrap gap-1">
                  {commonValues.hour.map((val) => (
                    <button
                      key={val}
                      onClick={() => manualMode && setHour(val)}
                      className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-900 rounded hover:bg-gray-200 dark:hover:bg-gray-800 disabled:opacity-50"
                      disabled={!manualMode}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-2">
                  日期 (1-31)
                </label>
                <input
                  type="text"
                  value={day}
                  onChange={(e) => setDay(e.target.value)}
                  disabled={!manualMode}
                  className="w-full px-3 py-2 font-mono text-sm border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-500 disabled:opacity-50"
                />
                <div className="mt-2 flex flex-wrap gap-1">
                  {commonValues.day.map((val) => (
                    <button
                      key={val}
                      onClick={() => manualMode && setDay(val)}
                      className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-900 rounded hover:bg-gray-200 dark:hover:bg-gray-800 disabled:opacity-50"
                      disabled={!manualMode}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-2">
                  月份 (1-12)
                </label>
                <input
                  type="text"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  disabled={!manualMode}
                  className="w-full px-3 py-2 font-mono text-sm border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-500 disabled:opacity-50"
                />
                <div className="mt-2 flex flex-wrap gap-1">
                  {commonValues.month.map((val) => (
                    <button
                      key={val}
                      onClick={() => manualMode && setMonth(val)}
                      className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-900 rounded hover:bg-gray-200 dark:hover:bg-gray-800 disabled:opacity-50"
                      disabled={!manualMode}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-2">
                  星期 (0-6)
                </label>
                <input
                  type="text"
                  value={weekday}
                  onChange={(e) => setWeekday(e.target.value)}
                  disabled={!manualMode}
                  className="w-full px-3 py-2 font-mono text-sm border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-500 disabled:opacity-50"
                />
                <div className="mt-2 flex flex-wrap gap-1">
                  {commonValues.weekday.map((val) => (
                    <button
                      key={val}
                      onClick={() => manualMode && setWeekday(val)}
                      className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-900 rounded hover:bg-gray-200 dark:hover:bg-gray-800 disabled:opacity-50"
                      disabled={!manualMode}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Presets */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
            <h3 className="text-sm font-semibold mb-4">常用预设</h3>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {presets.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => loadPreset(preset.cron)}
                  className={`p-3 rounded-lg border transition-all text-center ${
                    cron === preset.cron
                      ? 'bg-rose-500 text-white border-rose-500'
                      : 'bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <div className="text-xs font-semibold mb-1">{preset.name}</div>
                  <div className="font-mono text-xs opacity-80">{preset.cron}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Next Runs */}
          {nextRuns.length > 0 && (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
              <h3 className="text-sm font-semibold mb-4">接下来 5 次执行时间</h3>

              <div className="space-y-2">
                {nextRuns.map((run, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg"
                  >
                    <div className="w-6 h-6 bg-rose-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center">
                      <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">
                        {index + 1}
                      </span>
                    </div>
                    <div className="font-mono text-sm text-gray-900 dark:text-gray-100">
                      {new Date(run).toLocaleString('zh-CN', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Usage Tips */}
          <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-rose-800 dark:text-rose-300 mb-2">使用提示</h4>
            <ul className="text-xs text-rose-700 dark:text-rose-400 space-y-1">
              <li>• Cron 格式：分钟 小时 日期 月份 星期</li>
              <li>• * : 匹配任意值</li>
              <li>• */n : 每隔 n 个单位</li>
              <li>• n-m : 从 n 到 m 的范围</li>
              <li>• n,m,d : 多个值，用逗号分隔</li>
              <li>• 星期：0=周日, 1=周一, ..., 6=周六</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4 py-3">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            💡 可视化配置 • 常用预设 • 执行时间预览
          </div>
        </div>
      </div>
    </div>
  )
}
