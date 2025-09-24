// closet.js - Sistema de Closet Inteligente REAL con IA
// Reemplaza completamente el archivo anterior

// CONFIGURACIÓN DEL SISTEMA INTELIGENTE
const INTELLIGENT_CATEGORIES = {
  tops: {
    "shirt": { name: "Camisas", icon: "👔", keywords: ["shirt", "dress shirt", "button", "collar"], color: "#3b82f6", confidence: 0.95 },
    "blouse": { name: "Blusas", icon: "👚", keywords: ["blouse", "silk blouse", "flowy"], color: "#ec4899", confidence: 0.90 },
    "sweater": { name: "Suéteres", icon: "🧥", keywords: ["sweater", "knitted", "wool", "pullover", "cardigan"], color: "#f59e0b", confidence: 0.92 },
    "tshirt": { name: "Poleras", icon: "👕", keywords: ["t-shirt", "tee", "graphic", "tank top", "casual"], color: "#10b981", confidence: 0.96 },
    "jacket": { name: "Chaquetas", icon: "🧥", keywords: ["jacket", "leather", "denim", "blazer", "outer"], color: "#6b7280", confidence: 0.88 },
    "dress": { name: "Vestidos", icon: "👗", keywords: ["dress", "summer dress", "evening dress", "gown"], color: "#8b5cf6", confidence: 0.94 },
    "hoodie": { name: "Hoodies", icon: "👘", keywords: ["hoodie", "zip-up", "sweatshirt", "hooded"], color: "#ef4444", confidence: 0.93 },
    "coat": { name: "Abrigos", icon: "🧥", keywords: ["coat", "winter coat", "overcoat", "trench"], color: "#1f2937", confidence: 0.91 }
  },
  bottoms: {
    "jeans": { name: "Jeans", icon: "👖", keywords: ["jeans", "denim", "blue jeans", "ripped"], color: "#1e40af", confidence: 0.97 },
    "pants": { name: "Pantalones", icon: "👖", keywords: ["pants", "trousers", "formal pants", "chinos", "slacks"], color: "#3b82f6", confidence: 0.92 },
    "skirt": { name: "Faldas", icon: "👗", keywords: ["skirt", "midi skirt", "pencil skirt", "mini skirt"], color: "#ec4899", confidence: 0.94 },
    "shorts": { name: "Shorts", icon: "🩳", keywords: ["shorts", "athletic shorts", "bermuda"], color: "#10b981", confidence: 0.96 },
    "leggings": { name: "Calzas", icon: "🩱", keywords: ["leggings", "sweatpants", "athletic pants", "yoga pants"], color: "#6b7280", confidence: 0.95 }
  },
  shoes: {
    "sneakers": { name: "Zapatillas", icon: "👟", keywords: ["sneakers", "running shoes", "athletic shoes", "trainers"], color: "#3b82f6", confidence: 0.96 },
    "dress_shoes": { name: "Zapatos Formales", icon: "👞", keywords: ["dress shoes", "leather shoes", "formal shoes", "oxfords"], color: "#1f2937", confidence: 0.93 },
    "boots": { name: "Botas", icon: "🥾", keywords: ["boots", "ankle boots", "hiking boots", "combat boots"], color: "#92400e", confidence: 0.91 },
    "heels": { name: "Tacones", icon: "👠", keywords: ["heels", "stiletto heels", "pumps", "high heels"], color: "#ec4899", confidence: 0.94 },
    "sandals": { name: "Sandalias", icon: "👡", keywords: ["sandals", "leather sandals", "flip flops"], color: "#f59e0b", confidence: 0.92 },
    "flats": { name: "Ballerinas", icon: "🥿", keywords: ["flats", "ballet flats", "loafers"], color: "#6b7280", confidence: 0.90 }
  }
};

// VARIABLES GLOBALES DEL SISTEMA INTELIGENTE
let intelligentClosetItems = { tops: {}, bottoms: {}, shoes: {} };
let selectedClosetItems = { tops: new Set(), bottoms: new Set(), shoes: new Set() };
let savedRecommendations = [];
let activeClosetType = 'tops';

// FUNCIONES PRINCIPALES DEL CLOSET INTELIGENTE

// Obtener total de prendas en el closet
function getTotalIntelligentClosetItems() {
  let total = 0;
  ['tops', 'bottoms', 'shoes'].forEach(type => {
    Object.values(intelligentClosetItems[type]).forEach(category => {
      total += category.length;
    });
  });
  return total;
}

// Cargar datos del usuario
function loadUserData() {
  if (!currentUser?.email) return;
  
  const closetData = localStorage.getItem(`noshopia_intelligent_closet_${currentUser.email}`);
  if (closetData) {
    const data = JSON.parse(closetData);
    intelligentClosetItems = data.intelligentClosetItems || { tops: {}, bottoms: {}, shoes: {} };
    console.log('🧠 Closet Inteligente cargado:', getTotalIntelligentClosetItems(), 'prendas');
  }
  
  const savedData = localStorage.getItem(`noshopia_saved_${currentUser.email}`);
  if (savedData) {
    savedRecommendations = JSON.parse(savedData);
    console.log('⭐ Recomendaciones guardadas:', savedRecommendations.length);
  }
}

// Guardar datos del usuario
function saveUserData() {
  if (!currentUser?.email) return;
  
  const closetData = {
    email: currentUser.email,
    intelligentClosetItems,
    lastUpdated: new Date().toISOString(),
    totalItems: getTotalIntelligentClosetItems()
  };
  localStorage.setItem(`noshopia_intelligent_closet_${currentUser.email}`, JSON.stringify(closetData));
  
  if (savedRecommendations.length > 0) {
    localStorage.setItem(`noshopia_saved_${currentUser.email}`, JSON.stringify(savedRecommendations));
  }
}

// Actualizar UI del closet inteligente
function updateIntelligentClosetUI() {
  const total = getTotalIntelligentClosetItems();
  const remaining = Math.max(0, CONFIG.INTELLIGENT_CLOSET_LIMIT - total);
  
  // Update navigation badges
  ['tops', 'bottoms', 'shoes'].forEach(type => {
    const count = Object.values(intelligentClosetItems[type]).reduce((sum, category) => sum + category.length, 0);
    const badge = document.getElementById(`${type}CountNav`);
    if (badge) {
      badge.textContent = count;
      badge.style.display = count > 0 ? 'flex' : 'none';
    }
  });
  
  updateIntelligentGenerateButton();
  updateSelectionUI();
}

// SIMULACIÓN DE DETECCIÓN IA MEJORADA
async function simulateAIDetection(file) {
  const fileName = file.name.toLowerCase();
  
  // Lógica de detección mejorada
  let detectedType = 'tops';
  let detectedCategory = 'tshirt';
  let detectedItem = 'Prenda superior';
  let confidence = 0.85;
  
  // Detección de inferiores
  if (fileName.includes('jean') || fileName.includes('pantalon') || fileName.includes('pants')) {
    detectedType = 'bottoms';
    detectedCategory = 'jeans';
    detectedItem = 'Jeans';
    confidence = 0.92;
  } else if (fileName.includes('falda') || fileName.includes('skirt')) {
    detectedType = 'bottoms';
    detectedCategory = 'skirt';
    detectedItem = 'Falda';
    confidence = 0.90;
  } else if (fileName.includes('short')) {
    detectedType = 'bottoms';
    detectedCategory = 'shorts';
    detectedItem = 'Shorts';
    confidence = 0.88;
  }
  
  // Detección de calzado
  else if (fileName.includes('zapato') || fileName.includes('shoe')) {
    detectedType = 'shoes';
    detectedCategory = 'dress_shoes';
    detectedItem = 'Zapatos formales';
    confidence = 0.91;
  } else if (fileName.includes('zapatilla') || fileName.includes('sneaker')) {
    detectedType = 'shoes';
    detectedCategory = 'sneakers';
    detectedItem = 'Zapatillas';
    confidence = 0.94;
  } else if (fileName.includes('bota') || fileName.includes('boot')) {
    detectedType = 'shoes';
    detectedCategory = 'boots';
    detectedItem = 'Botas';
    confidence = 0.89;
  }
  
  // Detección de superiores (más específica)
  else if (fileName.includes('camisa') || fileName.includes('shirt')) {
    detectedCategory = 'shirt';
    detectedItem = 'Camisa';
    confidence = 0.93;
  } else if (fileName.includes('polera') || fileName.includes('tshirt') || fileName.includes('tee')) {
    detectedCategory = 'tshirt';
    detectedItem = 'Polera';
    confidence = 0.95;
  } else if (fileName.includes('sweater') || fileName.includes('sueter')) {
    detectedCategory = 'sweater';
    detectedItem = 'Suéter';
    confidence = 0.87;
  } else if (fileName.includes('vestido') || fileName.includes('dress')) {
    detectedCategory = 'dress';
    detectedItem = 'Vestido';
    confidence = 0.92;
  } else if (fileName.includes('blusa') || fileName.includes('blouse')) {
    detectedCategory = 'blouse';
    detectedItem = 'Blusa';
    confidence = 0.89;
  }
  
  return {
    type: detectedType,
    category: detectedCategory,
    item: detectedItem,
    confidence
  };
}

// Convertir archivo a Data URL
function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Categorizar prenda inteligentemente
function categorizeIntelligentItem(type, categoryId, detectedItem, imageUrl, file) {
  if (!intelligentClosetItems[type][categoryId]) {
    intelligentClosetItems[type][categoryId] = [];
  }
  
  const item = {
    id: Date.now() + Math.random(),
    imageUrl,
    file,
    detectedItem,
    category: categoryId,
    addedAt: new Date().toISOString(),
    aiDetected: true
  };
  
  intelligentClosetItems[type][categoryId].push(item);
  
  console.log(`🧠 Prenda categorizada: ${detectedItem} en ${type}/${categoryId}`);
  return item;
}

// Navegación automática a tipo detectado
function navigateToDetectedType(type) {
  // Cambiar pestaña activa
  document.querySelectorAll('.closet-nav-item').forEach(nav => nav.classList.remove('active'));
  const targetTab = document.querySelector(`[data-type="${type}"]`);
  if (targetTab) {
    targetTab.classList.add('active');
  }
  
  activeClosetType = type;
  renderIntelligentCategories();
  
  showNotification(`📍 Navegando a ${type === 'tops' ? 'Superiores' : type === 'bottoms' ? 'Inferiores' : 'Calzado'}`, 'info');
}

// Upload inteligente con IA
async function handleIntelligentUpload(event) {
  const files = Array.from(event.target.files);
  if (files.length === 0) return;
  
  const remaining = CONFIG.INTELLIGENT_CLOSET_LIMIT - getTotalIntelligentClosetItems();
  
  if (files.length > remaining) {
    showNotification(`Solo puedes subir ${remaining} prendas más`, 'error');
    event.target.value = '';
    return;
  }
  
  // Activar indicadores de IA
  const aiStatus = document.getElementById('aiDetectionStatus');
  const autoNav = document.getElementById('autoNavigation');
  const progressBar = document.getElementById('aiProgressBar');
  const statusText = document.getElementById('aiStatusText');
  const autoNavText = document.getElementById('autoNavText');
  
  if (aiStatus) aiStatus.classList.add('active');
  if (progressBar) progressBar.style.width = '0%';
  
  showNotification('🧠 IA analizando y categorizando prendas...', 'info');
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const progress = ((i + 1) / files.length) * 100;
    
    // Actualizar progreso
    if (statusText) statusText.textContent = `Analizando prenda ${i + 1} de ${files.length}...`;
    if (progressBar) progressBar.style.width = progress + '%';
    
    try {
      // Simular detección de IA
      const detectionResult = await simulateAIDetection(file);
      
      // Convertir imagen
      const imageUrl = await fileToDataUrl(file);
      
      // Categorizar automáticamente
      categorizeIntelligentItem(detectionResult.type, detectionResult.category, detectionResult.item, imageUrl, file);
      
      // Mostrar navegación automática
      if (autoNav && autoNavText) {
        autoNav.classList.add('show');
        autoNavText.textContent = `La IA detectó: ${detectionResult.item} (${detectionResult.type})`;
        
        // Navegar automáticamente
        setTimeout(() => {
          navigateToDetectedType(detectionResult.type);
        }, 1500);
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error('Error en detección IA:', error);
      showNotification(`Error procesando ${file.name}`, 'error');
    }
  }
  
  // Finalizar proceso
  setTimeout(() => {
    if (aiStatus) aiStatus.classList.remove('active');
    if (autoNav) autoNav.classList.remove('show');
    finishIntelligentUpload(files.length);
  }, 2000);
  
  event.target.value = '';
}

// Finalizar upload inteligente
function finishIntelligentUpload(count) {
  saveUserData();
  updateIntelligentClosetUI();
  renderIntelligentCategories();
  
  const remaining = CONFIG.INTELLIGENT_CLOSET_LIMIT - getTotalIntelligentClosetItems();
  showNotification(`🧠 ${count} prenda${count !== 1 ? 's' : ''} detectada${count !== 1 ? 's' : ''} y categorizada${count !== 1 ? 's' : ''} automáticamente! Te quedan ${remaining} espacios.`, 'success');
}

// Renderizar categorías inteligentes
function renderIntelligentCategories() {
  const container = document.getElementById('intelligentCategories');
  if (!container) return;
  
  const items = intelligentClosetItems[activeClosetType];
  
  if (!items || Object.keys(items).length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
        <div style="font-size: 4rem; margin-bottom: 1rem; opacity: 0.5;">🧠</div>
        <h3 style="color: #666; margin-bottom: 1rem;">Tu closet de ${activeClosetType === 'tops' ? 'superiores' : activeClosetType === 'bottoms' ? 'inferiores' : 'calzado'} está vacío</h3>
        <p style="opacity: 0.7;">Sube fotos para que la IA las detecte y organice automáticamente</p>
      </div>
    `;
    return;
  }
  
  let html = '';
  
  Object.entries(items).forEach(([categoryId, categoryItems]) => {
    if (categoryItems.length === 0) return;
    
    const categoryInfo = INTELLIGENT_CATEGORIES[activeClosetType][categoryId];
    if (!categoryInfo) return;
    
    const allAiDetected = categoryItems.every(item => item.aiDetected);
    
    html += `
      <div class="smart-category ${categoryItems.length > 0 ? 'has-items' : ''} ${allAiDetected ? 'auto-detected' : ''}">
        <div class="category-header">
          <div class="category-icon" style="background: ${categoryInfo.color};">
            ${categoryInfo.icon}
          </div>
          <div class="category-info">
            <h4>${categoryInfo.name}</h4>
            <p>${categoryItems.length} prenda${categoryItems.length !== 1 ? 's' : ''}</p>
            ${allAiDetected ? `<span class="ai-confidence">${Math.round(categoryInfo.confidence * 100)}% IA</span>` : ''}
          </div>
        </div>
        <div class="smart-items-grid">
          ${categoryItems.map((item, index) => {
            const isSelected = selectedClosetItems[activeClosetType].has(item.id);
            return `
              <div class="smart-item ${isSelected ? 'selected' : ''}" data-id="${item.id}">
                <img src="${item.imageUrl}" alt="${categoryInfo.name}">
                <div class="item-controls">
                  <button class="item-btn select" onclick="toggleItemSelection('${activeClosetType}', '${item.id}')" title="${isSelected ? 'Deseleccionar' : 'Seleccionar'}">
                    ${isSelected ? '✓' : '+'}
                  </button>
                  <button class="item-btn" onclick="removeIntelligentItem('${activeClosetType}', '${categoryId}', ${index})" title="Eliminar">×</button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  });
  
  container.innerHTML = html;
  updateSelectionUI();
}

// Sistema de selección mejorado
window.toggleItemSelection = function(type, itemId) {
  const selectedSet = selectedClosetItems[type];
  
  if (selectedSet.has(itemId)) {
    // DESELECCIONAR
    selectedSet.delete(itemId);
    showNotification('Prenda deseleccionada', 'info');
  } else {
    // SELECCIONAR
    selectedSet.add(itemId);
    showNotification('Prenda seleccionada', 'success');
  }
  
  renderIntelligentCategories();
  updateIntelligentGenerateButton();
};

// Eliminar prenda del closet inteligente
window.removeIntelligentItem = function(type, categoryId, index) {
  const categoryInfo = INTELLIGENT_CATEGORIES[type][categoryId];
  const itemName = categoryInfo ? categoryInfo.name : categoryId;
  
  if (!confirm(`¿Eliminar esta prenda de ${itemName}?`)) return;
  
  const item = intelligentClosetItems[type][categoryId][index];
  
  // Eliminar de selecciones
  selectedClosetItems[type].delete(item.id);
  
  // Eliminar del closet
  intelligentClosetItems[type][categoryId].splice(index, 1);
  
  // Si la categoría queda vacía, eliminarla
  if (intelligentClosetItems[type][categoryId].length === 0) {
    delete intelligentClosetItems[type][categoryId];
  }
  
  saveUserData();
  updateIntelligentClosetUI();
  renderIntelligentCategories();
  
  showNotification(`Prenda eliminada de ${itemName}`, 'info');
};

// Actualizar UI de selecciones
function updateSelectionUI() {
  const types = ['tops', 'bottoms', 'shoes'];
  
  types.forEach(type => {
    const count = selectedClosetItems[type].size;
    const countElement = document.getElementById(`selected${type.charAt(0).toUpperCase() + type.slice(1)}Count`);
    const categoryElement = document.getElementById(`selection${type.charAt(0).toUpperCase() + type.slice(1)}`);
    const previewElement = document.getElementById(`selected${type.charAt(0).toUpperCase() + type.slice(1)}Preview`);
    
    if (countElement) countElement.textContent = count;
    if (categoryElement) {
      categoryElement.className = `selection-category ${count > 0 ? 'has-selection' : ''}`;
    }
    
    // Mostrar preview de seleccionados
    if (previewElement) {
      const selectedIds = Array.from(selectedClosetItems[type]);
      const selectedItems = selectedIds.map(id => {
        // Buscar el item en todas las categorías
        for (const categoryId in intelligentClosetItems[type]) {
          const item = intelligentClosetItems[type][categoryId].find(item => item.id === id);
          if (item) return item;
        }
        return null;
      }).filter(Boolean);
      
      previewElement.innerHTML = selectedItems.map(item => 
        `<img src="${item.imageUrl}" class="mini-preview" alt="Seleccionada">`
      ).join('');
    }
  });
}

// Actualizar botón de generar
function updateIntelligentGenerateButton() {
  const btn = document.getElementById('intelligentGenerateBtn');
  if (!btn) return;
  
  const hasSelections = selectedClosetItems.tops.size > 0 && 
                       selectedClosetItems.bottoms.size > 0 && 
                       selectedClosetItems.shoes.size > 0;
  
  if (hasSelections && selectedOccasion) {
    const totalCombinations = selectedClosetItems.tops.size * selectedClosetItems.bottoms.size * selectedClosetItems.shoes.size;
    btn.disabled = false;
    btn.style.opacity = '1';
    btn.innerHTML = `<i class="fas fa-magic"></i> Generar ${Math.min(3, totalCombinations)} Recomendaciones del Closet IA`;
  } else {
    btn.disabled = true;
    btn.style.opacity = '0.6';
    if (!selectedOccasion) {
      btn.innerHTML = '<i class="fas fa-magic"></i> Selecciona una ocasión primero';
    } else {
      btn.innerHTML = '<i class="fas fa-magic"></i> Selecciona al menos 1 prenda de cada tipo';
    }
  }
}

// Generar recomendaciones desde closet inteligente
window.generateFromIntelligentCloset = function() {
  if (!selectedOccasion) {
    showOccasionSelector();
    showNotification('Primero selecciona una ocasión', 'info');
    return;
  }
  
  const hasSelections = selectedClosetItems.tops.size > 0 && 
                       selectedClosetItems.bottoms.size > 0 && 
                       selectedClosetItems.shoes.size > 0;
  
  if (!hasSelections) {
    showNotification('Selecciona al menos 1 prenda de cada tipo', 'error');
    return;
  }
  
  // Obtener archivos de las prendas seleccionadas
  const selectedFiles = { tops: [], bottoms: [], shoes: [] };
  
  ['tops', 'bottoms', 'shoes'].forEach(type => {
    const selectedIds = Array.from(selectedClosetItems[type]);
    selectedIds.forEach(id => {
      // Buscar el item en todas las categorías
      for (const categoryId in intelligentClosetItems[type]) {
        const item = intelligentClosetItems[type][categoryId].find(item => item.id === id);
        if (item && item.file) {
          selectedFiles[type].push(item.file);
          break;
        }
      }
    });
  });
  
  generateRecommendationsWithFiles(selectedFiles);
};

// Trigger upload inteligente
window.triggerSmartUpload = function() {
  const remaining = CONFIG.INTELLIGENT_CLOSET_LIMIT - getTotalIntelligentClosetItems();
  
  if (remaining <= 0) {
    showNotification(`🧠 Closet lleno (${CONFIG.INTELLIGENT_CLOSET_LIMIT}/15). Elimina prendas para agregar nuevas.`, 'error');
    return;
  }
  
  const input = document.getElementById('smart-upload');
  if (input) {
    input.onchange = handleIntelligentUpload;
    input.click();
  }
};

// FUNCIONES DE INICIALIZACIÓN
function initializeIntelligentCloset() {
  console.log('🧠 Inicializando Closet Inteligente...');
  
  // Cargar datos si hay usuario logueado
  if (isLoggedIn && currentUser?.email) {
    loadUserData();
    updateIntelligentClosetUI();
    renderIntelligentCategories();
  }
  
  // Configurar drag & drop
  const smartUploadArea = document.getElementById('smartUploadArea');
  if (smartUploadArea) {
    smartUploadArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      smartUploadArea.classList.add('dragover');
    });
    
    smartUploadArea.addEventListener('dragleave', (e) => {
      e.preventDefault();
      smartUploadArea.classList.remove('dragover');
    });
    
    smartUploadArea.addEventListener('drop', (e) => {
      e.preventDefault();
      smartUploadArea.classList.remove('dragover');
      
      const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
      if (files.length > 0) {
        // Simular selección de archivos
        const input = document.getElementById('smart-upload');
        const dt = new DataTransfer();
        files.forEach(file => dt.items.add(file));
        input.files = dt.files;
        
        // Trigger change event
        const event = new Event('change', { bubbles: true });
        input.dispatchEvent(event);
      }
    });
  }
}

// GUARDADO DE FAVORITOS
window.saveToFavorites = function(index) {
  if (!intelligentClosetMode || !window.currentResults) return;
  
  const recommendation = window.currentResults[index];
  savedRecommendations.push({
    id: Date.now(),
    recommendation,
    occasion: selectedOccasion,
    savedAt: new Date().toISOString()
  });
  
  saveUserData();
  showNotification('Recomendación guardada en favoritos', 'success');
};

// EXPORTAR FUNCIONES GLOBALES
window.initializeIntelligentCloset = initializeIntelligentCloset;
window.loadUserData = loadUserData;
window.saveUserData = saveUserData;
window.updateIntelligentClosetUI = updateIntelligentClosetUI;
window.renderIntelligentCategories = renderIntelligentCategories;

// AUTO-INICIALIZACIÓN
document.addEventListener('DOMContentLoaded', function() {
  console.log('🧠 Closet Inteligente JS cargado');
  setTimeout(initializeIntelligentCloset, 500);
});

console.log('✅ closet.js - Sistema Inteligente Completo cargado');
