<template>
  <div class="wrapper">
    <div v-if="loading" class="loading-txt">Cargando categoría...</div>

    <template v-else>
      <nav class="breadcrumb-nav">
        <RouterLink to="/" class="bc-link">Inicio</RouterLink>
        <span class="bc-sep">›</span>
        <span class="bc-actual">{{ categoria?.nombre }}</span>
      </nav>

      <div class="cat-header">
        <h1 class="seccion-titulo">{{ categoria?.nombre }}</h1>
        <RouterLink to="/peliculas/crear" class="btn-agregar">
          <i class="bi bi-plus-circle"></i> Agregar película
        </RouterLink>
      </div>

      <p v-if="categoria?.descripcion" class="cat-desc">{{ categoria.descripcion }}</p>

      <div v-if="peliculas.length === 0" class="vacio">
        <i class="bi bi-inbox"></i>
        <p>No hay películas en esta categoría.</p>
        <RouterLink to="/peliculas/crear" class="btn-agregar">Agregar la primera</RouterLink>
      </div>

      <div v-else class="grid-peliculas">
        <PeliculaCard v-for="p in peliculas" :key="p.id" :pelicula="p" />
      </div>

      <!-- Paginación -->
      <div v-if="lastPage > 1" class="paginacion">
        <button :disabled="page === 1" @click="cambiarPagina(page - 1)" class="pag-btn">‹</button>
        <span class="pag-info">{{ page }} / {{ lastPage }}</span>
        <button :disabled="page === lastPage" @click="cambiarPagina(page + 1)" class="pag-btn">›</button>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import PeliculaCard from '../components/PeliculaCard.vue'
import { categoriaService } from '../services/categoriaService'

const route    = useRoute()
const loading  = ref(true)
const categoria = ref(null)
const peliculas = ref([])
const page     = ref(1)
const lastPage = ref(1)

const cargar = async () => {
  loading.value = true
  try {
    const res = await categoriaService.getBySlug(route.params.slug)
    categoria.value = res.data.categoria
    peliculas.value = res.data.peliculas.data
    lastPage.value  = res.data.peliculas.last_page
  } catch { categoria.value = null }
  finally  { loading.value = false }
}

onMounted(cargar)
watch(() => route.params.slug, cargar)

const cambiarPagina = (p) => { page.value = p; cargar() }
</script>

<style scoped>
.wrapper { max-width: 1200px; margin: 0 auto; padding: 2rem 1rem; }
.loading-txt { color: #888; text-align: center; padding: 4rem; }
.breadcrumb-nav { font-size: 0.82rem; margin-bottom: 1.25rem; }
.bc-link { color: #888; text-decoration: none; }
.bc-link:hover { color: #fff; }
.bc-sep { color: #555; margin: 0 0.4rem; }
.bc-actual { color: #ddd; }
.cat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}
.seccion-titulo {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 1.8rem;
  letter-spacing: 2px;
  color: #fff;
  margin: 0;
}
.btn-agregar {
  background: transparent;
  border: 1px solid var(--cine-rojo);
  color: var(--cine-rojo);
  padding: 0.4rem 0.9rem;
  border-radius: 0.4rem;
  text-decoration: none;
  font-size: 0.82rem;
  transition: background 0.2s;
}
.btn-agregar:hover { background: var(--cine-rojo); color: #fff; }
.cat-desc { color: #aaa; margin-bottom: 1.5rem; }
.vacio { text-align: center; padding: 4rem; color: #888; }
.vacio i { font-size: 3rem; display: block; margin-bottom: 1rem; }
.grid-peliculas {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}
@media (min-width: 576px) { .grid-peliculas { grid-template-columns: repeat(3, 1fr); } }
@media (min-width: 992px) { .grid-peliculas { grid-template-columns: repeat(5, 1fr); } }
.paginacion {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
}
.pag-btn {
  background: var(--cine-card);
  border: 1px solid var(--cine-borde);
  color: #aaa;
  padding: 0.4rem 0.9rem;
  border-radius: 0.4rem;
  cursor: pointer;
}
.pag-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.pag-info { color: #888; font-size: 0.85rem; }
</style>