import request from '@/utils/request'

export function page(page, limit, status, payType, outTradeNo, orderNo, createTime) {
  return request({
    url: `/order/page/${page}/${limit}`,
    method: 'get',
    params: { status, payType, outTradeNo, orderNo, createTime }
  })
}

export function updatePaid(id) {
  return request({
    url: `/order/updatePaid/${id}`,
    method: 'post'
  })
}

export function notifyMerchant(id) {
  return request({
    url: `/order/notifyMerchant/${id}`,
    method: 'post'
  })
}
