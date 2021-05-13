import request from '@/utils/request'

export function riskList(merchantCode) {
  return request({
    url: `/merchantRisk/list/${merchantCode}`,
    method: 'get'
  })
}

export function riskAdd(data) {
  return request({
    url: '/merchantRisk/add',
    method: 'post',
    data
  })
}

export function riskEdit(data) {
  return request({
    url: '/merchantRisk/edit',
    method: 'post',
    data
  })
}

export function riskRemove(id) {
  return request({
    url: `/merchantRisk/remove/${id}`,
    method: 'post'
  })
}

