<template>
  <NavBar />
  <BarraCategorias />  
  <RouterView />
  <AppFooter />
</template>

<script setup>
import NavBar from './components/NavBar.vue'
import BarraCategorias from './components/BarraCategorias.vue'
import AppFooter from './components/AppFooter.vue'
</script>

<style>
:root {
  --cine-rojo:   #dc3545;
  --cine-oscuro: #0a0a0f;
  --cine-gris:   #141420;
  --cine-card:   #1a1a2e;
  --cine-borde:  #2a2a40;
}

*, *::before, *::after { box-sizing: border-box; }

body {
  font-family: 'Inter', sans-serif;
  background-color: var(--cine-oscuro);
  color: #e0e0e0;
  margin: 0;
}

a { color: inherit; }
</style>