import request from '@/utils/request'

export function getByChannel(channelId) {
  return request({
    url: `/payCategoryChannel/getByChannel/${channelId}`,
    method: 'get'
  })
}
