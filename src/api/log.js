import request from '@/utils/request'

export function page(page, limit, status, operation) {
  return request({
    url: `/log/page/${page}/${limit}`,
    method: 'get',
    params: { status, operation }
  })
}
