'use client'

import { useState, useEffect } from 'react'
import { Database, Copy, Trash2, Sparkles, CaseSensitive } from 'lucide-react'
import { format } from 'sql-formatter'
import { useTransferData } from '@/lib/useTransferData'
import { ToolShell } from '@/components/ToolShell'
import { useI18n } from '@/components/I18nProvider'

export default function SQLFormatterPage() {
  const { t } = useI18n()
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
      setOutput(`${t('-- 格式化错误:')} ${error.message}\n${input}`)
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
      description={t('美化和格式化 SQL 语句')}
      path="/tools/sql"
      icon={Database}
      actions={
        <>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            aria-label={t('SQL 方言')}
            className="tool-select"
          >
            {languages.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>
          <select
            value={indent}
            onChange={(e) => setIndent(e.target.value)}
            aria-label={t('缩进')}
            className="tool-select"
          >
            {['  ', '    ', '\t'].map((indentOption) => (
              <option key={indentOption} value={indentOption}>
                {indentOption === '\t' ? 'Tab' : indentOption === '  ' ? t('2空格') : t('4空格')}
              </option>
            ))}
          </select>
          <button
            onClick={() => setUppercase(!uppercase)}
            aria-pressed={uppercase}
            title={t('关键字大写')}
            aria-label={t('关键字大写')}
            className={`tool-btn tool-btn-icon ${uppercase ? 'tool-btn-accent' : ''}`}
          >
            <CaseSensitive className="h-3.5 w-3.5" />
          </button>

          <div className="hidden h-5 w-px bg-border-dim sm:block" />

          <button onClick={loadExample} className="tool-btn tool-btn-icon" title={t('示例')} aria-label={t('示例')}>
            <Sparkles className="h-3.5 w-3.5" />
          </button>
          <button onClick={copyToClipboard} disabled={!output} className="tool-btn tool-btn-icon tool-btn-accent" title={t('复制')} aria-label={t('复制')}>
            <Copy className="h-3.5 w-3.5" />
          </button>
          <button onClick={clearAll} className="tool-btn tool-btn-icon tool-btn-danger" title={t('清空')} aria-label={t('清空')}>
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </>
      }
    >
      <div className="flex min-h-0 flex-1 flex-col gap-3">
        {/* Workspace */}
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 lg:h-[calc(100dvh-var(--header-total)-4.5rem)] lg:grid-rows-[minmax(0,1fr)]">
          <div className="tool-panel h-full min-h-[400px]">
            <div className="tool-panel-head">
              <span className="text-neon-cyan">&gt;_</span>
              <span>INPUT</span>
              <span className="ml-auto normal-case tracking-normal">{input.length} {t('字符')}</span>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('粘贴 SQL 语句...')}
              spellCheck={false}
              className="min-h-0 flex-1 resize-none bg-void-100 p-4 font-mono text-sm text-ink-primary caret-neon-cyan placeholder:text-ink-muted focus:outline-none"
            />
          </div>

          <div className="tool-panel h-full min-h-[400px]">
            <div className="tool-panel-head">
              <span className="text-neon-cyan">&gt;_</span>
              <span>OUTPUT</span>
              <span className="ml-auto flex items-center gap-1.5 normal-case tracking-normal">
                <span className="status-dot" />
                {output.length} {t('字符')}
              </span>
            </div>
            <textarea
              value={output}
              readOnly
              placeholder={t('格式化后的 SQL 将显示在这里...')}
              className="min-h-0 flex-1 resize-none bg-void-100 p-4 font-mono text-sm text-ink-primary placeholder:text-ink-muted focus:outline-none"
            />
          </div>
        </div>

        {/* Examples */}
        <div className="border-t border-border-dim pt-3">
          <div className="mb-2 font-mono text-[11px] text-ink-muted">{t('常用示例 · 点击填入输入框')}</div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <button
              onClick={() => {
                setInput(`SELECT id, name, email FROM users WHERE status = 'active' ORDER BY created_at DESC`)
              }}
              className="rounded-md border border-border-dim bg-void-200 px-3 py-2 text-left transition-colors hover:border-neon-cyan/70"
            >
              <div className="text-[11px] text-ink-secondary">{t('简单查询')}</div>
              <div className="truncate font-mono text-[11px] text-ink-muted">SELECT ... FROM users</div>
            </button>

            <button
              onClick={() => {
                setInput(`INSERT INTO users (name, email, created_at) VALUES ('John', 'john@example.com', NOW()), ('Jane', 'jane@example.com', NOW())`)
              }}
              className="rounded-md border border-border-dim bg-void-200 px-3 py-2 text-left transition-colors hover:border-neon-cyan/70"
            >
              <div className="text-[11px] text-ink-secondary">{t('批量插入')}</div>
              <div className="truncate font-mono text-[11px] text-ink-muted">INSERT INTO ... VALUES</div>
            </button>

            <button
              onClick={() => {
                setInput(`UPDATE users SET email = 'newemail@example.com', updated_at = NOW() WHERE id = 1`)
              }}
              className="rounded-md border border-border-dim bg-void-200 px-3 py-2 text-left transition-colors hover:border-neon-cyan/70"
            >
              <div className="text-[11px] text-ink-secondary">{t('更新语句')}</div>
              <div className="truncate font-mono text-[11px] text-ink-muted">UPDATE users SET ...</div>
            </button>

            <button
              onClick={() => {
                setInput(`DELETE FROM sessions WHERE expires_at < NOW()`)
              }}
              className="rounded-md border border-border-dim bg-void-200 px-3 py-2 text-left transition-colors hover:border-neon-cyan/70"
            >
              <div className="text-[11px] text-ink-secondary">{t('删除语句')}</div>
              <div className="truncate font-mono text-[11px] text-ink-muted">DELETE FROM sessions</div>
            </button>
          </div>
        </div>

      </div>
    </ToolShell>
  )
}
