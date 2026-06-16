<template>
  <nav class="navbar-cine sticky-top">
    <div class="nav-inner">
      <!-- Logo -->
      <RouterLink to="/" class="navbar-brand">
        🎬 CINE<span>STORE</span>
      </RouterLink>

      <!-- Botón hamburguesa -->
      <button class="menu-toggle" @click="menuAbierto = !menuAbierto">
        <i :class="menuAbierto ? 'pi pi-times' : 'pi pi-bars'"></i>
      </button>

      <!-- Búsqueda con autocompletado -->
    <div class="search-wrap" v-click-outside="cerrarSugerencias">
      <div class="search-inner">
        <input
          v-model="query"
          type="text"
          class="search-input"
          placeholder="Buscar película o director..."
          @keyup.enter="buscar"
          @input="onInput"
          @keydown.down.prevent="seleccionarAbajo"
          @keydown.up.prevent="seleccionarArriba"
          @keydown.escape="cerrarSugerencias"
          autocomplete="off"
        />
        <!-- Botón buscar -->
        <button class="search-btn" @click="buscar">
          <i class="pi pi-search"></i>
        </button>
      </div>

      <!-- Dropdown de sugerencias -->
        <div v-if="sugerencias.length && mostrarSugerencias" class="sugerencias-dropdown">
          <div
            v-for="(item, i) in sugerencias"
            :key="item.id"
            class="sugerencia-item"
            :class="{ activo: i === indiceActivo }"
            @click="elegir(item)"
          >
            <img
              :src="getImagen(item.id)"
              class="sug-img"
              @error="e => e.target.src = fallback"
            />
            <div class="sug-info">
              <span class="sug-titulo">{{ item.titulo }}</span>
              <span class="sug-meta">{{ item.anio_lanzamiento }} · ₡{{ formatPrecio(item.precio) }}</span>
            </div>
            <!-- Flecha en sugerencias -->
            <i class="pi pi-arrow-right sug-flecha"></i>
          </div>
        </div>
      </div>

      <!-- Links desktop con clases de estado activo -->
      <ul class="nav-links desktop-links">
        <li>
          <RouterLink 
            to="/" 
            class="nav-link" 
            exact-active-class="nav-link-active"
            @click="menuAbierto = false"
          >
            Inicio
          </RouterLink>
        </li>
        <li>
          <RouterLink 
            to="/catalogo" 
            class="nav-link" 
            active-class="nav-link-active"
            @click="menuAbierto = false"
          >
            Catálogo
          </RouterLink>
        </li>
      </ul>
    </div>

    <!-- Menú móvil desplegable con clases de estado activo -->
    <Transition name="mobile-menu">
      <div v-if="menuAbierto && esMovil" class="mobile-menu">
        <ul class="mobile-nav-links">
          <li>
            <RouterLink 
              to="/" 
              class="mobile-nav-link"
              exact-active-class="mobile-nav-link-active"
              @click="menuAbierto = false"
            >
              Inicio
            </RouterLink>
          </li>
          <li>
            <RouterLink 
              to="/catalogo" 
              class="mobile-nav-link"
              active-class="mobile-nav-link-active"
              @click="menuAbierto = false"
            >
              Catálogo
            </RouterLink>
          </li>
        </ul>
      </div>
    </Transition>
  </nav>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { categoriaService } from '../services/categoriaService'
import { peliculaService } from '../services/peliculaService'

const router = useRouter()
const route = useRoute()
const query = ref('')
const categorias = ref([])
const menuAbierto = ref(false)
const anchoVentana = ref(window.innerWidth)

const sugerencias      = ref([])
const mostrarSugerencias = ref(false)
const indiceActivo     = ref(-1)
const fallback         = 'https://placehold.co/40x60/1a1a2e/dc3545?text=?'
let debounceTimer      = null

const getImagen = (id) => {
  try {
    return new URL(`../assets/images/${id}.jpg`, import.meta.url).href
  } catch {
    return fallback
  }
}

const formatPrecio = (v) =>
  Number(v).toLocaleString('es-CR', { minimumFractionDigits: 0 })

const onInput = () => {
  indiceActivo.value = -1
  clearTimeout(debounceTimer)
  if (query.value.trim().length < 2) {
    sugerencias.value = []
    mostrarSugerencias.value = false
    return
  }
  // Debounce de 300ms para no spamear la API
  debounceTimer = setTimeout(async () => {
    try {
      const res = await peliculaService.buscar(query.value.trim())
      sugerencias.value = res.data
      mostrarSugerencias.value = true
    } catch {
      sugerencias.value = []
    }
  }, 300)
}

const elegir = (item) => {
  router.push({ name: 'pelicula', params: { id: item.id } })
  query.value = ''
  sugerencias.value = []
  mostrarSugerencias.value = false
  menuAbierto.value = false
}

const cerrarSugerencias = () => {
  mostrarSugerencias.value = false
  indiceActivo.value = -1
}

const seleccionarAbajo = () => {
  if (indiceActivo.value < sugerencias.value.length - 1) indiceActivo.value++
}

const seleccionarArriba = () => {
  if (indiceActivo.value > 0) indiceActivo.value--
}

// Si presiona Enter con una sugerencia seleccionada, navega directo
const buscar = () => {
  if (indiceActivo.value >= 0 && sugerencias.value[indiceActivo.value]) {
    elegir(sugerencias.value[indiceActivo.value])
    return
  }
  if (query.value.trim()) {
    router.push({ name: 'catalogo', query: { buscar: query.value } })
    query.value = ''
    sugerencias.value = []
    mostrarSugerencias.value = false
    menuAbierto.value = false
  }
}

// Computed para saber si es móvil (ancho <= 768px)
const esMovil = computed(() => anchoVentana.value <= 768)

// Función para manejar el resize
const handleResize = () => {
  const nuevoAncho = window.innerWidth
  const eraMovil = anchoVentana.value <= 768
  const esMovilAhora = nuevoAncho <= 768
  
  anchoVentana.value = nuevoAncho
  
  // Si cambió de móvil a escritorio, cerrar el menú
  if (eraMovil && !esMovilAhora) {
    menuAbierto.value = false
  }
}

onMounted(async () => {
  try {
    const res = await categoriaService.getAll()
    categorias.value = res.data
  } catch (e) {
    console.error('Error cargando categorías', e)
  }
  
  // Escuchar evento de resize
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  // Limpiar evento al desmontar
  window.removeEventListener('resize', handleResize)
})

</script>

<style scoped>
.search-wrap { position: relative; }
.search-inner { display: flex; flex: 1; max-width: 380px; margin: 0 auto; }

.sugerencias-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: #1a1a2e;
  border: 1px solid #2a2a40;
  border-radius: 0.5rem;
  overflow: hidden;
  z-index: 200;
  box-shadow: 0 8px 24px rgba(0,0,0,.5);
}

.sugerencia-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 0.85rem;
  cursor: pointer;
  transition: background 0.15s;
  border-bottom: 1px solid #2a2a40;
}
.sugerencia-item:last-child { border-bottom: none; }
.sugerencia-item:hover,
.sugerencia-item.activo { background: #141420; }

.sug-img {
  width: 32px;
  height: 48px;
  object-fit: cover;
  border-radius: 3px;
  flex-shrink: 0;
  border: 1px solid #2a2a40;
}

.sug-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  min-width: 0;
}
.sug-titulo {
  color: #fff;
  font-size: 0.82rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.sug-meta {
  color: #888;
  font-size: 0.72rem;
}
.sug-flecha {
  color: #555;
  font-size: 0.75rem;
  flex-shrink: 0;
}

.navbar-cine {
  background-color: var(--cine-gris);
  border-bottom: 1px solid var(--cine-borde);
  position: sticky;
  top: 0;
  z-index: 100;
}
.nav-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0.75rem 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}
.navbar-brand {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 1.7rem;
  letter-spacing: 3px;
  color: #fff;
  text-decoration: none;
  white-space: nowrap;
}
.navbar-brand span { color: var(--cine-rojo); }

.nav-link {
  color: #aaa;
  text-decoration: none;
  font-size: 0.9rem;
  padding: 0.4rem 0.8rem;
  border-radius: 0.3rem;
  transition: all 0.2s ease;
  position: relative;
}

.nav-link:hover {
  color: #aaa;
  background: rgba(220, 53, 70, 0.1);
  text-decoration: none;
}


.nav-link-active {
  color: var(--cine-rojo) !important;
  background: rgba(220, 53, 70, 0.026);
  font-weight: 600;
}

.nav-link-active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 60%;
  height: 2px;
  background: var(--cine-rojo);
  border-radius: 2px;
}

.nav-link-active:hover {
  color: var(--cine-rojo) !important;
  background: rgba(220, 53, 70, 0.11);
}

/* Botón menú hamburguesa - visible solo en móvil */
.menu-toggle {
  display: none;
  background: transparent;
  border: none;
  color: #fff;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.25rem;
  margin-left: auto;
}

.search-wrap {
  display: flex;
  flex: 1;
  max-width: 380px;
  margin: 0 auto;
}
.search-input {
  flex: 1;
  background: #1e1e30;
  border: 1px solid var(--cine-borde);
  border-right: none;
  color: #ddd;
  padding: 0.45rem 0.75rem;
  border-radius: 0.5rem 0 0 0.5rem;
  font-size: 0.875rem;
  outline: none;
}
.search-input:focus { border-color: var(--cine-rojo); }
.search-input::placeholder { color: #555; }
.search-btn {
  background: var(--cine-rojo);
  border: none;
  color: #fff;
  padding: 0 0.9rem;
  border-radius: 0 0.5rem 0.5rem 0;
  cursor: pointer;
}
.nav-links {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-left: auto;
}
.nav-links a {
  color: #aaa;
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.2s;
}
.nav-links a:hover,
.nav-links a.router-link-active { color: #fff; }

/* Menú móvil */
.mobile-menu {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: var(--cine-gris);
  border-bottom: 1px solid var(--cine-borde);
  padding: 1rem;
  z-index: 99;
}
.mobile-nav-links {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.mobile-nav-links a {
  color: #ddd;
  text-decoration: none;
  font-size: 0.9rem;
  display: block;
  padding: 0.5rem 0;
  transition: color 0.2s;
}
.mobile-nav-links a:hover,
.mobile-nav-links a.router-link-active {
  color: var(--cine-rojo);
}

.mobile-nav-link {
  color: #ddd;
  text-decoration: none;
  font-size: 0.9rem;
  display: block;
  padding: 0.5rem 0;
  transition: all 0.2s ease;
  border-radius: 0.3rem;
  padding: 0.5rem 0.8rem;
}

.mobile-nav-link:hover {
  color: #fff;
  background: rgba(220, 53, 69, 0.1);
}

.mobile-nav-link-active {
  color: var(--cine-rojo) !important;
  background: rgba(220, 53, 69, 0.15);
  font-weight: 600;
}

.mobile-nav-link-active:hover {
  color: var(--cine-rojo) !important;
  background: rgba(220, 53, 69, 0.25);
}

/* Animación del menú móvil */
.mobile-menu-enter-active,
.mobile-menu-leave-active {
  transition: all 0.3s ease;
}
.mobile-menu-enter-from,
.mobile-menu-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Responsive: móvil */
@media (max-width: 768px) {
  .menu-toggle {
    display: block;
  }
  
  .search-wrap {
    display: none;
  }
  
  .desktop-links {
    display: none;
  }
}

/* Tablet: ocultar búsqueda también en pantallas pequeñas */
@media (max-width: 600px) {
  .search-wrap {
    display: none;
  }
}
</style>