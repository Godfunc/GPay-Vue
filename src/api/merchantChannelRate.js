import request from '@/utils/request'

export function list(merchantCode) {
  return request({
    url: `/merchantChannelRate/list/${merchantCode}`,
    method: 'get'
  })
}

export function save(data) {
  return request({
    url: '/merchantChannelRate/save',
    method: 'post',
    data
  })
}

export function remove(id) {
  return request({
    url: `/merchantChannelRate/remove/${id}`,
    method: 'post'
  })
}
