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
      {/* Live clock hero */}
      <div className="relative overflow-hidden rounded-xl border border-border-dim bg-void-100 px-6 py-8 text-center">
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
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="panel p-5">
          <h3 className="mb-4 font-mono text-[11px] tracking-[0.16em] text-neon-purple">
            UNIX → HUMAN
          </h3>
          <div className="space-y-3">
            <input
              type="text"
              inputMode="decimal"
              value={inputTimestamp}
              onChange={(e) => setInputTimestamp(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleTimestampToDate()}
              placeholder="例如: 1706610000 或 1706610000123.456"
              className="w-full rounded-md border border-border-glow bg-void-200 px-4 py-3 font-mono text-sm text-ink-primary placeholder:text-ink-muted focus:border-neon-purple focus:outline-none focus:ring-1 focus:ring-neon-purple/40"
            />
            <button onClick={handleTimestampToDate} className="btn-neon !bg-none" style={{ background: 'linear-gradient(90deg,#A855F7,#FF2D95)' }}>
              CONVERT
            </button>
            {timestampError && (
              <p className="font-mono text-xs text-neon-red">{timestampError}</p>
            )}
            {outputDate && (
              <div className="flex items-center justify-between gap-4 rounded-lg border border-neon-purple/40 bg-[#0A0C12] p-4">
                <div className="min-w-0">
                  <p className="mb-1 font-mono text-[10px] text-ink-muted">LOCAL</p>
                  <code className="font-mono text-base text-neon-lime">{outputDate}</code>
                </div>
                <button
                  onClick={() => copyToClipboard(outputDate)}
                  className="chip shrink-0"
                >
                  <Copy className="mr-1 h-3.5 w-3.5" />
                  COPY
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="panel p-5">
          <h3 className="mb-4 font-mono text-[11px] tracking-[0.16em] text-neon-cyan">
            HUMAN → UNIX
          </h3>
          <div className="space-y-3">
            <input
              type="text"
              value={inputDate}
              onChange={(e) => setInputDate(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleDateToTimestamp()}
              placeholder="例如: 2024-01-30 12:00:00.123 或 2024年1月30日"
              className="w-full rounded-md border border-border-glow bg-void-200 px-4 py-3 font-mono text-sm text-ink-primary placeholder:text-ink-muted focus:border-neon-cyan focus:outline-none focus:ring-1 focus:ring-neon-cyan/40"
            />
            <p className="text-[11px] text-ink-muted">
              支持 ISO 8601、`YYYY-MM-DD HH:mm:ss`、斜杠日期、中文日期和带时区的日期格式
            </p>
            <button onClick={handleDateToTimestamp} className="btn-neon">
              CONVERT
            </button>
            {dateError && (
              <p className="font-mono text-xs text-neon-red">{dateError}</p>
            )}
            {outputTimestamp && (
              <div className="space-y-2 rounded-lg border border-neon-cyan/40 bg-[#0A0C12] p-4">
                <div className="flex items-center justify-between gap-4">
                  <code className="font-mono text-sm text-neon-lime">
                    s · {outputTimestamp.seconds}
                  </code>
                  <button
                    onClick={() => copyToClipboard(outputTimestamp.seconds)}
                    className="chip shrink-0"
                  >
                    <Copy className="mr-1 h-3.5 w-3.5" />
                    COPY
                  </button>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <code className="font-mono text-sm text-neon-cyan">
                    ms · {outputTimestamp.milliseconds}
                  </code>
                  <button
                    onClick={() => copyToClipboard(outputTimestamp.milliseconds)}
                    className="chip shrink-0"
                  >
                    <Copy className="mr-1 h-3.5 w-3.5" />
                    COPY
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 font-mono text-[11px] text-ink-muted">
        点击大号时间戳可复制 · 主页粘贴时间戳或日期可快速打开本工具
      </div>
    </ToolShell>
  )
}
