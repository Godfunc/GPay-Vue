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

export function riskAdd(data) {
  return request({
    url: '/channelRisk/add',
    method: 'post',
    data
  })
}

export function riskEdit(data) {
  return request({
    url: '/channelRisk/edit',
    method: 'post',
    data
  })
}

export function riskRemove(id) {
  return request({
    url: `/channelRisk/remove/${id}`,
    method: 'post'
  })
}

