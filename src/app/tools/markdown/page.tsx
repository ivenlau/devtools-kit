'use client'

import { useState, useEffect, useRef } from 'react'
import { FileText, Copy, Trash2, Upload, ArrowLeft, Eye, ChevronUp, Download, Check } from 'lucide-react'
import { marked } from 'marked'
import { useTransferStore } from '@/stores/transferStore'
import { ToolShell } from '@/components/ToolShell'
import { useI18n } from '@/components/I18nProvider'

// 配置marked选项
marked.setOptions({
  breaks: true,
  gfm: true,
})

const ZH_SAMPLE = `# 欢迎使用 Markdown 编辑器

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
`

const EN_SAMPLE = `# Welcome to the Markdown Editor

This is a Markdown editor with **live preview**.

## Features

- Live preview
- GitHub Flavored Markdown (GFM)
- Code highlighting
- Autosave to localStorage
- Drag & drop local files

## Code Example

\`\`\`javascript
function hello() {
  console.log('Hello, World!');
}
\`\`\`

## Lists

1. First item
2. Second item
3. Third item

- Unordered item
- Another item

## Quote

> A quoted block
> can span multiple lines

## Link

[Visit GitHub](https://github.com)

## Table

| C1 | C2 | C3 |
|----|----|----|
| A  | B  | C  |
| D  | E  | F  |

---

Start editing! ✨
`

export default function MarkdownEditorPage() {
  const { t, lang } = useI18n()
  const [markdown, setMarkdown] = useState(ZH_SAMPLE)
  const [html, setHtml] = useState('')
  const [copySuccess, setCopySuccess] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [localFileName, setLocalFileName] = useState('')
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [showBackToTop, setShowBackToTop] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // In EN mode, present the English sample until the user edits the content
  const displayMarkdown = lang === 'en' && markdown === ZH_SAMPLE ? EN_SAMPLE : markdown

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
      const convertedHtml = await marked(displayMarkdown)
      setHtml(convertedHtml)
    }
    convert()

    // 只在编辑模式下保存到本地存储
    if (!localFileName) {
      localStorage.setItem('markdown-editor-content', markdown)
    }
  }, [displayMarkdown, markdown, localFileName])

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
      alert(t('请选择 Markdown 文件 (.md)'))
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
      alert(t('PDF 导出失败，请重试'))
    } finally {
      document.head.removeChild(style)
    }
  }

  return (
    <div
      className="bg-void"
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <ToolShell
        title="MARKDOWN"
        description={t('实时预览，支持 GFM 语法')}
        path="/tools/markdown"
        icon={FileText}
        accent="magenta"
        actions={
          !isPreviewMode ? (
            <>
              <button onClick={handleCopyMarkdown} className="tool-btn tool-btn-icon" title={t('复制 MD')} aria-label={t('复制 MD')}>
                <Copy className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={handleCopyHtml}
                className={`tool-btn tool-btn-icon ${copySuccess ? 'tool-btn-accent' : ''}`}
                title={t('复制 HTML')}
                aria-label={t('复制 HTML')}
              >
                {copySuccess ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
              <button onClick={() => inputRef.current?.click()} className="tool-btn tool-btn-icon" title={t('打开')} aria-label={t('打开')}>
                <Upload className="h-3.5 w-3.5" />
              </button>
              <input
                ref={inputRef}
                type="file"
                accept=".md,.markdown,.txt"
                onChange={handleFileSelect}
                className="hidden"
              />
              <button onClick={handleClear} className="tool-btn tool-btn-icon tool-btn-danger" title={t('清空')} aria-label={t('清空')}>
                <Trash2 className="h-3.5 w-3.5" />
              </button>
              <button onClick={exportAsMarkdown} className="tool-btn">
                <Download className="h-3.5 w-3.5" />
                MD
              </button>
              <button onClick={exportAsPDF} className="tool-btn">
                <Download className="h-3.5 w-3.5" />
                PDF
              </button>
              <button onClick={handleTogglePreview} className="tool-btn tool-btn-icon tool-btn-accent" title={t('预览')} aria-label={t('预览')}>
                <Eye className="h-3.5 w-3.5" />
              </button>
            </>
          ) : (
            <>
              <button onClick={handleBackToEdit} className="tool-btn tool-btn-icon tool-btn-accent" title={t('编辑')} aria-label={t('编辑')}>
                <ArrowLeft className="h-3.5 w-3.5" />
              </button>
              <button onClick={exportAsMarkdown} className="tool-btn">
                <Download className="h-3.5 w-3.5" />
                MD
              </button>
              <button onClick={exportAsPDF} className="tool-btn">
                <Download className="h-3.5 w-3.5" />
                PDF
              </button>
            </>
          )
        }
      >
        <div className="flex min-h-0 flex-1 flex-col gap-3">
          {/* Editor / Preview workspace */}
          {!isPreviewMode ? (
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 lg:h-[calc(100dvh-8rem)] lg:grid-rows-[minmax(0,1fr)]">
              <div className="tool-panel h-full min-h-[400px]">
                <div className="tool-panel-head">
                  <span className="text-neon-magenta">&gt;_</span>
                  <span>INPUT.MD</span>
                  <span className="ml-auto normal-case tracking-normal">
                    {displayMarkdown.length} {t('字符')} · {t('支持拖放')}
                  </span>
                </div>
                <textarea
                  value={displayMarkdown}
                  onChange={(e) => setMarkdown(e.target.value)}
                  placeholder={t('输入 Markdown 内容...')}
                  spellCheck={false}
                  className="min-h-0 flex-1 resize-none bg-void-100 p-4 font-mono text-sm leading-relaxed text-ink-primary caret-neon-magenta placeholder:text-ink-muted focus:outline-none"
                />
              </div>

              <div className="tool-panel h-full min-h-[400px]">
                <div className="tool-panel-head">
                  <span className="text-neon-magenta">&gt;_</span>
                  <span>PREVIEW</span>
                  <span className="ml-auto flex items-center gap-1.5 normal-case tracking-none">
                    <span className="status-dot" />
                    live
                  </span>
                </div>
                <div className="min-h-0 flex-1 overflow-auto p-5">
                  <div
                    className="markdown-preview"
                    dangerouslySetInnerHTML={{ __html: html }}
                  />
                </div>
              </div>
            </div>
          ) : (
            /* Preview Mode — full width */
            <div className="tool-panel min-h-[400px] lg:h-[calc(100dvh-8rem)]">
              <div className="tool-panel-head">
                <span className="text-neon-magenta">&gt;_</span>
                <span>{localFileName ? localFileName.toUpperCase() : 'PREVIEW'}</span>
                <span className="ml-auto normal-case tracking-normal">{displayMarkdown.length} {t('字符')}</span>
              </div>
              <div className="min-h-0 flex-1 overflow-auto px-8 py-6">
                <div
                  className="markdown-preview mx-auto max-w-3xl"
                  dangerouslySetInnerHTML={{ __html: html }}
                />
              </div>
            </div>
          )}

        </div>

        {/* Drag Overlay — same language as homepage DropZone */}
        {dragActive && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center bg-void/80 backdrop-blur-sm">
            <div className="panel-glow animate-fade-up flex flex-col items-center gap-4 px-12 py-10">
              <div className="flex h-14 w-14 items-center justify-center rounded-lg border border-neon-magenta bg-void-200 shadow-neon-magenta">
                <Upload className="h-7 w-7 text-neon-magenta" />
              </div>
              <p className="font-display text-xl font-semibold text-ink-primary">DROP .MD</p>
              <p className="font-mono text-xs text-ink-muted">release to load into the editor</p>
            </div>
          </div>
        )}

        {/* Back to Top Button */}
        {showBackToTop && (
          <button
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 z-50 flex h-12 w-12 items-center justify-center rounded-full border border-neon-magenta bg-void-200 text-neon-magenta shadow-neon-magenta transition-all hover:scale-110 hover:bg-neon-magenta/10"
            aria-label={t('返回顶部')}
          >
            <ChevronUp className="h-6 w-6" />
          </button>
        )}
      </ToolShell>
    </div>
  )
}
