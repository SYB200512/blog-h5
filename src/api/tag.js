import request from './request'

// 标签列表（后端在无标签时会返回 null，这里统一兜底成数组）
export function getTags() {
  return request.get('/tags').then((data) => (Array.isArray(data) ? data : []))
}
