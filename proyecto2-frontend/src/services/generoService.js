import api from './api'
 
export const generoService = {
  getAll: ()             => api.get('/generos'),
  getPeliculas: (slug)   => api.get(`/generos/${slug}/peliculas`),
}