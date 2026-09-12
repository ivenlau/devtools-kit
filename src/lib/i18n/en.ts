import common from './en.common'
import toolsA from './en.tools-a'
import toolsB from './en.tools-b'

/** zh → EN dictionary; missing keys fall back to the zh source. */
export const enDict: Record<string, string> = {
  ...common,
  ...toolsA,
  ...toolsB,
}
