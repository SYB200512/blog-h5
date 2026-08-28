import request from './request'

// 前台：文章列表
export function getArticles(params) {
  return request.get('/articles', { params })
}

// 前台：文章详情
export function getArticle(id) {
  return request.get(`/articles/${id}`)
}

// 前台：时间归档
export function getArchive() {
  return request.get('/archive')
}
