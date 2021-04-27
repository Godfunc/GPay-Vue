import request from '@/utils/request'

export function getInfo() {
  return request({
    url: '/user/info',
    method: 'get'
  })
}

export function page(page, limit, status, username) {
  return request({
    url: `/user/page/${page}/${limit}`,
    method: 'get',
    params: { status, username }
  })
}

export function add(data) {
  return request({
    url: '/user/add',
    method: 'post',
    data
  })
}

export function edit(data) {
  return request({
    url: '/user/edit',
    method: 'post',
    data
  })
}

export function password(data) {
  return request({
    url: '/user/password',
    method: 'post',
    data
  })
}

export function remove(id) {
  return request({
    url: `/user/remove/${id}`,
    method: 'post'
  })
}
