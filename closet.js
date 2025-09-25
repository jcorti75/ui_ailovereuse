// closet.js - Sistema Completo del Closet con Detección IA
// Versión corregida y robusta para NoshopiA

console.log('🚀 Iniciando sistema completo del closet...');

// =======================================================
// CONFIGURACIÓN Y VARIABLES GLOBALES
// =======================================================

// CATEGORÍAS INTELIGENTES EXACTAS DEL BACKEND
const INTELLIGENT_CATEGORIES = {
  tops: {
    "tshirt": { name: "Poleras", icon: "👕", keywords: ["t-shirt", "tee", "graphic", "tank top"], color: "#10b981" },
    "shirt": { name: "Camisas", icon: "👔", keywords: ["shirt", "dress shirt", "button", "collar"], color: "#3b82f6" },
    "blouse": { name: "Blusas", icon: "👚", keywords: ["blouse", "silk blouse", "flowy"], color: "#ec4899" },
    "sweater": { name: "Suéteres", icon: "🧥", keywords: ["sweater", "knitted", "wool", "pullover", "cardigan"], color: "#f59e0b" },
    "hoodie": { name: "Hoodies", icon: "👘", keywords: ["hoodie", "zip-up", "sweatshirt", "hooded"], color: "#ef4444" },
    "jacket": { name: "Chaquetas", icon: "🧥", keywords: ["jacket", "leather", "denim", "blazer", "outer"], color: "#6b7280" },
    "coat": { name: "Abrigos", icon: "🧥", keywords: ["coat", "winter coat", "overcoat", "trench"], color: "#1f2937" },
    "dress": { name: "Vestidos", icon: "👗", keywords: ["dress", "summer dress", "evening dress", "gown"], color: "#8b5cf6" },
    "vest": { name: "Chalecos", icon: "🦺", keywords: ["vest", "waistcoat"], color: "#84cc16" }
  },
  bottoms: {
    "jeans": { name: "Jeans", icon: "👖", keywords: ["jeans", "denim", "blue jeans", "ripped"], color: "#1e40af" },
    "pants": { name: "Pantalones", icon: "👖", keywords: ["pants", "trousers", "formal pants", "chinos", "slacks"], color: "#3b82f6" },
    "skirt": { name: "Faldas", icon: "👗", keywords: ["skirt", "midi skirt", "pencil skirt", "mini skirt"], color: "#ec4899" },
    "shorts": { name: "Shorts", icon: "🩳", keywords: ["shorts", "athletic shorts", "bermuda"], color: "#10b981" },
    "leggings": { name: "Calzas", icon: "🩱", keywords: ["leggings", "sweatpants", "athletic pants", "yoga pants"], color: "#6b7280" }
  },
  shoes: {
    "sneakers": { name: "Zapatillas", icon: "👟", keywords: ["sneakers", "running shoes", "athletic shoes", "trainers"], color: "#3b82f6" },
    "dress_shoes": { name: "Zapatos Formales", icon: "👞", keywords: ["dress shoes", "leather shoes", "formal shoes", "oxfords"], color: "#1f2937" },
    "boots": { name: "Botas", icon: "🥾", keywords: ["boots", "ankle boots", "hiking boots", "combat boots"], color: "#92400e" },
    "heels": { name: "Tacones", icon: "👠", keywords: ["heels", "stiletto heels", "pumps", "high heels"], color: "#ec4899" },
    "sandals": { name: "Sandalias", icon: "👡", keywords: ["sandals", "leather sandals", "flip flops"], color: "#f59e0b" },
    "flats": { name: "Ballerinas", icon: "🥿", keywords: ["flats", "ballet flats", "loafers"], color: "#6b7280" }
  }
};

// CONFIGURACIÓN GLOBAL (con valores por defecto seguros)
const CONFIG = window.CONFIG || {
  TOTAL_CLOSET_LIMIT: 15,
  FILE_LIMITS: { tops: 3, bottoms: 3, shoes: 5 },
  API_BASE: 'https://api.noshopia.com'
};

// Variables del sistema de closet
let closetMode = false;
let intelligentClosetItems = { tops: {}, bottoms: {}, shoes: {} };
let selectedClosetItems = { tops: new Set(), bottoms: new Set(), shoes: new Set() };
let closetSelectionMode = false;
let activeClosetType = 'tops';

// Variables globales de estado (con inicialización segura)
let currentUser = null;
let isLoggedIn = false;
let selectedOccasion = null;
let uploadedFiles = { tops: [], bottoms: [], shoes: [] };
let uploadedImages = { tops: [], bottoms: [], shoes: [] };
let closetItems = { tops: [], bottoms: [], shoes: [] };
let userStats = { visits: 1, recommendations: 0, savedOutfits: 0 };

// =======================================================
// FUNCIONES AUXILIARES Y UTILIDADES
// =======================================================

// Función de notificación robusta
function showNotification(message, type = 'info') {
  console.log(`📢 ${type.toUpperCase()}: ${message}`);
  
  try {
    // Intentar usar la función global si existe
    if (typeof window.showNotification === 'function') {
      return window.showNotification(message, type);
    }
    
    // Crear notificación propia si no existe
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : '#3b82f6'};
      color: white;
      padding: 1rem 2rem;
      border-radius: 10px;
      z-index: 10000;
      font-weight: 600;
      box-shadow: 0 4px 20px rgba(0,0,0,0.2);
      animation: slideInRight 0.3s ease;
    `;
    notification.textContent = message;
    
    // Agregar animación si no existe
    if (!document.getElementById('notificationStyles')) {
      const style = document.createElement('style');
      style.id = 'notificationStyles';
      style.textContent = `
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `;
      document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 3000);
    
  } catch (error) {
    console.error('Error mostrando notificación:', error);
  }
}

// Obtener usuario actual de manera segura
function getCurrentUser() {
  try {
    if (typeof window.currentUser === 'function') {
      return window.currentUser();
    } else if (window.currentUser && typeof window.currentUser === 'object') {
      return window.currentUser;
    } else {
      return currentUser;
    }
  } catch (error) {
    console.warn('Error obteniendo usuario:', error);
    return null;
  }
}

// Verificar si está logueado de manera segura
function checkIsLoggedIn() {
  try {
    if (typeof window.isLoggedIn === 'function') {
      return window.isLoggedIn();
    } else if (typeof window.isLoggedIn === 'boolean') {
      return window.isLoggedIn;
    } else {
      const user = getCurrentUser();
      return user && user.email;
    }
  } catch (error) {
    console.warn('Error verificando login:', error);
    return false;
  }
}

// Obtener ocasión seleccionada de manera segura
function getSelectedOccasion() {
  try {
    if (typeof window.selectedOccasion === 'function') {
      return window.selectedOccasion();
    } else if (window.selectedOccasion) {
      return window.selectedOccasion;
    } else {
      return selectedOccasion;
    }
  } catch (error) {
    console.warn('Error obteniendo ocasión:', error);
    return null;
  }
}

// Obtener espacios restantes en el closet
function getRemainingClosetSlots() {
  const total = getTotalClosetItems();
  return Math.max(0, CONFIG.TOTAL_CLOSET_LIMIT - total);
}

// Obtener total de items en closet
function getTotalClosetItems() {
  let total = 0;
  ['tops', 'bottoms', 'shoes'].forEach(type => {
    if (closetItems[type] && Array.isArray(closetItems[type])) {
      total += closetItems[type].length;
    }
    // También contar items inteligentes
    if (intelligentClosetItems[type]) {
      Object.values(intelligentClosetItems[type]).forEach(category => {
        if (Array.isArray(category)) {
          total += category.length;
        }
      });
    }
  });
  return total;
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

// =======================================================
// SISTEMA DE DETECCIÓN IA
// =======================================================

// DETECCIÓN AUTOMÁTICA DE PRENDAS ALINEADA CON BACKEND
async function simulateAIDetection(file) {
  console.log('🤖 IA detectando prenda:', file.name);
  
  const fileName = file.name.toLowerCase();
  
  // Inicializar valores por defecto
  let detectedType = 'tops';
  let detectedCategory = 'tshirt';
  let detectedItem = 'Polera';
  let confidence = 0.75;
  
  // DETECCIÓN POR NOMBRE DE ARCHIVO (simulando IA)
  
  // BOTTOMS - Prioridad alta
  if (fileName.includes('jean')) {
    detectedType = 'bottoms'; detectedCategory = 'jeans'; detectedItem = 'Jeans'; confidence = 0.95;
  } else if (fileName.includes('pantalon') || fileName.includes('pants') || fileName.includes('trouser')) {
    detectedType = 'bottoms'; detectedCategory = 'pants'; detectedItem = 'Pantalones'; confidence = 0.92;
  } else if (fileName.includes('falda') || fileName.includes('skirt')) {
    detectedType = 'bottoms'; detectedCategory = 'skirt'; detectedItem = 'Falda'; confidence = 0.90;
  } else if (fileName.includes('short')) {
    detectedType = 'bottoms'; detectedCategory = 'shorts'; detectedItem = 'Shorts'; confidence = 0.88;
  } else if (fileName.includes('calza') || fileName.includes('legging') || fileName.includes('yoga')) {
    detectedType = 'bottoms'; detectedCategory = 'leggings'; detectedItem = 'Calzas'; confidence = 0.89;
  }
  
  // SHOES - Prioridad alta
  else if (fileName.includes('zapatilla') || fileName.includes('sneaker') || fileName.includes('running')) {
    detectedType = 'shoes'; detectedCategory = 'sneakers'; detectedItem = 'Zapatillas'; confidence = 0.94;
  } else if (fileName.includes('zapato') || fileName.includes('dress') && fileName.includes('shoe')) {
    detectedType = 'shoes'; detectedCategory = 'dress_shoes'; detectedItem = 'Zapatos Formales'; confidence = 0.91;
  } else if (fileName.includes('bota') || fileName.includes('boot')) {
    detectedType = 'shoes'; detectedCategory = 'boots'; detectedItem = 'Botas'; confidence = 0.89;
  } else if (fileName.includes('taco') || fileName.includes('heel')) {
    detectedType = 'shoes'; detectedCategory = 'heels'; detectedItem = 'Tacones'; confidence = 0.92;
  } else if (fileName.includes('sandalia') || fileName.includes('sandal') || fileName.includes('flip')) {
    detectedType = 'shoes'; detectedCategory = 'sandals'; detectedItem = 'Sandalias'; confidence = 0.87;
  } else if (fileName.includes('ballerina') || fileName.includes('flat')) {
    detectedType = 'shoes'; detectedCategory = 'flats'; detectedItem = 'Ballerinas'; confidence = 0.86;
  }
  
  // TOPS - Detección específica (si no es bottom ni shoe)
  else if (fileName.includes('camisa') || fileName.includes('shirt')) {
    detectedCategory = 'shirt'; detectedItem = 'Camisa'; confidence = 0.93;
  } else if (fileName.includes('polera') || fileName.includes('tshirt') || fileName.includes('tee')) {
    detectedCategory = 'tshirt'; detectedItem = 'Polera'; confidence = 0.95;
  } else if (fileName.includes('blusa') || fileName.includes('blouse')) {
    detectedCategory = 'blouse'; detectedItem = 'Blusa'; confidence = 0.89;
  } else if (fileName.includes('sweater') || fileName.includes('sueter') || fileName.includes('cardigan')) {
    detectedCategory = 'sweater'; detectedItem = 'Suéter'; confidence = 0.87;
  } else if (fileName.includes('hoodie') || fileName.includes('capucha') || fileName.includes('sudadera')) {
    detectedCategory = 'hoodie'; detectedItem = 'Hoodie'; confidence = 0.91;
  } else if (fileName.includes('chaqueta') || fileName.includes('jacket') || fileName.includes('blazer')) {
    detectedCategory = 'jacket'; detectedItem = 'Chaqueta'; confidence = 0.88;
  } else if (fileName.includes('abrigo') || fileName.includes('coat') || fileName.includes('parka')) {
    detectedCategory = 'coat'; detectedItem = 'Abrigo'; confidence = 0.85;
  } else if (fileName.includes('vestido') || fileName.includes('dress')) {
    detectedCategory = 'dress'; detectedItem = 'Vestido'; confidence = 0.92;
  } else if (fileName.includes('chaleco') || fileName.includes('vest')) {
    detectedCategory = 'vest'; detectedItem = 'Chaleco'; confidence = 0.84;
  }
  
  console.log(`🎯 IA detectó: ${detectedItem} (${detectedType}/${detectedCategory}) - Confianza: ${Math.round(confidence * 100)}%`);
  
  // Simular tiempo de procesamiento
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    type: detectedType,
    category: detectedCategory,
    item: detectedItem,
    confidence
  };
}

// CATEGORIZAR PRENDA INTELIGENTEMENTE
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
  
  // TAMBIÉN agregar a arrays globales para compatibilidad
  if (!uploadedFiles[type]) uploadedFiles[type] = [];
  if (!uploadedImages[type]) uploadedImages[type] = [];
  if (!closetItems[type]) closetItems[type] = [];
  
  uploadedFiles[type].push(file);
  uploadedImages[type].push(imageUrl);
  closetItems[type].push(imageUrl);
  
  console.log(`🧠 Prenda categorizada: ${detectedItem} en ${type}/${categoryId}`);
  return item;
}

// =======================================================
// SISTEMA DE NAVEGACIÓN Y UI
// =======================================================

// NAVEGACIÓN AUTOMÁTICA AL TIPO DETECTADO
function navigateToDetectedType(type) {
  console.log(`📍 Navegando automáticamente a: ${type}`);
  
  try {
    // Cambiar pestaña activa
    document.querySelectorAll('.closet-tab').forEach(tab => tab.classList.remove('active'));
    
    const tabMap = { 'tops': 'superiores', 'bottoms': 'inferiores', 'shoes': 'calzado' };
    const targetTab = document.querySelector(`[data-tab="${tabMap[type]}"]`);
    if (targetTab) {
      targetTab.classList.add('active');
    }
    
    // Mostrar contenido de pestaña
    document.querySelectorAll('.closet-tab-content').forEach(content => {
      content.style.display = 'none';
    });
    
    const targetContent = document.getElementById(tabMap[type]);
    if (targetContent) {
      targetContent.style.display = 'block';
    }
    
    // Actualizar tipo activo
    activeClosetType = type;
    
    // Renderizar categorías
    renderIntelligentCategories();
    
    const typeNames = { tops: 'Superiores', bottoms: 'Inferiores', shoes: 'Calzado' };
    showNotification(`📍 Navegando a ${typeNames[type]}`, 'info');
  } catch (error) {
    console.error('Error navegando:', error);
  }
}

// UPLOAD INTELIGENTE CON IA (función principal)
async function handleIntelligentUpload(event) {
  const files = Array.from(event.target.files);
  if (files.length === 0) return;
  
  // Verificar límites
  const remaining = getRemainingClosetSlots();
  if (files.length > remaining) {
    showNotification(`Solo puedes subir ${remaining} prendas más`, 'error');
    event.target.value = '';
    return;
  }
  
  showNotification('🤖 IA analizando y categorizando prendas...', 'info');
  
  let detectedTypes = new Set();
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    
    try {
      // DETECCIÓN IA
      const detectionResult = await simulateAIDetection(file);
      detectedTypes.add(detectionResult.type);
      
      // Convertir imagen
      const imageUrl = await fileToDataUrl(file);
      
      // CATEGORIZAR AUTOMÁTICAMENTE
      categorizeIntelligentItem(detectionResult.type, detectionResult.category, detectionResult.item, imageUrl, file);
      
    } catch (error) {
      console.error('Error en detección IA:', error);
      showNotification(`Error procesando ${file.name}`, 'error');
    }
  }
  
  // Navegación automática al tipo más común detectado
  if (detectedTypes.size > 0) {
    const mostCommonType = Array.from(detectedTypes)[0];
    setTimeout(() => {
      navigateToDetectedType(mostCommonType);
    }, 1500);
  }
  
  // Finalizar proceso
  finishIntelligentUpload(files.length);
  
  event.target.value = '';
}

// FINALIZAR UPLOAD INTELIGENTE
function finishIntelligentUpload(count) {
  // Guardar datos
  saveUserClosetData();
  
  // Actualizar UI
  updateIntelligentClosetUI();
  renderIntelligentCategories();
  
  const remaining = getRemainingClosetSlots();
  showNotification(`🤖 ${count} prenda${count !== 1 ? 's' : ''} detectada${count !== 1 ? 's' : ''} y categorizada${count !== 1 ? 's' : ''} automáticamente! Quedan ${remaining} espacios.`, 'success');
}

// RENDERIZAR CATEGORÍAS INTELIGENTES
function renderIntelligentCategories() {
  const container = document.getElementById('intelligentCategories');
  if (!container) {
    console.log('Contenedor intelligentCategories no encontrado');
    return;
  }
  
  const items = intelligentClosetItems[activeClosetType];
  
  if (!items || Object.keys(items).length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
        <div style="font-size: 4rem; margin-bottom: 1rem; opacity: 0.5;">🤖</div>
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
      <div class="smart-category" style="background: white; border: 1px solid #e5e7eb; border-radius: 15px; padding: 1.5rem; margin-bottom: 1rem;">
        <div class="category-header" style="display: flex; align-items: center; margin-bottom: 1rem;">
          <div class="category-icon" style="background: ${categoryInfo.color}; color: white; border-radius: 50%; width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; margin-right: 1rem;">
            ${categoryInfo.icon}
          </div>
          <div class="category-info">
            <h4 style="margin: 0; color: #000;">${categoryInfo.name}</h4>
            <p style="margin: 0.25rem 0; color: #666; font-size: 0.9rem;">${categoryItems.length} prenda${categoryItems.length !== 1 ? 's' : ''}</p>
            ${allAiDetected ? `<span class="ai-confidence" style="background: rgba(34, 197, 94, 0.1); color: #059669; padding: 0.25rem 0.5rem; border-radius: 10px; font-size: 0.8rem; font-weight: 600;">🤖 IA Detectado</span>` : ''}
          </div>
        </div>
        <div class="smart-items-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 0.5rem;">
          ${categoryItems.map((item, index) => {
            const isSelected = selectedClosetItems[activeClosetType].has(item.id);
            return `
              <div class="smart-item ${isSelected ? 'selected' : ''}" data-id="${item.id}" style="position: relative; border-radius: 10px; overflow: hidden; cursor: pointer; ${isSelected ? 'border: 2px solid #3b82f6; box-shadow: 0 0 10px rgba(59, 130, 246, 0.3);' : 'border: 1px solid #e5e7eb;'}">
                <img src="${item.imageUrl}" alt="${categoryInfo.name}" style="width: 100%; height: 120px; object-fit: cover;">
                <div class="item-controls" style="position: absolute; top: 5px; right: 5px; display: flex; gap: 5px;">
                  <button class="item-btn select" onclick="toggleItemSelection('${activeClosetType}', '${item.id}')" title="${isSelected ? 'Deseleccionar' : 'Seleccionar'}" style="background: ${isSelected ? '#10b981' : '#3b82f6'}; color: white; border: none; border-radius: 50%; width: 25px; height: 25px; cursor: pointer; font-size: 0.8rem;">
                    ${isSelected ? '✓' : '+'}
                  </button>
                  <button class="item-btn" onclick="removeIntelligentItem('${activeClosetType}', '${categoryId}', ${index})" title="Eliminar" style="background: #ef4444; color: white; border: none; border-radius: 50%; width: 25px; height: 25px; cursor: pointer; font-size: 0.8rem;">×</button>
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

// =======================================================
// SISTEMA DE SELECCIÓN Y GENERACIÓN
// =======================================================

// SISTEMA DE SELECCIÓN MEJORADO
function toggleItemSelection(type, itemId) {
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
}

// ELIMINAR PRENDA DEL CLOSET INTELIGENTE
function removeIntelligentItem(type, categoryId, index) {
  const categoryInfo = INTELLIGENT_CATEGORIES[type][categoryId];
  const itemName = categoryInfo ? categoryInfo.name : categoryId;
  
  if (!confirm(`¿Eliminar esta prenda de ${itemName}?`)) return;
  
  const item = intelligentClosetItems[type][categoryId][index];
  
  // Eliminar de selecciones
  selectedClosetItems[type].delete(item.id);
  
  // Eliminar del closet inteligente
  intelligentClosetItems[type][categoryId].splice(index, 1);
  
  // También eliminar de arrays globales
  const globalIndex = uploadedImages[type].indexOf(item.imageUrl);
  if (globalIndex !== -1) {
    uploadedFiles[type].splice(globalIndex, 1);
    uploadedImages[type].splice(globalIndex, 1);
    closetItems[type].splice(globalIndex, 1);
  }
  
  // Si la categoría queda vacía, eliminarla
  if (intelligentClosetItems[type][categoryId].length === 0) {
    delete intelligentClosetItems[type][categoryId];
  }
  
  // Guardar y actualizar
  saveUserClosetData();
  updateIntelligentClosetUI();
  renderIntelligentCategories();
  
  showNotification(`Prenda eliminada de ${itemName}`, 'info');
}

// ACTUALIZAR UI DEL CLOSET INTELIGENTE
function updateIntelligentClosetUI() {
  const total = getTotalClosetItems();
  const remaining = Math.max(0, CONFIG.TOTAL_CLOSET_LIMIT - total);
  
  // Actualizar contadores de navegación
  ['tops', 'bottoms', 'shoes'].forEach(type => {
    const count = Object.values(intelligentClosetItems[type]).reduce((sum, category) => sum + (Array.isArray(category) ? category.length : 0), 0);
    const badge = document.getElementById(`${type}CountNav`);
    if (badge) {
      badge.textContent = count;
      badge.style.display = count > 0 ? 'flex' : 'none';
    }
  });
  
  updateIntelligentGenerateButton();
  updateSelectionUI();
  
  console.log(`📊 Closet Inteligente: ${total}/${CONFIG.TOTAL_CLOSET_LIMIT} prendas`);
}

// ACTUALIZAR UI DE SELECCIONES
function updateSelectionUI() {
  const types = ['tops', 'bottoms', 'shoes'];
  
  types.forEach(type => {
    const count = selectedClosetItems[type].size;
    const countElement = document.getElementById(`selected${type.charAt(0).toUpperCase() + type.slice(1)}Count`);
    
    if (countElement) countElement.textContent = count;
  });
}

// ACTUALIZAR BOTÓN DE GENERAR INTELIGENTE
function updateIntelligentGenerateButton() {
  const btn = document.getElementById('intelligentGenerateBtn');
  if (!btn) return;
  
  const hasSelections = selectedClosetItems.tops.size > 0 && 
                       selectedClosetItems.bottoms.size > 0 && 
                       selectedClosetItems.shoes.size > 0;
  
  const occasion = getSelectedOccasion();
  
  if (hasSelections && occasion) {
    const totalCombinations = selectedClosetItems.tops.size * selectedClosetItems.bottoms.size * selectedClosetItems.shoes.size;
    btn.disabled = false;
    btn.style.opacity = '1';
    btn.innerHTML = `<i class="fas fa-magic"></i> Generar ${Math.min(5, totalCombinations)} Recomendaciones del Closet IA`;
  } else {
    btn.disabled = true;
    btn.style.opacity = '0.6';
    if (!occasion) {
      btn.innerHTML = '<i class="fas fa-magic"></i> Selecciona una ocasión primero';
    } else {
      btn.innerHTML = '<i class="fas fa-magic"></i> Selecciona al menos 1 prenda de cada tipo';
    }
  }
}

// GENERAR RECOMENDACIONES DESDE CLOSET INTELIGENTE
function generateFromIntelligentCloset() {
  const occasion = getSelectedOccasion();
  
  if (!occasion) {
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
      // Buscar el item en todas las categorías del tipo
      for (const categoryId in intelligentClosetItems[type]) {
        const item = intelligentClosetItems[type][categoryId].find(item => item.id === id);
        if (item && item.file) {
          selectedFiles[type].push(item.file);
          break;
        }
      }
    });
  });
  
  // Usar función de generación de API si existe
  try {
    if (typeof window.generateRecommendationsWithFiles === 'function') {
      window.generateRecommendationsWithFiles(selectedFiles);
    } else if (typeof generateRecommendationsWithFiles === 'function') {
      generateRecommendationsWithFiles(selectedFiles);
    } else {
      showNotification('Generando recomendaciones simuladas...', 'info');
      simulateRecommendations(selectedFiles);
    }
  } catch (error) {
    console.error('Error generando recomendaciones:', error);
    showNotification('Error: Sistema de recomendaciones no disponible', 'error');
  }
}

// Simular generación de recomendaciones (fallback)
function simulateRecommendations(files) {
  setTimeout(() => {
    showNotification(`Recomendaciones generadas con ${files.tops.length} superiores, ${files.bottoms.length} inferiores y ${files.shoes.length} calzados`, 'success');
  }, 2000);
}

// =======================================================
// SISTEMA DE DATOS Y PERSISTENCIA
// =======================================================

// CARGAR DATOS DEL USUARIO
function loadUserClosetData() {
  try {
    const user = getCurrentUser();
    if (!user || !user.email) {
      console.log('No hay usuario logueado para cargar datos');
      return;
    }
    
    const closetData = localStorage.getItem(`noshopia_intelligent_closet_${user.email}`);
    if (closetData) {
      const data = JSON.parse(closetData);
      intelligentClosetItems = data.intelligentClosetItems || { tops: {}, bottoms: {}, shoes: {} };
      closetItems = data.closetItems || { tops: [], bottoms: [], shoes: [] };
      uploadedFiles = data.uploadedFiles || { tops: [], bottoms: [], shoes: [] };
      uploadedImages = data.uploadedImages || { tops: [], bottoms: [], shoes: [] };
      userStats = data.userStats || { visits: 1, recommendations: 0, savedOutfits: 0 };
      
      console.log('🤖 Closet Inteligente cargado:', getTotalClosetItems(), 'prendas');
    }
  } catch (error) {
    console.error('Error cargando datos del closet:', error);
  }
}

// GUARDAR DATOS DEL USUARIO
function saveUserClosetData() {
  try {
    const user = getCurrentUser();
    if (!user || !user.email) {
      console.log('No hay usuario logueado para guardar datos');
      return;
    }
    
    const closetData = {
      email: user.email,
      intelligentClosetItems,
      closetItems,
      uploadedFiles,
      uploadedImages,
      userStats,
      lastUpdated: new Date().toISOString(),
      totalItems: getTotalClosetItems()
    };
    
    localStorage.setItem(`noshopia_intelligent_closet_${user.email}`, JSON.stringify(closetData));
    console.log('💾 Datos del closet guardados');
  } catch (error) {
    console.error('Error guardando datos del closet:', error);
  }
}

// =======================================================
// FUNCIONES PRINCIPALES DEL CLOSET
// =======================================================

// ACTIVAR MODO CLOSET
function enableCloset() {
  console.log('✨ Activando modo closet...');
  
  closetMode = true;
  
  try {
    // Ocultar pregunta del closet
    const closetQuestion = document.getElementById('closetQuestion');
    if (closetQuestion) {
      closetQuestion.style.display = 'none';
    }
    
    // Mostrar contenedor del closet
    const closetContainer = document.getElementById('closetContainer');
    if (closetContainer) {
      closetContainer.style.display = 'block';
      
      // Mostrar email del usuario
      const userEmail = document.getElementById('userEmail');
      if (userEmail) {
        const user = getCurrentUser();
        userEmail.textContent = user && user.email ? user.email : 'Usuario';
      }
      
      // Cargar datos del usuario
      loadUserClosetData();
      updateIntelligentClosetUI();
      
      // Configurar upload inteligente
      setTimeout(() => {
        setupClosetFolderUploads();
      }, 500);
      
      showNotification('Mi Closet Favorito activado', 'success');
    } else {
      console.error('No se encontró closetContainer');
      showNotification('Error: No se pudo activar el closet', 'error');
    }
  } catch (error) {
    console.error('Error activando closet:', error);
    showNotification('Error activando closet', 'error');
  }
}

// USAR MODO DIRECTO
function useDirectMode() {
  console.log('⚡ Activando modo directo...');
  
  closetMode = false;
  
  try {
    // Ocultar pregunta del closet
    const closetQuestion = document.getElementById('closetQuestion');
    if (closetQuestion) {
      closetQuestion.style.display = 'none';
    }
    
    // Mostrar selector de ocasiones
    const occasionSelector = document.getElementById('occasionSelector');
    if (occasionSelector) {
      occasionSelector.style.display = 'block';
      setupOccasionSelector();
    }
    
    // Mostrar área de upload
    const uploadArea = document.getElementById('uploadArea');
    if (uploadArea) {
      uploadArea.style.display = 'block';
    }
    
    showNotification('Modo directo activado', 'success');
  } catch (error) {
    console.error('Error activando modo directo:', error);
    showNotification('Error activando modo directo', 'error');
  }
}

// MOSTRAR PESTAÑA DEL CLOSET
function showClosetTab(tabId) {
  console.log('📂 Mostrando pestaña:', tabId);
  
  try {
    // Ocultar todas las pestañas de contenido
    document.querySelectorAll('.closet-tab-content').forEach(content => {
      content.style.display = 'none';
    });
    
    // Remover clase active de todas las pestañas
    document.querySelectorAll('.closet-tab').forEach(tab => {
      tab.classList.remove('active');
    });
    
    // Mostrar pestaña seleccionada
    const selectedContent = document.getElementById(tabId);
    if (selectedContent) {
      selectedContent.style.display = 'block';
    }
    
    // Activar tab correspondiente
    const selectedTab = document.querySelector(`[data-tab="${tabId}"]`);
    if (selectedTab) {
      selectedTab.classList.add('active');
    }
    
    // Actualizar tipo activo para el sistema inteligente
    const typeMap = { 'superiores': 'tops', 'inferiores': 'bottoms', 'calzado': 'shoes' };
    if (typeMap[tabId]) {
      activeClosetType = typeMap[tabId];
      renderIntelligentCategories();
    }
    
    // Configurar carpetas para upload
    setTimeout(() => {
      setupClosetFolderUploads();
    }, 200);
  } catch (error) {
    console.error('Error mostrando pestaña:', error);
  }
}

// =======================================================
// CONFIGURACIÓN DE UPLOADS Y CARPETAS
// =======================================================

// CONFIGURAR SUBIDA DESDE CARPETAS DEL CLOSET
function setupClosetFolderUploads() {
  console.log('🗂️ Configurando subida desde carpetas del closet...');
  
  const allFolders = document.querySelectorAll('.folder-item');
  
  allFolders.forEach((folder, index) => {
    // Clonar elemento para limpiar listeners anteriores
    const newFolder = folder.cloneNode(true);
    folder.parentNode.replaceChild(newFolder, folder);
    
    // Agregar nuevo listener
    newFolder.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      if (!checkIsLoggedIn()) {
        showNotification('Debes iniciar sesión primero', 'error');
        return;
      }
      
      // Verificar límite total
      const remaining = getRemainingClosetSlots();
      if (remaining <= 0) {
        showNotification(`⚠️ Armario lleno (${getTotalClosetItems()}/${CONFIG.TOTAL_CLOSET_LIMIT}). Elimina prendas para agregar nuevas.`, 'error');
        return;
      }
      
      const folderName = this.querySelector('.folder-name')?.textContent || 'Carpeta';
      
      // Crear input de archivo temporal
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'image/*';
      fileInput.multiple = true;
      fileInput.style.display = 'none';
      
      // Cuando se seleccionen archivos
      fileInput.onchange = function(e) {
        handleIntelligentUpload(e);
      };
      
      // Agregar al DOM y hacer click
      document.body.appendChild(fileInput);
      fileInput.click();
      
      // Limpiar después de uso
      setTimeout(() => {
        if (document.body.contains(fileInput)) {
          document.body.removeChild(fileInput);
        }
      }, 1000);
    });
    
    // Mejorar estilos hover
    newFolder.style.cursor = 'pointer';
    newFolder.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-5px)';
      this.style.boxShadow = '0 10px 30px rgba(0,0,0,0.15)';
      this.style.borderColor = 'var(--primary)';
    });
    
    newFolder.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0)';
      this.style.boxShadow = '0 2px 10px rgba(0,0,0,0.05)';
      this.style.borderColor = 'var(--border)';
    });
  });
  
  console.log('✅ Todas las carpetas configuradas para subida');
}

// CONFIGURAR SELECTOR DE OCASIONES
function setupOccasionSelector() {
  console.log('🎯 Configurando selector de ocasiones...');
  
  const occasionBtns = document.querySelectorAll('.occasion-btn');
  occasionBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      // Remover selección anterior
      occasionBtns.forEach(b => b.classList.remove('selected'));
      
      // Seleccionar actual
      this.classList.add('selected');
      
      // Guardar ocasión
      const occasion = this.dataset.occasion;
      selectedOccasion = occasion;
      
      // Intentar también guardar globalmente
      if (window.selectedOccasion !== undefined) {
        window.selectedOccasion = occasion;
      }
      
      console.log('Ocasión seleccionada:', occasion);
      showNotification(`Ocasión: ${occasion}`, 'success');
      
      // Actualizar botones de generar
      updateIntelligentGenerateButton();
    });
  });
}

// TRIGGER UPLOAD INTELIGENTE
function triggerSmartUpload() {
  const remaining = CONFIG.TOTAL_CLOSET_LIMIT - getTotalClosetItems();
  
  if (remaining <= 0) {
    showNotification(`🤖 Closet lleno (${CONFIG.TOTAL_CLOSET_LIMIT}/15). Elimina prendas para agregar nuevas.`, 'error');
    return;
  }
  
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.multiple = true;
  input.style.display = 'none';
  
  input.onchange = handleIntelligentUpload;
  
  document.body.appendChild(input);
  input.click();
  
  setTimeout(() => {
    if (document.body.contains(input)) {
      document.body.removeChild(input);
    }
  }, 1000);
}

// =======================================================
// CONFIGURACIÓN DE EVENT LISTENERS Y BOTONES
// =======================================================

// CONFIGURACIÓN ROBUSTA DE BOTONES DEL CLOSET
function setupClosetButtons() {
  console.log('🔧 Configurando botones del closet...');
  
  // Buscar botones con múltiples métodos
  let enableBtn = document.getElementById('enableClosetBtn') || 
                  document.querySelector('.closet-option:first-child') ||
                  document.querySelector('[onclick*="enableCloset"]');
                  
  let directBtn = document.getElementById('useDirectModeBtn') || 
                  document.querySelector('.closet-option:last-child') ||
                  document.querySelector('[onclick*="useDirectMode"]');
  
  // También buscar por contenido de texto
  if (!enableBtn || !directBtn) {
    const options = document.querySelectorAll('.closet-option');
    options.forEach(option => {
      const text = option.textContent.toLowerCase();
      if (text.includes('closet') || text.includes('digital')) {
        enableBtn = option;
      } else if (text.includes('directo') || text.includes('rápid')) {
        directBtn = option;
      }
    });
  }
  
  // Configurar botón Mi Closet Digital
  if (enableBtn) {
    console.log('✅ Configurando botón Mi Closet Digital...');
    
    // Remover listeners anteriores clonando el elemento
    const newEnableBtn = enableBtn.cloneNode(true);
    enableBtn.parentNode.replaceChild(newEnableBtn, enableBtn);
    
    // Agregar nuevo listener
    newEnableBtn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      console.log('🎯 CLICK DETECTADO: Mi Closet Digital');
      enableCloset();
    });
    
    newEnableBtn.style.cursor = 'pointer';
    console.log('✅ Botón Mi Closet Digital configurado exitosamente');
  } else {
    console.warn('❌ No se pudo encontrar el botón enableCloset');
  }
  
  // Configurar botón Recomendaciones Rápidas
  if (directBtn) {
    console.log('✅ Configurando botón Recomendaciones Rápidas...');
    
    // Remover listeners anteriores clonando el elemento
    const newDirectBtn = directBtn.cloneNode(true);
    directBtn.parentNode.replaceChild(newDirectBtn, directBtn);
    
    // Agregar nuevo listener
    newDirectBtn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      console.log('🎯 CLICK DETECTADO: Recomendaciones Rápidas');
      useDirectMode();
    });
    
    newDirectBtn.style.cursor = 'pointer';
    console.log('✅ Botón Recomendaciones Rápidas configurado exitosamente');
  } else {
    console.warn('❌ No se pudo encontrar el botón directMode');
  }
}

// CONFIGURAR PESTAÑAS DEL CLOSET
function setupClosetTabs() {
  console.log('📂 Configurando pestañas del closet...');
  
  const tabs = document.querySelectorAll('.closet-tab');
  tabs.forEach(tab => {
    // Remover listeners anteriores
    const newTab = tab.cloneNode(true);
    tab.parentNode.replaceChild(newTab, tab);
    
    // Agregar nuevo listener
    newTab.addEventListener('click', function() {
      const tabId = this.dataset.tab;
      if (tabId) {
        showClosetTab(tabId);
      }
    });
  });
  
  console.log('✅ Pestañas del closet configuradas');
}

// =======================================================
// FUNCIONES EXPUESTAS GLOBALMENTE
// =======================================================

// Exponer funciones necesarias globalmente
window.enableCloset = enableCloset;
window.useDirectMode = useDirectMode;
window.showClosetTab = showClosetTab;
window.toggleItemSelection = toggleItemSelection;
window.removeIntelligentItem = removeIntelligentItem;
window.generateFromIntelligentCloset = generateFromIntelligentCloset;
window.triggerSmartUpload = triggerSmartUpload;

// Función para mostrar opciones después del perfil
window.showClosetOptionsAfterProfile = function() {
  console.log('🎯 Mostrando opciones del closet después del perfil...');
  
  // Ocultar formulario de perfil
  const profileForm = document.getElementById('profileForm');
  if (profileForm) {
    profileForm.style.display = 'none';
  }
  
  // Ocultar sección de bienvenida
  const welcomeSection = document.getElementById('welcomeSection');
  if (welcomeSection) {
    welcomeSection.style.display = 'none';
  }
  
  // Mostrar pregunta del closet
  const closetQuestion = document.getElementById('closetQuestion');
  if (closetQuestion) {
    closetQuestion.style.display = 'block';
    
    // Reconfigurar botones después de mostrar
    setTimeout(setupClosetButtons, 500);
  }
};

// =======================================================
// INICIALIZACIÓN Y OBSERVERS
// =======================================================

// FUNCIÓN DE INICIALIZACIÓN COMPLETA
function initializeClosetSystem() {
  console.log('🚀 Inicializando sistema completo del closet...');
  
  // Inicializar variables globales seguras
  if (typeof window.currentUser !== 'undefined') {
    currentUser = window.currentUser;
  }
  if (typeof window.isLoggedIn !== 'undefined') {
    isLoggedIn = window.isLoggedIn;
  }
  if (typeof window.selectedOccasion !== 'undefined') {
    selectedOccasion = window.selectedOccasion;
  }
  
  // Configurar botones y pestañas
  let attempts = 0;
  const maxAttempts = 5;
  
  const setupInterval = setInterval(() => {
    attempts++;
    console.log(`🔄 Intento de configuración ${attempts}/${maxAttempts}`);
    
    const closetQuestion = document.getElementById('closetQuestion');
    const closetContainer = document.getElementById('closetContainer');
    
    if (closetQuestion || closetContainer) {
      setupClosetButtons();
      setupClosetTabs();
      clearInterval(setupInterval);
      console.log('✅ Sistema del closet configurado exitosamente');
    } else if (attempts >= maxAttempts) {
      console.log('⚠️ Configurando con elementos disponibles...');
      setupClosetButtons();
      setupClosetTabs();
      clearInterval(setupInterval);
    }
  }, 1000);
  
  // Cargar datos si hay usuario logueado
  if (checkIsLoggedIn()) {
    loadUserClosetData();
    updateIntelligentClosetUI();
  }
}

// Observer para detectar cambios en closetQuestion
const closetObserver = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.type === 'attributes' && 
        mutation.target.id === 'closetQuestion' && 
        mutation.target.style.display === 'block') {
      
      console.log('👁️ Observer detectó closetQuestion visible - reconfigurando botones');
      setTimeout(setupClosetButtons, 200);
    }
  });
});

// Iniciar observer si el elemento existe
setTimeout(() => {
  const closetQuestion = document.getElementById('closetQuestion');
  if (closetQuestion) {
    closetObserver.observe(closetQuestion, {
      attributes: true,
      attributeFilter: ['style']
    });
    console.log('👁️ Observer configurado para closetQuestion');
  }
}, 1000);

// =======================================================
// AUTO-INICIALIZACIÓN
// =======================================================

// Inicialización automática con múltiples puntos de entrada
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM cargado - iniciando sistema del closet');
    setTimeout(initializeClosetSystem, 1000);
  });
} else {
  console.log('📄 DOM ya listo - iniciando sistema inmediato');
  setTimeout(initializeClosetSystem, 500);
}

// También inicializar cuando la página esté completamente cargada
window.addEventListener('load', () => {
  console.log('🌐 Página completamente cargada - verificando sistema');
  setTimeout(() => {
    if (!document.querySelector('.closet-option[data-configured="true"]')) {
      console.log('🔄 Reconfigurando sistema después de carga completa');
      setupClosetButtons();
    }
  }, 2000);
});

// FUNCIÓN CORREGIDA PARA MODO DIRECTO
function useDirectMode() {
  console.log('⚡ Activando modo directo...');
  
  closetMode = false;
  
  try {
    // 1. Ocultar pregunta del closet
    const closetQuestion = document.getElementById('closetQuestion');
    if (closetQuestion) {
      closetQuestion.style.display = 'none';
      console.log('✅ closetQuestion ocultado');
    }
    
    // 2. Mostrar selector de ocasiones
    const occasionSelector = document.getElementById('occasionSelector');
    if (occasionSelector) {
      occasionSelector.style.display = 'block';
      console.log('✅ occasionSelector mostrado');
      
      // CRÍTICO: Configurar botones de ocasión inmediatamente
      setupOccasionButtons();
    } else {
      console.error('❌ No se encontró occasionSelector');
    }
    
    // 3. Mostrar área de upload
    const uploadArea = document.getElementById('uploadArea');
    if (uploadArea) {
      uploadArea.style.display = 'block';
      console.log('✅ uploadArea mostrado');
      
      // CRÍTICO: Configurar inputs de archivo
      setupFileInputs();
    } else {
      console.error('❌ No se encontró uploadArea');
    }
    
    // 4. Inicializar variables globales de upload si no existen
    if (!window.uploadedFiles) {
      window.uploadedFiles = { tops: [], bottoms: [], shoes: [] };
      window.uploadedImages = { tops: [], bottoms: [], shoes: [] };
    }
    
    // 5. Verificar y actualizar botón de generar
    setTimeout(() => {
      updateGenerateButtonDirect();
    }, 500);
    
    showNotification('Recomendaciones Rápidas activado', 'success');
    
  } catch (error) {
    console.error('Error activando modo directo:', error);
    showNotification('Error activando modo directo', 'error');
  }
}

// CONFIGURAR BOTONES DE OCASIÓN PARA MODO DIRECTO
function setupOccasionButtons() {
  console.log('🎯 Configurando botones de ocasión...');
  
  const occasionBtns = document.querySelectorAll('.occasion-btn');
  console.log(`Encontrados ${occasionBtns.length} botones de ocasión`);
  
  occasionBtns.forEach((btn, index) => {
    // Remover listeners anteriores clonando
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
    
    newBtn.addEventListener('click', function() {
      console.log(`🎯 Ocasión seleccionada: ${this.dataset.occasion}`);
      
      // Remover selección anterior
      document.querySelectorAll('.occasion-btn').forEach(b => {
        b.classList.remove('selected');
        b.style.borderColor = 'var(--border)';
        b.style.background = 'var(--background)';
      });
      
      // Seleccionar actual
      this.classList.add('selected');
      this.style.borderColor = 'var(--primary)';
      this.style.background = 'rgba(59, 130, 246, 0.1)';
      
      // Guardar ocasión GLOBALMENTE
      const occasion = this.dataset.occasion;
      selectedOccasion = occasion;
      window.selectedOccasion = occasion;
      
      console.log('✅ Ocasión guardada:', occasion);
      showNotification(`Ocasión seleccionada: ${occasion}`, 'success');
      
      // CRÍTICO: Actualizar botón de generar inmediatamente
      updateGenerateButtonDirect();
    });
  });
  
  console.log('✅ Botones de ocasión configurados');
}

// CONFIGURAR INPUTS DE ARCHIVO PARA MODO DIRECTO
function setupFileInputs() {
  console.log('📁 Configurando inputs de archivo...');
  
  const fileInputs = [
    { id: 'tops-upload', type: 'tops', label: 'tops-preview' },
    { id: 'bottoms-upload', type: 'bottoms', label: 'bottoms-preview' },
    { id: 'shoes-upload', type: 'shoes', label: 'shoes-preview' }
  ];
  
  fileInputs.forEach(config => {
    const input = document.getElementById(config.id);
    if (input) {
      // Remover listeners anteriores
      const newInput = input.cloneNode(true);
      input.parentNode.replaceChild(newInput, input);
      
      newInput.addEventListener('change', function(e) {
        console.log(`📷 Archivos seleccionados para ${config.type}:`, e.target.files.length);
        handleDirectFileUpload(config.type, this);
      });
      
      console.log(`✅ Input configurado: ${config.id}`);
    } else {
      console.warn(`❌ No se encontró input: ${config.id}`);
    }
  });
}

// MANEJAR UPLOAD DE ARCHIVOS EN MODO DIRECTO
function handleDirectFileUpload(type, input) {
  const files = Array.from(input.files);
  if (files.length === 0) return;
  
  console.log(`📤 Procesando ${files.length} archivos para ${type}`);
  
  // Verificar límites
  const limits = { tops: 3, bottoms: 3, shoes: 5 };
  if (files.length > limits[type]) {
    showNotification(`Máximo ${limits[type]} archivos para ${type}`, 'error');
    input.value = '';
    return;
  }
  
  // Inicializar arrays si no existen
  if (!window.uploadedFiles) window.uploadedFiles = { tops: [], bottoms: [], shoes: [] };
  if (!window.uploadedImages) window.uploadedImages = { tops: [], bottoms: [], shoes: [] };
  
  // Limpiar archivos anteriores del tipo
  window.uploadedFiles[type] = [];
  window.uploadedImages[type] = [];
  
  // Procesar cada archivo
  let processedCount = 0;
  
  files.forEach(async (file, index) => {
    try {
      // Convertir a data URL
      const reader = new FileReader();
      reader.onload = function(e) {
        window.uploadedFiles[type].push(file);
        window.uploadedImages[type].push(e.target.result);
        
        processedCount++;
        
        // Actualizar preview
        updatePreview(type, window.uploadedImages[type]);
        
        // Si terminamos de procesar todos
        if (processedCount === files.length) {
          console.log(`✅ ${files.length} archivos procesados para ${type}`);
          updateGenerateButtonDirect();
          updateUploadLabel(type);
        }
      };
      reader.readAsDataURL(file);
      
    } catch (error) {
      console.error('Error procesando archivo:', error);
    }
  });
  
  showNotification(`${files.length} archivo(s) agregado(s) a ${type}`, 'success');
}

// ACTUALIZAR PREVIEW DE IMÁGENES
function updatePreview(type, images) {
  const previewContainer = document.getElementById(`${type}-preview`);
  if (!previewContainer) return;
  
  previewContainer.innerHTML = '';
  
  images.forEach((imageUrl, index) => {
    const imgContainer = document.createElement('div');
    imgContainer.style.cssText = 'position: relative; display: inline-block; margin: 5px;';
    
    const img = document.createElement('img');
    img.src = imageUrl;
    img.style.cssText = 'width: 80px; height: 80px; object-fit: cover; border-radius: 10px; border: 2px solid var(--primary);';
    
    const removeBtn = document.createElement('button');
    removeBtn.innerHTML = '×';
    removeBtn.style.cssText = `
      position: absolute; top: -8px; right: -8px; 
      background: #ef4444; color: white; border: none; 
      border-radius: 50%; width: 20px; height: 20px; 
      cursor: pointer; font-size: 12px;
    `;
    removeBtn.onclick = () => removeImage(type, index);
    
    imgContainer.appendChild(img);
    imgContainer.appendChild(removeBtn);
    previewContainer.appendChild(imgContainer);
  });
}

// REMOVER IMAGEN DEL PREVIEW
function removeImage(type, index) {
  if (window.uploadedFiles && window.uploadedFiles[type]) {
    window.uploadedFiles[type].splice(index, 1);
    window.uploadedImages[type].splice(index, 1);
    
    updatePreview(type, window.uploadedImages[type]);
    updateGenerateButtonDirect();
    updateUploadLabel(type);
    
    showNotification('Imagen eliminada', 'info');
  }
}

// ACTUALIZAR LABEL DE UPLOAD
function updateUploadLabel(type) {
  const label = document.querySelector(`label[for="${type}-upload"]`);
  if (label && window.uploadedFiles && window.uploadedFiles[type]) {
    const count = window.uploadedFiles[type].length;
    const limits = { tops: 3, bottoms: 3, shoes: 5 };
    const typeNames = { tops: 'Superiores', bottoms: 'Inferiores', shoes: 'Zapatos' };
    
    if (count === 0) {
      label.innerHTML = `📤 Subir ${typeNames[type]} (máx ${limits[type]})`;
    } else {
      label.innerHTML = `✅ ${count}/${limits[type]} ${typeNames[type]} subido(s)`;
    }
  }
}

// ACTUALIZAR BOTÓN DE GENERAR PARA MODO DIRECTO
function updateGenerateButtonDirect() {
  const generateBtn = document.getElementById('generateBtn');
  if (!generateBtn) {
    console.warn('❌ No se encontró generateBtn');
    return;
  }
  
  // Verificar ocasión
  const hasOccasion = selectedOccasion || window.selectedOccasion;
  
  // Verificar archivos
  let hasAllFiles = false;
  if (window.uploadedFiles) {
    const hasTops = window.uploadedFiles.tops && window.uploadedFiles.tops.length > 0;
    const hasBottoms = window.uploadedFiles.bottoms && window.uploadedFiles.bottoms.length > 0;
    const hasShoes = window.uploadedFiles.shoes && window.uploadedFiles.shoes.length > 0;
    hasAllFiles = hasTops && hasBottoms && hasShoes;
  }
  
  console.log('Estado del botón generar:');
  console.log('- Ocasión:', hasOccasion);
  console.log('- Archivos completos:', hasAllFiles);
  console.log('- uploadedFiles:', window.uploadedFiles);
  
  if (hasOccasion && hasAllFiles) {
    // HABILITAR botón
    generateBtn.disabled = false;
    generateBtn.style.opacity = '1';
    generateBtn.style.cursor = 'pointer';
    generateBtn.style.background = 'linear-gradient(135deg, var(--success), #059669)';
    generateBtn.innerHTML = '<i class="fas fa-magic"></i> Generar Recomendaciones';
    
    console.log('✅ Botón de generar HABILITADO');
  } else {
    // DESHABILITAR botón
    generateBtn.disabled = true;
    generateBtn.style.opacity = '0.6';
    generateBtn.style.cursor = 'not-allowed';
    generateBtn.style.background = 'linear-gradient(135deg, #6b7280, #4b5563)';
    
    if (!hasOccasion) {
      generateBtn.innerHTML = '<i class="fas fa-calendar"></i> Selecciona una ocasión primero';
    } else if (!hasAllFiles) {
      generateBtn.innerHTML = '<i class="fas fa-upload"></i> Sube fotos de cada categoría para continuar';
    }
    
    console.log('❌ Botón de generar DESHABILITADO');
  }
}

// AGREGAR A LA FUNCIÓN useDirectMode ORIGINAL
// Esta función debe reemplazar la que está en el código principal
console.log('✅ Sistema completo del closet cargado - versión robusta con IA');



// =======================================================
// FIN DEL ARCHIVO
// =======================================================
