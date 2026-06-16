<template>
  <div class="wrapper">

    <!-- Loading -->
    <div v-if="loading" class="flex flex-column align-items-center justify-content-center py-6 gap-3">
      <ProgressSpinner strokeWidth="3" style="width:40px;height:40px" />
      <span style="color:#888; font-size:0.9rem">Cargando categoría...</span>
    </div>

    <template v-else>
      <!-- Breadcrumb -->
      <nav class="flex align-items-center gap-1 mb-4" style="font-size:0.82rem">
        <RouterLink to="/" class="bc-link">Inicio</RouterLink>
        <span class="bc-sep">›</span>
        <span style="color:#ddd">{{ categoria?.nombre }}</span>
      </nav>

      <!-- Header -->
      <div class="flex justify-content-between align-items-center mb-3">
        <h1 class="seccion-titulo m-0">{{ categoria?.nombre }}</h1>
        <RouterLink to="/peliculas/crear">
          <Button
            label="Agregar película"
            icon="pi pi-plus-circle"
            outlined
            size="small"
            class="btn-rojo-outlined"
          />
        </RouterLink>
      </div>

      <p v-if="categoria?.descripcion" class="cat-desc">{{ categoria.descripcion }}</p>

      <!-- Vacío -->
      <div v-if="peliculas.length === 0" class="flex flex-column align-items-center py-6 gap-3" style="color:#888">
        <i class="pi pi-inbox" style="font-size:3rem"></i>
        <p class="m-0">No hay películas en esta categoría.</p>
        <RouterLink to="/peliculas/crear">
          <Button label="Agregar la primera" outlined size="small" class="btn-rojo-outlined mt-2" />
        </RouterLink>
      </div>

      <!-- Grid -->
      <div v-else class="grid-peliculas">
        <PeliculaCard v-for="p in peliculas" :key="p.id" :pelicula="p" />
      </div>

      <!-- Paginación -->
      <div v-if="lastPage > 1" class="flex justify-content-center mt-5">
        <Paginator
          :first="(page - 1) * 12"
          :rows="12"
          :totalRecords="lastPage * 12"
          :pageLinkSize="5"
          @page="e => cambiarPagina(e.page + 1)"
          class="cine-paginator"
        />
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'

import Button          from 'primevue/button'
import ProgressSpinner from 'primevue/progressspinner'
import Paginator       from 'primevue/paginator'

import PeliculaCard from '../components/PeliculaCard.vue'
import { categoriaService } from '../services/categoriaService'

// ✅ Lógica 100% intacta
const route     = useRoute()
const loading   = ref(true)
const categoria = ref(null)
const peliculas = ref([])
const page      = ref(1)
const lastPage  = ref(1)

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

.bc-link { color: #888; text-decoration: none; }
.bc-link:hover { color: #fff; }
.bc-sep { color: #555; margin: 0 0.2rem; }

.seccion-titulo {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 1.8rem;
  letter-spacing: 2px;
  color: #fff;
}

.cat-desc { color: #aaa; margin-bottom: 1.5rem; }

.grid-peliculas {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}
@media (min-width: 576px) { .grid-peliculas { grid-template-columns: repeat(3, 1fr); } }
@media (min-width: 992px) { .grid-peliculas { grid-template-columns: repeat(5, 1fr); } }

/* Botón outlined rojo */
:deep(.btn-rojo-outlined.p-button) {
  color: var(--cine-rojo);
  border-color: var(--cine-rojo);
  font-size: 0.82rem;
}
:deep(.btn-rojo-outlined.p-button:hover) {
  background: var(--cine-rojo);
  color: #fff;
}

/* Paginator tema cine */
:deep(.cine-paginator.p-paginator) {
  background: transparent;
  border: none;
  padding: 0;
}
:deep(.cine-paginator .p-paginator-page),
:deep(.cine-paginator .p-paginator-prev),
:deep(.cine-paginator .p-paginator-next) {
  background: var(--cine-card);
  border: 1px solid var(--cine-borde);
  color: #aaa;
  border-radius: 0.4rem;
  min-width: 2.2rem;
  height: 2.2rem;
}
:deep(.cine-paginator .p-paginator-page:hover),
:deep(.cine-paginator .p-paginator-prev:hover),
:deep(.cine-paginator .p-paginator-next:hover) { background: #2a2a40; color: #fff; }
:deep(.cine-paginator .p-paginator-page.p-highlight) {
  background: var(--cine-rojo);
  border-color: var(--cine-rojo);
  color: #fff;
  font-weight: 600;
}
</style>