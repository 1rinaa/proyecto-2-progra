<template>
  <div v-if="loading" class="loading-txt">
    <div class="spinner"></div>
    Cargando película...
  </div>
  <div v-else-if="!pelicula" class="loading-txt">Película no encontrada.</div>

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
        <nav class="breadcrumb-nav">
          <RouterLink to="/" class="bc-link">Inicio</RouterLink>
          <span class="bc-sep">›</span>
          <RouterLink to="/catalogo" class="bc-link">Catálogo</RouterLink>
          <span class="bc-sep">›</span>
          <span class="bc-actual">{{ pelicula.titulo }}</span>
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
            <div class="badges-row">
              <span class="badge-gris">{{ pelicula.formato }}</span>
              <span class="badge-gris">{{ pelicula.clasificacion }}</span>
              <RouterLink
                v-if="pelicula.categoria"
                :to="`/categorias/${pelicula.categoria.slug}`"
                class="badge-rojo"
              >{{ pelicula.categoria.nombre }}</RouterLink>
              <span v-for="g in pelicula.generos" :key="g.id" class="badge-oscuro">
                {{ g.nombre }}
              </span>
            </div>

            <!-- Título -->
            <h1 class="titulo-detalle">{{ pelicula.titulo }}</h1>
            <p v-if="pelicula.titulo_original && pelicula.titulo_original !== pelicula.titulo"
               class="titulo-original">{{ pelicula.titulo_original }}</p>

            <!-- Meta -->
            <div class="meta-row">
              <span><i class="bi bi-camera-video"></i> {{ pelicula.director }}</span>
              <span><i class="bi bi-calendar"></i> {{ pelicula.anio_lanzamiento }}</span>
              <span><i class="bi bi-clock"></i> {{ pelicula.duracion_minutos }} min</span>
              <span><i class="bi bi-globe"></i> {{ pelicula.idioma_original }}</span>
            </div>

            <!-- Calificaciones -->
            <div class="calificaciones-row">
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
              <span class="txt-blanco">Idiomas:</span>
              {{ pelicula.idiomas_disponibles.join(', ') }}
              <template v-if="pelicula.subtitulos?.length">
                &nbsp;·&nbsp;
                <span class="txt-blanco">Subtítulos:</span>
                {{ pelicula.subtitulos.join(', ') }}
              </template>
            </p>

            <!-- Precio -->
            <div class="precio-row">
              <span class="precio-grande">₡{{ formatPrecio(pelicula.precio) }}</span>
              <span v-if="pelicula.precio_alquiler" class="precio-alquiler">
                o alquiler ₡{{ formatPrecio(pelicula.precio_alquiler) }}
              </span>
            </div>
            <p class="stock-txt">
              {{ pelicula.stock > 0 ? `✅ ${pelicula.stock} unidades en stock` : '❌ Sin stock' }}
            </p>

            <!-- Trailer embebido -->
            <div v-if="youtubeId" class="trailer-wrap">
              <h6 class="trailer-titulo"><i class="bi bi-play-circle"></i> Trailer</h6>
              <div class="iframe-wrap">
                <iframe
                  :src="`https://www.youtube.com/embed/${youtubeId}`"
                  allowfullscreen
                  loading="lazy"
                ></iframe>
              </div>
            </div>

            <!-- Acciones CRUD -->
            <div class="acciones-crud">
              <RouterLink :to="`/peliculas/${pelicula.id}/editar`" class="btn-warning-outline">
                <i class="bi bi-pencil-square"></i> Editar película
              </RouterLink>
              <RouterLink :to="`/peliculas/${pelicula.id}/eliminar`" class="btn-danger-outline">
                <i class="bi bi-trash"></i> Eliminar película
              </RouterLink>
              <RouterLink to="/peliculas/crear" class="btn-light-outline">
                <i class="bi bi-plus-circle"></i> Agregar película
              </RouterLink>
              <RouterLink to="/catalogo" class="btn-sec-outline">
                <i class="bi bi-arrow-left"></i> Volver al catálogo
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
          <PeliculaCard v-for="p in relacionadas" :key="p.id" :pelicula="p" />
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import PeliculaCard from '../components/PeliculaCard.vue'
import GlobalAlerta from '../components/GlobalAlerta.vue'
import { peliculaService } from '../services/peliculaService'

const route = useRoute()

const pelicula     = ref(null)
const relacionadas = ref([])
const loading      = ref(true)
const fallback     = 'https://placehold.co/300x450/1a1a2e/dc3545?text=Sin+imagen'

// ✅ Solo una declaración de alerta
const alerta = reactive({ tipo: 'exito', mensaje: '' })

// Función para mostrar alerta
const mostrarAlerta = (tipo, mensaje) => {
  alerta.tipo = tipo
  alerta.mensaje = mensaje
}

const youtubeId = computed(() => {
  const url = pelicula.value?.trailer_url
  if (!url) return null
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  return m ? m[1] : null
})

onMounted(async () => {
  // Leer alerta pendiente (viene de guardar formulario)
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

const getImagen    = (id) => new URL(`../assets/images/${id}.jpg`, import.meta.url).href
const formatPrecio = (v)  => Number(v).toLocaleString('es-CR', { minimumFractionDigits: 0 })
</script>

<style scoped>
.loading-txt {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 5rem 0;
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

.container { max-width: 1140px; margin: 0 auto; padding: 0 1rem; }

.detalle-hero {
  background: linear-gradient(to right, var(--cine-oscuro) 50%, #1a0510);
  padding: 3rem 0;
}

.breadcrumb-nav { font-size: 0.82rem; margin-bottom: 1.5rem; }
.bc-link { color: #888; text-decoration: none; }
.bc-link:hover { color: #fff; }
.bc-sep { color: #555; margin: 0 0.4rem; }
.bc-actual { color: #fff; }

.detalle-row { display: flex; gap: 2rem; align-items: flex-start; }
.portada-col { flex-shrink: 0; width: 220px; }
.portada-img {
  width: 100%;
  border-radius: 0.75rem;
  border: 1px solid var(--cine-borde);
  box-shadow: 0 16px 40px rgba(0,0,0,.6);
}
.info-col { flex: 1; min-width: 0; }

.badges-row { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1rem; }
.badge-gris   { background: #6c757d; color: #fff; font-size: 0.72rem; padding: 0.25rem 0.6rem; border-radius: 0.3rem; }
.badge-rojo   { background: var(--cine-rojo); color: #fff; font-size: 0.72rem; padding: 0.25rem 0.6rem; border-radius: 0.3rem; text-decoration: none; }
.badge-oscuro { background: var(--cine-borde); color: #aaa; font-size: 0.72rem; padding: 0.25rem 0.6rem; border-radius: 0.3rem; }

.titulo-detalle {
  font-family: 'Bebas Neue', sans-serif;
  font-size: clamp(2rem, 5vw, 3.5rem);
  letter-spacing: 2px; color: #fff; line-height: 1.1; margin-bottom: 0.25rem;
}
.titulo-original { color: #888; font-style: italic; font-size: 0.9rem; margin-bottom: 0.75rem; }

.meta-row { display: flex; flex-wrap: wrap; gap: 1rem; color: #aaa; font-size: 0.88rem; margin-bottom: 1.25rem; }
.meta-row i { margin-right: 0.3rem; }

.calificaciones-row { display: flex; gap: 0.75rem; margin-bottom: 1.25rem; }
.cal-box { text-align: center; padding: 0.5rem 1rem; border-radius: 0.5rem; min-width: 70px; }
.cal-imdb { background: rgba(255,193,7,.15); border: 1px solid rgba(255,193,7,.3); }
.cal-imdb .cal-valor { color: #ffc107; font-weight: 700; font-size: 1.25rem; }
.cal-imdb .cal-label { color: #ffc107; font-size: 0.7rem; opacity: 0.7; }
.cal-local { background: rgba(220,53,69,.15); border: 1px solid rgba(220,53,69,.3); }
.cal-local .cal-valor { color: var(--cine-rojo); font-weight: 700; font-size: 1.25rem; }
.cal-local .cal-label { color: var(--cine-rojo); font-size: 0.7rem; opacity: 0.7; }

.descripcion { color: #aaa; line-height: 1.7; margin-bottom: 1rem; max-width: 600px; }
.idiomas-txt { color: #aaa; font-size: 0.85rem; margin-bottom: 1rem; }
.txt-blanco { color: #fff; }

.precio-row { display: flex; align-items: center; flex-wrap: wrap; gap: 0.75rem; margin-bottom: 0.5rem; }
.precio-grande { color: var(--cine-rojo); font-weight: 700; font-size: 2rem; }
.precio-alquiler { color: #aaa; font-size: 0.85rem; }
.stock-txt { font-size: 0.8rem; color: #555; margin-bottom: 1.25rem; }

.trailer-wrap { margin-bottom: 1.5rem; max-width: 480px; }
.trailer-titulo { color: #aaa; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 1px; margin-bottom: 0.75rem; }
.iframe-wrap { position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; border-radius: 10px; border: 1px solid var(--cine-borde); }
.iframe-wrap iframe { position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0; }

.acciones-crud {
  display: flex; flex-wrap: wrap; gap: 0.5rem;
  padding-top: 1rem; border-top: 1px solid var(--cine-borde);
}
.btn-warning-outline, .btn-danger-outline, .btn-light-outline, .btn-sec-outline {
  display: inline-flex; align-items: center; gap: 0.35rem;
  padding: 0.35rem 0.9rem; border-radius: 0.4rem; font-size: 0.82rem;
  cursor: pointer; text-decoration: none;
  transition: background 0.2s, color 0.2s; border: 1px solid;
}
.btn-warning-outline { background: transparent; border-color: #ffc107; color: #ffc107; }
.btn-warning-outline:hover { background: #ffc107; color: #000; }
.btn-danger-outline  { background: transparent; border-color: var(--cine-rojo); color: var(--cine-rojo); }
.btn-danger-outline:hover  { background: var(--cine-rojo); color: #fff; }
.btn-light-outline   { background: transparent; border-color: #aaa; color: #aaa; }
.btn-light-outline:hover   { background: #aaa; color: #000; }
.btn-sec-outline     { background: transparent; border-color: #6c757d; color: #6c757d; }
.btn-sec-outline:hover     { background: #6c757d; color: #fff; }

.seccion-rel { padding: 3rem 0; border-top: 1px solid var(--cine-borde); }
.seccion-titulo { font-family: 'Bebas Neue', sans-serif; font-size: 1.8rem; letter-spacing: 2px; color: #fff; margin-bottom: 1.25rem; }
.grid-rel { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem; }
@media (min-width: 576px) { .grid-rel { grid-template-columns: repeat(4, 1fr); } }
@media (max-width: 640px) { .detalle-row { flex-direction: column; } .portada-col { width: 160px; } }
</style>