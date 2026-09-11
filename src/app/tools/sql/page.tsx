'use client'

import { useState, useEffect } from 'react'
import { Database, Copy, Trash2, CheckCircle } from 'lucide-react'
import { format } from 'sql-formatter'
import { useTransferData } from '@/lib/useTransferData'
import { ToolShell } from '@/components/ToolShell'

export default function SQLFormatterPage() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [language, setLanguage] = useState('sql')
  const [indent, setIndent] = useState('  ')
  const [uppercase, setUppercase] = useState(true)

  useTransferData(setInput)

  // SQL Languages
  const languages = [
    { value: 'sql', label: 'SQL' },
    { value: 'mysql', label: 'MySQL' },
    { value: 'postgresql', label: 'PostgreSQL' },
    { value: 'tsql', label: 'T-SQL' },
  ]

  // Format SQL
  useEffect(() => {
    if (!input.trim()) {
      setOutput('')
      return
    }

    try {
      const formatted = format(input, {
        language: language as any,
        indent: indent,
        linesBetweenQueries: 2,
      } as any)

      // Apply uppercase if enabled
      let result = formatted
      if (uppercase) {
        // SQL keywords to uppercase (stored in lowercase for comparison)
        const keywords = [
          'select', 'from', 'where', 'join', 'left', 'right', 'inner', 'outer',
          'full', 'cross', 'on', 'as', 'and', 'or', 'not', 'in', 'exists',
          'between', 'like', 'is', 'null', 'order', 'by', 'group', 'having',
          'limit', 'offset', 'insert', 'into', 'values', 'update', 'set', 'delete',
          'create', 'table', 'alter', 'drop', 'index', 'view', 'grant', 'revoke',
          'union', 'all', 'distinct', 'case', 'when', 'then', 'else', 'end',
          'primary', 'key', 'foreign', 'references', 'constraint', 'default',
          'unique', 'check', 'cascade', 'restrict', 'show', 'describe',
          'use', 'database', 'schema', 'columns', 'transaction', 'begin',
          'commit', 'rollback', 'lock', 'unlock'
        ]

        const keywordSet = new Set(keywords)

        // Match whole words and uppercase if they're SQL keywords
        result = formatted.replace(/\b[a-z]+\b/gi, (match: string) => {
          const lowerWord = match.toLowerCase()
          return keywordSet.has(lowerWord) ? match.toUpperCase() : match
        })
      }

      setOutput(result)
    } catch (error: any) {
      setOutput(`-- 格式化错误: ${error.message}\n${input}`)
    }
  }, [input, language, indent, uppercase])

  // Copy to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(output)
  }

  // Clear all
  const clearAll = () => {
    setInput('')
    setOutput('')
  }

  // Load example
  const loadExample = () => {
    setInput(`SELECT u.id, u.name, u.email, COUNT(o.id) as order_count, SUM(o.total_amount) as total_spent FROM users u LEFT JOIN orders o ON u.id = o.user_id WHERE u.created_at >= '2024-01-01' AND o.status = 'completed' GROUP BY u.id, u.name, u.email HAVING COUNT(o.id) > 5 ORDER BY total_spent DESC LIMIT 10`)
  }

  return (
    <ToolShell
      title="SQL FORMAT"
      description="美化和格式化 SQL 语句"
      path="/tools/sql"
      icon={Database}
      accent="cyan"
    >

      <div className="container mx-auto px-4 py-8">
        {/* Options */}
        <div className="panel p-6 mb-6">
          <div className="flex flex-wrap items-center gap-6">
            {/* Language */}
            <div>
              <label className="block text-xs text-ink-secondary mb-2">
                SQL 方言
              </label>
              <div className="flex gap-2">
                {languages.map((lang) => (
                  <button
                    key={lang.value}
                    onClick={() => setLanguage(lang.value)}
                    className={`px-3 py-2 text-xs font-medium rounded-lg transition-all ${
                      language === lang.value
                        ? 'bg-emerald-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-900 border border-border-dim hover:bg-gray-200 dark:hover:bg-gray-800'
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Indent */}
            <div>
              <label className="block text-xs text-ink-secondary mb-2">
                缩进
              </label>
              <div className="flex gap-2">
                {['  ', '    ', '\t'].map((indentOption) => (
                  <button
                    key={indentOption}
                    onClick={() => setIndent(indentOption)}
                    className={`px-3 py-2 text-xs font-medium rounded-lg transition-all ${
                      indent === indentOption
                        ? 'bg-emerald-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-900 border border-border-dim hover:bg-gray-200 dark:hover:bg-gray-800'
                    }`}
                  >
                    {indentOption === '\t' ? 'Tab' : indentOption === '  ' ? '2空格' : '4空格'}
                  </button>
                ))}
              </div>
            </div>

            {/* Uppercase */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="uppercase"
                checked={uppercase}
                onChange={(e) => setUppercase(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="uppercase" className="text-xs text-ink-secondary">
                关键字大写
              </label>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Input */}
          <div className="space-y-4">
            <div className="panel p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold">原始 SQL</h3>
                <div className="flex gap-2">
                  <button
                    onClick={loadExample}
                    className="px-3 py-1 text-xs border border-border-dim rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    加载示例
                  </button>
                  {input && (
                    <button
                      onClick={clearAll}
                      className="px-3 py-1 text-xs border border-border-dim rounded hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-1"
                    >
                      <Trash2 className="h-3 w-3" />
                      清空
                    </button>
                  )}
                </div>
              </div>

              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="粘贴 SQL 语句..."
                className="w-full h-96 p-4 font-mono text-sm border border-border-dim rounded-lg bg-void-200 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500"
                spellCheck={false}
              />
            </div>
          </div>

          {/* Right Column - Output */}
          <div className="space-y-4">
            <div className="panel p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                  格式化结果
                </h3>
                {output && (
                  <button
                    onClick={copyToClipboard}
                    className="px-3 py-1 text-xs bg-emerald-500 text-white rounded hover:bg-emerald-600 flex items-center gap-1"
                  >
                    <Copy className="h-3 w-3" />
                    复制
                  </button>
                )}
              </div>

              <textarea
                value={output}
                readOnly
                placeholder="格式化后的 SQL 将显示在这里..."
                className="w-full h-96 p-4 font-mono text-sm border border-border-dim rounded-lg bg-void-200 resize-none focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Examples */}
        <div className="mt-6 panel p-6">
          <h3 className="text-sm font-semibold mb-4">常用示例</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button
              onClick={() => {
                setInput(`SELECT id, name, email FROM users WHERE status = 'active' ORDER BY created_at DESC`)
              }}
              className="text-left p-3 bg-void-200 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="text-xs text-ink-secondary mb-1">简单查询</div>
              <div className="font-mono text-xs text-gray-900 dark:text-gray-100 truncate">SELECT ... FROM users</div>
            </button>

            <button
              onClick={() => {
                setInput(`INSERT INTO users (name, email, created_at) VALUES ('John', 'john@example.com', NOW()), ('Jane', 'jane@example.com', NOW())`)
              }}
              className="text-left p-3 bg-void-200 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="text-xs text-ink-secondary mb-1">批量插入</div>
              <div className="font-mono text-xs text-gray-900 dark:text-gray-100 truncate">INSERT INTO ... VALUES</div>
            </button>

            <button
              onClick={() => {
                setInput(`UPDATE users SET email = 'newemail@example.com', updated_at = NOW() WHERE id = 1`)
              }}
              className="text-left p-3 bg-void-200 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="text-xs text-ink-secondary mb-1">更新语句</div>
              <div className="font-mono text-xs text-gray-900 dark:text-gray-100 truncate">UPDATE users SET ...</div>
            </button>

            <button
              onClick={() => {
                setInput(`DELETE FROM sessions WHERE expires_at < NOW()`)
              }}
              className="text-left p-3 bg-void-200 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="text-xs text-ink-secondary mb-1">删除语句</div>
              <div className="font-mono text-xs text-gray-900 dark:text-gray-100 truncate">DELETE FROM sessions</div>
            </button>
          </div>
        </div>

        {/* Usage Tips */}
        <div className="mt-6 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4">
          <h4 className="text-sm font-semibold text-emerald-800 dark:text-emerald-300 mb-2">使用提示</h4>
          <ul className="text-xs text-emerald-700 dark:text-emerald-400 space-y-1">
            <li>• 支持多种 SQL 方言：标准 SQL、MySQL、PostgreSQL、T-SQL</li>
            <li>• 自动格式化关键字、表名、字段名，提高可读性</li>
            <li>• 支持自定义缩进方式（2空格、4空格、Tab）</li>
            <li>• 可选择关键字是否大写</li>
            <li>• 实时格式化，无需点击按钮</li>
          </ul>
        </div>
      </div>

    </ToolShell>
  )
}
