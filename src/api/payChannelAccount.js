import request from '@/utils/request'

export function page(page, limit, status, channelCode, name, accountCode) {
  return request({
    url: `/payChannelAccount/page/${page}/${limit}`,
    method: 'get',
    params: { status, channelCode, name, accountCode }
  })
}

export function add(data) {
  return request({
    url: '/payChannelAccount/add',
    method: 'post',
    data
  })
}

export function edit(data) {
  return request({
    url: '/payChannelAccount/edit',
    method: 'post',
    data
  })
}

export function remove(id) {
  return request({
    url: `/payChannelAccount/remove/${id}`,
    method: 'post'
  })
}
