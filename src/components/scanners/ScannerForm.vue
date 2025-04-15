<template>
  <div class="bg-[#2C2C2E] p-4 sm:p-6 rounded-lg shadow-lg">
    <h3 class="text-lg font-bold mb-4 text-[#F3F4F6]">
      {{ isEditing ? 'Edit Scanner' : 'Add New Scanner' }}
    </h3>
    
    <form @submit.prevent="handleSubmit">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label for="category" class="block text-[#F3F4F6] mb-1">Category</label>
          <input 
            type="text" 
            id="category" 
            v-model="form.category" 
            class="w-full p-2 rounded bg-[#1C1C1E] text-[#F3F4F6] border border-[#31415F]"
            required
          />
        </div>
        
        <div>
          <label for="query" class="block text-[#F3F4F6] mb-1">Query</label>
          <input 
            type="text" 
            id="query" 
            v-model="form.query" 
            class="w-full p-2 rounded bg-[#1C1C1E] text-[#F3F4F6] border border-[#31415F]"
            required
          />
        </div>
        
        <div>
          <label for="town" class="block text-[#F3F4F6] mb-1">Town</label>
          <input 
            type="text" 
            id="town" 
            v-model="form.town" 
            class="w-full p-2 rounded bg-[#1C1C1E] text-[#F3F4F6] border border-[#31415F]"
            required
          />
        </div>
        
        <div>
          <label for="status" class="block text-[#F3F4F6] mb-1">Status</label>
          <select 
            id="status" 
            v-model="form.status" 
            class="w-full p-2 rounded bg-[#1C1C1E] text-[#F3F4F6] border border-[#31415F]"
            required
          >
            <option value="running">Running</option>
            <option value="stopped">Stopped</option>
          </select>
        </div>
      </div>
      
      <div class="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
        <button 
          type="button" 
          @click="$emit('cancel')" 
          class="px-4 py-2 rounded bg-[#3F3F46] text-[#F3F4F6] hover:bg-opacity-90 w-full sm:w-auto"
        >
          Cancel
        </button>
        <button 
          type="submit" 
          class="px-4 py-2 rounded bg-[#3B82F6] text-white hover:bg-opacity-90 w-full sm:w-auto"
          :disabled="isSubmitting"
        >
          {{ isSubmitting ? 'Saving...' : (isEditing ? 'Update' : 'Add') }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import type { Scanner } from '@/types';

const props = defineProps<{
  scanner?: Scanner;
  isEditing: boolean;
}>();

const emit = defineEmits<{
  (e: 'submit', scanner: Omit<Scanner, 'id'> | Partial<Scanner>): void;
  (e: 'cancel'): void;
}>();

const isSubmitting = ref(false);

const form = reactive({
  category: '',
  query: '',
  town: '',
  status: 'stopped'
});

onMounted(() => {
  if (props.scanner && props.isEditing) {
    form.category = props.scanner.category;
    form.query = props.scanner.query;
    form.town = props.scanner.town;
    form.status = props.scanner.status;
  }
});

const handleSubmit = async () => {
  console.log('Form submitted with data:', form);
  isSubmitting.value = true;
  
  try {
    emit('submit', { ...form });
  } finally {
    isSubmitting.value = false;
  }
};
</script> 