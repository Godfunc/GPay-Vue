import request from '@/utils/request'

export function page(page, limit, name) {
  return request({
    url: `/config/page/${page}/${limit}`,
    method: 'get',
    params: { name }
  })
}

export function remove(id) {
  return request({
    url: `/config/remove/${id}`,
    method: 'post'
  })
}

export function edit(data) {
  return request({
    url: '/config/edit',
    method: 'post',
    data
  })
}

export function add(data) {
  return request({
    url: '/config/add',
    method: 'post',
    data
  })
}
