import request from './request'

// 标签列表
export function getTags() {
  return request.get('/tags')
}
