'use client'

import { useState, useEffect } from 'react'
import { Regex, Copy, Trash2 } from 'lucide-react'
import { useTransferData } from '@/lib/useTransferData'
import { ToolShell } from '@/components/ToolShell'
import { useI18n } from '@/components/I18nProvider'

// 常用正则表达式库
const commonRegex = [
  { name: '电子邮件', pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$', description: '匹配邮箱地址' },
  { name: '手机号（中国）', pattern: '^1[3-9]\\d{9}$', description: '匹配中国手机号' },
  { name: '身份证号', pattern: '^[1-9]\\d{5}(18|19|20)\\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\\d|3[01])\\d{3}[\\dXx]$', description: '匹配18位身份证号' },
  { name: 'IPv4地址', pattern: '^((25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.){3}(25[0-5]|2[0-4]\\d|[01]?\\d\\d?)$', description: '匹配IPv4地址' },
  { name: 'URL', pattern: '^https?:\\/\\/[\\w\\-]+(\\.[\\w\\-]+)+[/#?]?.*$', description: '匹配HTTP/HTTPS URL' },
  { name: '十六进制颜色', pattern: '^#?([a-f0-9]{6}|[a-f0-9]{3})$', description: '匹配十六进制颜色代码' },
  { name: '日期(YYYY-MM-DD)', pattern: '^\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])$', description: '匹配日期格式' },
  { name: '用户名', pattern: '^[a-zA-Z0-9_]{3,16}$', description: '匹配3-16位用户名（字母、数字、下划线）' },
]

// flags 复选框选项
const flagOptions = [
  { flag: 'g', label: '全局' },
  { flag: 'i', label: '忽略大小写' },
  { flag: 'm', label: '多行' },
  { flag: 's', label: '点匹配换行' },
]

export default function RegexTesterPage() {
  const { t, lang } = useI18n()
  const [regex, setRegex] = useState('')
  const [flags, setFlags] = useState('gm')
  const [testString, setTestString] = useState('')
  const [matches, setMatches] = useState<RegExpMatchArray[]>([])
  const [error, setError] = useState<string | null>(null)
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null)

  useTransferData(setTestString)

  // 测试正则表达式
  useEffect(() => {
    if (!regex || !testString) {
      setMatches([])
      setError(null)
      return
    }

    try {
      const re = new RegExp(regex, flags)
      const allMatches: RegExpMatchArray[] = []
      let match: RegExpMatchArray | null

      // 获取所有匹配
      while ((match = re.exec(testString)) !== null) {
        allMatches.push(match)
        // 防止无限循环
        if (match.index === re.lastIndex) {
          re.lastIndex++
        }
      }

      setMatches(allMatches)
      setError(null)
    } catch (err: any) {
      setError(err.message)
      setMatches([])
    }
  }, [regex, flags, testString])

  // 应用预设正则
  const applyPreset = (preset: typeof commonRegex[0], index: number) => {
    setRegex(preset.pattern)
    setSelectedPreset(index)
    setTestString(t(preset.description))
  }

  // 切换单个正则 flag（复选框）
  const toggleFlag = (f: string) => {
    setFlags(flags.includes(f) ? flags.replace(f, '') : flags + f)
  }

  // 替换功能
  const [replacePattern, setReplacePattern] = useState('')
  const [replaceResult, setReplaceResult] = useState('')

  useEffect(() => {
    if (!regex || !testString) {
      setReplaceResult('')
      return
    }

    try {
      const re = new RegExp(regex, flags.includes('g') ? flags : flags + 'g')
      const result = testString.replace(re, replacePattern)
      setReplaceResult(result)
    } catch (err) {
      setReplaceResult(t('替换失败'))
    }
  }, [regex, flags, testString, replacePattern])

  return (
    <ToolShell
      title="REGEX LAB"
      description={t('实时测试正则表达式，查看匹配结果')}
      path="/tools/regex"
      icon={Regex}
      actions={
        <>
          {commonRegex.map((preset, index) => (
            <button
              key={index}
              onClick={() => applyPreset(preset, index)}
              className={`chip whitespace-nowrap ${selectedPreset === index ? 'chip-active' : ''}`}
            >
              {t(preset.name)}
            </button>
          ))}

          <div className="hidden h-5 w-px bg-border-dim sm:block" />

          {replaceResult && (
            <button
              onClick={() => navigator.clipboard.writeText(replaceResult)}
              className="tool-btn tool-btn-icon"
             title={t('复制结果')} aria-label={t('复制结果')}>
              <Copy className="h-3.5 w-3.5" />
            </button>
          )}
          <button onClick={() => setTestString('')} className="tool-btn tool-btn-icon tool-btn-danger" title={t('清空')} aria-label={t('清空')}>
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </>
      }
    >
      <div className="flex min-h-0 flex-1 flex-col gap-3">
        {/* Pattern */}
        {/* Pattern */}
        <div className="tool-panel">
          <div className="tool-panel-head">
            <span className="text-neon-magenta">&gt;_</span>
            <span>PATTERN</span>
            <div className="ml-3 flex flex-wrap items-center gap-x-3 gap-y-1">
              {flagOptions.map(({ flag, label }) => (
                <label
                  key={flag}
                  title={t(label)}
                  className="flex cursor-pointer select-none items-center gap-1 font-mono text-[11px] text-ink-secondary"
                >
                  <input
                    type="checkbox"
                    checked={flags.includes(flag)}
                    onChange={() => toggleFlag(flag)}
                    className="accent-neon-magenta"
                  />
                  <span className={flags.includes(flag) ? 'text-neon-magenta' : ''}>{flag}</span>
                </label>
              ))}
            </div>
            {error ? (
              <span className="ml-auto normal-case tracking-normal text-neon-red">
                ✗ {error}
              </span>
            ) : (
              <span className="ml-auto normal-case tracking-normal">
                {matches.length} {t('个匹配')} · {t('实时校验')}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 p-3">
            <span className="font-mono text-lg text-neon-magenta">/</span>
            <input
              type="text"
              value={regex}
              onChange={(e) => setRegex(e.target.value)}
              placeholder="example: ^[a-z]+"
              className="min-w-0 flex-1 rounded-md border border-border-dim bg-void-200 px-3 py-2 font-mono text-sm text-ink-primary placeholder:text-ink-muted focus:border-neon-magenta focus:outline-none"
              spellCheck={false}
            />
            <span className="font-mono text-lg text-neon-magenta">/</span>
          </div>
        </div>

        {/* Test String + Matches */}
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 lg:h-[calc(100dvh-8rem)] lg:grid-rows-[minmax(0,1fr)]">
          <div className="tool-panel h-full min-h-[400px]">
            <div className="tool-panel-head">
              <span className="text-neon-magenta">&gt;_</span>
              <span>INPUT</span>
              <span className="ml-auto normal-case tracking-normal">
                {testString.length} {t('字符')}
              </span>
            </div>
            <textarea
              value={testString}
              onChange={(e) => setTestString(e.target.value)}
              placeholder={t('输入要测试的文本...')}
              spellCheck={false}
              className="min-h-0 flex-1 resize-none bg-void-100 p-4 font-mono text-sm leading-relaxed text-ink-primary caret-neon-magenta placeholder:text-ink-muted focus:outline-none"
            />
          </div>

          <div className="tool-panel h-full min-h-[400px]">
            <div className="tool-panel-head">
              <span className="text-neon-magenta">&gt;_</span>
              <span>MATCHES</span>
              <span className="ml-auto normal-case tracking-normal">
                {matches.length} {t('个匹配')}
              </span>
            </div>
            <div className="min-h-0 flex-1 overflow-auto p-4">
              {matches.length === 0 ? (
                <div className="py-12 text-center font-mono text-xs text-ink-muted">
                  {testString && regex ? t('未找到匹配') : t('输入正则表达式和测试文本开始匹配')}
                </div>
              ) : (
                <div className="space-y-2">
                  {matches.map((match, index) => (
                    <div
                      key={index}
                      className="rounded-md border border-border-dim bg-void-200 p-3"
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <span className="font-mono text-xs font-semibold text-neon-magenta">
                          {`${t('匹配')} #${index + 1}`}
                        </span>
                        <span className="font-mono text-[11px] text-ink-muted">
                          {t('位置:')} {match.index} - {match.index! + match[0].length}
                        </span>
                      </div>

                      {/* Matched Text */}
                      <div className="mb-2">
                        <span className="text-xs text-ink-muted">{t('匹配文本:')}</span>
                        <code className="ml-2 rounded bg-neon-magenta/10 px-2 py-1 font-mono text-sm text-neon-magenta">
                          {match[0]}
                        </code>
                      </div>

                      {/* Capture Groups */}
                      {match.length > 1 && (
                        <div>
                          <span className="text-xs text-ink-muted">{t('捕获组:')}</span>
                          <div className="mt-1 space-y-1">
                            {Array.from(match).slice(1).map((group, i) => (
                              <div key={i} className="flex items-center gap-2 text-sm">
                                <span className="font-mono text-xs text-ink-muted">${i + 1}</span>
                                <code className="rounded bg-neon-lime/10 px-2 py-0.5 font-mono text-xs text-neon-lime">
                                  {group || t('(空)')}
                                </code>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Replace */}
        <div className="tool-panel">
          <div className="tool-panel-head">
            <span className="text-neon-magenta">&gt;_</span>
            <span>REPLACE</span>
            <span className="ml-auto normal-case tracking-normal">{t('使用 $1, $2 引用捕获组')}</span>
          </div>
          <div className="space-y-3 p-4">
            <div>
              <label className="mb-1 block font-mono text-[11px] text-ink-muted">{t('替换为')}</label>
              <input
                type="text"
                value={replacePattern}
                onChange={(e) => setReplacePattern(e.target.value)}
                placeholder={t('替换文本（可以使用 $1, $2 等捕获组）')}
                className="w-full rounded-md border border-border-dim bg-void-200 px-3 py-2 font-mono text-sm text-ink-primary placeholder:text-ink-muted focus:border-neon-magenta focus:outline-none"
              />
            </div>

            {replaceResult && (
              <div>
                <label className="mb-1 block font-mono text-[11px] text-ink-muted">{t('替换结果')}</label>
                <pre className="w-full overflow-x-auto whitespace-pre-wrap break-all rounded-md border border-border-dim bg-void-200 p-3 font-mono text-sm text-ink-primary">
                  {replaceResult}
                </pre>
              </div>
            )}
          </div>
        </div>

      </div>
    </ToolShell>
  )
}
