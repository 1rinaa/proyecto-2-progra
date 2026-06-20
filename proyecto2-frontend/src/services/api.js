import axios from 'axios'

const API_URL = 'https://cinestore.site.je/api'
const API_KEY = 'proyecto_progra_web2'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const metodosProtegidos = ['post', 'put', 'delete']
  if (metodosProtegidos.includes(config.method)) {
    config.headers['X-API-Key'] = API_KEY
  }
  return config
})

console.log('API Key cargada:', API_KEY)
console.log('API URL:', API_URL)

// Manejo global de errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    if (status === 401) console.error('No autorizado — revisa tu API Key')
    if (status === 404) console.error('Recurso no encontrado')
    if (status === 422) console.error('Error de validación', error.response.data.errors)
    return Promise.reject(error)
  }
)

export default api