import request from '@/utils/request'

export function list(merchantCode) {
  return request({
    url: `/merchantRisk/list/${merchantCode}`,
    method: 'get'
  })
}

export function add(data) {
  return request({
    url: '/merchantRisk/add',
    method: 'post',
    data
  })
}

export function edit(data) {
  return request({
    url: '/merchantRisk/edit',
    method: 'post',
    data
  })
}

export function remove(id) {
  return request({
    url: `/merchantRisk/remove/${id}`,
    method: 'post'
  })
}

