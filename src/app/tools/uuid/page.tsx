'use client'

import { useState, useEffect } from 'react'
import { Hash, Copy, RefreshCw } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import CryptoJS from 'crypto-js'

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
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
              <Hash className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-display">哈希 & UUID 生成器</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                MD5/SHA 哈希生成、UUID v4 生成
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('uuid')}
              className={`px-6 py-3 font-medium transition-all text-sm border-b-2 ${
                activeTab === 'uuid'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900'
              }`}
            >
              UUID 生成器
            </button>
            <button
              onClick={() => setActiveTab('hash')}
              className={`px-6 py-3 font-medium transition-all text-sm border-b-2 ${
                activeTab === 'hash'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900'
              }`}
            >
              哈希生成器
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* UUID Generator */}
        {activeTab === 'uuid' && (
          <div className="space-y-6">
            {/* Single UUID */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">单个 UUID</h3>
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg flex items-center justify-between">
                  <code className="text-lg font-mono">{uuid}</code>
                  <div className="flex gap-2">
                    <button
                      onClick={() => copyToClipboard(uuid)}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all text-sm flex items-center gap-2"
                    >
                      <Copy className="h-4 w-4" />
                      复制
                    </button>
                    <button
                      onClick={generateNewUUID}
                      className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:shadow-lg transition-all text-sm flex items-center gap-2"
                    >
                      <RefreshCw className="h-4 w-4" />
                      重新生成
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Batch UUID */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">批量生成 UUID</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <label className="text-sm font-medium">生成数量:</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={uuidCount}
                    onChange={(e) => setUuidCount(Number(e.target.value))}
                    className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <button
                    onClick={generateBatchUUIDs}
                    className="px-6 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:shadow-lg transition-all text-sm"
                  >
                    生成
                  </button>
                </div>

                {uuidList.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        已生成 {uuidList.length} 个 UUID
                      </span>
                      <button
                        onClick={() => copyToClipboard(uuidList.join('\n'))}
                        className="text-sm text-orange-500 hover:text-orange-600"
                      >
                        复制全部
                      </button>
                    </div>
                    <div className="max-h-64 overflow-y-auto space-y-1">
                      {uuidList.map((u, i) => (
                        <div
                          key={i}
                          className="p-2 bg-gray-50 dark:bg-gray-900 rounded font-mono text-sm flex items-center justify-between group"
                        >
                          <span className="truncate flex-1">{u}</span>
                          <button
                            onClick={() => copyToClipboard(u)}
                            className="opacity-0 group-hover:opacity-100 ml-2 text-gray-400 hover:text-orange-500"
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
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">哈希生成</h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">输入文本</label>
                  <textarea
                    value={hashInput}
                    onChange={(e) => setHashInput(e.target.value)}
                    placeholder="输入要生成哈希的文本..."
                    className="w-full h-32 p-4 font-mono text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 resize-none focus:outline-none focus:ring-2 focus:ring-orange-500"
                    spellCheck={false}
                  />
                </div>

                {hashInput && Object.keys(hashOutput).length > 0 && (
                  <div className="space-y-4">
                    {(['md5', 'sha1', 'sha256', 'sha512'] as const).map((algo) => (
                      <div key={algo} className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-mono font-bold text-orange-600 uppercase">{algo}</span>
                          <button
                            onClick={() => copyToClipboard(hashOutput[algo])}
                            className="px-3 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-all flex items-center gap-1"
                          >
                            <Copy className="h-3 w-3" />
                            复制
                          </button>
                        </div>
                        <code className="text-sm break-all font-mono">{hashOutput[algo]}</code>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4 py-3">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            💡 UUID v4 是随机生成的唯一标识符 • 哈希函数用于数据完整性校验
          </div>
        </div>
      </div>
    </div>
  )
}
