'use client'

import { useState, useEffect } from 'react'
import { Hash, Copy, RefreshCw, Fingerprint } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import CryptoJS from 'crypto-js'
import { useTransferStore } from '@/stores/transferStore'
import { ToolShell } from '@/components/ToolShell'
import { useI18n } from '@/components/I18nProvider'

/**
 * 生成UUID v4
 */
const generateUUID = (): string => {
  return uuidv4()
}

/**
 * 生成哈希
 */
const generateHash = (text: string, algorithm: 'md5' | 'sha1' | 'sha256' | 'sha512'): string => {
  try {
    switch (algorithm) {
      case 'md5':
        return CryptoJS.MD5(text).toString()
      case 'sha1':
        return CryptoJS.SHA1(text).toString()
      case 'sha256':
        return CryptoJS.SHA256(text).toString()
      case 'sha512':
        return CryptoJS.SHA512(text).toString()
      default:
        return ''
    }
  } catch (error) {
    return '生成失败'
  }
}

export default function HashGeneratorPage() {
  const { t, lang } = useI18n()
  const [activeTab, setActiveTab] = useState<'uuid' | 'hash'>('uuid')

  // UUID 状态
  const [uuid, setUuid] = useState('')
  const [uuidCount, setUuidCount] = useState(1)
  const [uuidList, setUuidList] = useState<string[]>([])

  // 哈希状态
  const [hashInput, setHashInput] = useState('')
  const [hashOutput, setHashOutput] = useState<Record<string, string>>({})
  const [hashAlgorithm, setHashAlgorithm] = useState('md5')

  // 从 transferStore 接收数据
  useEffect(() => {
    const { pendingData, clearPendingData } = useTransferStore.getState()
    if (pendingData?.content) {
      setHashInput(pendingData.content)
      setActiveTab('hash')
      clearPendingData()
    }
  }, [])

  // 初始化UUID
  useEffect(() => {
    generateNewUUID()
  }, [])

  // 生成新UUID
  const generateNewUUID = () => {
    const newUuid = generateUUID()
    setUuid(newUuid)
  }

  // 批量生成UUID
  const generateBatchUUIDs = () => {
    const count = Math.min(Math.max(uuidCount, 1), 100)
    const newUuids = Array.from({ length: count }, () => generateUUID())
    setUuidList(newUuids)
  }

  // 计算哈希
  useEffect(() => {
    if (!hashInput.trim()) {
      setHashOutput({})
      return
    }

    const algorithms = ['md5', 'sha1', 'sha256', 'sha512'] as const
    const results: Record<string, string> = {}

    algorithms.forEach(algo => {
      results[algo] = generateHash(hashInput, algo)
    })

    setHashOutput(results)
  }, [hashInput])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <ToolShell
      title="HASH & UUID"
      description={t('MD5/SHA 哈希生成、UUID v4 生成')}
      path="/tools/uuid"
      icon={Hash}
      actions={
        <>
          <button
            onClick={() => setActiveTab('uuid')}
            aria-pressed={activeTab === 'uuid'}
            title="UUID"
            aria-label="UUID"
            className={`tool-btn tool-btn-icon ${activeTab === 'uuid' ? 'tool-btn-accent' : ''}`}
          >
            <Fingerprint className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setActiveTab('hash')}
            aria-pressed={activeTab === 'hash'}
            title="HASH"
            aria-label="HASH"
            className={`tool-btn tool-btn-icon ${activeTab === 'hash' ? 'tool-btn-accent' : ''}`}
          >
            <Hash className="h-3.5 w-3.5" />
          </button>
          {activeTab === 'uuid' && (
            <>
              <button onClick={() => copyToClipboard(uuid)} className="tool-btn tool-btn-icon" title={t('复制')} aria-label={t('复制')}>
                <Copy className="h-3.5 w-3.5" />
              </button>
              <button onClick={generateNewUUID} className="tool-btn tool-btn-icon tool-btn-accent" title={t('重新生成')} aria-label={t('重新生成')}>
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
            </>
          )}
        </>
      }
    >
      <div className="flex min-h-0 flex-1 flex-col gap-3">
        {/* UUID Generator */}
        {activeTab === 'uuid' && (
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 lg:h-[calc(100dvh-8rem)] lg:grid-rows-[minmax(0,1fr)]">
            {/* Single UUID */}
            <div className="tool-panel h-full min-h-[400px]">
              <div className="tool-panel-head">
                <span className="text-neon-amber">&gt;_</span>
                <span>UUID.V4</span>
                <span className="ml-auto normal-case tracking-normal">crypto random</span>
              </div>
              <div className="flex min-h-0 flex-1 flex-col justify-center gap-3 p-4">
                <code className="break-all rounded-md bg-void-200 p-4 font-mono text-lg text-ink-primary">
                  {uuid}
                </code>
                <p className="font-mono text-[11px] text-ink-muted">
                  {t('RFC 4122 v4 · 122-bit 随机 · 冲突概率可忽略')}
                </p>
              </div>
            </div>

            {/* Batch UUID */}
            <div className="tool-panel h-full min-h-[400px]">
              <div className="tool-panel-head">
                <span className="text-neon-amber">&gt;_</span>
                <span>BATCH</span>
                <span className="ml-auto normal-case tracking-normal">
                  {uuidList.length > 0 ? `${uuidList.length} ${t('个')}` : 'idle'}
                </span>
              </div>
              <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-auto p-4">
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={uuidCount}
                    onChange={(e) => setUuidCount(Number(e.target.value))}
                    className="w-24 rounded-md border border-border-dim bg-void-200 px-3 py-2 font-mono text-sm text-ink-primary focus:border-neon-cyan focus:outline-none"
                  />
                  <button onClick={generateBatchUUIDs} className="tool-btn tool-btn-icon tool-btn-accent" title={t('生成')} aria-label={t('生成')}>
                    <RefreshCw className="h-3.5 w-3.5" />
                  </button>
                </div>

                {uuidList.length > 0 && (
                  <div className="flex min-h-0 flex-1 flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] text-ink-secondary">
                        {lang === 'en' ? `Generated ${uuidList.length} UUIDs` : `已生成 ${uuidList.length} 个 UUID`}
                      </span>
                      <button
                        onClick={() => copyToClipboard(uuidList.join('\n'))}
                        className="tool-btn tool-btn-icon"
                       title={t('复制全部')} aria-label={t('复制全部')}>
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="max-h-64 space-y-1 overflow-y-auto">
                      {uuidList.map((u, i) => (
                        <div
                          key={i}
                          className="group flex items-center justify-between rounded bg-void-200 p-2 font-mono text-sm text-ink-primary"
                        >
                          <span className="flex-1 truncate">{u}</span>
                          <button
                            onClick={() => copyToClipboard(u)}
                            className="ml-2 text-ink-muted opacity-0 transition-opacity hover:text-neon-amber group-hover:opacity-100"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Hash Generator */}
        {activeTab === 'hash' && (
          <div className="tool-panel min-h-[400px] lg:h-[calc(100dvh-8rem)]">
            <div className="tool-panel-head">
              <span className="text-neon-amber">&gt;_</span>
              <span>HASH.MD5·SHA1·SHA256·SHA512</span>
              <span className="ml-auto flex items-center gap-1.5 normal-case tracking-normal">
                {hashInput ? (
                  <>
                    <span className="status-dot" />live
                  </>
                ) : (
                  'idle'
                )}
              </span>
            </div>
            <textarea
              value={hashInput}
              onChange={(e) => setHashInput(e.target.value)}
              placeholder={t('输入要生成哈希的文本...')}
              className="h-32 min-h-0 w-full flex-none resize-none bg-void-100 p-4 font-mono text-sm text-ink-primary caret-neon-amber placeholder:text-ink-muted focus:outline-none"
              spellCheck={false}
            />
            <div className="min-h-0 flex-1 space-y-3 overflow-auto border-t border-border-dim p-4">
              {hashInput && Object.keys(hashOutput).length > 0 ? (
                (['md5', 'sha1', 'sha256', 'sha512'] as const).map((algo) => (
                  <div key={algo} className="rounded-md bg-void-200 p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="font-mono text-xs font-bold uppercase text-neon-amber">{algo}</span>
                      <button
                        onClick={() => copyToClipboard(hashOutput[algo])}
                        className="tool-btn tool-btn-icon"
                       title={t('复制')} aria-label={t('复制')}>
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <code className="break-all font-mono text-sm text-ink-primary">{t(hashOutput[algo])}</code>
                  </div>
                ))
              ) : (
                <p className="font-mono text-xs text-ink-muted">{t('// 输入文本后实时计算四种哈希')}</p>
              )}
            </div>
          </div>
        )}

      </div>
    </ToolShell>
  )
}
