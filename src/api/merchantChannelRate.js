import request from '@/utils/request'

export function page(page, limit, merchantCode, channelCode, categoryCode) {
  return request({
    url: `/merchantChannelRate/page/${page}/${limit}`,
    method: 'get',
    params: { merchantCode, channelCode, categoryCode }
  })
}

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

export function add(data) {
  return request({
    url: '/merchantChannelRate/add',
    method: 'post',
    data
  })
}

export function edit(data) {
  return request({
    url: '/merchantChannelRate/edit',
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
