import defaultSettings from '@/settings'

const title = defaultSettings.title || 'GPay'

export default function getPageTitle(pageTitle) {
  if (pageTitle) {
    return `${pageTitle} - ${title}`
  }
  return `${title}`
}
