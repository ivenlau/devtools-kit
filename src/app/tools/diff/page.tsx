'use client'

import { useState, useEffect } from 'react'
import { ArrowLeftRight, Copy, Trash2, ListOrdered } from 'lucide-react'
import { diffLines } from 'diff'
import { useTransferData } from '@/lib/useTransferData'
import { ToolShell } from '@/components/ToolShell'
import { useI18n } from '@/components/I18nProvider'

interface DiffResult {
  type: 'unchanged' | 'added' | 'removed'
  lineNumber?: number
  content: string
  oldLineNumber?: number
  newLineNumber?: number
}

export default function DiffToolPage() {
  const { t } = useI18n()
  const [oldText, setOldText] = useState('')
  const [newText, setNewText] = useState('')
  const [diff, setDiff] = useState<DiffResult[]>([])
  const [lineMode, setLineMode] = useState(false)

  useTransferData(setOldText)

  // 计算差异
  useEffect(() => {
    if (!oldText && !newText) {
      setDiff([])
      return
    }

    try {
      const difference = diffLines(
        oldText || '',
        newText || '',
        {
          newlineIsToken: false,
          ignoreWhitespace: false,
          oneChangePerToken: false,
        }
      )

      const results: DiffResult[] = []
      let oldLineNum = 1
      let newLineNum = 1

      difference.forEach((part) => {
        const lines = part.value.split('\n')

        if (part.added) {
          // 添加的行
          lines.forEach((line) => {
            if (line) {
              results.push({
                type: 'added',
                lineNumber: newLineNum,
                content: line,
                newLineNumber: newLineNum,
              })
              newLineNum++
            }
          })
        } else if (part.removed) {
          // 删除的行
          lines.forEach((line) => {
            if (line) {
              results.push({
                type: 'removed',
                lineNumber: oldLineNum,
                content: line,
                oldLineNumber: oldLineNum,
              })
              oldLineNum++
            }
          })
        } else {
          // 未改变的行
          lines.forEach((line) => {
            if (line) {
              results.push({
                type: 'unchanged',
                lineNumber: oldLineNum,
                oldLineNumber: oldLineNum,
                newLineNumber: newLineNum,
                content: line,
              })
              oldLineNum++
              newLineNum++
            }
          })
        }
      })

      setDiff(results)
    } catch (error) {
      console.error('Diff error:', error)
    }
  }, [oldText, newText])

  const handleClear = () => {
    setOldText('')
    setNewText('')
    setDiff([])
  }

  const copyUnifiedDiff = () => {
    const unifiedDiff = diff
      .map((line) => {
        const prefix = line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' '
        return prefix + line.content
      })
      .join('\n')

    navigator.clipboard.writeText(unifiedDiff)
  }

  const stats = {
    added: diff.filter((d) => d.type === 'added').length,
    removed: diff.filter((d) => d.type === 'removed').length,
    unchanged: diff.filter((d) => d.type === 'unchanged').length,
  }

  return (
    <ToolShell
      title="TEXT DIFF"
      description={t('对比两段文本的差异，支持并排和统一视图')}
      path="/tools/diff"
      icon={ArrowLeftRight}
      actions={
        <>
          {diff.length > 0 && (
            <button onClick={copyUnifiedDiff} className="tool-btn tool-btn-icon" title={t('复制Diff')} aria-label={t('复制Diff')}>
              <Copy className="h-3.5 w-3.5" />
            </button>
          )}
          <button onClick={handleClear} className="tool-btn tool-btn-icon tool-btn-danger" title={t('清空')} aria-label={t('清空')}>
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </>
      }
    >
      <div className="flex min-h-0 flex-1 flex-col gap-3">
        {/* Old / New inputs */}
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 lg:h-[calc(100dvh-8rem)] lg:grid-rows-[minmax(0,1fr)]">
          <div className="tool-panel h-full min-h-[400px]">
            <div className="tool-panel-head">
              <span className="text-neon-magenta">&gt;_</span>
              <span>OLD</span>
              <span className="ml-auto normal-case tracking-normal">
                {oldText.split('\n').length} {t('行')}
              </span>
            </div>
            <textarea
              value={oldText}
              onChange={(e) => setOldText(e.target.value)}
              placeholder={t('输入原始文本...')}
              spellCheck={false}
              className="min-h-0 flex-1 resize-none bg-void-100 p-4 font-mono text-sm leading-relaxed text-ink-primary caret-neon-magenta placeholder:text-ink-muted focus:outline-none"
            />
          </div>

          <div className="tool-panel h-full min-h-[400px]">
            <div className="tool-panel-head">
              <span className="text-neon-magenta">&gt;_</span>
              <span>NEW</span>
              <span className="ml-auto normal-case tracking-normal">
                {newText.split('\n').length} {t('行')}
              </span>
            </div>
            <textarea
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              placeholder={t('输入新文本...')}
              spellCheck={false}
              className="min-h-0 flex-1 resize-none bg-void-100 p-4 font-mono text-sm leading-relaxed text-ink-primary caret-neon-magenta placeholder:text-ink-muted focus:outline-none"
            />
          </div>
        </div>

        {/* Diff Result */}
        {diff.length > 0 && (
          <div className="tool-panel">
            <div className="tool-panel-head">
              <span className="text-neon-magenta">&gt;_</span>
              <span>DIFF</span>
              <span className="ml-3 flex items-center gap-3 normal-case tracking-normal">
                <span className="text-neon-lime" title={t('新增行')}>+{stats.added}</span>
                <span className="text-neon-red" title={t('删除行')}>-{stats.removed}</span>
                <span className="hidden text-ink-muted sm:inline" title={t('未改变行')}>
                  ={stats.unchanged}
                </span>
              </span>
              <button
                onClick={() => setLineMode(!lineMode)}
                aria-pressed={lineMode}
                title={t('显示行号')}
                aria-label={t('显示行号')}
                className={`tool-btn tool-btn-icon ml-auto ${lineMode ? 'tool-btn-accent' : ''}`}
              >
                <ListOrdered className="h-3.5 w-3.5" />
              </button>
              <span className="normal-case tracking-normal">{diff.length} 行</span>
            </div>
            <div className="max-h-[440px] min-h-0 flex-1 overflow-auto">
              <table className="w-full font-mono text-sm">
                <tbody>
                  {diff.map((line, index) => (
                    <tr
                      key={index}
                      className={`${
                        line.type === 'added'
                          ? 'bg-neon-lime/10'
                          : line.type === 'removed'
                          ? 'bg-neon-red/10'
                          : ''
                      }`}
                    >
                      {lineMode && (
                        <>
                          <td className="w-14 select-none border-r border-border-dim px-3 py-1 text-right font-mono text-[11px] text-ink-muted">
                            {line.oldLineNumber ?? ''}
                          </td>
                          <td className="w-14 select-none border-r border-border-dim px-3 py-1 text-right font-mono text-[11px] text-ink-muted">
                            {line.newLineNumber ?? ''}
                          </td>
                        </>
                      )}
                      <td className="whitespace-pre px-4 py-1">
                        <span
                          className={
                            line.type === 'added'
                              ? 'text-neon-lime'
                              : line.type === 'removed'
                              ? 'text-neon-red line-through'
                              : 'text-ink-secondary'
                          }
                        >
                          {line.content}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </ToolShell>
  )
}
