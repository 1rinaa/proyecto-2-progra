<template>
  <div>
    <!-- HERO -->
    <section class="hero">
      <div class="hero-content">
        <h1>Tu cine<span>.</span> En casa<span>.</span></h1>
        <p class="hero-sub">
          Más de 500 títulos en DVD, Blu-ray y 4K UHD. Entrega a todo Costa Rica.
        </p>
        <RouterLink to="/catalogo" class="btn-hero">
          <i class="bi bi-collection-play"></i> Ver catálogo completo
        </RouterLink>
      </div>
    </section>

    <!-- DESTACADAS -->
    <section class="seccion">
      <h2 class="seccion-titulo">
        <i class="bi bi-star-fill" style="color:#ffc107"></i> Destacadas
      </h2>
      <div v-if="loadingDestacadas" class="loading-txt">
        <div class="spinner"></div>
        Cargando películas destacadas...
      </div>
      <div v-else class="grid-6">
        <PeliculaCard v-for="p in destacadas" :key="p.id" :pelicula="p" />
      </div>
    </section>

    <!-- CATEGORÍAS -->
    <section class="seccion seccion-gris">
      <div class="seccion-inner">
        <h2 class="seccion-titulo">🎭 Explorar por categoría</h2>
        <div v-if="loadingCats" class="loading-txt">
          <div class="spinner"></div>
          Cargando categorías...
        </div>
        <div v-else class="grid-categorias">
          <RouterLink
            v-for="cat in categorias"
            :key="cat.id"
            :to="`/categorias/${cat.slug}`"
            class="cat-card"
          >
            <i :class="`bi bi-${cat.icono}`" class="cat-icono"></i>
            <div class="cat-nombre">{{ cat.nombre }}</div>
            <div class="cat-count">{{ cat.peliculas_count }} títulos</div>
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- NOVEDADES -->
    <section class="seccion">
      <div class="seccion-header">
        <h2 class="seccion-titulo mb-0">🆕 Novedades</h2>
        <RouterLink to="/catalogo" class="ver-todas">
          Ver todas <i class="bi bi-arrow-right"></i>
        </RouterLink>
      </div>
      <div v-if="loadingRecientes" class="loading-txt">
        <div class="spinner"></div>
        Cargando novedades...
      </div>
      <div v-else class="grid-4">
        <PeliculaCard
          v-for="p in recientes"
          :key="p.id"
          :pelicula="p"
        />
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import PeliculaCard from '../components/PeliculaCard.vue'
import { peliculaService } from '../services/peliculaService'
import { categoriaService } from '../services/categoriaService'

const destacadas     = ref([])
const recientes      = ref([])
const categorias     = ref([])
const loadingCats    = ref(true)
const loadingRecientes = ref(true)
const loadingDestacadas = ref(true)

onMounted(async () => {
  // Carga en paralelo
  const [destRes, recRes, catRes] = await Promise.allSettled([
    peliculaService.getDestacadas(),
    peliculaService.getRecientes(),
    categoriaService.getAll(),
  ])

  if (destRes.status === 'fulfilled') destacadas.value = destRes.value.data
  if (recRes.status === 'fulfilled')  { recientes.value = recRes.value.data; loadingRecientes.value = false }
  if (catRes.status === 'fulfilled')  { categorias.value = catRes.value.data; loadingCats.value = false }
  if (destRes.status === 'fulfilled') {
    destacadas.value = destRes.value.data
    loadingDestacadas.value = false
  }
  loadingCats.value    = false
  loadingRecientes.value = false
})
</script>

<style scoped>
/* ── Hero ── */
.hero {
  background: linear-gradient(135deg, #0a0a0f 0%, #1a0510 50%, #0a0a0f 100%);
  padding: 5rem 1rem;
  text-align: center;
}
.hero-content { max-width: 700px; margin: 0 auto; }
.hero h1 {
  font-family: 'Bebas Neue', sans-serif;
  font-size: clamp(3rem, 8vw, 6rem);
  letter-spacing: 4px;
  color: #fff;
  margin-bottom: 1rem;
}
.hero h1 span { color: var(--cine-rojo); }
.hero-sub { color: #aaa; font-size: 1.1rem; margin-bottom: 2rem; }
.btn-hero {
  display: inline-block;
  background: var(--cine-rojo);
  color: #fff;
  padding: 0.75rem 2.5rem;
  border-radius: 0.5rem;
  text-decoration: none;
  font-size: 1rem;
  font-weight: 600;
  transition: opacity 0.2s;
}
.btn-hero:hover { opacity: 0.85; }

/* ── Secciones ── */
.seccion {
  max-width: 1200px;
  margin: 0 auto;
  padding: 3rem 1rem;
}
.seccion-gris {
  background-color: var(--cine-gris);
  max-width: 100%;
  padding: 1rem 2rem 3rem 2rem;
}
.seccion-inner { max-width: 1200px; margin: 0 auto; }
.seccion-titulo {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 1.8rem;
  letter-spacing: 2px;
  color: #fff;
  margin-bottom: 1.25rem;
}
.seccion-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
}
.ver-todas {
  color: var(--cine-rojo);
  text-decoration: none;
  font-size: 0.9rem;
}
.ver-todas:hover { text-decoration: underline; }

/* ── Grids ── */
.grid-6 {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}
.grid-4 {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}
@media (min-width: 576px) {
  .grid-6 { grid-template-columns: repeat(3, 1fr); }
  .grid-4 { grid-template-columns: repeat(4, 1fr); }
}
@media (min-width: 992px) {
  .grid-6 { grid-template-columns: repeat(6, 1fr); }
}

/* ── Categorías ── */
.grid-categorias {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}
@media (min-width: 576px) { .grid-categorias { grid-template-columns: repeat(3, 1fr); } }
@media (min-width: 992px) { .grid-categorias { grid-template-columns: repeat(5, 1fr); } }

.cat-card {
  background-color: var(--cine-card);
  border: 1px solid var(--cine-borde);
  border-radius: 0.75rem;
  padding: 1.25rem;
  text-align: center;
  text-decoration: none;
  display: block;
  transition: border-color 0.2s, background 0.2s;
}
.cat-card:hover {
  border-color: var(--cine-rojo);
  background: #1a0510;
}
.cat-icono {
  font-size: 1.8rem;
  color: var(--cine-rojo);
  display: block;
  margin-bottom: 0.4rem;
}
.cat-nombre { font-weight: 600; color: #fff; font-size: 0.9rem; }
.cat-count  { color: #888; font-size: 0.75rem; margin-top: 0.2rem; }

.loading-txt { color: #888; text-align: center; padding: 2rem; }

.loading-txt {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 0;
  gap: 1rem;
  color: #888;
  font-size: 0.9rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #2a2a40;
  border-top-color: var(--cine-rojo);
  border-radius: 50%;
  animation: girar 0.8s linear infinite;
}

@keyframes girar {
  to { transform: rotate(360deg); }
}
</style>