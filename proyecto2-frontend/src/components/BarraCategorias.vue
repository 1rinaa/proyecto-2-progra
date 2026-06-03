<template>
  <div v-if="categorias.length" class="barra-categorias">
    <div class="barra-inner">
      <RouterLink
        v-for="cat in categorias"
        :key="cat.id"
        :to="`/categorias/${cat.slug}`"
        class="cat-link"
      >
        <i :class="`bi bi-${cat.icono}`"></i> {{ cat.nombre }}
      </RouterLink>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { categoriaService } from '../services/categoriaService'

const categorias = ref([])

onMounted(async () => {
  try {
    const res = await categoriaService.getAll()
    categorias.value = res.data
  } catch (e) {}
})
</script>

<style scoped>
.barra-categorias {
  background-color: var(--cine-gris);
  border-bottom: 1px solid var(--cine-borde);
  padding: 0.4rem 0;
  /* sin sticky — se va al hacer scroll */
}
.barra-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.2rem;
}
.cat-link {
  color: #888;
  text-decoration: none;
  font-size: 0.8rem;
  padding: 0.2rem 0.6rem;
  border-radius: 0.3rem;
  transition: color 0.2s;
}
.cat-link:hover { color: var(--cine-rojo); }
</style>