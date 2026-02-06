'use client'

import { useState, useEffect, useRef } from 'react'
import { FileText, Copy, Trash2, Upload, ArrowLeft, Eye, ChevronUp } from 'lucide-react'
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
- 支持拖拽本地文件预览

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
  const [dragActive, setDragActive] = useState(false)
  const [localFileName, setLocalFileName] = useState('')
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [showBackToTop, setShowBackToTop] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // 加载保存的内容
  useEffect(() => {
    const saved = localStorage.getItem('markdown-editor-content')
    if (saved) {
      setMarkdown(saved)
    }
  }, [])

  // 实时转换Markdown到HTML
  useEffect(() => {
    const convert = async () => {
      const convertedHtml = await marked(markdown)
      setHtml(convertedHtml)
    }
    convert()

    // 只在编辑模式下保存到本地存储
    if (!localFileName) {
      localStorage.setItem('markdown-editor-content', markdown)
    }
  }, [markdown, localFileName])

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

  // 处理文件拖拽
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  // 处理文件拖放
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  // 处理文件选择
  const handleFile = async (file: File) => {
    if (file.type === 'text/markdown' || file.name.endsWith('.md') || file.type === 'text/plain') {
      const text = await file.text()
      setMarkdown(text)
      setLocalFileName(file.name)
      setIsPreviewMode(true)
    } else {
      alert('请选择 Markdown 文件 (.md)')
    }
  }

  // 处理文件选择按钮
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  // 切换预览模式
  const handleTogglePreview = () => {
    setIsPreviewMode(!isPreviewMode)
  }

  // 返回编辑模式
  const handleBackToEdit = () => {
    setIsPreviewMode(false)
    setLocalFileName('')
  }

  // 监听滚动显示返回顶部按钮
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // 返回顶部
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div
      className="min-h-screen bg-white dark:bg-gray-900"
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
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
          {!isPreviewMode ? (
            <>
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
              <button
                onClick={() => inputRef.current?.click()}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all text-sm flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                打开本地文件
              </button>
              <input
                ref={inputRef}
                type="file"
                accept=".md,.markdown,.txt"
                onChange={handleFileSelect}
                className="hidden"
              />
              <button
                onClick={handleTogglePreview}
                className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg transition-all text-sm flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                预览模式
              </button>

              <div className="ml-auto text-sm text-gray-500 dark:text-gray-400">
                自动保存已启用
              </div>
            </>
          ) : (
            <>
              <button
                onClick={handleBackToEdit}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all text-sm flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                返回编辑模式
              </button>
              <div className="ml-auto text-sm text-gray-500 dark:text-gray-400">
                {localFileName ? `正在预览: ${localFileName}` : '预览模式'}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Drag Overlay */}
      {dragActive && (
        <div className="fixed inset-0 bg-pink-500/20 backdrop-blur-sm z-50 flex items-center justify-center border-4 border-dashed border-pink-500 m-8 rounded-2xl">
          <div className="text-center">
            <Upload className="h-16 w-16 text-pink-500 mx-auto mb-4" />
            <p className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
              拖放 Markdown 文件到这里预览
            </p>
          </div>
        </div>
      )}

      {/* Editor Area */}
      <div className="container mx-auto px-4 py-6">
        {!isPreviewMode ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Markdown Input */}
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Markdown 输入 | 文件拖放
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
        ) : (
          /* Preview Mode - Full Width */
          <div className="w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">
                {localFileName ? '文件预览' : '预览模式'}
              </h3>
              <span className="text-sm text-gray-500">{markdown.length} 字符</span>
            </div>
            <div className="min-h-[700px] p-8 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 overflow-auto shadow-lg">
              <div
                className="markdown-preview prose dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            </div>
          </div>
        )}
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

      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 w-12 h-12 bg-pink-500 hover:bg-pink-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 z-50"
          aria-label="返回顶部"
        >
          <ChevronUp className="h-6 w-6" />
        </button>
      )}
    </div>
  )
}
