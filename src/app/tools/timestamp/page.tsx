'use client'

import { useCallback, useEffect, useState } from 'react'
import { Clock, Copy, ArrowRight, ArrowLeft } from 'lucide-react'
import {
  formatTimestampDate,
  formatTimestampMilliseconds,
  formatTimestampSeconds,
  parseDateInput,
  parseTimestampInput,
} from '@/lib/timestamp'
import { useTransferData } from '@/lib/useTransferData'
import { ToolShell } from '@/components/ToolShell'

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
    <ToolShell
      title="TIMESTAMP"
      description="Unix 时间戳与日期时间互转，支持毫秒级精度"
      path="/tools/timestamp"
      icon={Clock}
      accent="purple"
    >
      <div className="flex min-h-0 flex-1 flex-col gap-3">
        {/* Live clock hero */}
        <div className="relative overflow-hidden rounded-lg border border-border-dim bg-void-100 px-6 py-8 text-center">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_50%_50%,rgba(168,85,247,0.16),transparent_65%)]" />
          <div className="relative">
            <p className="font-mono text-[11px] tracking-[0.28em] text-ink-muted">
              CURRENT UNIX TIME
            </p>
            <button
              onClick={() => copyToClipboard(formatTimestampSeconds(currentTimeMs))}
              className="mx-auto mt-2 block font-mono text-4xl font-bold tracking-wide text-ink-primary transition-opacity hover:opacity-80 sm:text-5xl md:text-6xl"
              style={{ textShadow: '0 0 28px rgba(168,85,247,0.4)' }}
              title="复制秒级时间戳"
            >
              {formatTimestampSeconds(currentTimeMs)}
            </button>
            <button
              onClick={() => copyToClipboard(formatTimestampMilliseconds(currentTimeMs))}
              className="mt-1 font-mono text-base text-neon-purple transition-opacity hover:opacity-80 sm:text-lg"
              title="复制毫秒级时间戳"
            >
              {formatTimestampMilliseconds(currentTimeMs)}
            </button>
            <p className="mt-2 text-sm text-ink-secondary">
              {formatTimestampDate(currentTimeMs)}
            </p>
          </div>
        </div>

        {/* Converters */}
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {/* UNIX → HUMAN */}
          <div className="tool-panel min-h-[400px]">
            <div className="tool-panel-head">
              <span className="text-neon-purple">&gt;_</span>
              <span>UNIX → HUMAN</span>
              <span className="ml-auto flex items-center gap-1.5 normal-case tracking-normal">
                {timestampError ? (
                  <span className="text-neon-red">ERR</span>
                ) : outputDate ? (
                  <>
                    <span className="status-dot" />ok
                  </>
                ) : (
                  'idle'
                )}
              </span>
            </div>
            <div className="flex min-h-0 flex-1 flex-col gap-3 p-4">
              <input
                type="text"
                inputMode="decimal"
                value={inputTimestamp}
                onChange={(e) => setInputTimestamp(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleTimestampToDate()}
                placeholder="例如: 1706610000 或 1706610000123.456"
                className="w-full rounded-md border border-border-dim bg-void-200 px-3 py-2 font-mono text-sm text-ink-primary placeholder:text-ink-muted focus:border-neon-cyan focus:outline-none"
              />
              <button onClick={handleTimestampToDate} className="tool-btn tool-btn-accent self-start">
                <ArrowRight className="h-3.5 w-3.5" />
                转换
              </button>
              {timestampError && (
                <p className="font-mono text-xs text-neon-red">{timestampError}</p>
              )}
              {outputDate && (
                <div className="flex items-center justify-between gap-4 rounded-md border border-border-dim bg-void-200 p-4">
                  <div className="min-w-0">
                    <p className="mb-1 font-mono text-[10px] text-ink-muted">LOCAL</p>
                    <code className="break-all font-mono text-base text-neon-lime">{outputDate}</code>
                  </div>
                  <button
                    onClick={() => copyToClipboard(outputDate)}
                    className="tool-btn shrink-0"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    复制
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* HUMAN → UNIX */}
          <div className="tool-panel min-h-[400px]">
            <div className="tool-panel-head">
              <span className="text-neon-purple">&gt;_</span>
              <span>HUMAN → UNIX</span>
              <span className="ml-auto flex items-center gap-1.5 normal-case tracking-normal">
                {dateError ? (
                  <span className="text-neon-red">ERR</span>
                ) : outputTimestamp ? (
                  <>
                    <span className="status-dot" />ok
                  </>
                ) : (
                  'idle'
                )}
              </span>
            </div>
            <div className="flex min-h-0 flex-1 flex-col gap-3 p-4">
              <input
                type="text"
                value={inputDate}
                onChange={(e) => setInputDate(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleDateToTimestamp()}
                placeholder="例如: 2024-01-30 12:00:00.123 或 2024年1月30日"
                className="w-full rounded-md border border-border-dim bg-void-200 px-3 py-2 font-mono text-sm text-ink-primary placeholder:text-ink-muted focus:border-neon-cyan focus:outline-none"
              />
              <p className="font-mono text-[11px] text-ink-muted">
                支持 ISO 8601、`YYYY-MM-DD HH:mm:ss`、斜杠日期、中文日期和带时区的日期格式
              </p>
              <button onClick={handleDateToTimestamp} className="tool-btn tool-btn-accent self-start">
                <ArrowLeft className="h-3.5 w-3.5" />
                转换
              </button>
              {dateError && (
                <p className="font-mono text-xs text-neon-red">{dateError}</p>
              )}
              {outputTimestamp && (
                <div className="space-y-2 rounded-md border border-border-dim bg-void-200 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <code className="break-all font-mono text-sm text-neon-lime">
                      s · {outputTimestamp.seconds}
                    </code>
                    <button
                      onClick={() => copyToClipboard(outputTimestamp.seconds)}
                      className="tool-btn shrink-0"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      复制
                    </button>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <code className="break-all font-mono text-sm text-neon-cyan">
                      ms · {outputTimestamp.milliseconds}
                    </code>
                    <button
                      onClick={() => copyToClipboard(outputTimestamp.milliseconds)}
                      className="tool-btn shrink-0"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      复制
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </ToolShell>
  )
}
