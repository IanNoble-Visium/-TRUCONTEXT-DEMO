// Utility functions for Cloudinary icon management

/**
 * Get Cloudinary URL for an icon by node type
 * @param nodeType - The node type (e.g., 'firewall', 'database', 'server')
 * @param fallbackToUnknown - Whether to fallback to unknown.svg if icon not found
 * @param bustCache - Whether to add cache-busting parameter (default: true)
 * @returns Cloudinary URL for the icon
 */
export function getCloudinaryIconUrl(nodeType: string, fallbackToUnknown: boolean = true, bustCache: boolean = true): string {
  const baseUrl = 'https://res.cloudinary.com/dlogj3gc8/image/upload'
  const iconPath = `trucontext-icons/trucontext-icons/${nodeType.toLowerCase()}`
  
  // Base URL with auto-format and quality optimization
  let url = `${baseUrl}/f_auto,q_auto/${iconPath}.svg`
  
  // Add cache-busting parameter to ensure updated icons are not cached
  if (bustCache) {
    const timestamp = Math.floor(Date.now() / (1000 * 60 * 5)) // 5-minute cache window
    url += `?v=${timestamp}`
  }
  
  return url
}

/**
 * Get fallback unknown icon URL from Cloudinary
 * @param bustCache - Whether to add cache-busting parameter (default: true)
 * @returns Cloudinary URL for the unknown icon
 */
export function getUnknownIconUrl(bustCache: boolean = true): string {
  return getCloudinaryIconUrl('unknown', false, bustCache)
}

/**
 * Check if an icon exists in Cloudinary (client-side check)
 * @param nodeType - The node type to check
 * @returns Promise<boolean> - Whether the icon exists
 */
export async function checkIconExists(nodeType: string): Promise<boolean> {
  try {
    const iconUrl = getCloudinaryIconUrl(nodeType, false)
    const response = await fetch(iconUrl, { method: 'HEAD' })
    return response.ok
  } catch (error) {
    console.warn(`Failed to check icon existence for ${nodeType}:`, error)
    return false
  }
}

/**
 * Get icon URL with fallback logic
 * @param nodeType - The node type
 * @returns Promise<string> - The icon URL (either specific or unknown fallback)
 */
export async function getIconUrlWithFallback(nodeType: string): Promise<string> {
  const iconExists = await checkIconExists(nodeType)
  return iconExists ? getCloudinaryIconUrl(nodeType, false) : getUnknownIconUrl()
}

/**
 * Transform local icon path to Cloudinary URL
 * @param localPath - Local path like '/icons-svg/firewall.svg'
 * @returns Cloudinary URL
 */
export function transformLocalPathToCloudinary(localPath: string): string {
  // Extract node type from local path
  const match = localPath.match(/\/icons-svg\/(.+)\.svg$/)
  if (match) {
    const nodeType = match[1]
    return getCloudinaryIconUrl(nodeType)
  }
  
  // If path doesn't match expected format, return unknown icon
  return getUnknownIconUrl()
}

/**
 * Get all available icons from the migration report
 * @returns Array of icon information
 */
export function getAvailableIcons(): Array<{
  nodeType: string
  iconUrl: string
  publicId: string
}> {
  // This would typically come from an API call or cached data
  // For now, return the known icons from our migration
  const knownIcons = [
    'actor', 'agent', 'application', 'attack', 'attacker', 'client', 'cpe', 'cvss',
    'cvssseverity', 'cvsssmetrics', 'cwe', 'database', 'device', 'dmz', 'domain',
    'entity', 'event', 'exploit', 'externalentry', 'firewall', 'load_balancer',
    'machine', 'network', 'proxy_server', 'references', 'router', 'server',
    'software', 'storage', 'switch', 'threatactor', 'traffic', 'unknown',
    'user', 'vulnerability', 'workstation'
  ]
  
  return knownIcons.map(nodeType => ({
    nodeType,
    iconUrl: getCloudinaryIconUrl(nodeType),
    publicId: `trucontext-icons/trucontext-icons/${nodeType}`
  }))
}

/**
 * Generate thumbnail URL for an icon
 * @param nodeType - The node type
 * @param size - Thumbnail size (default: 64)
 * @returns Cloudinary URL with thumbnail transformation
 */
export function getIconThumbnailUrl(nodeType: string, size: number = 64): string {
  const baseUrl = 'https://res.cloudinary.com/dlogj3gc8/image/upload'
  const iconPath = `trucontext-icons/trucontext-icons/${nodeType.toLowerCase()}`
  
  return `${baseUrl}/w_${size},h_${size},c_fit,f_auto,q_auto/${iconPath}.svg`
}

/**
 * Get icon URL optimized for specific use case
 * @param nodeType - The node type
 * @param context - Usage context ('thumbnail', 'display', 'print')
 * @returns Optimized Cloudinary URL
 */
export function getOptimizedIconUrl(nodeType: string, context: 'thumbnail' | 'display' | 'print' = 'display'): string {
  const baseUrl = 'https://res.cloudinary.com/dlogj3gc8/image/upload'
  const iconPath = `trucontext-icons/trucontext-icons/${nodeType.toLowerCase()}`
  
  switch (context) {
    case 'thumbnail':
      return `${baseUrl}/w_64,h_64,c_fit,f_auto,q_auto/${iconPath}.svg`
    case 'display':
      return `${baseUrl}/w_512,h_512,c_fit,f_auto,q_auto/${iconPath}.svg`
    case 'print':
      return `${baseUrl}/w_1024,h_1024,c_fit,f_svg,q_100/${iconPath}.svg`
    default:
      return getCloudinaryIconUrl(nodeType)
  }
}

