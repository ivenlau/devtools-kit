'use client'

import { useState, useEffect } from 'react'
import { Regex, Copy, Trash2 } from 'lucide-react'

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

export default function RegexTesterPage() {
  const [regex, setRegex] = useState('')
  const [flags, setFlags] = useState('gm')
  const [testString, setTestString] = useState('')
  const [matches, setMatches] = useState<RegExpMatchArray[]>([])
  const [error, setError] = useState<string | null>(null)
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null)

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
    setTestString(preset.description)
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
      setReplaceResult('替换失败')
    }
  }, [regex, flags, testString, replacePattern])

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
              <Regex className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-display">正则表达式测试器</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                实时测试正则表达式，查看匹配结果
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Common Regex Presets */}
      <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-3 overflow-x-auto">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
              常用正则:
            </span>
            <div className="flex gap-2">
              {commonRegex.map((preset, index) => (
                <button
                  key={index}
                  onClick={() => applyPreset(preset, index)}
                  className={`px-3 py-1.5 text-sm whitespace-nowrap rounded-lg transition-all ${
                    selectedPreset === index
                      ? 'bg-indigo-500 text-white'
                      : 'bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 hover:border-indigo-300'
                  }`}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Input */}
          <div className="space-y-4">
            {/* Regex Input */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
              <label className="block text-sm font-medium mb-2">正则表达式</label>
              <div className="flex gap-2 mb-3">
                <span className="text-2xl text-gray-400">/</span>
                <input
                  type="text"
                  value={regex}
                  onChange={(e) => setRegex(e.target.value)}
                  placeholder="example: ^[a-z]+"
                  className="flex-1 px-3 py-2 font-mono text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  spellCheck={false}
                />
                <span className="text-2xl text-gray-400">/</span>
                <input
                  type="text"
                  value={flags}
                  onChange={(e) => setFlags(e.target.value)}
                  placeholder="gim"
                  className="w-16 px-3 py-2 font-mono text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  spellCheck={false}
                />
              </div>

              {/* Flags Explanation */}
              <div className="flex flex-wrap gap-3 text-xs text-gray-600 dark:text-gray-400">
                <span><code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">g</code> 全局</span>
                <span><code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">i</code> 忽略大小写</span>
                <span><code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">m</code> 多行</span>
                <span><code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">s</code> 让.匹配换行</span>
              </div>

              {error && (
                <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-600 dark:text-red-400">❌ {error}</p>
                </div>
              )}
            </div>

            {/* Test String */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium">测试文本</label>
                <button
                  onClick={() => setTestString('')}
                  className="text-sm text-gray-500 hover:text-red-500 flex items-center gap-1"
                >
                  <Trash2 className="h-3 w-3" />
                  清空
                </button>
              </div>
              <textarea
                value={testString}
                onChange={(e) => setTestString(e.target.value)}
                placeholder="输入要测试的文本..."
                className="w-full h-64 p-4 font-mono text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
                spellCheck={false}
              />

              {/* Match Info */}
              {matches.length > 0 && (
                <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <p className="text-sm text-green-600 dark:text-green-400">
                    ✅ 找到 {matches.length} 个匹配
                  </p>
                </div>
              )}
            </div>

            {/* Replace */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
              <h3 className="text-sm font-semibold mb-3">替换功能</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">替换为</label>
                  <input
                    type="text"
                    value={replacePattern}
                    onChange={(e) => setReplacePattern(e.target.value)}
                    placeholder="替换文本（可以使用 $1, $2 等捕获组）"
                    className="w-full px-3 py-2 font-mono text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {replaceResult && (
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">替换结果</label>
                    <div className="relative">
                      <pre className="w-full p-3 font-mono text-sm bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-x-auto whitespace-pre-wrap break-all">
                        {replaceResult}
                      </pre>
                      <button
                        onClick={() => navigator.clipboard.writeText(replaceResult)}
                        className="absolute top-2 right-2 p-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Results */}
          <div className="space-y-4">
            {/* Match Details */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
              <h3 className="text-sm font-semibold mb-3">匹配结果</h3>

              {matches.length === 0 ? (
                <div className="text-center py-12 text-gray-400 dark:text-gray-600">
                  {testString && regex ? '未找到匹配' : '输入正则表达式和测试文本开始匹配'}
                </div>
              ) : (
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {matches.map((match, index) => (
                    <div
                      key={index}
                      className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-indigo-600">匹配 #{index + 1}</span>
                        <span className="text-xs text-gray-500">
                          位置: {match.index} - {match.index! + match[0].length}
                        </span>
                      </div>

                      {/* Matched Text */}
                      <div className="mb-2">
                        <span className="text-xs text-gray-500">匹配文本:</span>
                        <code className="ml-2 px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded font-mono text-sm">
                          {match[0]}
                        </code>
                      </div>

                      {/* Capture Groups */}
                      {match.length > 1 && (
                        <div>
                          <span className="text-xs text-gray-500">捕获组:</span>
                          <div className="mt-1 space-y-1">
                            {Array.from(match).slice(1).map((group, i) => (
                              <div key={i} className="flex items-center gap-2 text-sm">
                                <span className="text-xs text-gray-400">${i + 1}</span>
                                <code className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded font-mono text-xs">
                                  {group || '(空)'}
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

            {/* Quick Reference */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
              <h3 className="text-sm font-semibold mb-3">快捷参考</h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="font-semibold text-gray-700 dark:text-gray-300">字符类</span>
                  <ul className="mt-1 space-y-1 text-gray-600 dark:text-gray-400">
                    <li><code>\d</code> 数字</li>
                    <li><code>\w</code> 单词字符</li>
                    <li><code>\s</code> 空白字符</li>
                    <li><code>.</code> 任意字符</li>
                  </ul>
                </div>
                <div>
                  <span className="font-semibold text-gray-700 dark:text-gray-300">量词</span>
                  <ul className="mt-1 space-y-1 text-gray-600 dark:text-gray-400">
                    <li><code>*</code> 0次或多次</li>
                    <li><code>+</code> 1次或多次</li>
                    <li><code>?</code> 0次或1次</li>
                    <li><code>{'{n,m}'}</code> n到m次</li>
                  </ul>
                </div>
                <div>
                  <span className="font-semibold text-gray-700 dark:text-gray-300">定位符</span>
                  <ul className="mt-1 space-y-1 text-gray-600 dark:text-gray-400">
                    <li><code>^</code> 行首</li>
                    <li><code>$</code> 行尾</li>
                    <li><code>\b</code> 单词边界</li>
                    <li><code>\B</code> 非单词边界</li>
                  </ul>
                </div>
                <div>
                  <span className="font-semibold text-gray-700 dark:text-gray-300">字符集</span>
                  <ul className="mt-1 space-y-1 text-gray-600 dark:text-gray-400">
                    <li><code>[abc]</code> a或b或c</li>
                    <li><code>[^abc]</code> 非abc</li>
                    <li><code>[a-z]</code> a到z</li>
                    <li><code>(a|b)</code> a或b</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4 py-3">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            💡 支持所有JavaScript正则表达式语法 • 点击常用正则快速应用 • 使用 $1, $2 引用捕获组
          </div>
        </div>
      </div>
    </div>
  )
}
