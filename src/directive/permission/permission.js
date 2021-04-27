import store from '@/store'

function checkPermission(el, binding) {
  const { value } = binding
  const permissions = store.getters && store.getters.permissions
  if (value) {
    const permission = value
    const hasPermission = permissions.indexOf(permission) !== -1
    if (!hasPermission) {
      el.parentNode && el.parentNode.removeChild(el)
    }
  } else {
    throw new Error(`need permissions!`)
  }
}

export default {
  inserted(el, binding) {
    checkPermission(el, binding)
  },
  update(el, binding) {
    checkPermission(el, binding)
  }
}
