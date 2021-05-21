import request from '@/utils/request'

export function listByChannel(channelId) {
  return request({
    url: `/channelRisk/listByChannel/${channelId}`,
    method: 'get'
  })
}

export function listByAccount(channelAccountId) {
  return request({
    url: `/channelRisk/listByAccount/${channelAccountId}`,
    method: 'get'
  })
}

export function add(data) {
  return request({
    url: '/channelRisk/add',
    method: 'post',
    data
  })
}

export function edit(data) {
  return request({
    url: '/channelRisk/edit',
    method: 'post',
    data
  })
}

export function remove(id) {
  return request({
    url: `/channelRisk/remove/${id}`,
    method: 'post'
  })
}

