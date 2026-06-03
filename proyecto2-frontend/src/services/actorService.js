import api from './api'
 
export const actorService = {
  getAll: ()     => api.get('/actores'),
  getById: (id)  => api.get(`/actores/${id}`),
  buscar: (q)    => api.get('/buscar/actores', { params: { q } }),
}
 