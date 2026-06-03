import { createRouter, createWebHistory } from 'vue-router'

import HomeView         from '../views/HomeView.vue'
import CatalogoView     from '../views/CatalogoView.vue'
import PeliculaView     from '../views/PeliculaView.vue'
import CategoriaView    from '../views/CategoriaView.vue'
import PeliculaForm     from '../views/PeliculaForm.vue'
import EliminarPelicula from '../views/EliminarPelicula.vue'

const routes = [
  { path: '/',                         name: 'home',              component: HomeView },
  { path: '/catalogo',                  name: 'catalogo',          component: CatalogoView },
  { path: '/peliculas/crear',           name: 'pelicula-crear',    component: PeliculaForm },
  { path: '/peliculas/:id/editar',      name: 'pelicula-editar',   component: PeliculaForm },
  { path: '/peliculas/:id/eliminar',    name: 'pelicula-eliminar', component: EliminarPelicula },
  { path: '/peliculas/:id',             name: 'pelicula',          component: PeliculaView },
  { path: '/categorias/:slug',          name: 'categoria',         component: CategoriaView },
]

export default createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})