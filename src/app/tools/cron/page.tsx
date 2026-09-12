'use client'

import { useState, useEffect } from 'react'
import { Clock, Copy, Calendar } from 'lucide-react'
import cronstrue from 'cronstrue/i18n'
import { useTransferData } from '@/lib/useTransferData'
import { ToolShell } from '@/components/ToolShell'

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

  useTransferData(setCron)

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

  const fieldInputClass =
    'w-full rounded-md border border-border-dim bg-void-200 px-3 py-2 font-mono text-sm text-ink-primary placeholder:text-ink-muted focus:border-neon-cyan focus:outline-none disabled:cursor-not-allowed disabled:opacity-40'
  const chipClass =
    'rounded border border-border-dim bg-void-200 px-1.5 py-0.5 font-mono text-[10px] text-ink-secondary transition-colors hover:border-neon-amber hover:text-neon-amber disabled:cursor-not-allowed disabled:opacity-40'

  const manualFields = [
    { label: '分钟 (0-59)', value: minute, setValue: setMinute, values: commonValues.minute },
    { label: '小时 (0-23)', value: hour, setValue: setHour, values: commonValues.hour },
    { label: '日期 (1-31)', value: day, setValue: setDay, values: commonValues.day },
    { label: '月份 (1-12)', value: month, setValue: setMonth, values: commonValues.month },
    { label: '星期 (0-6)', value: weekday, setValue: setWeekday, values: commonValues.weekday },
  ]

  return (
    <ToolShell
      title="CRON EXPRESSION"
      description="生成和解析 Cron 定时任务表达式"
      path="/tools/cron"
      icon={Clock}
      accent="amber"
      actions={
        <>
          <label className="flex cursor-pointer select-none items-center gap-1.5 font-mono text-[11px] text-ink-secondary">
            <input
              type="checkbox"
              checked={manualMode}
              onChange={(e) => setManualMode(e.target.checked)}
              className="accent-neon-amber"
            />
            手动模式
          </label>

          <div className="hidden h-5 w-px bg-border-dim sm:block" />

          <button onClick={copyToClipboard} disabled={!cron} className="tool-btn tool-btn-accent">
            <Copy className="h-3.5 w-3.5" />
            复制
          </button>
        </>
      }
    >
      <div className="flex min-h-0 flex-1 flex-col gap-3">
        {/* Expression */}
        <div className="tool-panel">
          <div className="tool-panel-head">
            <span className="text-neon-amber">&gt;_</span>
            <span>EXPRESSION</span>
            <span className="ml-auto normal-case tracking-normal">
              {error ? <span className="text-neon-red">ERROR</span> : 'VALID'}
            </span>
          </div>
          <div className="p-4">
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
              placeholder="* * * * *"
              className="w-full rounded-md border border-border-dim bg-void-200 px-3 py-2.5 font-mono text-lg text-ink-primary caret-neon-amber placeholder:text-ink-muted focus:border-neon-cyan focus:outline-none"
            />
            <div className="mt-3 flex items-start gap-2">
              <Calendar
                className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${error ? 'text-neon-red' : 'text-neon-amber'}`}
              />
              <p
                className={`font-mono text-xs leading-relaxed ${
                  error ? 'text-neon-red' : 'text-ink-secondary'
                }`}
              >
                <span className="text-ink-muted">{error ? '错误' : '说明'}:</span>{' '}
                {error || description}
              </p>
            </div>
          </div>
        </div>

        {/* Manual Builder */}
        <div className="tool-panel">
          <div className="tool-panel-head">
            <span className="text-neon-amber">&gt;_</span>
            <span>BUILDER</span>
            <span className="ml-auto normal-case tracking-normal">
              {manualMode ? 'MANUAL ON' : 'READ-ONLY'}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4 p-4 sm:grid-cols-3 lg:grid-cols-5">
            {manualFields.map((field) => (
              <div key={field.label}>
                <label className="mb-2 block font-mono text-[11px] text-ink-muted">
                  {field.label}
                </label>
                <input
                  type="text"
                  value={field.value}
                  onChange={(e) => field.setValue(e.target.value)}
                  disabled={!manualMode}
                  className={fieldInputClass}
                />
                <div className="mt-2 flex flex-wrap gap-1">
                  {field.values.map((val) => (
                    <button
                      key={val}
                      onClick={() => manualMode && field.setValue(val)}
                      className={chipClass}
                      disabled={!manualMode}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Presets */}
        <div className="tool-panel">
          <div className="tool-panel-head">
            <span className="text-neon-amber">&gt;_</span>
            <span>PRESETS</span>
            <span className="ml-auto normal-case tracking-normal">{presets.length} 组常用</span>
          </div>
          <div className="grid grid-cols-2 gap-2 p-4 sm:grid-cols-3 lg:grid-cols-5">
            {presets.map((preset) => (
              <button
                key={preset.name}
                onClick={() => loadPreset(preset.cron)}
                className={`rounded-md border px-3 py-2 text-center transition-colors ${
                  cron === preset.cron
                    ? 'border-neon-amber bg-neon-amber/10 text-neon-amber'
                    : 'border-border-dim bg-void-200 text-ink-secondary hover:border-neon-amber/60'
                }`}
              >
                <div className="text-xs font-semibold">{preset.name}</div>
                <div className="font-mono text-[11px] opacity-80">{preset.cron}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Next Runs */}
        {nextRuns.length > 0 && (
          <div className="tool-panel">
            <div className="tool-panel-head">
              <span className="text-neon-amber">&gt;_</span>
              <span>NEXT RUNS</span>
              <span className="ml-auto normal-case tracking-normal">接下来 {nextRuns.length} 次执行</span>
            </div>
            <div className="space-y-2 p-4">
              {nextRuns.map((run, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 rounded-md border border-border-dim bg-void-200 px-3 py-2"
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-neon-amber/60 font-mono text-[10px] text-neon-amber">
                    {index + 1}
                  </span>
                  <span className="font-mono text-xs text-ink-primary">
                    {new Date(run).toLocaleString('zh-CN', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </ToolShell>
  )
}
