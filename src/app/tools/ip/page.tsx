'use client'

import { useState, useEffect } from 'react'
import { Globe, MapPin, Copy, Info, Search } from 'lucide-react'
import ipaddr from 'ipaddr.js'
import { useTransferData } from '@/lib/useTransferData'
import { ToolShell } from '@/components/ToolShell'

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

  useTransferData(setInput)

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
    <ToolShell
      title="IP LOOKUP"
      description="查询 IP 地址信息和地理位置"
      path="/tools/ip"
      icon={Globe}
      accent="lime"
      actions={
        <>
          <button onClick={queryIP} disabled={loading} className="tool-btn tool-btn-accent">
            <Search className="h-3.5 w-3.5" />
            查询
          </button>
          {myIP && (
            <button onClick={useMyIP} className="tool-btn">
              <Globe className="h-3.5 w-3.5" />
              本机 IP
            </button>
          )}
          {geoLocation && (
            <button onClick={() => copyToClipboard(geoLocation.ip)} className="tool-btn">
              <Copy className="h-3.5 w-3.5" />
              复制
            </button>
          )}
        </>
      }
    >
      <div className="flex min-h-0 flex-1 flex-col gap-3">
        {/* Input */}
        <div className="tool-panel">
          <div className="tool-panel-head">
            <span className="text-neon-lime">&gt;_</span>
            <span>TARGET</span>
            <span className="ml-auto normal-case tracking-normal">
              {myIP ? `本机 ${myIP}` : 'IPv4 / IPv6'}
            </span>
          </div>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && queryIP()}
            placeholder="输入 IP 地址 (如: 8.8.8.8)"
            spellCheck={false}
            className="h-12 w-full bg-void-100 px-4 font-mono text-sm text-ink-primary caret-neon-lime placeholder:text-ink-muted focus:outline-none"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="rounded-lg border border-neon-magenta/40 bg-neon-magenta/5 p-3">
            <p className="font-mono text-xs text-neon-magenta">{error}</p>
          </div>
        )}

        {/* IP Info */}
        {ipInfo && ipInfo.isValid && (
          <div className="rounded-lg border border-border-dim bg-void-100 p-4">
            <h3 className="mb-3 flex items-center gap-2 font-mono text-[11px] text-ink-muted">
              <Info className="h-3.5 w-3.5 text-neon-lime" />
              IP 信息
            </h3>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <div className="rounded-md bg-void-200 p-3">
                <div className="mb-1 text-[11px] text-ink-muted">版本</div>
                <div className="font-mono text-sm font-semibold text-ink-primary">
                  {ipInfo.version}
                </div>
              </div>

              <div className="rounded-md bg-void-200 p-3">
                <div className="mb-1 text-[11px] text-ink-muted">类型</div>
                <div className="font-mono text-sm font-semibold text-ink-primary">
                  {ipInfo.type}
                </div>
              </div>

              <div className="rounded-md bg-void-200 p-3">
                <div className="mb-1 text-[11px] text-ink-muted">私有地址</div>
                <div className="font-mono text-sm font-semibold text-ink-primary">
                  {ipInfo.isPrivate ? '是' : '否'}
                </div>
              </div>

              <div className="rounded-md bg-void-200 p-3">
                <div className="mb-1 text-[11px] text-ink-muted">回环地址</div>
                <div className="font-mono text-sm font-semibold text-ink-primary">
                  {ipInfo.isLoopback ? '是' : '否'}
                </div>
              </div>

              {ipInfo.range && (
                <div className="col-span-2 rounded-md bg-void-200 p-3 md:col-span-4">
                  <div className="mb-1 text-[11px] text-ink-muted">地址范围</div>
                  <div className="font-mono text-sm font-semibold text-ink-primary">
                    {ipInfo.range}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Geolocation Info */}
        {geoLocation && (
          <div className="rounded-lg border border-border-dim bg-void-100 p-4">
            <h3 className="mb-3 flex items-center gap-2 font-mono text-[11px] text-ink-muted">
              <MapPin className="h-3.5 w-3.5 text-neon-lime" />
              地理位置
            </h3>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="rounded-md bg-void-200 p-3">
                <div className="mb-1 text-[11px] text-ink-muted">IP 地址</div>
                <div className="font-mono text-sm font-semibold text-ink-primary">
                  {geoLocation.ip}
                </div>
              </div>

              <div className="rounded-md bg-void-200 p-3">
                <div className="mb-1 text-[11px] text-ink-muted">国家/地区</div>
                <div className="font-mono text-sm font-semibold text-ink-primary">
                  {geoLocation.country} ({geoLocation.countryCode})
                </div>
              </div>

              <div className="rounded-md bg-void-200 p-3">
                <div className="mb-1 text-[11px] text-ink-muted">省份/州</div>
                <div className="font-mono text-sm font-semibold text-ink-primary">
                  {geoLocation.region}
                </div>
              </div>

              <div className="rounded-md bg-void-200 p-3">
                <div className="mb-1 text-[11px] text-ink-muted">城市</div>
                <div className="font-mono text-sm font-semibold text-ink-primary">
                  {geoLocation.city}
                </div>
              </div>

              <div className="rounded-md bg-void-200 p-3">
                <div className="mb-1 text-[11px] text-ink-muted">时区</div>
                <div className="font-mono text-sm font-semibold text-ink-primary">
                  {geoLocation.timezone}
                </div>
              </div>

              <div className="rounded-md bg-void-200 p-3">
                <div className="mb-1 text-[11px] text-ink-muted">ISP</div>
                <div className="font-mono text-sm font-semibold text-ink-primary">
                  {geoLocation.isp}
                </div>
              </div>

              {geoLocation.org && (
                <div className="rounded-md bg-void-200 p-3">
                  <div className="mb-1 text-[11px] text-ink-muted">组织</div>
                  <div className="font-mono text-sm font-semibold text-ink-primary">
                    {geoLocation.org}
                  </div>
                </div>
              )}

              {geoLocation.as && (
                <div className="rounded-md bg-void-200 p-3">
                  <div className="mb-1 text-[11px] text-ink-muted">AS 号</div>
                  <div className="font-mono text-xs text-ink-primary">{geoLocation.as}</div>
                </div>
              )}

              {geoLocation.lat && geoLocation.lon && (
                <>
                  <div className="rounded-md bg-void-200 p-3">
                    <div className="mb-1 text-[11px] text-ink-muted">纬度</div>
                    <div className="font-mono text-sm text-ink-primary">
                      {geoLocation.lat.toFixed(4)}
                    </div>
                  </div>

                  <div className="rounded-md bg-void-200 p-3">
                    <div className="mb-1 text-[11px] text-ink-muted">经度</div>
                    <div className="font-mono text-sm text-ink-primary">
                      {geoLocation.lon.toFixed(4)}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Quick Examples */}
        <div className="rounded-lg border border-border-dim bg-void-100 p-4">
          <h3 className="mb-3 font-mono text-[11px] text-ink-muted">常用 IP 示例</h3>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <button
              onClick={() => {
                setInput('8.8.8.8')
                queryIP()
              }}
              className="rounded-md border border-border-dim bg-void-200 p-3 text-left transition-colors hover:border-neon-lime"
            >
              <div className="font-mono text-sm text-ink-primary">8.8.8.8</div>
              <div className="text-[11px] text-ink-muted">Google DNS</div>
            </button>

            <button
              onClick={() => {
                setInput('1.1.1.1')
                queryIP()
              }}
              className="rounded-md border border-border-dim bg-void-200 p-3 text-left transition-colors hover:border-neon-lime"
            >
              <div className="font-mono text-sm text-ink-primary">1.1.1.1</div>
              <div className="text-[11px] text-ink-muted">Cloudflare DNS</div>
            </button>

            <button
              onClick={() => {
                setInput('114.114.114.114')
                queryIP()
              }}
              className="rounded-md border border-border-dim bg-void-200 p-3 text-left transition-colors hover:border-neon-lime"
            >
              <div className="font-mono text-sm text-ink-primary">114.114.114.114</div>
              <div className="text-[11px] text-ink-muted">国内 DNS</div>
            </button>
          </div>
        </div>

      </div>
    </ToolShell>
  )
}
