<template>
<!-- Alerta de éxito/error -->
    <GlobalAlerta 
      :tipo="alerta.tipo" 
      :mensaje="alerta.mensaje" 
      @cerrar="alerta.mensaje = ''"
    />
  <div class="catalogo-wrapper">

    <div class="catalogo-top-header">
      <div class="header-izq">
        <h1 class="seccion-titulo">
          <i class="bi bi-camera-reels"></i> Catálogo de Películas
        </h1>
      </div>
      <RouterLink to="/peliculas/crear" class="btn-agregar-peli">
        <i class="bi bi-plus-circle"></i> Agregar película
      </RouterLink>
    </div>

    <div class="catalogo-contenido">
      <!-- Sidebar filtros (sin sticky) -->
      <aside class="sidebar-filtros">
        <label class="sidebar-titulo">FILTROS</label>

        <div class="filtro-grupo">
          <label>Buscar</label>
          <div class="input-busqueda-contenedor">
            <input v-model="filtros.buscar" type="text" class="filtro-input" placeholder="Título o director..." @keyup.enter="aplicarFiltros" />
            <span class="buscar-icono"><i class="bi bi-search"></i></span>
          </div>
        </div>

        <div class="filtro-grupo">
          <label>Categoría</label>
          <div class="radio-opciones">
            <div class="form-check-radio">
              <input type="radio" id="cat-todas" value="" v-model="filtros.categoria" class="radio-input" />
              <label for="cat-todas" class="radio-label">Todas</label>
            </div>
            <div v-for="c in opcionesFiltros.categorias" :key="c.id" class="form-check-radio">
              <input type="radio" :id="'cat-' + c.id" :value="c.slug" v-model="filtros.categoria" class="radio-input" />
              <label :for="'cat-' + c.id" class="radio-label">{{ c.nombre }}</label>
            </div>
          </div>
        </div>

        <div class="filtro-grupo">
          <label>Formato</label>
          <select v-model="filtros.formato" class="filtro-input">
            <option value="">Todos</option>
            <option v-for="f in opcionesFiltros.formatos" :key="f" :value="f">{{ f }}</option>
          </select>
        </div>

        <div class="filtro-grupo">
          <label>Precio (₡)</label>
          <div class="precio-fila">
            <input v-model="filtros.precio_min" type="number" min="0" max="999999" class="filtro-input" placeholder="Mín" />
            <input v-model="filtros.precio_max" type="number" min="0" max="999999" class="filtro-input" placeholder="Máx" />
          </div>
        </div>

        <div class="filtro-grupo">
          <label>Ordenar por</label>
          <select v-model="filtros.orden" class="filtro-input">
            <option value="reciente">Más recientes</option>
            <option value="precio_asc">Precio: menor a mayor</option>
            <option value="precio_desc">Precio: mayor a menor</option>
            <option value="titulo">Título A-Z</option>
            <option value="calificacion">Mejor calificación</option>
          </select>
        </div>

        <button class="btn-aplicar" @click="aplicarFiltros">
          <i class="bi bi-funnel"></i> Aplicar filtros
        </button>
        <button class="btn-limpiar" @click="limpiarFiltros">Limpiar</button>
      </aside>

      <!-- Contenido principal -->
      <main class="catalogo-main">
        <span class="total-txt" v-if="!loading">
            {{ paginacion.total }} película(s) encontradas
          </span>
        <div v-if="loading" class="loading-txt">
          <div class="spinner"></div>
          Cargando películas...
        </div>

        <div v-else-if="peliculas.length === 0" class="vacio">
          <i class="bi bi-inbox"></i>
          <p>No hay películas con esos filtros.</p>
        </div>

        <div v-else class="grid-peliculas">
          <PeliculaCard v-for="p in peliculas" :key="p.id" :pelicula="p" />
        </div>

        <!-- Paginación -->
        <div v-if="paginacion.last_page > 1" class="paginacion-contenedor">
          <ul class="paginacion-lista">
            <li class="pag-item" :class="{ disabled: paginacion.current_page === 1 }">
              <button class="pag-link" @click="cambiarPagina(paginacion.current_page - 1)">‹</button>
            </li>
            <li v-for="pagina in paginasVisibles" :key="pagina" class="pag-item" :class="{ active: paginacion.current_page === pagina }">
              <button class="pag-link" @click="cambiarPagina(pagina)">{{ pagina }}</button>
            </li>
            <li class="pag-item" :class="{ disabled: paginacion.current_page === paginacion.last_page }">
              <button class="pag-link" @click="cambiarPagina(paginacion.current_page + 1)">›</button>
            </li>
          </ul>
        </div>
        
        <span class="total-txt" v-if="!loading">
          Mostrando {{ peliculas.length }} de {{ paginacion.total }} película(s)
        </span>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PeliculaCard from '../components/PeliculaCard.vue'
import { peliculaService } from '../services/peliculaService'
import GlobalAlerta from '../components/GlobalAlerta.vue'

const route = useRoute()
const router = useRouter()

const peliculas       = ref([])
const loading         = ref(true)
const opcionesFiltros = ref({ categorias: [], generos: [], formatos: [] })
const paginacion      = ref({ current_page: 1, last_page: 1, total: 0 })

const filtros = reactive({
  categoria: '', genero: '', formato: '',
  precio_min: '', precio_max: '', orden: 'reciente',
  buscar: '', page: 1,
})

const paginasVisibles = computed(() => {
  const paginas = []
  const maxBloque = 5
  let inicio = Math.max(1, paginacion.value.current_page - Math.floor(maxBloque / 2))
  let fin    = Math.min(paginacion.value.last_page, inicio + maxBloque - 1)
  if (fin - inicio + 1 < maxBloque) inicio = Math.max(1, fin - maxBloque + 1)
  for (let i = inicio; i <= fin; i++) paginas.push(i)
  return paginas
})

const alerta = reactive({ tipo: 'exito', mensaje: '' })

const mostrarAlerta = (tipo, mensaje) => {
  alerta.tipo = tipo
  alerta.mensaje = mensaje
}

// ✅ Cargar películas con los filtros actuales
const cargar = async () => {
  loading.value = true
  try {
    const params = Object.fromEntries(
      Object.entries(filtros).filter(([, v]) => v !== '' && v !== null && v !== undefined)
    )
    console.log('📡 Enviando parámetros a la API:', params)
    const res = await peliculaService.getAll(params)
    peliculas.value  = res.data.data
    paginacion.value = {
      current_page: res.data.current_page,
      last_page:    res.data.last_page,
      total:        res.data.total,
    }
  } catch (e) {
    console.error('Error cargando catálogo', e)
  } finally {
    loading.value = false
  }
}

// ✅ Aplicar filtros y reiniciar página
const aplicarFiltros = () => { 
  filtros.page = 1
  const queryParams = {}
  if (filtros.buscar) queryParams.buscar = filtros.buscar
  if (filtros.categoria) queryParams.categoria = filtros.categoria
  if (filtros.formato) queryParams.formato = filtros.formato
  if (filtros.precio_min) queryParams.precio_min = filtros.precio_min
  if (filtros.precio_max) queryParams.precio_max = filtros.precio_max
  if (filtros.orden && filtros.orden !== 'reciente') queryParams.orden = filtros.orden
  
  router.replace({ query: queryParams })
  cargar() 
}

// ✅ Limpiar filtros
const limpiarFiltros = () => {
  Object.assign(filtros, {
    categoria: '', genero: '', formato: '',
    precio_min: '', precio_max: '', orden: 'reciente',
    buscar: '', page: 1,
  })
  router.replace({ query: {} })
  cargar()
}

const cambiarPagina = (p) => {
  filtros.page = p
  cargar()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// ✅ Escuchar cambios en la URL
watch(() => route.query, (newQuery) => {
  console.log('🔄 Cambió la URL:', newQuery)
  if (newQuery.buscar !== undefined && newQuery.buscar !== filtros.buscar) {
    filtros.buscar = newQuery.buscar || ''
    console.log('📝 Actualizando filtro buscar a:', filtros.buscar)
    cargar()
  }
}, { deep: true, immediate: true })

onMounted(async () => {
  // Leer alerta pendiente
  const alertaPendiente = sessionStorage.getItem('alerta')
  if (alertaPendiente) {
    const { tipo, mensaje } = JSON.parse(alertaPendiente)
    mostrarAlerta(tipo, mensaje)
    sessionStorage.removeItem('alerta')
  }

  // Leer parámetros de la URL
  if (route.query.buscar) {
    filtros.buscar = route.query.buscar
    console.log('📥 Leyendo buscar de URL:', filtros.buscar)
  }
  if (route.query.categoria) filtros.categoria = route.query.categoria
  if (route.query.formato) filtros.formato = route.query.formato
  if (route.query.precio_min) filtros.precio_min = route.query.precio_min
  if (route.query.precio_max) filtros.precio_max = route.query.precio_max
  if (route.query.orden) filtros.orden = route.query.orden

  // Cargar opciones de filtros
  const [filtrosRes] = await Promise.allSettled([peliculaService.getFiltros()])
  if (filtrosRes.status === 'fulfilled') opcionesFiltros.value = filtrosRes.value.data
  
  // Cargar películas
  await cargar()
})
</script>

<style scoped>
.catalogo-wrapper { max-width: 1200px; margin: 0 auto; padding: 2rem 1rem; display: flex; flex-direction: column; }

/* Header - mantener igual */
.catalogo-top-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding-bottom: 1rem;
  margin-bottom: 1.5rem;
}
.header-izq { display: flex; flex-direction: column; gap: 0.2rem; }
.seccion-titulo {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 1.7rem;
  letter-spacing: 2px;
  color: #fff;
  margin: 0;
}

.total-txt { color: #888; font-size: 0.82rem;}

.catalogo-main .total-txt:first-of-type {
  margin-bottom: 1.5rem;
  display: inline-block;
}

.catalogo-main .total-txt:last-of-type {
  display: block;
  text-align: center;
  margin-top: 1.5rem;
}

.btn-agregar-peli {
  display: inline-flex; align-items: center; gap: 0.4rem;
  background: transparent;
  border: 1px solid var(--cine-rojo);
  color: var(--cine-rojo);
  padding: 0.4rem 0.9rem;
  border-radius: 0.4rem;
  text-decoration: none;
  font-size: 0.82rem;
  font-weight: 600;
  transition: background 0.2s, color 0.2s;
  white-space: nowrap;
}
.btn-agregar-peli:hover { background: var(--cine-rojo); color: #fff; }

/* Contenido */
.catalogo-contenido { display: flex; gap: 1.5rem; align-items: flex-start; }

/* Sidebar */
.sidebar-filtros {
  width: 260px;
  flex-shrink: 0;
  background: var(--cine-card);
  border: 1px solid var(--cine-borde);
  border-radius: 0.75rem;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.sidebar-titulo { color: #cbcbcb; font-size: 0.9rem; font-weight: 600; margin-bottom: 0.5rem; display: block; }
.filtro-grupo { display: flex; flex-direction: column; margin-bottom: 0.75rem; }
.sidebar-filtros label { color: #aaa; font-size: 0.8rem; margin-bottom: 0.4rem; }

.filtro-input {
  background: #1e1e30;
  border: 1px solid var(--cine-borde);
  color: #ddd;
  padding: 0.4rem 0.6rem;
  border-radius: 0.4rem;
  font-size: 0.82rem;
  width: 100%;
  outline: none;
}
.filtro-input:focus { border-color: var(--cine-rojo); }

.input-busqueda-contenedor { position: relative; display: flex; align-items: center; }
.input-busqueda-contenedor .filtro-input { padding-right: 2rem; }
.buscar-icono { position: absolute; right: 0.6rem; color: var(--cine-rojo); font-size: 0.85rem; pointer-events: none; }

.radio-opciones { display: flex; flex-direction: column; gap: 0.3rem; }
.form-check-radio { display: flex; align-items: center; gap: 0.5rem; }
.radio-input {
  appearance: none;
  background-color: #1e1e30;
  border: 1px solid var(--cine-borde);
  width: 0.9rem; height: 0.9rem;
  border-radius: 50%;
  cursor: pointer;
  display: grid;
  place-content: center;
  outline: none;
  flex-shrink: 0;
}
.radio-input:checked { border-color: var(--cine-rojo); background-color: var(--cine-rojo); }
.radio-input:checked::before { content: ""; width: 0.35rem; height: 0.35rem; border-radius: 50%; background: white; }
.radio-label { color: #ddd !important; font-size: 0.82rem !important; margin: 0 !important; cursor: pointer; }

.precio-fila { display: flex; gap: 0.5rem; }

.btn-aplicar {
  background: var(--cine-rojo); color: #fff; border: none;
  padding: 0.5rem; border-radius: 0.4rem; cursor: pointer;
  font-size: 0.85rem; font-weight: 550;
  display: flex; align-items: center; justify-content: center; gap: 0.4rem;
  margin-top: 0.5rem;
}
.btn-aplicar:hover { opacity: 0.9; }
.btn-limpiar {
  background: transparent; border: 1px solid var(--cine-borde); color: #888;
  padding: 0.4rem; border-radius: 0.4rem; cursor: pointer; font-size: 0.82rem;
  margin-top: 0.25rem;
}
.btn-limpiar:hover { border-color: #aaa; color: #ddd; }

/* Grid */
.catalogo-main { flex: 1; min-width: 0; }
.grid-peliculas { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem; }
@media (min-width: 576px) { .grid-peliculas { grid-template-columns: repeat(3, 1fr); } }
@media (min-width: 900px)  { .grid-peliculas { grid-template-columns: repeat(4, 1fr); } }

/* Paginación */
.paginacion-contenedor { display: flex; justify-content: center; margin-top: 2.5rem; }
.paginacion-lista { display: flex; list-style: none; padding: 0; margin: 0; gap: 0.3rem; }
.pag-link {
  background: var(--cine-card); border: 1px solid var(--cine-borde); color: #aaa;
  padding: 0.4rem 0.85rem; border-radius: 0.4rem; cursor: pointer; font-size: 0.85rem; transition: all 0.2s;
}
.pag-link:hover { background: #2a2a40; color: #fff; }
.pag-item.active .pag-link { background: var(--cine-rojo); border-color: var(--cine-rojo); color: #fff; font-weight: 600; }
.pag-item.disabled .pag-link { opacity: 0.3; cursor: not-allowed; }

.vacio { text-align: center; padding: 4rem 0; color: #888; }
.vacio i { font-size: 3rem; display: block; margin-bottom: 1rem; }
.loading-txt {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 0;
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

@media (max-width: 768px) {
  .catalogo-contenido { flex-direction: column; }
  .sidebar-filtros { width: 100%; }
  .catalogo-top-header { flex-direction: column; align-items: flex-start; gap: 0.75rem; }
}
</style>