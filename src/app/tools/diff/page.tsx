'use client'

import { useState, useEffect } from 'react'
import { ArrowLeftRight, Copy, Trash2 } from 'lucide-react'
import { diffLines } from 'diff'

interface DiffResult {
  type: 'unchanged' | 'added' | 'removed'
  lineNumber?: number
  content: string
  oldLineNumber?: number
  newLineNumber?: number
}

export default function DiffToolPage() {
  const [oldText, setOldText] = useState('')
  const [newText, setNewText] = useState('')
  const [diff, setDiff] = useState<DiffResult[]>([])
  const [lineMode, setLineMode] = useState(false)

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
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
              <ArrowLeftRight className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-display">Diff 文本对比</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                对比两段文本的差异，支持并排和统一视图
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Toolbar */}
      <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4 py-3 flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={lineMode}
              onChange={(e) => setLineMode(e.target.checked)}
              className="rounded"
            />
            <span className="text-gray-600 dark:text-gray-400">显示行号</span>
          </label>

          <div className="ml-auto flex items-center gap-3">
            {diff.length > 0 && (
              <>
                <button
                  onClick={copyUnifiedDiff}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all text-sm flex items-center gap-2"
                >
                  <Copy className="h-4 w-4" />
                  复制Diff
                </button>
                <button
                  onClick={handleClear}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all text-sm flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  清空
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      {diff.length > 0 && (
        <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-green-500"></span>
                <span className="text-green-600">新增 {stats.added} 行</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500"></span>
                <span className="text-red-600">删除 {stats.removed} 行</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-gray-400"></span>
                <span className="text-gray-600">未改变 {stats.unchanged} 行</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-6">
        {!oldText && !newText && (
          <div className="mb-6 text-center py-8 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
            <ArrowLeftRight className="h-12 w-12 mx-auto mb-3 text-gray-400" />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              在下方输入两段文本开始对比
            </p>
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Old Text */}
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                原始文本
              </h3>
              <span className="text-xs text-gray-500">
                {oldText.split('\n').length} 行
              </span>
            </div>
            <textarea
              value={oldText}
              onChange={(e) => setOldText(e.target.value)}
              placeholder="输入原始文本..."
              className="flex-1 min-h-[400px] p-4 font-mono text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 resize-none focus:outline-none focus:ring-2 focus:ring-orange-500"
              spellCheck={false}
            />
          </div>

          {/* New Text */}
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                新文本
              </h3>
              <span className="text-xs text-gray-500">
                {newText.split('\n').length} 行
              </span>
            </div>
            <textarea
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              placeholder="输入新文本..."
              className="flex-1 min-h-[400px] p-4 font-mono text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
              spellCheck={false}
            />
          </div>
        </div>
      </div>

      {/* Diff Result */}
      {diff.length > 0 && (
        <div className="container mx-auto px-4 pb-6">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm font-mono">
                <tbody>
                  {diff.map((line, index) => (
                    <tr
                      key={index}
                      className={`${
                        line.type === 'added'
                          ? 'bg-green-50 dark:bg-green-900/20'
                          : line.type === 'removed'
                          ? 'bg-red-50 dark:bg-red-900/20'
                          : 'bg-white dark:bg-gray-800'
                      }`}
                    >
                      {lineMode && (
                        <>
                          <td className="px-3 py-1 text-gray-400 border-r border-gray-200 dark:border-gray-700 w-16 text-right text-xs">
                            {line.oldLineNumber ?? ''}
                          </td>
                          <td className="px-3 py-1 text-gray-400 border-r border-gray-200 dark:border-gray-700 w-16 text-right text-xs">
                            {line.newLineNumber ?? ''}
                          </td>
                        </>
                      )}
                      <td className="px-4 py-1 whitespace-pre">
                        <span
                          className={
                            line.type === 'added'
                              ? 'text-green-700 dark:text-green-400'
                              : line.type === 'removed'
                              ? 'text-red-700 dark:text-red-400 line-through'
                              : 'text-gray-700 dark:text-gray-300'
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
        </div>
      )}

      {/* Usage Examples */}
      <div className="container mx-auto px-4 pb-6">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <h3 className="text-sm font-semibold mb-4">使用示例</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">示例 1: 代码对比</h4>
              <button
                onClick={() => {
                  setOldText('function hello() {\n  console.log("Hello");\n}')
                  setNewText('function hello() {\n  console.log("Hello World");\n}')
                }}
                className="w-full text-left p-3 bg-gray-50 dark:bg-gray-900 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-xs"
              >
                <div className="font-mono">
                  <span className="text-gray-500">查看代码变更示例</span>
                </div>
              </button>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">示例 2: 配置文件</h4>
              <button
                onClick={() => {
                  setOldText('name: "Old"\nversion: "1.0"')
                  setNewText('name: "New"\nversion: "2.0"\nfeature: true')
                }}
                className="w-full text-left p-3 bg-gray-50 dark:bg-gray-900 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-xs"
              >
                <div className="font-mono">
                  <span className="text-gray-500">查看配置变更示例</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4 py-3">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            使用 diff 算法 • 并排对比视图 • 支持 Unified Diff 格式
          </div>
        </div>
      </div>
    </div>
  )
}
