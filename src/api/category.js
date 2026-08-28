import request from './request'

// 分类列表
export function getCategories() {
  return request.get('/categories')
}
