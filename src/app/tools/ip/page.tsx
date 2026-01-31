'use client'

import { useState, useEffect } from 'react'
import { Globe, MapPin, Copy, Info, Search } from 'lucide-react'
import ipaddr from 'ipaddr.js'

interface IPInfo {
  version: 'IPv4' | 'IPv6' | null
  isValid: boolean
  type: string
  range?: string
  isPrivate: boolean
  isLoopback: boolean
  isMulticast: boolean
}

interface GeoLocation {
  ip: string
  country: string
  countryCode: string
  region: string
  city: string
  timezone: string
  isp: string
  org: string
  as: string
  lat?: number
  lon?: number
}

export default function IPQueryPage() {
  const [input, setInput] = useState('')
  const [ipInfo, setIpInfo] = useState<IPInfo | null>(null)
  const [geoLocation, setGeoLocation] = useState<GeoLocation | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [myIP, setMyIP] = useState('')

  // Get user's own IP
  useEffect(() => {
    fetch('https://api.ipify.org?format=json')
      .then(res => res.json())
      .then(data => setMyIP(data.ip))
      .catch(() => {})
  }, [])

  // Parse IP address
  const parseIP = (ip: string): IPInfo => {
    try {
      const addr = ipaddr.parse(ip)

      const info: IPInfo = {
        version: addr.kind() === 'ipv4' ? 'IPv4' : 'IPv6',
        isValid: true,
        type: addr.kind() === 'ipv4' ? 'unicast' : 'unicast',
        isPrivate: addr.range() === 'private' || false,
        isLoopback: addr.range() === 'loopback',
        isMulticast: addr.range() === 'multicast',
      }

      // Get range
      const range = addr.range()
      if (range) {
        info.range = range
      }

      return info
    } catch (err) {
      return {
        version: null,
        isValid: false,
        type: 'invalid',
        isPrivate: false,
        isLoopback: false,
        isMulticast: false,
      }
    }
  }

  // Query IP information
  const queryIP = async () => {
    if (!input.trim()) {
      setError('请输入 IP 地址')
      return
    }

    setLoading(true)
    setError('')
    setGeoLocation(null)

    // Parse IP
    const info = parseIP(input.trim())
    setIpInfo(info)

    if (!info.isValid) {
      setError('无效的 IP 地址格式')
      setLoading(false)
      return
    }

    // Query geolocation for public IPs
    if (!info.isPrivate && !info.isLoopback) {
      try {
        const response = await fetch(`http://ip-api.com/json/${input.trim()}?lang=zh-CN`)
        const data = await response.json()

        if (data.status === 'success') {
          setGeoLocation({
            ip: data.query,
            country: data.country,
            countryCode: data.countryCode,
            region: data.regionName,
            city: data.city,
            timezone: data.timezone,
            isp: data.isp,
            org: data.org,
            as: data.as,
            lat: data.lat,
            lon: data.lon,
          })
        } else {
          setError('无法获取地理位置信息')
        }
      } catch (err) {
        setError('查询失败，请稍后重试')
      }
    }

    setLoading(false)
  }

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  // Use my IP
  const useMyIP = () => {
    if (myIP) {
      setInput(myIP)
      setIpInfo(parseIP(myIP))
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <Globe className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-display">IP 地址查询</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                查询 IP 地址信息和地理位置
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Input Section */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
            <div className="flex gap-3">
              <div className="flex-1">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && queryIP()}
                  placeholder="输入 IP 地址 (如: 8.8.8.8)"
                  className="w-full px-4 py-3 font-mono text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={queryIP}
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <Search className="h-4 w-4" />
                查询
              </button>
            </div>

            {/* My IP Button */}
            {myIP && (
              <div className="mt-4 flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-600 dark:text-gray-400">本机 IP:</span>
                  <code className="font-mono text-blue-600 dark:text-blue-400">{myIP}</code>
                </div>
                <button
                  onClick={useMyIP}
                  className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-all"
                >
                  使用本机 IP
                </button>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}
          </div>

          {/* IP Info */}
          {ipInfo && ipInfo.isValid && (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <Info className="h-4 w-4 text-blue-500" />
                IP 信息
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">版本</div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {ipInfo.version}
                  </div>
                </div>

                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">类型</div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {ipInfo.type}
                  </div>
                </div>

                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">私有地址</div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {ipInfo.isPrivate ? '是' : '否'}
                  </div>
                </div>

                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">回环地址</div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {ipInfo.isLoopback ? '是' : '否'}
                  </div>
                </div>

                {ipInfo.range && (
                  <div className="col-span-2 md:col-span-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">地址范围</div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {ipInfo.range}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Geolocation Info */}
          {geoLocation && (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-green-500" />
                地理位置
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">IP 地址</div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-mono font-semibold text-gray-900 dark:text-gray-100">
                      {geoLocation.ip}
                    </div>
                    <button
                      onClick={() => copyToClipboard(geoLocation.ip)}
                      className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">国家/地区</div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {geoLocation.country} ({geoLocation.countryCode})
                  </div>
                </div>

                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">省份/州</div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {geoLocation.region}
                  </div>
                </div>

                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">城市</div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {geoLocation.city}
                  </div>
                </div>

                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">时区</div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {geoLocation.timezone}
                  </div>
                </div>

                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">ISP</div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {geoLocation.isp}
                  </div>
                </div>

                {geoLocation.org && (
                  <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">组织</div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {geoLocation.org}
                    </div>
                  </div>
                )}

                {geoLocation.as && (
                  <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">AS 号</div>
                    <div className="text-sm font-mono text-xs text-gray-900 dark:text-gray-100">
                      {geoLocation.as}
                    </div>
                  </div>
                )}

                {geoLocation.lat && geoLocation.lon && (
                  <>
                    <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">纬度</div>
                      <div className="text-sm font-mono text-gray-900 dark:text-gray-100">
                        {geoLocation.lat.toFixed(4)}
                      </div>
                    </div>

                    <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">经度</div>
                      <div className="text-sm font-mono text-gray-900 dark:text-gray-100">
                        {geoLocation.lon.toFixed(4)}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Quick Examples */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
            <h3 className="text-sm font-semibold mb-4">常用 IP 示例</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button
                onClick={() => {
                  setInput('8.8.8.8')
                  queryIP()
                }}
                className="p-3 bg-gray-50 dark:bg-gray-900 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left"
              >
                <div className="font-mono text-sm text-gray-900 dark:text-gray-100">8.8.8.8</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Google DNS</div>
              </button>

              <button
                onClick={() => {
                  setInput('1.1.1.1')
                  queryIP()
                }}
                className="p-3 bg-gray-50 dark:bg-gray-900 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left"
              >
                <div className="font-mono text-sm text-gray-900 dark:text-gray-100">1.1.1.1</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Cloudflare DNS</div>
              </button>

              <button
                onClick={() => {
                  setInput('114.114.114.114')
                  queryIP()
                }}
                className="p-3 bg-gray-50 dark:bg-gray-900 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left"
              >
                <div className="font-mono text-sm text-gray-900 dark:text-gray-100">114.114.114.114</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">国内 DNS</div>
              </button>
            </div>
          </div>

          {/* Usage Tips */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2">使用提示</h4>
            <ul className="text-xs text-blue-700 dark:text-blue-400 space-y-1">
              <li>• 支持 IPv4 和 IPv6 地址查询</li>
              <li>• 私有 IP 地址 (192.168.x.x, 10.x.x.x) 无法查询地理位置</li>
              <li>• 地理位置数据来自公共数据库，可能存在偏差</li>
              <li>• 点击"使用本机 IP"可快速查询您的公网 IP</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4 py-3">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            💡 支持 IPv4/IPv6 • 地理位置查询 • 本机 IP 显示
          </div>
        </div>
      </div>
    </div>
  )
}
