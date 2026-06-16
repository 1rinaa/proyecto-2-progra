<template>
  <Transition name="alerta">
    <div v-if="visible" :class="['global-alerta', `alerta-${tipo}`]">
      <div class="alerta-inner">
        <i :class="tipo === 'exito' ? 'pi pi-check-circle' : 'pi pi-exclamation-triangle'"></i>
        <span class="alerta-mensaje">{{ mensaje }}</span>
        <button class="alerta-cerrar" @click="cerrar">×</button>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  tipo: {
    type: String,
    default: 'exito'
  },
  mensaje: {
    type: String,
    default: ''
  },
  modelo: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['cerrar'])
const visible = ref(false)

// Observar cambios en las props
watch(() => props.mensaje, (nuevo) => {
  if (nuevo) {
    visible.value = true
    setTimeout(() => {
      visible.value = false
      emit('cerrar')
    }, 4000)
  }
}, { immediate: true }) 

const cerrar = () => {
  visible.value = false
  emit('cerrar')
}
</script>

<style scoped>
.global-alerta {
  margin-bottom: 1.5rem;
  overflow: hidden;
  animation: slideDown 0.3s ease;
}

.alerta-inner {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.85rem 1.25rem;
  font-size: 0.9rem;
  font-weight: 500;
  backdrop-filter: blur(8px);
}

.alerta-exito .alerta-inner {
  background: rgba(25, 135, 84, 0.2);
  border-left: 4px solid #198754;
  color: #a3d9b8;
}

.alerta-error .alerta-inner {
  background: rgba(220, 53, 69, 0.2);
  border-left: 4px solid #dc3545;
  color: #f1aeb5;
}

.alerta-mensaje {
  flex: 1;
}

.alerta-cerrar {
  background: none;
  border: none;
  color: inherit;
  font-size: 1.2rem;
  cursor: pointer;
  line-height: 1;
  opacity: 0.6;
  transition: opacity 0.2s;
  padding: 0 0.25rem;
}

.alerta-cerrar:hover {
  opacity: 1;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-15px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.alerta-enter-active,
.alerta-leave-active {
  transition: all 0.3s ease;
}

.alerta-enter-from,
.alerta-leave-to {
  opacity: 0;
  transform: translateY(-15px);
}
</style>