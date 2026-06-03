<template>
  <footer class="footer">
    <div class="footer-inner">
      <div class="footer-col">
        <div class="marca">🎬 CINESTORE</div>
        <p>Tu tienda virtual de películas en Costa Rica.<br>DVD, Blu-ray, 4K UHD y Digital.</p>
      </div>
      <div class="footer-col">
        <h6>Categorías</h6>
        <div class="footer-links">
          <RouterLink
            v-for="cat in categorias"
            :key="cat.id"
            :to="`/categorias/${cat.slug}`"
          >{{ cat.nombre }}</RouterLink>
        </div>
      </div>
      <div class="footer-col">
        <h6>Información</h6>
        <div class="footer-links">
          <a href="#">Sobre nosotros</a>
          <a href="#">Política de envíos</a>
          <a href="#">Devoluciones</a>
          <a href="#">Contacto</a>
        </div>
      </div>
    </div>
    <div class="footer-copy">
      © {{ year }} CineStore — EIF506 Diseño de Sitios Web · Universidad Nacional
    </div>
  </footer>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { categoriaService } from '../services/categoriaService'

const categorias = ref([])
const year = new Date().getFullYear()

onMounted(async () => {
  try {
    const res = await categoriaService.getAll()
    categorias.value = res.data.slice(0, 5)
  } catch {}
})
</script>

<style scoped>
.footer {
  background-color: var(--cine-gris);
  border-top: 1px solid var(--cine-borde);
  color: #666;
  font-size: 0.85rem;
  margin-top: 3rem;
  padding: 3rem 1rem 1.5rem;
}
.footer-inner {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  margin-bottom: 2rem;
}
@media (max-width: 640px) { .footer-inner { grid-template-columns: 1fr; } }

.marca {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 1.4rem;
  letter-spacing: 3px;
  color: #fff;
  margin-bottom: 0.5rem;
}
.footer-col h6 { color: #fff; margin-bottom: 0.75rem; font-size: 0.9rem; }
.footer-links { display: flex; flex-direction: column; gap: 0.4rem; }
.footer-links a { color: #666; text-decoration: none; transition: color 0.2s; }
.footer-links a:hover { color: var(--cine-rojo); }

.footer-copy {
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
  border-top: 1px solid var(--cine-borde);
  padding-top: 1.25rem;
  font-size: 0.8rem;
}
</style>