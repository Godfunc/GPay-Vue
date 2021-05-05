import request from '@/utils/request'

export function page(page, limit, status, name, code) {
  return request({
    url: `/payChannel/page/${page}/${limit}`,
    method: 'get',
    params: { status, name, code }
  })
}

export function add(data) {
  return request({
    url: '/payChannel/add',
    method: 'post',
    data
  })
}

export function edit(data) {
  return request({
    url: '/payChannel/edit',
    method: 'post',
    data
  })
}

export function remove(id) {
  return request({
    url: `/payChannel/remove/${id}`,
    method: 'post'
  })
}
