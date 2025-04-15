<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'

const apiStatus = ref('Checking API connection...')
const apiResponse = ref(null)

onMounted(async () => {
  try {
    // Make a direct axios call to test the connection
    const response = await axios.get('http://localhost:8000/api/colleges/stats/')
    apiStatus.value = 'API connection successful!'
    apiResponse.value = response.data
  } catch (error: any) {
    apiStatus.value = `API Error: ${error.message}`
    console.error('API connection error:', error)
  }
})
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold mb-4">API Connection Test</h1>
    <div 
      class="p-4 rounded mb-4"
      :class="apiStatus.includes('successful') ? 'bg-green-500/20' : 'bg-red-500/20'"
    >
      <p class="font-bold">Status: {{ apiStatus }}</p>
    </div>
    
    <div v-if="apiResponse" class="bg-gray-800 p-4 rounded">
      <pre class="text-sm text-gray-300">{{ JSON.stringify(apiResponse, null, 2) }}</pre>
    </div>
  </div>
</template> 