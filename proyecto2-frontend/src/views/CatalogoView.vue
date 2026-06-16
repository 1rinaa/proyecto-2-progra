<template>
  <!-- Alerta de éxito/error -->
  <GlobalAlerta
    :tipo="alerta.tipo"
    :mensaje="alerta.mensaje"
    @cerrar="alerta.mensaje = ''"
  />

  <div class="catalogo-wrapper">

    <!-- Header -->
    <div class="flex justify-content-between align-items-end pb-3 mb-4" style="border-bottom: 1px solid var(--cine-borde)">
      <h1 class="seccion-titulo m-0">
        <i class="pi pi-video mr-2 icono-titulo"></i> Catálogo de Películas
      </h1>
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

    <div class="flex gap-4 align-items-start">

      <!-- ── Sidebar filtros ── -->
      <aside class="sidebar-filtros">
        <span class="sidebar-titulo">FILTROS</span>

        <!-- Buscar -->
        <div class="filtro-grupo">
          <label class="filtro-label">Buscar</label>
          <IconField>
            <InputIcon class="pi pi-search" style="color: var(--cine-rojo)" />
            <InputText
              v-model="filtros.buscar"
              placeholder="Título o director..."
              class="filtro-input w-full"
              @keyup.enter="aplicarFiltros"
            />
          </IconField>
        </div>

        <!-- Categoría -->
        <div class="filtro-grupo">
          <label class="filtro-label">Categoría</label>
          <div class="flex flex-column gap-2">
            <div class="flex align-items-center gap-2">
              <RadioButton inputId="cat-todas" value="" v-model="filtros.categoria" />
              <label for="cat-todas" class="radio-label">Todas</label>
            </div>
            <div v-for="c in opcionesFiltros.categorias" :key="c.id" class="flex align-items-center gap-2">
              <RadioButton :inputId="'cat-' + c.id" :value="c.slug" v-model="filtros.categoria" />
              <label :for="'cat-' + c.id" class="radio-label">{{ c.nombre }}</label>
            </div>
          </div>
        </div>

        <!-- Formato -->
        <div class="filtro-grupo">
          <label class="filtro-label">Formato</label>
          <Select
            v-model="filtros.formato"
            :options="[{ label: 'Todos', value: '' }, ...opcionesFiltros.formatos.map(f => ({ label: f, value: f }))]"
            optionLabel="label"
            optionValue="value"
            class="filtro-input w-full"
          />
        </div>

        <!-- Precio -->
        <div class="filtro-grupo">
          <label class="filtro-label">Precio (₡)</label>
          <div class="flex gap-2">
            <InputNumber
              v-model="filtros.precio_min"
              placeholder="Mín"
              :min="0"
              :useGrouping="false"
              class="filtro-input w-full"
              inputClass="w-full"
            />
            <InputNumber
              v-model="filtros.precio_max"
              placeholder="Máx"
              :min="0"
              :useGrouping="false"
              class="filtro-input w-full"
              inputClass="w-full"
            />
          </div>
        </div>

        <!-- Ordenar -->
        <div class="filtro-grupo">
          <label class="filtro-label">Ordenar por</label>
          <Select
            v-model="filtros.orden"
            :options="opcionesOrden"
            optionLabel="label"
            optionValue="value"
            class="filtro-input w-full"
          />
        </div>

        <!-- Botones filtro -->
        <Button
          label="Aplicar filtros"
          icon="pi pi-filter"
          class="btn-rojo-solid w-full mt-2"
          @click="aplicarFiltros"
        />
        <Button
          label="Limpiar"
          text
          class="btn-limpiar w-full mt-1"
          @click="limpiarFiltros"
        />
      </aside>

      <!-- ── Contenido principal ── -->
      <main class="flex-1 min-w-0">

        <span v-if="!loading" class="total-txt block mb-3">
          {{ paginacion.total }} película(s) encontradas
        </span>

        <!-- Loading -->
        <div v-if="loading" class="flex flex-column align-items-center justify-content-center py-6 gap-3">
          <ProgressSpinner strokeWidth="3" style="width:40px;height:40px" />
          <span class="text-color-secondary text-sm">Cargando películas...</span>
        </div>

        <!-- Vacío -->
        <div v-else-if="peliculas.length === 0" class="flex flex-column align-items-center py-6 gap-3" style="color:#888">
          <i class="pi pi-inbox" style="font-size:3rem"></i>
          <p class="m-0">No hay películas con esos filtros.</p>
        </div>

        <!-- Grid -->
        <div v-else class="grid-peliculas">
          <PeliculaCard v-for="p in peliculas" :key="p.id" :pelicula="p" />
        </div>

        <!-- Paginación -->
        <div v-if="paginacion.last_page > 1" class="flex justify-content-center mt-5">
          <Paginator
            :first="(paginacion.current_page - 1) * 12"
            :rows="12"
            :totalRecords="paginacion.total"
            :pageLinkSize="5"
            @page="e => cambiarPagina(e.page + 1)"
            class="cine-paginator"
          />
        </div>

        <span v-if="!loading" class="total-txt block text-center mt-3">
          Mostrando {{ peliculas.length }} de {{ paginacion.total }} película(s)
        </span>

      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import Button         from 'primevue/button'
import InputText      from 'primevue/inputtext'
import InputNumber    from 'primevue/inputnumber'
import Select         from 'primevue/select'
import RadioButton    from 'primevue/radiobutton'
import IconField      from 'primevue/iconfield'
import InputIcon      from 'primevue/inputicon'
import ProgressSpinner from 'primevue/progressspinner'
import Paginator      from 'primevue/paginator'

import PeliculaCard from '../components/PeliculaCard.vue'
import GlobalAlerta from '../components/GlobalAlerta.vue'
import { peliculaService } from '../services/peliculaService'

// ✅ Script 100% intacto — solo se agregan imports PrimeVue arriba
const route  = useRoute()
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

const opcionesOrden = [
  { label: 'Más recientes',          value: 'reciente'    },
  { label: 'Precio: menor a mayor',  value: 'precio_asc'  },
  { label: 'Precio: mayor a menor',  value: 'precio_desc' },
  { label: 'Título A-Z',             value: 'titulo'      },
  { label: 'Mejor calificación',     value: 'calificacion'},
]

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
const mostrarAlerta = (tipo, mensaje) => { alerta.tipo = tipo; alerta.mensaje = mensaje }

const cargar = async () => {
  loading.value = true
  try {
    const params = Object.fromEntries(
      Object.entries(filtros).filter(([, v]) => v !== '' && v !== null && v !== undefined)
    )
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

const aplicarFiltros = () => {
  filtros.page = 1
  const queryParams = {}
  if (filtros.buscar)    queryParams.buscar     = filtros.buscar
  if (filtros.categoria) queryParams.categoria  = filtros.categoria
  if (filtros.formato)   queryParams.formato    = filtros.formato
  if (filtros.precio_min) queryParams.precio_min = filtros.precio_min
  if (filtros.precio_max) queryParams.precio_max = filtros.precio_max
  if (filtros.orden && filtros.orden !== 'reciente') queryParams.orden = filtros.orden
  router.replace({ query: queryParams })
  cargar()
}

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

watch(() => route.query, (newQuery) => {
  if (newQuery.buscar !== undefined && newQuery.buscar !== filtros.buscar) {
    filtros.buscar = newQuery.buscar || ''
    cargar()
  }
}, { deep: true, immediate: true })

onMounted(async () => {
  const alertaPendiente = sessionStorage.getItem('alerta')
  if (alertaPendiente) {
    const { tipo, mensaje } = JSON.parse(alertaPendiente)
    mostrarAlerta(tipo, mensaje)
    sessionStorage.removeItem('alerta')
  }
  if (route.query.buscar)    filtros.buscar     = route.query.buscar
  if (route.query.categoria) filtros.categoria  = route.query.categoria
  if (route.query.formato)   filtros.formato    = route.query.formato
  if (route.query.precio_min) filtros.precio_min = route.query.precio_min
  if (route.query.precio_max) filtros.precio_max = route.query.precio_max
  if (route.query.orden)     filtros.orden      = route.query.orden

  const [filtrosRes] = await Promise.allSettled([peliculaService.getFiltros()])
  if (filtrosRes.status === 'fulfilled') opcionesFiltros.value = filtrosRes.value.data
  await cargar()
})
</script>

<style scoped>
.catalogo-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.seccion-titulo {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 1.7rem;
  letter-spacing: 2px;
  color: #fff;
}

.icono-titulo {
  font-size: 2rem; /* Ajusta según necesites */
  vertical-align: middle;
}

.total-txt { color: #888; font-size: 0.82rem; }

/* ── Sidebar ── */
.sidebar-filtros {
  width: 240px;
  flex-shrink: 0;
  background: var(--cine-card);
  border: 1px solid var(--cine-borde);
  border-radius: 0.75rem;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.sidebar-titulo {
  color: #cbcbcb;
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  display: block;
}
.filtro-grupo {
  display: flex;
  flex-direction: column;
  margin-bottom: 0.75rem;
}
.filtro-label {
  color: #aaa;
  font-size: 0.8rem;
  margin-bottom: 0.4rem;
}
.radio-label {
  color: #ddd;
  font-size: 0.82rem;
  cursor: pointer;
}

/* Inputs PrimeVue teñidos con el tema oscuro */
:deep(.filtro-input .p-inputtext),
:deep(.filtro-input.p-inputtext),
:deep(.filtro-input .p-select-label) {
  background: #1e1e30;
  border-color: var(--cine-borde);
  color: #ddd;
  font-size: 0.82rem;
}
:deep(.filtro-input .p-select),
:deep(.filtro-input.p-select) {
  background: #1e1e30;
  border-color: var(--cine-borde);
}
:deep(.filtro-input .p-inputtext:focus),
:deep(.filtro-input.p-inputtext:focus) {
  border-color: var(--cine-rojo);
  box-shadow: none;
}

/* RadioButton color rojo */
:deep(.p-radiobutton.p-highlight .p-radiobutton-box) {
  background: var(--cine-rojo);
  border-color: var(--cine-rojo);
}

/* Botón aplicar */
:deep(.btn-rojo-solid.p-button) {
  background: var(--cine-rojo);
  border-color: var(--cine-rojo);
  font-size: 0.85rem;
  justify-content: center;
}
:deep(.btn-rojo-solid.p-button:hover) { opacity: 0.9; background: var(--cine-rojo); }

/* Botón outlined rojo (header) */
:deep(.btn-rojo-outlined.p-button) {
  color: var(--cine-rojo);
  border-color: var(--cine-rojo);
  font-size: 0.82rem;
}
:deep(.btn-rojo-outlined.p-button:hover) {
  background: var(--cine-rojo);
  color: #fff;
  border-color:  var(--cine-rojo);
}

/* Botón limpiar */
:deep(.btn-limpiar.p-button) {
  color: #888;
  border: 1px solid var(--cine-borde);
  font-size: 0.82rem;
  justify-content: center;
}
:deep(.btn-limpiar.p-button:hover) { color: #ddd; border-color: #aaa; background: transparent; }

/* Grid películas */
.grid-peliculas {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}
@media (min-width: 576px) { .grid-peliculas { grid-template-columns: repeat(3, 1fr); } }
@media (min-width: 900px)  { .grid-peliculas { grid-template-columns: repeat(4, 1fr); } }

/* Paginator tema cine */
:deep(.cine-paginator.p-paginator) {
  background: transparent;
  border: none;
}
:deep(.cine-paginator .p-paginator-page),
:deep(.cine-paginator .p-paginator-prev),
:deep(.cine-paginator .p-paginator-next) {
  background: var(--cine-card);
  border: 1px solid var(--cine-borde);
  color: #aaa;
  border-radius: 0.4rem;
  min-width: 2rem;
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
:deep(.cine-paginator .p-paginator-page.p-paginator-page-selected) {
  background: var(--cine-rojo) !important;
  border-color: var(--cine-rojo) !important;
  color: #fff !important;
  font-weight: 600;
}

@media (max-width: 768px) {
  .flex.gap-4 { flex-direction: column; }
  .sidebar-filtros { width: 100%; }
}
</style>