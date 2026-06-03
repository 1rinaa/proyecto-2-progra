import api from './api'

export const peliculaService = {
  // ── Públicas ──────────────────────────────────────────────
  getAll: (params = {})  => api.get('/peliculas', { params }),
  getById: (id)          => api.get(`/peliculas/${id}`),
  getDestacadas: ()      => api.get('/peliculas/destacadas'),
  getRecientes: ()       => api.get('/peliculas/recientes'),
  getEnOferta: ()        => api.get('/peliculas/en-oferta'),
  getFiltros: ()         => api.get('/peliculas/filtros'),
  buscar: (q)            => api.get('/buscar', { params: { q } }),

  // ── Protegidas ────────────────────────────────────────────
  create: (data)         => api.post('/peliculas', data),
  update: (id, data)     => api.put(`/peliculas/${id}`, data),
  delete: (id)           => api.delete(`/peliculas/${id}`),
}