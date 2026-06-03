<template>
  <article class="card-pelicula" @click="ir">
    <!-- Portada -->
    <div class="portada-wrap">
      <img
        :src="getImagen(pelicula.id)"
        :alt="pelicula.titulo"
        loading="lazy"
        @error="onImgError"
      />
      <span class="badge-formato">{{ pelicula.formato }}</span>
      <span v-if="pelicula.destacado" class="badge-top">★ TOP</span>
    </div>

    <!-- Cuerpo -->
    <div class="card-body">
      <h3 class="card-title">{{ pelicula.titulo }}</h3>
      <p class="meta">{{ pelicula.director }} · {{ pelicula.anio_lanzamiento }}</p>
      <div class="card-footer-row">
        <span class="precio">₡{{ formatPrecio(pelicula.precio) }}</span>
        <span v-if="pelicula.calificacion_imdb" class="imdb">
          ★ {{ pelicula.calificacion_imdb }}
        </span>
      </div>
    </div>
  </article>
</template>

<script setup>
import { useRouter } from 'vue-router'

const props = defineProps({
  pelicula: { type: Object, required: true },
})

const router = useRouter()
const fallback = 'https://placehold.co/300x450/1a1a2e/dc3545?text=Sin+imagen'

const ir = () => router.push({ name: 'pelicula', params: { id: props.pelicula.id } })

const onImgError = (e) => { e.target.src = fallback }

const formatPrecio = (precio) =>
  Number(precio).toLocaleString('es-CR', { minimumFractionDigits: 0 })

const getImagen = (id) => {
  return new URL(`../assets/images/${id}.jpg`, import.meta.url).href}
</script>

<style scoped>
.card-pelicula {
  background-color: var(--cine-card);
  border: 1px solid var(--cine-borde);
  border-radius: 0.75rem;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.25s, border-color 0.25s, box-shadow 0.25s;
  height: 100%;
  display: flex;
  flex-direction: column;
}
.card-pelicula:hover {
  transform: translateY(-4px);
  border-color: rgba(220, 53, 69, 0.5);
  box-shadow: 0 8px 24px rgba(220, 53, 69, 0.15);
}
.portada-wrap {
  aspect-ratio: 2/3;
  overflow: hidden;
  position: relative;
}
.portada-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s;
}
.card-pelicula:hover .portada-wrap img {
  transform: scale(1.05);
}
.badge-formato {
  position: absolute;
  top: 0.5rem;
  left: 0.5rem;
  background: rgba(0, 0, 0, 0.7);
  color: #ccc;
  font-size: 0.65rem;
  padding: 0.2rem 0.5rem;
  border-radius: 0.3rem;
}
.badge-top {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: #ffc107;
  color: #000;
  font-size: 0.65rem;
  font-weight: 700;
  padding: 0.2rem 0.5rem;
  border-radius: 0.3rem;
}
.card-body {
  padding: 0.02rem 0.75rem 1.6rem 0.75rem; 
  flex: 1;
  display: flex;
  flex-direction: column;
}

.card-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: #fff;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: -0.5rem;
}

.meta {
  font-size: 0.95rem;
  color: #888;
  margin-bottom: auto;
}
.card-footer-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.5rem;
}
.precio {
  color: var(--cine-rojo);
  font-weight: 700;
  font-size: 0.9rem;
}
.imdb {
  color: #ffc107;
  font-size: 0.78rem;
}
</style>