import request from './request'

// 前台：文章列表（兜底空列表，避免后端返回 null 时渲染报错）
export function getArticles(params) {
  return request.get('/articles', { params }).then((data) => data || { list: [], total: 0 })
}

// 前台：文章详情
export function getArticle(id) {
  return request.get(`/articles/${id}`)
}

// 前台：时间归档（兜底空对象）
export function getArchive() {
  return request.get('/archive').then((data) => data || {})
}
