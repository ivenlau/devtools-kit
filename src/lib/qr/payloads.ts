/**
 * QR content payload builders — one per content type tab.
 * All builders return the raw string encoded into the QR symbol.
 */

export type ContentType =
  | 'url'
  | 'text'
  | 'wifi'
  | 'vcard'
  | 'email'
  | 'phone'
  | 'sms'
  | 'geo'
  | 'event'

export interface WifiContent {
  ssid: string
  security: 'WPA' | 'WEP' | 'nopass'
  password: string
  hidden: boolean
}

export interface VcardContent {
  firstName: string
  lastName: string
  org: string
  title: string
  phone: string
  email: string
  website: string
  address: string
}

export interface EmailContent {
  to: string
  subject: string
  body: string
}

export interface PhoneContent {
  phone: string
}

export interface SmsContent {
  phone: string
  body: string
}

export interface GeoContent {
  lat: string
  lng: string
}

export interface EventContent {
  title: string
  start: string // datetime-local
  end: string // datetime-local
  location: string
  description: string
}

/** Escape reserved characters for the WIFI: scheme (`\ ; , : "`) */
const escWifi = (s: string) => s.replace(/([\\;,:"])/g, '\\$1')

/** Escape per RFC 6350 for vCard text values (`\ ; ,`) and fold newlines */
const escVcard = (s: string) => s.replace(/([\\;,])/g, '\\$1').replace(/\n/g, '\\n')

/** Escape per RFC 5545 for iCalendar TEXT values (`\ ; ,`) and fold newlines */
const escIcal = (s: string) => s.replace(/([\\;,])/g, '\\$1').replace(/\n/g, '\\n')

/** datetime-local "2026-09-21T18:30" → iCal "20260921T183000" (floating local) */
const icalDateTime = (local: string) => {
  const m = local.match(/^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?/)
  if (!m) return ''
  const [, y, mo, d, h = '00', mi = '00'] = m
  return `${y}${mo}${d}T${h}${mi}00`
}

export function buildPayload(type: ContentType, content: Record<string, unknown>): string {
  switch (type) {
    case 'url':
      return String(content.url ?? '')
    case 'text':
      return String(content.text ?? '')
    case 'wifi': {
      const c = content as unknown as WifiContent
      if (!c.ssid) return ''
      const parts = [`T:${c.security === 'nopass' ? 'nopass' : c.security}`, `S:${escWifi(c.ssid)}`]
      if (c.security !== 'nopass' && c.password) parts.push(`P:${escWifi(c.password)}`)
      if (c.hidden) parts.push('H:true')
      return `WIFI:${parts.join(';')};;`
    }
    case 'vcard': {
      const c = content as unknown as VcardContent
      const lines = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `N:${escVcard(c.lastName)};${escVcard(c.firstName)};;;`,
        `FN:${escVcard([c.firstName, c.lastName].filter(Boolean).join(' '))}`,
      ]
      if (c.org) lines.push(`ORG:${escVcard(c.org)}`)
      if (c.title) lines.push(`TITLE:${escVcard(c.title)}`)
      if (c.phone) lines.push(`TEL;TYPE=CELL:${c.phone}`)
      if (c.email) lines.push(`EMAIL:${c.email}`)
      if (c.website) lines.push(`URL:${c.website}`)
      if (c.address) lines.push(`ADR;TYPE=WORK:;;${escVcard(c.address)};;;;`)
      lines.push('END:VCARD')
      return lines.join('\n')
    }
    case 'email': {
      const c = content as unknown as EmailContent
      if (!c.to) return ''
      const query = [
        c.subject && `subject=${encodeURIComponent(c.subject)}`,
        c.body && `body=${encodeURIComponent(c.body)}`,
      ]
        .filter(Boolean)
        .join('&')
      return `mailto:${c.to}${query ? `?${query}` : ''}`
    }
    case 'phone': {
      const c = content as unknown as PhoneContent
      return c.phone ? `tel:${c.phone}` : ''
    }
    case 'sms': {
      const c = content as unknown as SmsContent
      if (!c.phone) return ''
      return `SMSTO:${c.phone}:${c.body}`
    }
    case 'geo': {
      const c = content as unknown as GeoContent
      if (!c.lat && !c.lng) return ''
      return `geo:${c.lat || '0'},${c.lng || '0'}`
    }
    case 'event': {
      const c = content as unknown as EventContent
      if (!c.title) return ''
      const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'BEGIN:VEVENT']
      lines.push(`SUMMARY:${escIcal(c.title)}`)
      if (c.start) lines.push(`DTSTART:${icalDateTime(c.start)}`)
      if (c.end) lines.push(`DTEND:${icalDateTime(c.end)}`)
      if (c.location) lines.push(`LOCATION:${escIcal(c.location)}`)
      if (c.description) lines.push(`DESCRIPTION:${escIcal(c.description)}`)
      lines.push('END:VEVENT', 'END:VCALENDAR')
      return lines.join('\n')
    }
  }
}

/** Byte length of the UTF-8 payload — what the QR symbol actually stores */
export function byteLength(s: string): number {
  return new TextEncoder().encode(s).length
}
