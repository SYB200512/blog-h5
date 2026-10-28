import request from './request'

// 图片墙图片列表（公开接口，仅返回分类为「图片墙」的图片）
export function getPhotos(limit = 60) {
  return request.get('/photos', { params: { limit } })
}
