import dayjs, { Dayjs } from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'

dayjs.extend(customParseFormat)

export interface ParsedTimestamp {
  milliseconds: number
  unit: 'seconds' | 'milliseconds'
}

const DATE_FORMATS = [
  'YYYY-MM-DD HH:mm:ss.SSS',
  'YYYY-MM-DD HH:mm:ss',
  'YYYY-MM-DD HH:mm',
  'YYYY-MM-DD',
  'YYYY-M-D H:m:s.SSS',
  'YYYY-M-D H:m:s',
  'YYYY-M-D H:m',
  'YYYY-M-D',
  'YYYY/MM/DD HH:mm:ss.SSS',
  'YYYY/MM/DD HH:mm:ss',
  'YYYY/MM/DD HH:mm',
  'YYYY/MM/DD',
  'YYYY/M/D H:m:s.SSS',
  'YYYY/M/D H:m:s',
  'YYYY/M/D H:m',
  'YYYY/M/D',
  'YYYY.MM.DD HH:mm:ss.SSS',
  'YYYY.MM.DD HH:mm:ss',
  'YYYY.MM.DD HH:mm',
  'YYYY.MM.DD',
  'YYYY.M.D H:m:s.SSS',
  'YYYY.M.D H:m:s',
  'YYYY.M.D H:m',
  'YYYY.M.D',
]

const ISO_DATE_PATTERN = /^\d{4}-\d{1,2}-\d{1,2}T\d{1,2}:\d{2}(?::\d{2}(?:\.\d{1,9})?)?(?:Z|[+-]\d{2}:?\d{2})?$/i
const SPACE_SEPARATED_DATE_PATTERN = /^\d{4}-\d{1,2}-\d{1,2}\s+\d{1,2}:\d{2}(?::\d{2}(?:\.\d{1,9})?)?\s+(?:Z|UTC|GMT|[+-]\d{2}:?\d{2})$/i
const RFC_DATE_PATTERN = /^(?:(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun),?\s+)?(?:\d{1,2}\s+)?(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b/i

function normalizeDateInput(value: string) {
  return value
    .trim()
    .replace(/[０-９]/g, (digit) => String.fromCharCode(digit.charCodeAt(0) - 0xfee0))
    .replace(/年/g, '-')
    .replace(/月/g, '-')
    .replace(/日/g, '')
    .replace(/时/g, ':')
    .replace(/分(?=\s*\d)/g, ':')
    .replace(/分/g, '')
    .replace(/秒/g, '')
}

function isValidDate(value: Dayjs) {
  return value.isValid() && value.year() >= 1 && value.year() <= 9999
}

export function parseTimestampInput(value: string): ParsedTimestamp | null {
  const trimmed = value.trim()
  if (!/^-?\d+(?:\.\d+)?$/.test(trimmed)) return null

  const numericValue = Number(trimmed)
  if (!Number.isFinite(numericValue)) return null

  const isMilliseconds = Math.abs(numericValue) >= 100_000_000_000
  const milliseconds = Math.trunc(isMilliseconds ? numericValue : numericValue * 1000)
  if (!Number.isSafeInteger(milliseconds)) return null

  const date = dayjs(milliseconds)
  if (!isValidDate(date)) return null

  return {
    milliseconds,
    unit: isMilliseconds ? 'milliseconds' : 'seconds',
  }
}

export function isLikelyTimestampInput(value: string) {
  const trimmed = value.trim()
  if (!/^-?\d+(?:\.\d+)?$/.test(trimmed)) return false
  return trimmed.replace('-', '').split('.')[0].length >= 8
}

export function parseDateInput(value: string): Dayjs | null {
  const normalized = normalizeDateInput(value)
  if (!normalized) return null

  const explicitDate = dayjs(normalized, DATE_FORMATS, true)
  if (isValidDate(explicitDate)) return explicitDate

  if (!ISO_DATE_PATTERN.test(normalized) &&
      !SPACE_SEPARATED_DATE_PATTERN.test(normalized) &&
      !RFC_DATE_PATTERN.test(normalized)) return null

  const nativeDate = dayjs(normalized)
  return isValidDate(nativeDate) ? nativeDate : null
}

export function parseTimestampOrDate(value: string) {
  return parseTimestampInput(value) || parseDateInput(value)
}

export function formatTimestampDate(milliseconds: number) {
  return dayjs(milliseconds).format('YYYY-MM-DD HH:mm:ss.SSS')
}

export function formatTimestampSeconds(milliseconds: number) {
  return Math.floor(milliseconds / 1000).toString()
}

export function formatTimestampMilliseconds(milliseconds: number) {
  return Math.trunc(milliseconds).toString()
}
