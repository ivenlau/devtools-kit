export interface JsonValidationError {
  message: string
  line: number
  column: number
  position: number
}

/**
 * 格式化JSON
 */
export const formatJson = (
  input: string,
  options: { indent: number; sortKeys: boolean }
): { result: string; error: JsonValidationError | null } => {
  try {
    const parsed = JSON.parse(input)

    // 递归排序键
    const sorted = options.sortKeys ? sortObjectKeys(parsed) : parsed

    const formatted = JSON.stringify(sorted, null, options.indent)
    return { result: formatted, error: null }
  } catch (error: any) {
    return {
      result: '',
      error: parseJsonError(error, input),
    }
  }
}

/**
 * 压缩JSON
 */
export const minifyJson = (input: string): { result: string; error: JsonValidationError | null } => {
  try {
    const parsed = JSON.parse(input)
    const minified = JSON.stringify(parsed)
    return { result: minified, error: null }
  } catch (error: any) {
    return {
      result: '',
      error: parseJsonError(error, input),
    }
  }
}

/**
 * 验证JSON
 */
export const validateJson = (input: string): JsonValidationError | null => {
  try {
    JSON.parse(input)
    return null
  } catch (error: any) {
    return parseJsonError(error, input)
  }
}

/**
 * 递归排序对象键
 */
function sortObjectKeys(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(sortObjectKeys)
  }
  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj)
      .sort()
      .reduce((sorted, key) => {
        sorted[key] = sortObjectKeys(obj[key])
        return sorted
      }, {} as any)
  }
  return obj
}

/**
 * 解析JSON错误
 */
function parseJsonError(error: any, input: string): JsonValidationError {
  const message = error.message.replace(/at position \d+/, '')
  const match = error.message.match(/position (\d+)/)
  const position = match ? parseInt(match[1]) : 0

  const { line, column } = getLineAndColumn(input, position)

  return {
    message,
    line,
    column,
    position,
  }
}

/**
 * 获取错误行号和列号
 */
function getLineAndColumn(text: string, position: number): { line: number; column: number } {
  const lines = text.substring(0, position).split('\n')
  return {
    line: lines.length,
    column: lines[lines.length - 1].length + 1,
  }
}
