'use client'

import { useState, useEffect } from 'react'
import { FileText, Copy, Trash2 } from 'lucide-react'
import { marked } from 'marked'

// 配置marked选项
marked.setOptions({
  breaks: true,
  gfm: true,
})

export default function MarkdownEditorPage() {
  const [markdown, setMarkdown] = useState(`# 欢迎使用 Markdown 编辑器

这是一个**实时预览**的Markdown编辑器。

## 功能特性

- 实时预览
- 支持 GitHub 风格 Markdown (GFM)
- 代码高亮
- 自动保存到本地

## 代码示例

\`\`\`javascript
function hello() {
  console.log('Hello, World!');
}
\`\`\`

## 列表示例

1. 第一项
2. 第二项
3. 第三项

- 无序列表项
- 另一项

## 引用

> 这是一段引用文本
> 可以有多行

## 链接

[访问 GitHub](https://github.com)

## 表格

| 列1 | 列2 | 列3 |
|-----|-----|-----|
| A   | B   | C   |
| D   | E   | F   |

---

开始编辑吧！✨
`)
  const [html, setHtml] = useState('')
  const [copySuccess, setCopySuccess] = useState(false)

  // 实时转换Markdown到HTML
  useEffect(() => {
    const convertedHtml = marked(markdown)
    setHtml(convertedHtml)

    // 保存到本地存储
    localStorage.setItem('markdown-editor-content', markdown)
  }, [markdown])

  // 加载保存的内容
  useEffect(() => {
    const saved = localStorage.getItem('markdown-editor-content')
    if (saved) {
      setMarkdown(saved)
    }
  }, [])

  // 清空内容
  const handleClear = () => {
    setMarkdown('')
  }

  // 复制HTML
  const handleCopyHtml = () => {
    navigator.clipboard.writeText(html)
    setCopySuccess(true)
    setTimeout(() => setCopySuccess(false), 2000)
  }

  // 复制Markdown
  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(markdown)
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-500 rounded-lg flex items-center justify-center">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-display">Markdown 编辑器</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                实时预览，支持 GFM 语法
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Toolbar */}
      <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4 py-3 flex flex-wrap items-center gap-3">
          <button
            onClick={handleCopyMarkdown}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all text-sm flex items-center gap-2"
          >
            <Copy className="h-4 w-4" />
            复制 Markdown
          </button>
          <button
            onClick={handleCopyHtml}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all text-sm flex items-center gap-2"
          >
            <Copy className="h-4 w-4" />
            {copySuccess ? '✓ 已复制 HTML' : '复制 HTML'}
          </button>
          <button
            onClick={handleClear}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all text-sm flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            清空
          </button>

          <div className="ml-auto text-sm text-gray-500 dark:text-gray-400">
            自动保存已启用
          </div>
        </div>
      </div>

      {/* Editor Area */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Markdown Input */}
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Markdown 输入
              </h3>
              <span className="text-xs text-gray-500">
                {markdown.length} 字符
              </span>
            </div>
            <textarea
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              placeholder="输入 Markdown 内容..."
              className="flex-1 min-h-[600px] p-4 font-mono text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 resize-none focus:outline-none focus:ring-2 focus:ring-pink-500"
              spellCheck={false}
            />
          </div>

          {/* Preview */}
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                实时预览
              </h3>
            </div>
            <div className="flex-1 min-h-[600px] p-6 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 overflow-auto">
              {/* Preview Content */}
              <div
                className="markdown-preview"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Syntax Help */}
      <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4 py-6">
          <h3 className="text-sm font-semibold mb-4">Markdown 语法参考</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div>
              <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">标题</h4>
              <pre className="p-2 bg-gray-100 dark:bg-gray-900 rounded font-mono">{`# 一级标题
## 二级标题
### 三级标题`}</pre>
            </div>
            <div>
              <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">文本样式</h4>
              <pre className="p-2 bg-gray-100 dark:bg-gray-900 rounded font-mono">{`**粗体**
*斜体*
~~删除线~~
\`行内代码\``}</pre>
            </div>
            <div>
              <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">列表</h4>
              <pre className="p-2 bg-gray-100 dark:bg-gray-900 rounded font-mono">{`- 无序
1. 有序
  - 嵌套`}</pre>
            </div>
            <div>
              <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">其他</h4>
              <pre className="p-2 bg-gray-100 dark:bg-gray-900 rounded font-mono">{`[链接](url)
![图片](url)
> 引用
\`\`\`代码块\`\`\``}</pre>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4 py-3">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            💡 支持 GitHub Flavored Markdown • 自动保存到本地存储 • 实时预览
          </div>
        </div>
      </div>
    </div>
  )
}
