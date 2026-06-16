<template>
  <!-- Loading -->
  <div v-if="loading" class="flex flex-column align-items-center justify-content-center py-6 gap-3">
    <ProgressSpinner strokeWidth="3" style="width:40px;height:40px" />
    <span style="color:#888; font-size:0.9rem">Cargando película...</span>
  </div>

  <div v-else-if="!pelicula" class="flex justify-content-center py-6" style="color:#888">
    Película no encontrada.
  </div>

  <div v-else>
    <!-- Alerta global -->
    <GlobalAlerta
      :tipo="alerta.tipo"
      :mensaje="alerta.mensaje"
      @cerrar="alerta.mensaje = ''"
    />

    <!-- Hero detalle -->
    <div class="detalle-hero">
      <div class="container">

        <!-- Breadcrumb -->
        <nav class="flex align-items-center gap-1 mb-4" style="font-size:0.82rem">
          <RouterLink to="/" class="bc-link">Inicio</RouterLink>
          <span class="bc-sep">›</span>
          <RouterLink to="/catalogo" class="bc-link">Catálogo</RouterLink>
          <span class="bc-sep">›</span>
          <span style="color:#fff">{{ pelicula.titulo }}</span>
        </nav>

        <div class="detalle-row">
          <!-- Portada -->
          <div class="portada-col">
            <img
              :src="getImagen(pelicula.id)"
              :alt="pelicula.titulo"
              class="portada-img"
              @error="e => e.target.src = fallback"
            />
          </div>

          <!-- Info -->
          <div class="info-col">

            <!-- Badges -->
            <div class="flex flex-wrap gap-2 mb-3">
              <Tag :value="pelicula.formato" severity="secondary" />
              <Tag :value="pelicula.clasificacion" severity="secondary" />
              <RouterLink
                v-if="pelicula.categoria"
                :to="`/categorias/${pelicula.categoria.slug}`"
                style="text-decoration:none"
              >
                <Tag :value="pelicula.categoria.nombre" class="tag-rojo" />
              </RouterLink>
              <Tag
                v-for="g in pelicula.generos"
                :key="g.id"
                :value="g.nombre"
                class="tag-oscuro"
              />
            </div>

            <!-- Título -->
            <h1 class="titulo-detalle">{{ pelicula.titulo }}</h1>
            <p v-if="pelicula.titulo_original && pelicula.titulo_original !== pelicula.titulo"
               class="titulo-original">{{ pelicula.titulo_original }}</p>

            <!-- Meta -->
            <div class="flex flex-wrap gap-3 mb-4" style="color:#aaa; font-size:0.88rem">
              <span><i class="pi pi-camera mr-1"></i>{{ pelicula.director }}</span>
              <span><i class="pi pi-calendar mr-1"></i>{{ pelicula.anio_lanzamiento }}</span>
              <span><i class="pi pi-clock mr-1"></i>{{ pelicula.duracion_minutos }} min</span>
              <span><i class="pi pi-globe mr-1"></i>{{ pelicula.idioma_original }}</span>
            </div>

            <!-- Calificaciones -->
            <div class="flex gap-3 mb-4">
              <div v-if="pelicula.calificacion_imdb" class="cal-box cal-imdb">
                <div class="cal-valor">{{ pelicula.calificacion_imdb }}</div>
                <div class="cal-label">IMDb</div>
              </div>
              <div v-if="pelicula.calificacion_local" class="cal-box cal-local">
                <div class="cal-valor">{{ pelicula.calificacion_local }}</div>
                <div class="cal-label">CineStore</div>
              </div>
            </div>

            <!-- Descripción -->
            <p class="descripcion">{{ pelicula.sinopsis ?? pelicula.descripcion }}</p>

            <!-- Idiomas -->
            <p v-if="pelicula.idiomas_disponibles?.length" class="idiomas-txt">
              <span style="color:#fff">Idiomas:</span>
              {{ pelicula.idiomas_disponibles.join(', ') }}
              <template v-if="pelicula.subtitulos?.length">
                &nbsp;·&nbsp;
                <span style="color:#fff">Subtítulos:</span>
                {{ pelicula.subtitulos.join(', ') }}
              </template>
            </p>

            <!-- Precio -->
            <div class="flex align-items-center flex-wrap gap-3 mb-2">
              <span class="precio-grande">₡{{ formatPrecio(pelicula.precio) }}</span>
              <span v-if="pelicula.precio_alquiler" style="color:#aaa; font-size:0.85rem">
                o alquiler ₡{{ formatPrecio(pelicula.precio_alquiler) }}
              </span>
            </div>
            <p class="stock-txt">
              {{ pelicula.stock > 0 ? `✅ ${pelicula.stock} unidades en stock` : '❌ Sin stock' }}
            </p>

            <!-- Trailer -->
            <div v-if="youtubeId" class="trailer-wrap">
              <h6 class="trailer-titulo"><i class="pi pi-play-circle mr-1"></i> Trailer</h6>
              <div class="iframe-wrap">
                <iframe
                  :src="`https://www.youtube.com/embed/${youtubeId}`"
                  allowfullscreen
                  loading="lazy"
                ></iframe>
              </div>
            </div>

            <!-- Acciones CRUD -->
            <div class="flex flex-wrap gap-2 pt-3" style="border-top: 1px solid var(--cine-borde)">
              <RouterLink :to="`/peliculas/${pelicula.id}/editar`">
                <Button label="Editar película" icon="pi pi-pencil" outlined size="small" class="btn-warning-outlined" />
              </RouterLink>
              <RouterLink :to="`/peliculas/${pelicula.id}/eliminar`">
                <Button label="Eliminar película" icon="pi pi-trash" outlined size="small" class="btn-rojo-outlined" />
              </RouterLink>
              <RouterLink to="/peliculas/crear">
                <Button label="Agregar película" icon="pi pi-plus-circle" outlined size="small" class="btn-gris-outlined" />
              </RouterLink>
              <RouterLink to="/catalogo">
                <Button label="Volver al catálogo" icon="pi pi-arrow-left" outlined size="small" class="btn-sec-outlined" />
              </RouterLink>
            </div>

          </div>
        </div>
      </div>
    </div>

<!-- Relacionadas -->
<section v-if="relacionadas.length" class="seccion-rel">
  <div class="container">
    <h2 class="seccion-titulo">También te puede interesar</h2>
    <div class="grid-rel">
      <RouterLink 
        v-for="p in relacionadas" 
        :key="p.id" 
        :to="{ name: 'pelicula', params: { id: p.id } }"
        style="text-decoration: none; display: block;"
      >
        <PeliculaCard :pelicula="p" />
      </RouterLink>
    </div>
  </div>
</section>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router' 

import Button          from 'primevue/button'
import Tag             from 'primevue/tag'
import ProgressSpinner from 'primevue/progressspinner'

import PeliculaCard from '../components/PeliculaCard.vue'
import GlobalAlerta from '../components/GlobalAlerta.vue'
import { peliculaService } from '../services/peliculaService'

const route = useRoute()
const router = useRouter()

const pelicula     = ref(null)
const relacionadas = ref([])
const loading      = ref(true)
const fallback     = 'https://placehold.co/300x450/1a1a2e/dc3545?text=Sin+imagen'

const alerta = reactive({ tipo: 'exito', mensaje: '' })
const mostrarAlerta = (tipo, mensaje) => { alerta.tipo = tipo; alerta.mensaje = mensaje }

const youtubeId = computed(() => {
  const url = pelicula.value?.trailer_url
  if (!url) return null
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  return m ? m[1] : null
})

onMounted(async () => {
  const pendiente = sessionStorage.getItem('alerta')
  if (pendiente) {
    const { tipo, mensaje } = JSON.parse(pendiente)
    mostrarAlerta(tipo, mensaje)
    sessionStorage.removeItem('alerta')
  }
  try {
    const res = await peliculaService.getById(route.params.id)
    pelicula.value     = res.data.pelicula
    relacionadas.value = res.data.relacionadas
  } catch {
    pelicula.value = null
  } finally {
    loading.value = false
  }
})

// 🔥 FUNCIÓN PARA CARGAR LA PELÍCULA
const cargarPelícula = async () => {
  loading.value = true
  try {
    const res = await peliculaService.getById(route.params.id)
    pelicula.value     = res.data.pelicula
    relacionadas.value = res.data.relacionadas
  } catch {
    pelicula.value = null
  } finally {
    loading.value = false
  }
}

// ✅ WATCH para detectar cambios en el ID
watch(
  () => route.params.id,
  (nuevoId, viejoId) => {
    if (nuevoId !== viejoId) {
      console.log('🔄 Cambió la película:', nuevoId)
      cargarPelícula()
      // Opcional: scroll al inicio
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }
)

onMounted(async () => {
  const pendiente = sessionStorage.getItem('alerta')
  if (pendiente) {
    const { tipo, mensaje } = JSON.parse(pendiente)
    mostrarAlerta(tipo, mensaje)
    sessionStorage.removeItem('alerta')
  }
  
  // Cargar la película inicial
  await cargarPelícula()
})

const getImagen    = (id) => new URL(`../assets/images/${id}.jpg`, import.meta.url).href
const formatPrecio = (v)  => Number(v).toLocaleString('es-CR', { minimumFractionDigits: 0 })
</script>

<style scoped>
.container { max-width: 1140px; margin: 0 auto; padding: 0 1rem; }

.detalle-hero {
  background: linear-gradient(to right, var(--cine-oscuro) 50%, #1a0510);
  padding: 3rem 0;
}

.bc-link { color: #888; text-decoration: none; }
.bc-link:hover { color: #fff; }
.bc-sep { color: #555; margin: 0 0.2rem; }

.detalle-row { display: flex; gap: 2rem; align-items: flex-start; }
.portada-col { flex-shrink: 0; width: 220px; }
.portada-img {
  width: 100%;
  border-radius: 0.75rem;
  border: 1px solid var(--cine-borde);
  box-shadow: 0 16px 40px rgba(0,0,0,.6);
}
.info-col { flex: 1; min-width: 0; }

/* Tags / Badges */
:deep(.tag-rojo.p-tag) { background: var(--cine-rojo); color: #fff; font-size: 0.72rem; }
:deep(.tag-oscuro.p-tag) { background: var(--cine-borde); color: #aaa; font-size: 0.72rem; }
:deep(.p-tag-secondary) { background: #6c757d; color: #fff; font-size: 0.72rem; }

/* Título */
.titulo-detalle {
  font-family: 'Bebas Neue', sans-serif;
  font-size: clamp(2rem, 5vw, 3.5rem);
  letter-spacing: 2px;
  color: #fff;
  line-height: 1.1;
  margin-bottom: 0.25rem;
}
.titulo-original { color: #888; font-style: italic; font-size: 0.9rem; margin-bottom: 0.75rem; }

/* Calificaciones */
.cal-box { text-align: center; padding: 0.5rem 1rem; border-radius: 0.5rem; min-width: 70px; }
.cal-imdb  { background: rgba(255,193,7,.15); border: 1px solid rgba(255,193,7,.3); }
.cal-imdb  .cal-valor { color: #ffc107; font-weight: 700; font-size: 1.25rem; }
.cal-imdb  .cal-label { color: #ffc107; font-size: 0.7rem; opacity: 0.7; }
.cal-local { background: rgba(220,53,69,.15); border: 1px solid rgba(220,53,69,.3); }
.cal-local .cal-valor { color: var(--cine-rojo); font-weight: 700; font-size: 1.25rem; }
.cal-local .cal-label { color: var(--cine-rojo); font-size: 0.7rem; opacity: 0.7; }

.descripcion { color: #aaa; line-height: 1.7; margin-bottom: 1rem; max-width: 600px; }
.idiomas-txt { color: #aaa; font-size: 0.85rem; margin-bottom: 1rem; }

.precio-grande { color: var(--cine-rojo); font-weight: 700; font-size: 2rem; }
.stock-txt { font-size: 0.8rem; color: #555; margin-bottom: 1.25rem; }

/* Trailer */
.trailer-wrap { margin-bottom: 1.5rem; max-width: 480px; }
.trailer-titulo { color: #aaa; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 1px; margin-bottom: 0.75rem; }
.iframe-wrap { position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; border-radius: 10px; border: 1px solid var(--cine-borde); }
.iframe-wrap iframe { position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0; }

/* Botones CRUD outlined */
:deep(.btn-warning-outlined.p-button) {
  color: #ffc107; border-color: #ffc107; font-size: 0.82rem;
}
:deep(.btn-warning-outlined.p-button:hover) { background: #ffc107; color: #000; }

:deep(.btn-rojo-outlined.p-button) {
  color: var(--cine-rojo); border-color: var(--cine-rojo); font-size: 0.82rem;
}
:deep(.btn-rojo-outlined.p-button:hover) { background: var(--cine-rojo); color: #fff; }

:deep(.btn-gris-outlined.p-button) {
  color: #aaa; border-color: #aaa; font-size: 0.82rem;
}
:deep(.btn-gris-outlined.p-button:hover) { background: #aaa; color: #000; }

:deep(.btn-sec-outlined.p-button) {
  color: #6c757d; border-color: #6c757d; font-size: 0.82rem;
}
:deep(.btn-sec-outlined.p-button:hover) { background: #6c757d; color: #fff; }

/* Relacionadas */
.seccion-rel { padding: 3rem 0; border-top: 1px solid var(--cine-borde); }
.seccion-titulo {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 1.8rem;
  letter-spacing: 2px;
  color: #fff;
  margin-bottom: 1.25rem;
}
.grid-rel { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem; }
@media (min-width: 576px) { .grid-rel { grid-template-columns: repeat(4, 1fr); } }
@media (max-width: 640px) { .detalle-row { flex-direction: column; } .portada-col { width: 160px; } }
</style>