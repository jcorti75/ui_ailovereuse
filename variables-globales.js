// variables-globales.js - Variables Centralizadas
// Este archivo debe cargarse ANTES que todos los demás

console.log('🔧 Iniciando variables globales centralizadas...');

// =======================================================
// VARIABLES GLOBALES ÚNICAS (Evitar duplicados)
// =======================================================

// Variables de autenticación (Solo declarar si no existen)
if (typeof window.isLoggedIn === 'undefined') {
  window.isLoggedIn = false;
  console.log('✅ Variable isLoggedIn inicializada');
}

if (typeof window.currentUser === 'undefined') {
  window.currentUser = null;
  console.log('✅ Variable currentUser inicializada');
}

// Variables de procesamiento (Solo declarar si no existen)
if (typeof window.processingStartTime === 'undefined') {
  window.processingStartTime = null;
  console.log('✅ Variable processingStartTime inicializada');
}

// Variables de upload (Solo declarar si no existen)
if (typeof window.uploadedFiles === 'undefined') {
  window.uploadedFiles = { tops: [], bottoms: [], shoes: [] };
  console.log('✅ Variable uploadedFiles inicializada');
}

if (typeof window.uploadedImages === 'undefined') {
  window.uploadedImages = { tops: [], bottoms: [], shoes: [] };
  console.log('✅ Variable uploadedImages inicializada');
}

if (typeof window.closetItems === 'undefined') {
  window.closetItems = { tops: [], bottoms: [], shoes: [] };
  console.log('✅ Variable closetItems inicializada');
}

// Variables de estado (Solo declarar si no existen)
if (typeof window.selectedOccasion === 'undefined') {
  window.selectedOccasion = null;
  console.log('✅ Variable selectedOccasion inicializada');
}

if (typeof window.userStats === 'undefined') {
  window.userStats = { visits: 1, recommendations: 0, savedOutfits: 0 };
  console.log('✅ Variable userStats inicializada');
}

// Variables del closet (Solo declarar si no existen)
if (typeof window.closetMode === 'undefined') {
  window.closetMode = false;
  console.log('✅ Variable closetMode inicializada');
}

if (typeof window.closetSelectionMode === 'undefined') {
  window.closetSelectionMode = false;
  console.log('✅ Variable closetSelectionMode inicializada');
}

if (typeof window.closetSelectedItems === 'undefined') {
  window.closetSelectedItems = { tops: [], bottoms: [], shoes: [] };
  console.log('✅ Variable closetSelectedItems inicializada');
}

// Variables de resultados (Solo declarar si no existen)
if (typeof window.currentResults === 'undefined') {
  window.currentResults = [];
  console.log('✅ Variable currentResults inicializada');
}

if (typeof window.savedRecommendations === 'undefined') {
  window.savedRecommendations = [];
  console.log('✅ Variable savedRecommendations inicializada');
}

// =======================================================
// FUNCIONES AUXILIARES GLOBALES
// =======================================================

// Función para obtener nombre del tipo (CRÍTICA - Era la que faltaba)
if (typeof window.getTypeName === 'undefined') {
  window.getTypeName = function(type) {
    const typeNames = {
      'tops': 'Superiores',
      'bottoms': 'Inferiores', 
      'shoes': 'Calzado'
    };
    return typeNames[type] || type;
  };
  console.log('✅ Función getTypeName definida globalmente');
}

// Función para limpiar resultados anteriores
if (typeof window.clearPreviousResults === 'undefined') {
  window.clearPreviousResults = function() {
    console.log('🧹 Limpiando resultados anteriores...');
    const result = document.getElementById('result');
    if (result) {
      result.style.display = 'none';
      result.innerHTML = '';
    }
    window.currentResults = [];
  };
  console.log('✅ Función clearPreviousResults definida globalmente');
}

// Función para mostrar selector de ocasiones
if (typeof window.showOccasionSelector === 'undefined') {
  window.showOccasionSelector = function() {
    const occasionSelector = document.getElementById('occasionSelector');
    const uploadArea = document.getElementById('uploadArea');
    
    if (occasionSelector) {
      occasionSelector.style.display = 'block';
    }
    if (uploadArea) {
      uploadArea.style.display = 'block';
    }
    
    console.log('✅ Selector de ocasiones mostrado');
  };
  console.log('✅ Función showOccasionSelector definida globalmente');
}

// Función para actualizar label de upload
if (typeof window.updateUploadLabel === 'undefined') {
  window.updateUploadLabel = function(type) {
    try {
      const files = window.uploadedFiles[type] || [];
      const label = document.querySelector(`label[for="${type}-upload"]`);
      
      if (label) {
        const typeName = window.getTypeName(type);
        const maxFiles = window.CONFIG?.FILE_LIMITS?.[type] || 5;
        
        if (files.length === 0) {
          label.textContent = `📤 Subir ${typeName} (máx ${maxFiles})`;
        } else {
          label.textContent = `📤 ${typeName}: ${files.length}/${maxFiles} subidos`;
        }
        
        console.log(`✅ Label actualizado para ${type}: ${files.length} archivos`);
      }
    } catch (error) {
      console.error('❌ Error actualizando upload label:', error);
    }
  };
  console.log('✅ Función updateUploadLabel definida globalmente');
}

// Función para actualizar botón de generar
if (typeof window.updateGenerateButton === 'undefined') {
  window.updateGenerateButton = function() {
    try {
      const generateBtn = document.getElementById('generateBtn');
      if (!generateBtn) return;
      
      const hasTops = (window.uploadedFiles.tops?.length || 0) > 0;
      const hasBottoms = (window.uploadedFiles.bottoms?.length || 0) > 0;  
      const hasShoes = (window.uploadedFiles.shoes?.length || 0) > 0;
      const hasOccasion = window.selectedOccasion !== null;
      
      if (hasTops && hasBottoms && hasShoes && hasOccasion) {
        generateBtn.disabled = false;
        generateBtn.innerHTML = '<i class="fas fa-magic"></i> Generar Recomendaciones';
        generateBtn.style.opacity = '1';
      } else {
        generateBtn.disabled = true;
        generateBtn.innerHTML = '<i class="fas fa-upload"></i> Sube fotos de cada categoría y selecciona ocasión';
        generateBtn.style.opacity = '0.6';
      }
      
      console.log('✅ Botón generar actualizado');
    } catch (error) {
      console.error('❌ Error actualizando botón generar:', error);
    }
  };
  console.log('✅ Función updateGenerateButton definida globalmente');
}

// Función para obtener datos de imagen (compatibilidad)
if (typeof window.getImageDataUrl === 'undefined') {
  window.getImageDataUrl = function(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };
  console.log('✅ Función getImageDataUrl definida globalmente');
}

// Función para actualizar estadísticas
if (typeof window.updateStatsDisplay === 'undefined') {
  window.updateStatsDisplay = function() {
    try {
      // Actualizar contadores en closet
      const visitCounter = document.getElementById('visitCounter') || document.getElementById('closetVisits');
      const recommendationCounter = document.getElementById('recommendationCounter') || document.getElementById('closetRecommendations');  
      const outfitCounter = document.getElementById('outfitCounter') || document.getElementById('closetOutfits');
      
      if (visitCounter) {
        visitCounter.textContent = window.userStats.visits || 1;
      }
      if (recommendationCounter) {
        recommendationCounter.textContent = window.userStats.recommendations || 0;
      }
      if (outfitCounter) {
        outfitCounter.textContent = window.userStats.savedOutfits || 0;
      }
      
      console.log('✅ Estadísticas actualizadas:', window.userStats);
    } catch (error) {
      console.error('❌ Error actualizando estadísticas:', error);
    }
  };
  console.log('✅ Función updateStatsDisplay definida globalmente');
}

// =======================================================
// INICIALIZACIÓN DE VARIABLES GLOBALES
// =======================================================

// Marcar que las variables globales han sido inicializadas
window.GLOBAL_VARIABLES_INITIALIZED = true;

console.log('✅ Variables globales centralizadas inicializadas correctamente');
console.log('📊 Estado inicial:', {
  isLoggedIn: window.isLoggedIn,
  currentUser: window.currentUser ? 'Definido' : 'Null',
  uploadedFiles: Object.keys(window.uploadedFiles).map(key => `${key}: ${window.uploadedFiles[key].length}`),
  closetMode: window.closetMode,
  selectedOccasion: window.selectedOccasion
});
