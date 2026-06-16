<template>
  <div class="container">

    <!-- Alerta global -->
    <GlobalAlerta
      :tipo="alertaLocal.tipo"
      :mensaje="alertaLocal.mensaje"
      @cerrar="alertaLocal.mensaje = ''"
    />

    <!-- Breadcrumb -->
    <nav class="flex align-items-center gap-1 mb-3" style="font-size:0.82rem">
      <RouterLink to="/" class="bc-link">Inicio</RouterLink>
      <span class="bc-sep">›</span>
      <RouterLink to="/catalogo" class="bc-link">Catálogo</RouterLink>
      <template v-if="esEdicion">
        <span class="bc-sep">›</span>
        <RouterLink :to="`/peliculas/${route.params.id}`" class="bc-link">{{ form.titulo || '...' }}</RouterLink>
      </template>
      <span class="bc-sep">›</span>
      <span style="color:#fff">{{ esEdicion ? 'Editar' : 'Agregar película' }}</span>
    </nav>

    <h1 class="seccion-titulo">
      <i :class="esEdicion ? 'pi pi-pencil' : 'pi pi-plus-circle'" class="mr-2 icono-titulo"></i>
      {{ esEdicion ? 'Editar Película' : 'Agregar Película' }}
    </h1>

    <!-- Errores de validación -->
      <div v-if="Object.keys(errores).length" class="alerta-error">
        <i class="pi pi-exclamation-triangle mr-2"></i>
        <strong>Corrija los siguientes errores:</strong>
        <ul class="mt-1 mb-0 pl-3">
          <li v-for="(msgs, campo) in errores" :key="campo">{{ msgs[0] }}</li>
        </ul>
      </div>

    <!-- Loading -->
    <div v-if="loading" class="flex align-items-center justify-content-center py-6 gap-3">
      <ProgressSpinner strokeWidth="3" style="width:40px;height:40px" />
    </div>

    <form v-else @submit.prevent="guardar">

      <!-- ── Sección 1: Info principal ── -->
      <div class="form-seccion">
        <p class="form-seccion-titulo">
          <i class="pi pi-info-circle mr-1"></i> Información principal
        </p>

        <div class="fila-2">
          <div class="form-group">
            <label class="campo-label">Título <span class="req">*</span></label>
            <InputText v-model="form.titulo" class="w-full input-cine" />
          </div>
          <div class="form-group">
            <label class="campo-label">Título original</label>
            <InputText v-model="form.titulo_original" class="w-full input-cine" />
          </div>
        </div>

        <div class="fila-3">
          <div class="form-group">
            <label class="campo-label">Director <span class="req">*</span></label>
            <InputText v-model="form.director" class="w-full input-cine" />
          </div>
          <div class="form-group">
            <label class="campo-label">Año de lanzamiento <span class="req">*</span></label>
            <InputNumber v-model="form.anio_lanzamiento" :min="1888" :max="2026" :useGrouping="false" class="w-full input-cine" inputClass="w-full" />
          </div>
          <div class="form-group">
            <label class="campo-label">Duración (min) <span class="req">*</span></label>
            <InputNumber v-model="form.duracion_minutos" :min="0" :useGrouping="false" class="w-full input-cine" inputClass="w-full" />
          </div>
        </div>

        <div class="form-group">
          <label class="campo-label">Descripción breve <span class="req">*</span></label>
          <Textarea v-model="form.descripcion" rows="2" class="w-full input-cine" autoResize />
        </div>
        <div class="form-group">
          <label class="campo-label">Sinopsis</label>
          <Textarea v-model="form.sinopsis" rows="4" class="w-full input-cine" autoResize />
        </div>
      </div>

      <!-- ── Sección 2: Clasificación y formato ── -->
      <div class="form-seccion">
        <p class="form-seccion-titulo">
          <i class="pi pi-tag mr-1"></i> Clasificación y formato
        </p>

        <div class="fila-3">
          <div class="form-group">
            <label class="campo-label">Categoría <span class="req">*</span></label>
            <Select
              v-model="form.categoria_id"
              :options="[{ label: 'Seleccione...', value: '' }, ...categorias.map(c => ({ label: c.nombre, value: c.id }))]"
              optionLabel="label"
              optionValue="value"
              class="w-full input-cine"
            />
          </div>
          <div class="form-group">
            <label class="campo-label">Clasificación <span class="req">*</span></label>
            <Select
              v-model="form.clasificacion"
              :options="[{ label: 'Seleccione...', value: '' }, ...clasificaciones.map(c => ({ label: c, value: c }))]"
              optionLabel="label"
              optionValue="value"
              class="w-full input-cine"
            />
          </div>
          <div class="form-group">
            <label class="campo-label">Formato <span class="req">*</span></label>
            <Select
              v-model="form.formato"
              :options="[{ label: 'Seleccione...', value: '' }, ...formatos.map(f => ({ label: f, value: f }))]"
              optionLabel="label"
              optionValue="value"
              class="w-full input-cine"
            />
          </div>
        </div>

        <div class="fila-3">
          <div class="form-group">
            <label class="campo-label">Idioma original <span class="req">*</span></label>
            <InputText v-model="form.idioma_original" class="w-full input-cine" />
          </div>
          <div class="form-group">
            <label class="campo-label">Idiomas disponibles <small style="color:#666">(separados por coma)</small></label>
            <InputText v-model="form.idiomas_disponibles" placeholder="Español, Inglés..." class="w-full input-cine" />
          </div>
          <div class="form-group">
            <label class="campo-label">Subtítulos <small style="color:#666">(separados por coma)</small></label>
            <InputText v-model="form.subtitulos" placeholder="Español, Inglés..." class="w-full input-cine" />
          </div>
        </div>

        <!-- Géneros como chips con Checkbox -->
        <div class="form-group">
          <label class="campo-label">Géneros</label>
          <div class="generos-grid">
            <label
              v-for="g in generos"
              :key="g.id"
              class="genero-chip"
              :class="{ activo: form.generos.includes(g.id) }"
            >
              <Checkbox :value="g.id" v-model="form.generos" class="chip-check" />
              {{ g.nombre }}
            </label>
          </div>
        </div>
      </div>

      <!-- ── Sección 3: Precios e inventario ── -->
      <div class="form-seccion">
        <p class="form-seccion-titulo">
          <i class="pi pi-dollar mr-1"></i> Precios e inventario
        </p>
        <div class="fila-3">
          <div class="form-group">
            <label class="campo-label">Precio de venta (₡) <span class="req">*</span></label>
            <InputNumber v-model="form.precio" :min="0" :minFractionDigits="0" :maxFractionDigits="2" :useGrouping="false" class="w-full input-cine" inputClass="w-full" />
          </div>
          <div class="form-group">
            <label class="campo-label">Precio de alquiler (₡)</label>
            <InputNumber v-model="form.precio_alquiler" :min="0" :minFractionDigits="0" :maxFractionDigits="2" :useGrouping="false" class="w-full input-cine" inputClass="w-full" />
          </div>
          <div class="form-group">
            <label class="campo-label">Stock <span class="req">*</span></label>
            <InputNumber v-model="form.stock" :min="0" :useGrouping="false" class="w-full input-cine" inputClass="w-full" />
          </div>
        </div>
      </div>

      <!-- ── Sección 4: Multimedia y calificaciones ── -->
      <div class="form-seccion">
        <p class="form-seccion-titulo">
          <i class="pi pi-star mr-1"></i> Multimedia y calificaciones
        </p>

        <div class="form-group">
          <label class="campo-label">URL portada <small style="color:#666">(ruta o URL de imagen)</small></label>
          <InputText v-model="form.imagen_portada" class="w-full input-cine" />
        </div>

        <div class="fila-3">
          <div class="form-group">
            <label class="campo-label">URL del trailer</label>
            <InputText v-model="form.trailer_url" placeholder="https://youtube.com/..." class="w-full input-cine" />
          </div>
          <div class="form-group">
            <label class="campo-label">Calificación IMDb <span class="req">*</span></label>
            <InputNumber v-model="form.calificacion_imdb" :min="0" :max="10" :minFractionDigits="1" :maxFractionDigits="1" :useGrouping="false" class="w-full input-cine" inputClass="w-full" />
          </div>
          <div class="form-group">
            <label class="campo-label">Calificación local <span class="req">*</span></label>
            <InputNumber v-model="form.calificacion_local" :min="0" :max="10" :minFractionDigits="1" :maxFractionDigits="1" :useGrouping="false" class="w-full input-cine" inputClass="w-full" />
          </div>
        </div>

        <!-- Toggles con ToggleSwitch -->
        <div class="flex gap-5 flex-wrap pt-2">
          <div class="flex align-items-center gap-2">
            <ToggleSwitch v-model="form.destacado" />
            <label style="color:#aaa; font-size:0.85rem; cursor:pointer">Película destacada</label>
          </div>
          <div class="flex align-items-center gap-2">
            <ToggleSwitch v-model="form.disponible" />
            <label style="color:#aaa; font-size:0.85rem; cursor:pointer">Disponible en catálogo</label>
          </div>
        </div>
      </div>

      <!-- Botones -->
      <div class="flex flex-wrap gap-2 align-items-center mt-2">
        <Button
          type="submit"
          :label="guardando ? 'Guardando...' : (esEdicion ? 'Guardar cambios' : 'Guardar película')"
          icon="pi pi-save"
          :class="esEdicion ? 'btn-warning-solid' : 'btn-rojo-solid'"
          :disabled="guardando"
          :loading="guardando"
        />
        <RouterLink :to="esEdicion ? `/peliculas/${route.params.id}` : '/catalogo'">
          <Button label="Cancelar" outlined class="btn-sec-outlined" />
        </RouterLink>
        <RouterLink v-if="esEdicion" :to="`/peliculas/${route.params.id}/eliminar`" class="ml-auto">
          <Button label="Eliminar esta película" icon="pi pi-trash" outlined class="btn-rojo-outlined" />
        </RouterLink>
      </div>

    </form>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import Button          from 'primevue/button'
import InputText       from 'primevue/inputtext'
import InputNumber     from 'primevue/inputnumber'
import Textarea        from 'primevue/textarea'
import Select          from 'primevue/select'
import Checkbox        from 'primevue/checkbox'
import ToggleSwitch    from 'primevue/toggleswitch'
import ProgressSpinner from 'primevue/progressspinner'

import GlobalAlerta from '../components/GlobalAlerta.vue'
import { peliculaService } from '../services/peliculaService'

// ✅ Script 100% intacto
const route  = useRoute()
const router = useRouter()

const esEdicion = computed(() => !!route.params.id && route.name === 'pelicula-editar')

const loading   = ref(true)
const guardando = ref(false)
const errores   = ref({})

const alertaLocal = reactive({ tipo: 'error', mensaje: '' })

const categorias      = ref([])
const generos         = ref([])
const formatos        = ['DVD', 'Blu-ray', '4K UHD', 'Digital']
const clasificaciones = ['G', 'PG', 'PG-13', 'R', 'NC-17']

const form = reactive({
  titulo: '', titulo_original: '', descripcion: '', sinopsis: '',
  categoria_id: '', director: '', anio_lanzamiento: '', duracion_minutos: '',
  clasificacion: '', idioma_original: '', formato: '', precio: '',
  precio_alquiler: '', stock: '', imagen_portada: '', trailer_url: '',
  calificacion_imdb: '', calificacion_local: '', destacado: false,
  disponible: true, idiomas_disponibles: '', subtitulos: '', generos: [],
})

const validarNumerosNoNegativos = () => {
  const erroresNumericos = []
  if (form.anio_lanzamiento && (form.anio_lanzamiento < 1888 || form.anio_lanzamiento > new Date().getFullYear() + 2))
    erroresNumericos.push('El año de lanzamiento debe estar entre 1888 y el año actual + 2')
  if (form.duracion_minutos !== '' && form.duracion_minutos !== null) {
    const d = Number(form.duracion_minutos)
    if (isNaN(d) || d < 1) erroresNumericos.push('La duración debe ser mayor a 0 minutos')
    if (d > 600) erroresNumericos.push('La duración no puede exceder los 600 minutos')
  }
  if (form.precio !== '' && form.precio !== null && Number(form.precio) < 0)
    erroresNumericos.push('El precio de venta no puede ser negativo')
  if (form.precio_alquiler !== '' && form.precio_alquiler !== null && Number(form.precio_alquiler) < 0)
    erroresNumericos.push('El precio de alquiler no puede ser negativo')
  if (form.stock !== '' && form.stock !== null && Number(form.stock) < 0)
    erroresNumericos.push('El stock no puede ser negativo')
  if (form.calificacion_imdb !== '' && form.calificacion_imdb !== null) {
    const c = Number(form.calificacion_imdb)
    if (isNaN(c) || c < 0 || c > 10) erroresNumericos.push('La calificación IMDb debe estar entre 0 y 10')
  }
  if (form.calificacion_local !== '' && form.calificacion_local !== null) {
    const c = Number(form.calificacion_local)
    if (isNaN(c) || c < 0 || c > 10) erroresNumericos.push('La calificación local debe estar entre 0 y 10')
  }
  return erroresNumericos
}

const sanitizarNumeros = () => {
  if (form.anio_lanzamiento && Number(form.anio_lanzamiento) < 0) form.anio_lanzamiento = new Date().getFullYear()
  if (form.duracion_minutos && Number(form.duracion_minutos) < 0) form.duracion_minutos = 1
  if (form.precio && Number(form.precio) < 0) form.precio = 0
  if (form.precio_alquiler && Number(form.precio_alquiler) < 0) form.precio_alquiler = 0
  if (form.stock && Number(form.stock) < 0) form.stock = 0
  if (form.calificacion_imdb) { const c = Number(form.calificacion_imdb); if (c < 0) form.calificacion_imdb = 0; if (c > 10) form.calificacion_imdb = 10 }
  if (form.calificacion_local) { const c = Number(form.calificacion_local); if (c < 0) form.calificacion_local = 0; if (c > 10) form.calificacion_local = 10 }
}

const validarFormulario = () => {
  const erroresNumericos = validarNumerosNoNegativos()
  if (erroresNumericos.length > 0) {
    alertaLocal.tipo = 'error'
    alertaLocal.mensaje = erroresNumericos.join('. ')
    return false
  }
  return true
}

onMounted(async () => {
  const res = await peliculaService.getFiltros()
  categorias.value = res.data.categorias
  generos.value    = res.data.generos
  if (esEdicion.value) {
    try {
      const r = await peliculaService.getById(route.params.id)
      const p = r.data.pelicula
      Object.assign(form, {
        ...p,
        idiomas_disponibles: p.idiomas_disponibles?.join(', ') ?? '',
        subtitulos:          p.subtitulos?.join(', ') ?? '',
        generos:             p.generos?.map(g => g.id) ?? [],
      })
    } catch { router.push({ name: 'catalogo' }) }
  }
  loading.value = false
})

const guardar = async () => {
  guardando.value = true
  errores.value = {}
  alertaLocal.mensaje = ''
  sanitizarNumeros()
  if (!validarFormulario()) {
    guardando.value = false
    window.scrollTo({ top: 0, behavior: 'smooth' })
    return
  }
  try {
    let peliculaId
    if (esEdicion.value) {
      await peliculaService.update(route.params.id, form)
      peliculaId = route.params.id
    } else {
      const res = await peliculaService.create(form)
      peliculaId = res.data.id
    }
    sessionStorage.setItem('alerta', JSON.stringify({
      tipo: 'exito',
      mensaje: `Película "${form.titulo}" ${esEdicion.value ? 'actualizada' : 'creada'} correctamente.`
    }))
    router.push({ name: 'pelicula', params: { id: peliculaId } })
  } catch (e) {
    if (e.response?.status === 422) {
      errores.value = e.response.data.errors
      alertaLocal.tipo = 'error'
      alertaLocal.mensaje = 'Por favor corrige los errores en el formulario.'
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      alertaLocal.tipo = 'error'
      alertaLocal.mensaje = e.response?.data?.message || 'Error al guardar la película. Intenta de nuevo.'
    }
  } finally {
    guardando.value = false
  }
}
</script>

<style scoped>
.container { max-width: 860px; margin: 0 auto; padding: 2rem 1rem; }

.bc-link { color: #888; text-decoration: none; }
.bc-link:hover { color: #fff; }
.bc-sep { color: #555; margin: 0 0.3rem; }

.seccion-titulo {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 1.8rem;
  letter-spacing: 2px;
  color: #fff;
  margin-bottom: 1.5rem;
}

.icono-titulo {
  font-size: 2rem; /* Ajusta según necesites */
  vertical-align: middle;
}

/* Secciones */
.form-seccion {
  background: var(--cine-card);
  border: 1px solid var(--cine-borde);
  border-radius: 0.75rem;
  margin-bottom: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 2rem;
}
.form-seccion-titulo {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: var(--cine-rojo);
  margin: 0 0 0.25rem 0;
  padding-bottom: 0.6rem;
  border-bottom: 1px solid var(--cine-borde);
}

/* Grids de campos */
.fila-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
.fila-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.75rem; }
@media (max-width: 640px) { .fila-2, .fila-3 { grid-template-columns: 1fr; } }

.form-group { display: flex; flex-direction: column; gap: 0.3rem; }
.campo-label { color: #aaa; font-size: 0.8rem; }
.req { color: var(--cine-rojo); font-weight: 700; }

/* Inputs oscuros */
:deep(.input-cine.p-inputtext),
:deep(.input-cine .p-inputtext),
:deep(.input-cine.p-textarea) {
  background: #12122a;
  border-color: var(--cine-borde);
  color: #e0e0e0;
  font-size: 0.875rem;
}
:deep(.input-cine.p-inputtext:focus),
:deep(.input-cine .p-inputtext:focus),
:deep(.input-cine.p-textarea:focus) {
  border-color: var(--cine-rojo);
  box-shadow: 0 0 0 2px rgba(220,53,69,.2);
}
:deep(.input-cine.p-select),
:deep(.input-cine .p-select) {
  background: #12122a;
  border-color: var(--cine-borde);
}
:deep(.input-cine .p-select-label) { color: #e0e0e0; font-size: 0.875rem; }

/* Géneros chips */
.generos-grid { display: flex; flex-wrap: wrap; gap: 0.4rem; margin-top: 0.25rem; }
.genero-chip {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  background: #12122a;
  border: 1px solid var(--cine-borde);
  color: #888;
  font-size: 0.8rem;
  padding: 0.3rem 0.7rem;
  border-radius: 999px;
  cursor: pointer;
  transition: border-color 0.2s, color 0.2s, background 0.2s;
  user-select: none;
}
.genero-chip:hover { border-color: #555; color: #ccc; }
.genero-chip.activo {
  background: rgba(220,53,69,.15);
  border-color: var(--cine-rojo);
  color: #f1aeb5;
}
/* Ocultar el checkbox visual dentro del chip */
:deep(.chip-check) {
  display: none !important;
}

/* ToggleSwitch rojo */
:deep(.p-toggleswitch.p-toggleswitch-checked .p-toggleswitch-slider) {
  background: var(--cine-rojo);
  border-color: var(--cine-rojo);
}

/* Botones */
:deep(.btn-rojo-solid.p-button) {
  background: var(--cine-rojo);
  border-color: var(--cine-rojo);
  color: #fff;
  font-weight: 600;
}
:deep(.btn-rojo-solid.p-button:hover) { opacity: 0.85; background: var(--cine-rojo); }

:deep(.btn-warning-solid.p-button) {
  background: #ffc107;
  border-color: #ffc107;
  color: #000;
  font-weight: 600;
}
:deep(.btn-warning-solid.p-button:hover) { opacity: 0.85; background: #ffc107; }

:deep(.btn-sec-outlined.p-button) {
  color: #6c757d;
  border-color: #6c757d;
}
:deep(.btn-sec-outlined.p-button:hover) { background: #6c757d; color: #fff; }

:deep(.btn-rojo-outlined.p-button) {
  color: var(--cine-rojo);
  border-color: var(--cine-rojo);
}
:deep(.btn-rojo-outlined.p-button:hover) { background: var(--cine-rojo); color: #fff; }

.alerta-error {
  background: rgba(220, 53, 69, .15);
  border: 1px solid rgba(220, 53, 69, .4);
  color: #ea868f;
  padding: 0.75rem 1.25rem;
  border-radius: 0.4rem;
  margin-bottom: 1.25rem;
  font-size: 0.875rem;
}
.alerta-error ul { margin: 0.5rem 0 0 1rem; }
</style>