<template>
  <div class="container">
    <div v-if="loading" class="loading-txt">Cargando...</div>

    <template v-else-if="pelicula">
      <!-- Breadcrumb -->
      <nav class="breadcrumb-nav">
        <RouterLink to="/" class="bc-link">Inicio</RouterLink>
        <span class="bc-sep">›</span>
        <RouterLink to="/catalogo" class="bc-link">Catálogo</RouterLink>
        <span class="bc-sep">›</span>
        <RouterLink :to="`/peliculas/${pelicula.id}`" class="bc-link">{{ pelicula.titulo }}</RouterLink>
        <span class="bc-sep">›</span>
        <span class="bc-danger">Eliminar</span>
      </nav>

      <!-- Título centrado -->
      <div class="titulo-centrado">
        <div class="icono-trash">🗑️</div>
        <h1 class="seccion-titulo">Confirmar eliminación</h1>
      </div>

      <!-- Tarjeta de la película -->
      <div class="pelicula-card">
        <img
          :src="getImagen(pelicula.id)"
          :alt="pelicula.titulo"
          class="pelicula-img"
          @error="e => e.target.src = fallback"
        />
        <div class="pelicula-info">
          <h5>{{ pelicula.titulo }}</h5>
          <p v-if="pelicula.titulo_original && pelicula.titulo_original !== pelicula.titulo"
             class="titulo-original">{{ pelicula.titulo_original }}</p>
          <div class="badges-row">
            <span class="badge-rojo">{{ pelicula.categoria?.nombre }}</span>
            <span class="badge-gris">{{ pelicula.formato }}</span>
            <span class="badge-gris">{{ pelicula.anio_lanzamiento }}</span>
          </div>
          <p class="meta">
            <i class="bi bi-camera-video"></i> {{ pelicula.director }}
            &nbsp;·&nbsp; {{ pelicula.duracion_minutos }} min
          </p>
        </div>
      </div>

      <!-- Alerta de advertencia -->
      <div class="alerta-advertencia">
        <i class="bi bi-exclamation-triangle"></i>
        <strong> ¿Está seguro?</strong> Esta película será eliminada del catálogo.
        Si la categoría <strong>{{ pelicula.categoria?.nombre }}</strong> tenía solo esta película,
        aparecerá vacía.
      </div>

      <!-- Botones -->
      <div class="acciones-centradas">
        <button class="btn-danger-solid" @click="eliminar" :disabled="eliminando">
          <i class="bi bi-trash"></i>
          {{ eliminando ? 'Eliminando...' : 'Sí, eliminar película' }}
        </button>
        <RouterLink :to="`/peliculas/${pelicula.id}`" class="btn-sec-outline">
          Cancelar
        </RouterLink>
      </div>
    </template>

    <div v-else class="loading-txt">Película no encontrada.</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
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
    // Guardar alerta para mostrar en el catálogo
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
.loading-txt { color: #888; text-align: center; padding: 4rem; }

.breadcrumb-nav { font-size: 0.82rem; margin-bottom: 1.5rem; }
.bc-link { color: #888; text-decoration: none; }
.bc-link:hover { color: #fff; }
.bc-sep { color: #555; margin: 0 0.4rem; }
.bc-danger { color: var(--cine-rojo); }

.titulo-centrado { text-align: center; margin-bottom: 1.5rem; }
.icono-trash { font-size: 4rem; }
.seccion-titulo {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 1.8rem;
  letter-spacing: 2px;
  color: #fff;
  margin-top: 0.5rem;
}

/* Tarjeta película */
.pelicula-card {
  background: var(--cine-card);
  border: 1px solid rgba(220,53,69,.4);
  border-radius: 0.75rem;
  padding: 1.25rem;
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  margin-bottom: 1.25rem;
}
.pelicula-img {
  width: 80px;
  border-radius: 6px;
  border: 1px solid var(--cine-borde);
  flex-shrink: 0;
}
.pelicula-info h5 { color: #fff; margin-bottom: 0.3rem; font-size: 1rem; }
.titulo-original { color: #888; font-style: italic; font-size: 0.85rem; margin-bottom: 0.5rem; }

.badges-row { display: flex; flex-wrap: wrap; gap: 0.4rem; margin-bottom: 0.5rem; }
.badge-rojo { background: var(--cine-rojo); color: #fff; font-size: 0.72rem; padding: 0.2rem 0.5rem; border-radius: 0.3rem; }
.badge-gris { background: #6c757d; color: #fff; font-size: 0.72rem; padding: 0.2rem 0.5rem; border-radius: 0.3rem; }

.meta { color: #888; font-size: 0.83rem; margin: 0; }
.meta i { margin-right: 0.25rem; }

/* Alerta */
.alerta-advertencia {
  background: rgba(220,53,69,.12);
  border: 1px solid rgba(220,53,69,.35);
  color: #ea868f;
  border-radius: 0.5rem;
  padding: 0.85rem 1.1rem;
  font-size: 0.875rem;
  margin-bottom: 1.5rem;
}

/* Botones */
.acciones-centradas { display: flex; gap: 0.75rem; justify-content: center; }
.btn-danger-solid, .btn-sec-outline {
  display: inline-flex; align-items: center; gap: 0.4rem;
  padding: 0.55rem 1.5rem;
  border-radius: 0.4rem;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  border: 1px solid;
  transition: opacity 0.2s, background 0.2s;
}
.btn-danger-solid { background: var(--cine-rojo); border-color: var(--cine-rojo); color: #fff; }
.btn-danger-solid:hover { opacity: 0.85; }
.btn-danger-solid:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-sec-outline { background: transparent; border-color: #6c757d; color: #6c757d; }
.btn-sec-outline:hover { background: #6c757d; color: #fff; }
</style>