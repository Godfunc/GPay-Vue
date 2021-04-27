import store from '@/store'

/**
 * @param {Array} value
 * @returns {Boolean}
 * @example see @/views/permission/directive.vue   v-if="checkPermission('mg:aliAccount:platform:page')"
 */
export default function checkPermission(value) {
  if (value) {
    const permissions = store.getters && store.getters.permissions
    const permission = value
    const hasPermission = permissions.indexOf(permission) !== -1
    if (hasPermission) {
      return true
    }
    return false
  }
  return false
}
