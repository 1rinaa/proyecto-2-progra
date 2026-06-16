<template>
  <div v-if="categorias.length" class="barra-categorias">
    <div class="flex flex-wrap gap-1 max-w-1200 mx-auto px-3 py-2">
      <RouterLink
        v-for="cat in categorias"
        :key="cat.id"
        :to="`/categorias/${cat.slug}`"
        class="cat-link"
      >
        <i :class="`pi pi-${cat.icono}`" class="mr-1"></i> {{ cat.nombre }}
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
}

.cat-link {
  color: #888;
  text-decoration: none;
  font-size: 0.8rem;
  padding: 0.2rem 0.6rem;
  border-radius: 0.3rem;
  transition: color 0.2s;
  display: flex;
  align-items: center;
}

.cat-link:hover { 
  color: var(--cine-rojo); 
}

/* Utilidades PrimeFlex que no están incluidas por defecto */
.max-w-1200 { max-width: 1200px; }
.mx-auto { margin-left: auto; margin-right: auto; }
.px-3 { padding-left: 1rem; padding-right: 1rem; }
.py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
.flex-wrap { flex-wrap: wrap; }
.gap-1 { gap: 0.25rem; }
.flex { display: flex; }
.mr-1 { margin-right: 0.25rem; }
.items-center { align-items: center; }
</style>