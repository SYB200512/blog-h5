import request from './request'

// 前台：文章评论列表
export function getComments(articleId) {
  return request.get(`/articles/${articleId}/comments`)
}

// 前台：发表评论
export function createComment(articleId, data) {
  return request.post(`/articles/${articleId}/comments`, data)
}
