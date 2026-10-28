import request from './request'

// 分类列表（后端在无分类时会返回 null，这里统一兜底成数组）
export function getCategories() {
  return request.get('/categories').then((data) => (Array.isArray(data) ? data : []))
}
