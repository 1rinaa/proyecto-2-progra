<template>
  <div class="container">

    <!-- Loading -->
    <div v-if="loading" class="flex align-items-center justify-content-center py-6 gap-3">
      <ProgressSpinner strokeWidth="3" style="width:40px;height:40px" />
    </div>

    <template v-else-if="pelicula">

      <!-- Breadcrumb -->
      <nav class="flex align-items-center gap-1 mb-4" style="font-size:0.82rem">
        <RouterLink to="/" class="bc-link">Inicio</RouterLink>
        <span class="bc-sep">›</span>
        <RouterLink to="/catalogo" class="bc-link">Catálogo</RouterLink>
        <span class="bc-sep">›</span>
        <RouterLink :to="`/peliculas/${pelicula.id}`" class="bc-link">{{ pelicula.titulo }}</RouterLink>
        <span class="bc-sep">›</span>
        <span style="color: var(--cine-rojo)">Eliminar</span>
      </nav>

      <!-- Título centrado -->
      <div class="flex flex-column align-items-center mb-4">
        <span style="font-size:4rem">🗑️</span>
        <h1 class="seccion-titulo mt-2">Confirmar eliminación</h1>
      </div>

      <!-- Tarjeta película con ancho fijo y contenido centrado verticalmente -->
      <div class="flex justify-content-center mb-4">
        <div class="pelicula-card">
          <img
            :src="getImagen(pelicula.id)"
            :alt="pelicula.titulo"
            class="pelicula-img"
            @error="e => e.target.src = fallback"
          />
          <div class="info-pelicula">
            <h5 class="m-0" style="color:#fff">{{ pelicula.titulo }}</h5>
            <p v-if="pelicula.titulo_original && pelicula.titulo_original !== pelicula.titulo"
              class="m-0" style="color:#888; font-style:italic; font-size:0.85rem">
              {{ pelicula.titulo_original }}
            </p>
            <div class="flex flex-wrap gap-2">
              <Tag :value="pelicula.categoria?.nombre" class="tag-rojo" />
              <Tag :value="pelicula.formato" severity="secondary" />
              <Tag :value="String(pelicula.anio_lanzamiento)" severity="secondary" />
            </div>
            <p class="m-0" style="color:#888; font-size:0.83rem">
              <i class="pi pi-camera mr-1"></i>{{ pelicula.director }}
              &nbsp;·&nbsp; {{ pelicula.duracion_minutos }} min
            </p>
          </div>
        </div>
      </div>

      <!-- Alerta advertencia -->
      <div class="alerta-advertencia">
        <i class="pi pi-exclamation-triangle mr-2"></i>
        <strong>¿Está seguro?</strong> Esta película será eliminada del catálogo.
        Si la categoría <strong>{{ pelicula.categoria?.nombre }}</strong> tenía solo esta película,
        aparecerá vacía.
      </div>

      <!-- Botones -->
      <div class="flex justify-content-center gap-3">
        <Button
          label="Sí, eliminar película"
          icon="pi pi-trash"
          :loading="eliminando"
          :disabled="eliminando"
          class="btn-rojo-solid"
          @click="eliminar"
        />
        <RouterLink :to="`/peliculas/${pelicula.id}`">
          <Button label="Cancelar" outlined class="btn-sec-outlined" />
        </RouterLink>
      </div>

    </template>

    <div v-else class="flex justify-content-center py-6" style="color:#888">
      Película no encontrada.
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import Button          from 'primevue/button'
import Tag             from 'primevue/tag'
import ProgressSpinner from 'primevue/progressspinner'

import { peliculaService } from '../services/peliculaService'

const route  = useRoute()
const router = useRouter()

const pelicula  = ref(null)
const loading   = ref(true)
const eliminando = ref(false)
const fallback  = 'https://placehold.co/300x450/1a1a2e/dc3545?text=Sin+imagen'

onMounted(async () => {
  try {
    const res = await peliculaService.getById(route.params.id)
    pelicula.value = res.data.pelicula
  } catch {
    pelicula.value = null
  } finally {
    loading.value = false
  }
})

const getImagen = (id) => new URL(`../assets/images/${id}.jpg`, import.meta.url).href

const eliminar = async () => {
  eliminando.value = true
  try {
    await peliculaService.delete(pelicula.value.id)
    sessionStorage.setItem('alerta', JSON.stringify({
      tipo: 'exito',
      mensaje: `"${pelicula.value.titulo}" fue eliminada correctamente.`
    }))
    router.push({ name: 'catalogo' })
  } catch {
    eliminando.value = false
    sessionStorage.setItem('alerta', JSON.stringify({
      tipo: 'error',
      mensaje: 'Hubo un error al eliminar la película.'
    }))
  }
}
</script>

<style scoped>
.container { max-width: 600px; margin: 0 auto; padding: 2rem 1rem; }

.bc-link { color: #888; text-decoration: none; }
.bc-link:hover { color: #fff; }
.bc-sep { color: #555; margin: 0 0.3rem; }

.seccion-titulo {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 1.8rem;
  letter-spacing: 2px;
  color: #fff;
}

.pelicula-card {
  background: var(--cine-card);
  border: 1px solid rgba(220,53,69,.4);
  border-radius: 0.75rem;
  padding: 1.25rem;
  display: flex;
  align-items: center;      /* Centra verticalmente */
  gap: 1rem;
  width: 500px;             /* Ancho fijo */
  max-width: 100%;          /* Responsive: no se desborda en móviles */
  min-height: 120px;        /* Altura mínima para que el centrado se note */
}
.pelicula-img {
  width: 80px;
  border-radius: 6px;
  border: 1px solid var(--cine-borde);
  flex-shrink: 0;
}

.info-pelicula {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: flex-start;  /* Texto alineado a la izquierda */
  flex: 1;                  /* Ocupa el espacio restante */
}

:deep(.tag-rojo.p-tag) { background: var(--cine-rojo); color: #fff; font-size: 0.72rem; }
:deep(.p-tag-secondary) { background: #6c757d; color: #fff; font-size: 0.72rem; }

:deep(.btn-rojo-solid.p-button) {
  background: var(--cine-rojo);
  border-color: var(--cine-rojo);
  color: #fff;
  font-weight: 600;
}
:deep(.btn-rojo-solid.p-button:hover) { opacity: 0.85; background: var(--cine-rojo); }

:deep(.btn-sec-outlined.p-button) { color: #6c757d; border-color: #6c757d; }
:deep(.btn-sec-outlined.p-button:hover) { background: #6c757d; color: #fff; }

.alerta-advertencia {
  background: rgba(220, 53, 69, .12);
  border: 1px solid rgba(220, 53, 69, .35);
  color: #ea868f;
  border-radius: 0.5rem;
  padding: 0.85rem 1.1rem;
  font-size: 0.875rem;
  margin-bottom: 1.5rem;
  line-height: 1.5;
}
</style>