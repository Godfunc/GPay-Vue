import request from '@/utils/request'

export function page(page, limit, orderId) {
  return request({
    url: `/orderLog/page/${page}/${limit}/${orderId}`,
    method: 'get'
  })
}
