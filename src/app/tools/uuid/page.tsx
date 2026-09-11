'use client'

import { useState, useEffect } from 'react'
import { Hash, Copy, RefreshCw } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import CryptoJS from 'crypto-js'
import { useTransferStore } from '@/stores/transferStore'
import { ToolShell } from '@/components/ToolShell'

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
      description="MD5/SHA 哈希生成、UUID v4 生成"
      path="/tools/uuid"
      icon={Hash}
      accent="amber"
    >
      {/* Tabs */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <button
          onClick={() => setActiveTab('uuid')}
          className={`chip !px-4 !py-2 ${activeTab === 'uuid' ? 'chip-active' : ''}`}
        >
          UUID 生成器
        </button>
        <button
          onClick={() => setActiveTab('hash')}
          className={`chip !px-4 !py-2 ${activeTab === 'hash' ? 'chip-active' : ''}`}
        >
          哈希生成器
        </button>
      </div>

      <div className="space-y-6">
        {/* UUID Generator */}
        {activeTab === 'uuid' && (
          <div className="space-y-4">
            {/* Single UUID */}
            <div className="panel-glow rounded-xl p-6">
              <h3 className="mb-4 font-display text-lg font-semibold text-ink-primary">单个 UUID</h3>
              <div className="flex items-center justify-between rounded-lg bg-void-200 p-4">
                <code className="font-mono text-lg text-ink-primary">{uuid}</code>
                <div className="flex gap-2">
                  <button
                    onClick={() => copyToClipboard(uuid)}
                    className="chip !px-4 !py-2"
                  >
                    <Copy className="mr-1.5 h-3.5 w-3.5" />
                    复制
                  </button>
                  <button
                    onClick={generateNewUUID}
                    className="btn-neon !px-4 !py-2"
                  >
                    <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                    重新生成
                  </button>
                </div>
              </div>
            </div>

            {/* Batch UUID */}
            <div className="panel-glow rounded-xl p-6">
              <h3 className="mb-4 font-display text-lg font-semibold text-ink-primary">批量生成 UUID</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <label className="font-mono text-xs text-ink-secondary">生成数量</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={uuidCount}
                    onChange={(e) => setUuidCount(Number(e.target.value))}
                    className="w-24 rounded-lg border border-border-dim bg-void-200 px-3 py-2 font-mono text-sm text-ink-primary focus:border-neon-amber focus:outline-none"
                  />
                  <button
                    onClick={generateBatchUUIDs}
                    className="btn-neon !px-6 !py-2"
                  >
                    生成
                  </button>
                </div>

                {uuidList.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] text-ink-secondary">
                        已生成 {uuidList.length} 个 UUID
                      </span>
                      <button
                        onClick={() => copyToClipboard(uuidList.join('\n'))}
                        className="font-mono text-[11px] text-neon-amber hover:text-neon-cyan"
                      >
                        复制全部
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
                            className="ml-2 text-ink-muted opacity-0 hover:text-neon-amber group-hover:opacity-100"
                          >
                            <Copy className="h-4 w-4" />
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
          <div className="panel-glow rounded-xl p-6">
            <h3 className="mb-4 font-display text-lg font-semibold text-ink-primary">哈希生成</h3>
            <div className="space-y-6">
              <div>
                <label className="mb-2 block font-mono text-[11px] text-ink-secondary">输入文本</label>
                <textarea
                  value={hashInput}
                  onChange={(e) => setHashInput(e.target.value)}
                  placeholder="输入要生成哈希的文本..."
                  className="h-32 w-full resize-none rounded-lg border border-border-dim bg-void-200 p-4 font-mono text-sm text-ink-primary placeholder:text-ink-muted focus:border-neon-amber focus:outline-none"
                  spellCheck={false}
                />
              </div>

              {hashInput && Object.keys(hashOutput).length > 0 && (
                <div className="space-y-3">
                  {(['md5', 'sha1', 'sha256', 'sha512'] as const).map((algo) => (
                    <div key={algo} className="rounded-lg bg-void-200 p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="font-mono text-xs font-bold uppercase text-neon-amber">{algo}</span>
                        <button
                          onClick={() => copyToClipboard(hashOutput[algo])}
                          className="chip !px-3 !py-1 !text-xs"
                        >
                          <Copy className="mr-1 h-3 w-3" />
                          复制
                        </button>
                      </div>
                      <code className="break-all font-mono text-sm text-ink-primary">{hashOutput[algo]}</code>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 font-mono text-[11px] text-ink-muted">
        local only · UUID v4 随机唯一标识符 · 哈希函数用于数据完整性校验
      </div>
    </ToolShell>
  )
}
