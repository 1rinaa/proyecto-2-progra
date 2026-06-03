<template>
  <div class="container">

    <!-- Alerta global para errores -->
    <GlobalAlerta 
      :tipo="alertaLocal.tipo" 
      :mensaje="alertaLocal.mensaje" 
      @cerrar="alertaLocal.mensaje = ''"
    />

    <!-- Breadcrumb -->
    <nav class="breadcrumb-nav">
      <RouterLink to="/" class="bc-link">Inicio</RouterLink>
      <span class="bc-sep">›</span>
      <RouterLink to="/catalogo" class="bc-link">Catálogo</RouterLink>
      <span v-if="esEdicion">
        <span class="bc-sep">›</span>
        <RouterLink :to="`/peliculas/${route.params.id}`" class="bc-link">{{ form.titulo || '...' }}</RouterLink>
      </span>
      <span class="bc-sep">›</span>
      <span class="bc-actual">{{ esEdicion ? 'Editar' : 'Agregar película' }}</span>
    </nav>

    <h1 class="seccion-titulo">
      <i :class="esEdicion ? 'bi bi-pencil-square' : 'bi bi-plus-circle'"></i>
      {{ esEdicion ? 'Editar Película' : 'Agregar Película' }}
    </h1>

    <!-- Errores de validación -->
    <div v-if="Object.keys(errores).length" class="alert-error">
      <i class="bi bi-exclamation-triangle"></i>
      <strong> Corrija los siguientes errores:</strong>
      <ul>
        <li v-for="(msgs, campo) in errores" :key="campo">{{ msgs[0] }}</li>
      </ul>
    </div>

    <div v-if="loading" class="loading-txt">Cargando...</div>

    <form v-else @submit.prevent="guardar">

      <!-- ── Sección 1: Info principal ── -->
      <div class="form-seccion">
        <p class="form-seccion-titulo"><i class="bi bi-film"></i> Información principal</p>

        <!-- Fila 1: Título y Título original -->
        <div class="fila-2">
          <div class="form-group">
            <label>Título <span class="req">*</span></label>
            <input v-model="form.titulo" type="text" class="form-input" />
          </div>
          <div class="form-group">
            <label>Título original</label>
            <input v-model="form.titulo_original" type="text" class="form-input" />
          </div>
        </div>

        <!-- Fila 2: Director, Año, Duración -->
        <div class="fila-3">
          <div class="form-group">
            <label>Director <span class="req">*</span></label>
            <input v-model="form.director" type="text" class="form-input" />
          </div>
          <div class="form-group">
            <label>Año de lanzamiento <span class="req">*</span></label>
            <input v-model="form.anio_lanzamiento" type="number" min="1888" max="2026" class="form-input" />
          </div>
          <div class="form-group">
            <label>Duración (min) <span class="req">*</span></label>
            <input v-model="form.duracion_minutos" type="number" min="0" class="form-input" />
          </div>
        </div>

        <!-- Fila 3: Descripción y Sinopsis -->
        <div class="fila-1">
          <div class="form-group">
            <label>Descripción breve <span class="req">*</span></label>
            <textarea v-model="form.descripcion" class="form-input" rows="2"></textarea>
          </div>
        </div>
        <div class="fila-1">
          <div class="form-group">
            <label>Sinopsis</label>
            <textarea v-model="form.sinopsis" class="form-input" rows="4"></textarea>
          </div>
        </div>
      </div>

      <!-- ── Sección 2: Clasificación y formato ── -->
      <div class="form-seccion">
        <p class="form-seccion-titulo"><i class="bi bi-tag"></i> Clasificación y formato</p>

        <!-- Fila: Categoría, Clasificación, Formato -->
        <div class="fila-3">
          <div class="form-group">
            <label>Categoría <span class="req">*</span></label>
            <select v-model="form.categoria_id" class="form-input">
              <option value="">Seleccione...</option>
              <option v-for="c in categorias" :key="c.id" :value="c.id">{{ c.nombre }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>Clasificación <span class="req">*</span></label>
            <select v-model="form.clasificacion" class="form-input">
              <option value="">Seleccione...</option>
              <option v-for="c in clasificaciones" :key="c" :value="c">{{ c }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>Formato <span class="req">*</span></label>
            <select v-model="form.formato" class="form-input">
              <option value="">Seleccione...</option>
              <option v-for="f in formatos" :key="f" :value="f">{{ f }}</option>
            </select>
          </div>
        </div>

        <!-- Fila: Idioma original, Idiomas disponibles, Subtítulos -->
        <div class="fila-3">
          <div class="form-group">
            <label>Idioma original <span class="req">*</span></label>
            <input v-model="form.idioma_original" type="text" class="form-input" />
          </div>
          <div class="form-group">
            <label>Idiomas disponibles <small>(separados por coma)</small></label>
            <input v-model="form.idiomas_disponibles" type="text" class="form-input" placeholder="Español, Inglés..." />
          </div>
          <div class="form-group">
            <label>Subtítulos <small>(separados por coma)</small></label>
            <input v-model="form.subtitulos" type="text" class="form-input" placeholder="Español, Inglés..." />
          </div>
        </div>

        <!-- Géneros -->
        <div class="form-group">
          <label>Géneros</label>
          <div class="generos-grid">
            <label v-for="g in generos" :key="g.id" class="genero-chip" :class="{ activo: form.generos.includes(g.id) }">
              <input type="checkbox" :value="g.id" v-model="form.generos" class="chip-input" />
              {{ g.nombre }}
            </label>
          </div>
        </div>
      </div>

      <!-- ── Sección 3: Precios e inventario ── -->
      <div class="form-seccion">
        <p class="form-seccion-titulo"><i class="bi bi-currency-dollar"></i> Precios e inventario</p>
        <div class="fila-3">
          <div class="form-group">
            <label>Precio de venta (₡) <span class="req">*</span></label>
            <input v-model="form.precio" type="number" min="0" step="0.01" class="form-input" />
          </div>
          <div class="form-group">
            <label>Precio de alquiler (₡)</label>
            <input v-model="form.precio_alquiler" type="number" min="0" step="0.01" class="form-input" />
          </div>
          <div class="form-group">
            <label>Stock <span class="req">*</span></label>
            <input v-model="form.stock" type="number" min="0" class="form-input" />
          </div>
        </div>
      </div>

      <!-- ── Sección 4: Multimedia y calificaciones ── -->
      <div class="form-seccion">
        <p class="form-seccion-titulo"><i class="bi bi-star"></i> Multimedia y calificaciones</p>

        <div class="fila-1">
          <div class="form-group">
            <label>URL portada <small>(ruta o URL de imagen)</small></label>
            <input v-model="form.imagen_portada" type="text" class="form-input" />
          </div>
        </div>

        <!-- URL trailer + IMDb + Local en la misma fila -->
        <div class="fila-3">
          <div class="form-group">
            <label>URL del trailer</label>
            <input v-model="form.trailer_url" type="text" class="form-input" placeholder="https://youtube.com/..." />
          </div>
          <div class="form-group">
            <label>Calificación IMDb <span class="req">*</span></label>
            <input v-model="form.calificacion_imdb" type="number" step="0.1" min="0" max="10" class="form-input" />
          </div>
          <div class="form-group">
            <label>Calificación local <span class="req">*</span></label>
            <input v-model="form.calificacion_local" type="number" step="0.1" min="0" max="10" class="form-input" />
          </div>
        </div>

        <!-- Switches -->
        <div class="switches-row">
          <label class="switch-label">
            <div class="switch-wrap">
              <input type="checkbox" v-model="form.destacado" class="switch-input" />
              <span class="switch-track"></span>
            </div>
            <span>Película destacada</span>
          </label>
          <label class="switch-label">
            <div class="switch-wrap">
              <input type="checkbox" v-model="form.disponible" class="switch-input" />
              <span class="switch-track"></span>
            </div>
            <span>Disponible en catálogo</span>
          </label>
        </div>
      </div>

      <!-- Botones -->
      <div class="form-acciones">
        <button type="submit" :class="esEdicion ? 'btn-warning-solid' : 'btn-danger-solid'" :disabled="guardando">
          <i class="bi bi-save"></i>
          {{ guardando ? 'Guardando...' : (esEdicion ? 'Guardar cambios' : 'Guardar película') }}
        </button>
        <RouterLink :to="esEdicion ? `/peliculas/${route.params.id}` : '/catalogo'" class="btn-sec-outline">
          Cancelar
        </RouterLink>
        <RouterLink v-if="esEdicion" :to="`/peliculas/${route.params.id}/eliminar`" class="btn-danger-outline ms-auto">
          <i class="bi bi-trash"></i> Eliminar esta película
        </RouterLink>
      </div>

    </form>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { peliculaService } from '../services/peliculaService'
import GlobalAlerta from '../components/GlobalAlerta.vue'

const route  = useRoute()
const router = useRouter()

const esEdicion = computed(() => !!route.params.id && route.name === 'pelicula-editar')

const loading   = ref(true)
const guardando = ref(false)
const errores   = ref({})

// Alerta local para errores en el formulario
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

// ✅ Función para validar que los números no sean negativos
const validarNumerosNoNegativos = () => {
  const erroresNumericos = []
  
  // Validar año de lanzamiento (debe ser positivo y razonable)
  if (form.anio_lanzamiento && (form.anio_lanzamiento < 1888 || form.anio_lanzamiento > new Date().getFullYear() + 2)) {
    erroresNumericos.push('El año de lanzamiento debe estar entre 1888 y el año actual + 2')
  } else if (form.anio_lanzamiento && form.anio_lanzamiento < 0) {
    erroresNumericos.push('El año de lanzamiento no puede ser negativo')
  }
  
  // Validar duración (minutos)
  if (form.duracion_minutos !== '' && form.duracion_minutos !== null) {
    const duracion = Number(form.duracion_minutos)
    if (isNaN(duracion) || duracion < 0) {
      erroresNumericos.push('La duración no puede ser negativa')
    } else if (duracion < 1) {
      erroresNumericos.push('La duración debe ser mayor a 0 minutos')
    } else if (duracion > 600) {
      erroresNumericos.push('La duración no puede exceder los 600 minutos (10 horas)')
    }
  }
  
  // Validar precio de venta
  if (form.precio !== '' && form.precio !== null) {
    const precio = Number(form.precio)
    if (isNaN(precio) || precio < 0) {
      erroresNumericos.push('El precio de venta no puede ser negativo')
    }
  }
  
  // Validar precio de alquiler
  if (form.precio_alquiler !== '' && form.precio_alquiler !== null) {
    const precioAlquiler = Number(form.precio_alquiler)
    if (isNaN(precioAlquiler) || precioAlquiler < 0) {
      erroresNumericos.push('El precio de alquiler no puede ser negativo')
    }
  }
  
  // Validar stock
  if (form.stock !== '' && form.stock !== null) {
    const stock = Number(form.stock)
    if (isNaN(stock) || stock < 0) {
      erroresNumericos.push('El stock no puede ser negativo')
    }
  }
  
  // Validar calificaciones (0-10)
  if (form.calificacion_imdb !== '' && form.calificacion_imdb !== null) {
    const cal = Number(form.calificacion_imdb)
    if (isNaN(cal) || cal < 0 || cal > 10) {
      erroresNumericos.push('La calificación IMDb debe estar entre 0 y 10')
    }
  }
  
  if (form.calificacion_local !== '' && form.calificacion_local !== null) {
    const cal = Number(form.calificacion_local)
    if (isNaN(cal) || cal < 0 || cal > 10) {
      erroresNumericos.push('La calificación local debe estar entre 0 y 10')
    }
  }
  
  return erroresNumericos
}

// ✅ Función para sanitizar números (convertir negativos a 0 o su valor por defecto)
const sanitizarNumeros = () => {
  if (form.anio_lanzamiento !== '' && form.anio_lanzamiento !== null && Number(form.anio_lanzamiento) < 0) {
    form.anio_lanzamiento = new Date().getFullYear()
  }
  
  if (form.duracion_minutos !== '' && form.duracion_minutos !== null && Number(form.duracion_minutos) < 0) {
    form.duracion_minutos = 1
  }
  
  if (form.precio !== '' && form.precio !== null && Number(form.precio) < 0) {
    form.precio = 0
  }
  
  if (form.precio_alquiler !== '' && form.precio_alquiler !== null && Number(form.precio_alquiler) < 0) {
    form.precio_alquiler = 0
  }
  
  if (form.stock !== '' && form.stock !== null && Number(form.stock) < 0) {
    form.stock = 0
  }
  
  if (form.calificacion_imdb !== '' && form.calificacion_imdb !== null) {
    let cal = Number(form.calificacion_imdb)
    if (cal < 0) form.calificacion_imdb = 0
    if (cal > 10) form.calificacion_imdb = 10
  }
  
  if (form.calificacion_local !== '' && form.calificacion_local !== null) {
    let cal = Number(form.calificacion_local)
    if (cal < 0) form.calificacion_local = 0
    if (cal > 10) form.calificacion_local = 10
  }
}

// ✅ Función para validar el formulario antes de enviar
const validarFormulario = () => {
  const erroresNumericos = validarNumerosNoNegativos()
  
  if (erroresNumericos.length > 0) {
    alertaLocal.tipo = 'error'
    alertaLocal.mensaje = erroresNumericos.join('. ')
    return false
  }
  
  return true
}

const sanitizarAlCambiar = (campo, valorPorDefecto = 0) => {
  if (form[campo] !== '' && form[campo] !== null && Number(form[campo]) < 0) {
    form[campo] = valorPorDefecto
  }
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
    } catch { 
      router.push({ name: 'catalogo' })
    }
  }
  loading.value = false
})

const guardar = async () => {
  guardando.value = true
  errores.value = {}
  alertaLocal.mensaje = ''
  
  // ✅ Sanitizar números antes de validar
  sanitizarNumeros()
  
  // ✅ Validar el formulario antes de enviar
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
    
    // Guardar alerta de éxito
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
      console.error('Error al guardar:', e)
      alertaLocal.tipo = 'error'
      alertaLocal.mensaje = e.response?.data?.message || 'Error al guardar la película. Intenta de nuevo.'
    }
  } finally {
    guardando.value = false
  }
}
</script>

<style scoped>
/* Tus estilos existentes se mantienen igual */
.container { max-width: 860px; margin: 0 auto; padding: 2rem 1rem; }
.loading-txt { color: #888; text-align: center; padding: 3rem; }

.breadcrumb-nav { font-size: 0.82rem; margin-bottom: 1rem; }
.bc-link { color: #888; text-decoration: none; }
.bc-link:hover { color: #fff; }
.bc-sep { color: #555; margin: 0 0.4rem; }
.bc-actual { color: #fff; }

.seccion-titulo {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 1.8rem;
  letter-spacing: 2px;
  color: #fff;
  margin-bottom: 1.5rem;
}

.alert-error {
  background: rgba(220,53,69,.15);
  border: 1px solid rgba(220,53,69,.4);
  color: #ea868f;
  padding: 0.75rem 1.25rem;
  border-radius: 0.4rem;
  margin-bottom: 1.25rem;
  font-size: 0.875rem;
}
.alert-error ul { margin: 0.5rem 0 0 1rem; }

/* ── Secciones ── */
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
.form-seccion-titulo i { margin-right: 0.35rem; }

/* ── Filas de campos ── */
.fila-1 { display: grid; grid-template-columns: 1fr; gap: 0.75rem; }
.fila-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
.fila-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.75rem; }
@media (max-width: 640px) {
  .fila-2, .fila-3 { grid-template-columns: 1fr; }
}

.form-group { display: flex; flex-direction: column; gap: 0.3rem; }

label { color: #aaa; font-size: 0.8rem; }
label small { color: #666; font-size: 0.72rem; }
.req { color: var(--cine-rojo); font-weight: 700; }

.form-input {
  background: var(--cine-card);
  border: 1px solid var(--cine-borde);
  color: #e0e0e0;
  padding: 0.45rem 0.75rem;
  border-radius: 0.4rem;
  font-size: 0.875rem;
  outline: none;
  width: 100%;
}
.form-input:focus {
  border-color: var(--cine-rojo);
  box-shadow: 0 0 0 0.2rem rgba(220,53,69,.2);
}
.form-input::placeholder { color: #555; }

/* ── Géneros como chips ── */
.generos-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-top: 0.25rem;
}
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
.chip-input { display: none; }

/* ── Switches ── */
.switches-row {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
  padding-top: 0.25rem;
}
.switch-label {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  cursor: pointer;
  color: #aaa;
  font-size: 0.85rem;
  user-select: none;
}
.switch-wrap { position: relative; display: inline-block; width: 42px; height: 24px; }
.switch-input { opacity: 0; width: 0; height: 0; position: absolute; }
.switch-track {
  position: absolute;
  inset: 0;
  background: #2a2a40;
  border: 1px solid var(--cine-borde);
  border-radius: 999px;
  transition: background 0.25s, border-color 0.25s;
}
.switch-track::after {
  content: '';
  position: absolute;
  top: 3px;
  left: 3px;
  width: 16px;
  height: 16px;
  background: #555;
  border-radius: 50%;
  transition: transform 0.25s, background 0.25s;
}
.switch-input:checked + .switch-track {
  background: rgba(220,53,69,.25);
  border-color: var(--cine-rojo);
}
.switch-input:checked + .switch-track::after {
  transform: translateX(18px);
  background: var(--cine-rojo);
}

/* ── Botones ── */
.form-acciones {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
  margin-top: 0.5rem;
}
.ms-auto { margin-left: auto; }

.btn-danger-solid, .btn-warning-solid, .btn-sec-outline, .btn-danger-outline {
  display: inline-flex; align-items: center; gap: 0.35rem;
  padding: 0.5rem 1.25rem;
  border-radius: 0.4rem;
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  border: 1px solid;
  transition: opacity 0.2s, background 0.2s, color 0.2s;
}
.btn-danger-solid  { background: var(--cine-rojo); border-color: var(--cine-rojo); color: #fff; }
.btn-danger-solid:hover { opacity: 0.85; }
.btn-danger-solid:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-warning-solid { background: #ffc107; border-color: #ffc107; color: #000; }
.btn-warning-solid:hover { opacity: 0.85; }
.btn-warning-solid:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-sec-outline   { background: transparent; border-color: #6c757d; color: #6c757d; }
.btn-sec-outline:hover   { background: #6c757d; color: #fff; }
.btn-danger-outline { background: transparent; border-color: var(--cine-rojo); color: var(--cine-rojo); }
.btn-danger-outline:hover { background: var(--cine-rojo); color: #fff; }
</style>