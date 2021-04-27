import request from '@/utils/request'

export function logout() {
  return request({
    url: '/logout',
    method: 'post'
  })
}

export function login(data) {
  return request({
    url: '/login',
    method: 'post',
    data
  })
}
