<template>
  <div>
    <!-- HERO -->
    <section class="hero">
      <div class="hero-content">
        <h1>Tu cine<span>.</span> En casa<span>.</span></h1>
        <p class="hero-sub">
          Más de 500 títulos en DVD, Blu-ray y 4K UHD. Entrega a todo Costa Rica.
        </p>
        <RouterLink to="/catalogo">
          <Button
            label="Ver catálogo completo"
            icon="pi pi-play-circle"
            size="large"
            class="btn-hero"
          />
        </RouterLink>
      </div>
    </section>

    <!-- DESTACADAS -->
    <section class="seccion">
      <h2 class="seccion-titulo">
        <i class="pi pi-star-fill" style="color:#ffc107"></i> Destacadas
      </h2>
      <div v-if="loadingDestacadas" class="flex flex-column align-items-center justify-content-center py-6 gap-3">
        <ProgressSpinner strokeWidth="3" style="width:40px;height:40px" />
        <span class="text-color-secondary text-sm">Cargando películas destacadas...</span>
      </div>
      <div v-else class="grid-6">
        <PeliculaCard v-for="p in destacadas" :key="p.id" :pelicula="p" />
      </div>
    </section>

    <!-- CATEGORÍAS -->
    <section class="seccion seccion-gris">
      <div class="seccion-inner">
        <h2 class="seccion-titulo">🎭 Explorar por categoría</h2>
        <div v-if="loadingCats" class="flex flex-column align-items-center justify-content-center py-6 gap-3">
          <ProgressSpinner strokeWidth="3" style="width:40px;height:40px" />
          <span class="text-color-secondary text-sm">Cargando categorías...</span>
        </div>
        <div v-else class="grid-categorias">
          <RouterLink
            v-for="cat in categorias"
            :key="cat.id"
            :to="`/categorias/${cat.slug}`"
            class="cat-card"
          >
            <i :class="`pi pi-${cat.icono}`" class="cat-icono"></i>
            <div class="cat-nombre">{{ cat.nombre }}</div>
            <div class="cat-count">{{ cat.peliculas_count }} títulos</div>
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- NOVEDADES -->
    <section class="seccion">
      <div class="flex justify-content-between align-items-center mb-4">
        <h2 class="seccion-titulo mb-0">🆕 Novedades</h2>
        <RouterLink to="/catalogo">
          <Button
            label="Ver todas"
            icon="pi pi-arrow-right"
            iconPos="right"
            text
            class="ver-todas-btn"
          />
        </RouterLink>
      </div>
      <div v-if="loadingRecientes" class="flex flex-column align-items-center justify-content-center py-6 gap-3">
        <ProgressSpinner strokeWidth="3" style="width:40px;height:40px" />
        <span class="text-color-secondary text-sm">Cargando novedades...</span>
      </div>
      <div v-else class="grid-4">
        <PeliculaCard v-for="p in recientes" :key="p.id" :pelicula="p" />
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Button from 'primevue/button'
import ProgressSpinner from 'primevue/progressspinner'
import PeliculaCard from '../components/PeliculaCard.vue'
import { peliculaService } from '../services/peliculaService'
import { categoriaService } from '../services/categoriaService'

const destacadas       = ref([])
const recientes        = ref([])
const categorias       = ref([])
const loadingCats      = ref(true)
const loadingRecientes = ref(true)
const loadingDestacadas = ref(true)

onMounted(async () => {
  const [destRes, recRes, catRes] = await Promise.allSettled([
    peliculaService.getDestacadas(),
    peliculaService.getRecientes(),
    categoriaService.getAll(),
  ])

  if (destRes.status === 'fulfilled') {
    destacadas.value = destRes.value.data
    loadingDestacadas.value = false
  }
  if (recRes.status === 'fulfilled') {
    recientes.value = recRes.value.data
    loadingRecientes.value = false
  }
  if (catRes.status === 'fulfilled') {
    categorias.value = catRes.value.data
    loadingCats.value = false
  }
  loadingCats.value     = false
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

/* Botón hero con color cine */
:deep(.btn-hero.p-button) {
  background: var(--cine-rojo);
  border-color: var(--cine-rojo);
  font-size: 1rem;
  font-weight: 600;
  padding: 0.75rem 2.5rem;
  border-radius: 0.5rem;
}
:deep(.btn-hero.p-button:hover) { opacity: 0.85; background: var(--cine-rojo); border-color: var(--cine-rojo); }

/* Botón "ver todas" */
:deep(.ver-todas-btn.p-button) { color: var(--cine-rojo); }
:deep(.ver-todas-btn.p-button:hover) { background: transparent; color: var(--cine-rojo); text-decoration: underline; }

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

/* ── Grids de películas ── */
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
.cat-card:hover { border-color: var(--cine-rojo); background: #1a0510; }
.cat-icono { font-size: 1.8rem; color: var(--cine-rojo); display: block; margin-bottom: 0.4rem; }
.cat-nombre { font-weight: 600; color: #fff; font-size: 0.9rem; }
.cat-count  { color: #888; font-size: 0.75rem; margin-top: 0.2rem; }
</style>