import api from './api'

export const categoriaService = {
  getAll: ()       => api.get('/categorias'),
  getBySlug: (slug) => api.get(`/categorias/${slug}`),
}