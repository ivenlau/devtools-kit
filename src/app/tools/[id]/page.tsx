import { tools } from '@/lib/constants/tools'

export function generateStaticParams() {
  return tools.map((tool) => ({ id: tool.path.replace('/tools/', '') }))
}

export const dynamicParams = false

// The workspace in the root layout watches the route and opens/activates the
// matching tab — this page only needs to exist so deep links resolve.
export default function ToolRoutePage() {
  return null
}
