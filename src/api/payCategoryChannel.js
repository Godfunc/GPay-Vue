import request from '@/utils/request'

export function getByChannel(channelId) {
  return request({
    url: `/payCategoryChannel/getByChannel/${channelId}`,
    method: 'get'
  })
}

export function list(payCategoryId) {
  return request({
    url: '/payCategoryChannel/list/',
    method: 'get',
    params: { payCategoryId }
  })
}
export function weight(data) {
  return request({
    url: '/payCategoryChannel/weight/',
    method: 'post',
    data
  })
}
