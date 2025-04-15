<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { getColleges, getCollegeStats } from '@/services/api';
import type { College, CollegeListResponse } from '@/services/api';

// Data
const colleges = ref<College[]>([]);
const isLoading = ref(true);
const error = ref<string | null>(null);
const currentPage = ref(1);
const totalPages = ref(0);
const totalColleges = ref(0);
const statesRepresented = ref(0);
const currentSort = ref('name');
const pageSize = ref(25);

// Methods
const fetchColleges = async () => {
  isLoading.value = true;
  error.value = null;
  
  try {
    const response = await getColleges(currentPage.value, currentSort.value, pageSize.value);
    colleges.value = response.results;
    totalColleges.value = response.count;
    totalPages.value = Math.ceil(response.count / pageSize.value);
  } catch (err: any) {
    error.value = err.message || 'Failed to load colleges';
  } finally {
    isLoading.value = false;
  }
};

const fetchStats = async () => {
  try {
    const stats = await getCollegeStats();
    statesRepresented.value = stats.states_represented;
  } catch (err) {
    console.error('Error fetching stats:', err);
  }
};

const changeSort = (sortField: string) => {
  if (currentSort.value === sortField) {
    // Toggle between ascending and descending
    currentSort.value = currentSort.value.startsWith('-') 
      ? sortField 
      : `-${sortField}`;
  } else {
    // Default to ascending order for new sort field
    currentSort.value = sortField;
  }
  currentPage.value = 1; // Reset to first page
  fetchColleges();
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value += 1;
    fetchColleges();
  }
};

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value -= 1;
    fetchColleges();
  }
};

// Computed
const sortIcon = (field: string) => {
  if (currentSort.value === field) return '↑';
  if (currentSort.value === `-${field}`) return '↓';
  return '';
};

const formatCost = (cost: number | null) => {
  if (cost === null) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(cost);
};

const formatRate = (rate: number | null) => {
  if (rate === null) return 'N/A';
  return `${(rate * 100).toFixed(1)}%`;
};

// Lifecycle hooks
onMounted(() => {
  fetchColleges();
  fetchStats();
});
</script>

<template>
  <div class="colleges-view">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-100 mb-2">College Explorer</h1>
      <p class="text-gray-400">
        Browse through our collection of {{ totalColleges }} colleges 
        from {{ statesRepresented }} different states.
      </p>
    </div>
    
    <!-- Loading and Error states -->
    <div v-if="isLoading" class="flex justify-center py-10">
      <div class="animate-pulse flex space-x-2">
        <div class="h-3 w-3 bg-blue-500 rounded-full"></div>
        <div class="h-3 w-3 bg-blue-500 rounded-full"></div>
        <div class="h-3 w-3 bg-blue-500 rounded-full"></div>
      </div>
    </div>
    
    <div v-else-if="error" class="bg-red-900/30 border border-red-700 p-4 rounded-md text-red-200">
      {{ error }}
    </div>
    
    <!-- Colleges Table -->
    <div v-else class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-800">
        <thead class="bg-gray-900">
          <tr>
            <th 
              @click="changeSort('name')" 
              class="px-4 py-3 text-left text-sm font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-800"
            >
              College Name {{ sortIcon('name') }}
            </th>
            <th 
              @click="changeSort('state')" 
              class="px-4 py-3 text-left text-sm font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-800"
            >
              Location {{ sortIcon('state') }}
            </th>
            <th 
              @click="changeSort('acceptance_rate')" 
              class="px-4 py-3 text-left text-sm font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-800"
            >
              Acceptance Rate {{ sortIcon('acceptance_rate') }}
            </th>
            <th 
              @click="changeSort('cost_of_attendance')" 
              class="px-4 py-3 text-left text-sm font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-800"
            >
              Cost {{ sortIcon('cost_of_attendance') }}
            </th>
          </tr>
        </thead>
        <tbody class="bg-gray-900/40 divide-y divide-gray-800">
          <tr v-for="college in colleges" :key="college.id" class="hover:bg-gray-800/50">
            <td class="px-4 py-4 whitespace-nowrap">
              <div class="text-sm font-medium text-blue-400">
                <a 
                  :href="college.website || '#'" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  class="hover:underline"
                >
                  {{ college.name }}
                </a>
              </div>
            </td>
            <td class="px-4 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-300">
                {{ college.city && college.state ? `${college.city}, ${college.state}` : (college.state || 'Unknown') }}
              </div>
            </td>
            <td class="px-4 py-4 whitespace-nowrap">
              <div 
                class="text-sm" 
                :class="{
                  'text-green-400': college.acceptance_rate !== null && college.acceptance_rate > 0.15,
                  'text-yellow-400': college.acceptance_rate !== null && college.acceptance_rate <= 0.15 && college.acceptance_rate > 0.05,
                  'text-red-400': college.acceptance_rate !== null && college.acceptance_rate <= 0.05,
                  'text-gray-400': college.acceptance_rate === null
                }"
              >
                {{ formatRate(college.acceptance_rate) }}
              </div>
            </td>
            <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
              {{ formatCost(college.cost_of_attendance) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- Pagination -->
    <div class="flex items-center justify-between mt-6">
      <div class="text-sm text-gray-400">
        Page {{ currentPage }} of {{ totalPages }} ({{ totalColleges }} colleges)
      </div>
      <div class="flex space-x-2">
        <button 
          @click="prevPage" 
          :disabled="currentPage <= 1"
          class="px-4 py-2 bg-gray-800 text-gray-300 rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <button 
          @click="nextPage" 
          :disabled="currentPage >= totalPages"
          class="px-4 py-2 bg-gray-800 text-gray-300 rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template> 