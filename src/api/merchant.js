import request from '@/utils/request'

export function page(page, limit, type, status, name, code) {
  return request({
    url: `/merchant/page/${page}/${limit}`,
    method: 'get',
    params: { type, status, name, code }
  })
}

export function keys(id) {
  return request({
    url: `/merchant/keys/${id}`,
    method: 'get'
  })
}

export function refreshKeys(data) {
  return request({
    url: '/merchant/refreshKeys',
    method: 'post',
    data
  })
}

export function add(data) {
  return request({
    url: '/merchant/add',
    method: 'post',
    data
  })
}

export function edit(data) {
  return request({
    url: '/merchant/edit',
    method: 'post',
    data
  })
}

export function remove(id) {
  return request({
    url: `/merchant/remove/${id}`,
    method: 'post'
  })
}
