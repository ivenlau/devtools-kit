'use client'

import { useState, useEffect, useRef } from 'react'
import { FileText, Copy, Trash2, Upload, ArrowLeft, Eye, ChevronUp, Download } from 'lucide-react'
import { marked } from 'marked'
import { useTransferStore } from '@/stores/transferStore'

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

  // 接收传输数据（优先于 localStorage）
  const transferredRef = useRef(false)
  useEffect(() => {
    const { pendingData, clearPendingData } = useTransferStore.getState()
    if (pendingData?.content) {
      setMarkdown(pendingData.content)
      clearPendingData()
      transferredRef.current = true
      setIsPreviewMode(true)
    }
  }, [])

  // 加载保存的内容（有传输数据时跳过）
  useEffect(() => {
    if (transferredRef.current) return
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

  // 导出为 Markdown 文件
  const exportAsMarkdown = () => {
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = localFileName || 'document.md'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // 导出为 PDF 文件
  const exportAsPDF = async () => {
    const html2pdfModule = await import('html2pdf.js')
    const html2pdf = html2pdfModule.default || html2pdfModule

    const element = document.createElement('div')
    element.innerHTML = html
    element.className = 'markdown-preview prose max-w-none p-8'
    element.style.width = '210mm'
    element.style.padding = '20mm'
    element.style.background = 'white'
    element.style.color = '#000000'

    // 强制所有文本为黑色，确保高对比度
    const style = document.createElement('style')
    style.textContent = `
      .markdown-preview * {
        color: #000000 !important;
      }
      .markdown-preview h1,
      .markdown-preview h2,
      .markdown-preview h3,
      .markdown-preview h4,
      .markdown-preview h5,
      .markdown-preview h6 {
        color: #000000 !important;
        font-weight: bold !important;
      }
      .markdown-preview strong {
        color: #000000 !important;
        font-weight: bold !important;
      }
      .markdown-preview a {
        color: #0066cc !important;
        text-decoration: underline;
      }
      .markdown-preview code {
        background: #f5f5f5 !important;
        color: #000000 !important;
        border: 1px solid #ddd !important;
      }
      .markdown-preview pre {
        background: #f5f5f5 !important;
        border: 1px solid #ddd !important;
      }
      .markdown-preview pre code {
        background: transparent !important;
        border: none !important;
      }
      .markdown-preview blockquote {
        color: #333333 !important;
        border-left-color: #666666 !important;
      }
      .markdown-preview table {
        border-color: #000000 !important;
      }
      .markdown-preview th,
      .markdown-preview td {
        border-color: #cccccc !important;
        color: #000000 !important;
      }
      .markdown-preview img {
        max-width: 100% !important;
      }
    `
    document.head.appendChild(style)

    const opt = {
      margin: 10,
      filename: localFileName?.replace('.md', '.pdf') || 'document.pdf',
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
      jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const },
    }

    try {
      await html2pdf().set(opt).from(element).save()
    } catch (error) {
      console.error('PDF export failed:', error)
      alert('PDF 导出失败，请重试')
    } finally {
      document.head.removeChild(style)
    }
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
              <button
                onClick={exportAsMarkdown}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all text-sm flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                导出 MD
              </button>
              <button
                onClick={exportAsPDF}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all text-sm flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                导出 PDF
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
              <button
                onClick={exportAsMarkdown}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all text-sm flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                导出 MD
              </button>
              <button
                onClick={exportAsPDF}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all text-sm flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                导出 PDF
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
        <div className="fixed inset-0 z-[101] bg-blue-500/10 dark:bg-blue-400/10 backdrop-blur-sm flex items-center justify-center pointer-events-none">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-12 border-2 border-dashed border-blue-400 dark:border-blue-500 flex flex-col items-center gap-4 animate-pulse">
            <div className="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
              <Upload className="h-10 w-10 text-blue-500" />
            </div>
            <p className="text-xl font-semibold text-gray-800 dark:text-gray-200">
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
