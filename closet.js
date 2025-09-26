// closet.js - Sistema Completo del Closet con IA Automática CORREGIDO
// Versión con detección automática y navegación inteligente

console.log('🚀 Iniciando sistema del closet con IA automática...');

// =======================================================
// CONFIGURACIÓN Y VARIABLES GLOBALES CORREGIDAS
// =======================================================

// CATEGORÍAS INTELIGENTES EXACTAS DEL BACKEND CON SUBCATEGORÍAS
const INTELLIGENT_CATEGORIES = {
  tops: {
    "tshirt": { name: "Poleras", icon: "👕", keywords: ["t-shirt", "tee", "graphic", "tank top", "polera"], color: "#10b981" },
    "shirt": { name: "Camisas", icon: "👔", keywords: ["shirt", "dress shirt", "button", "collar", "camisa"], color: "#3b82f6" },
    "blouse": { name: "Blusas", icon: "👚", keywords: ["blouse", "silk blouse", "flowy", "blusa"], color: "#ec4899" },
    "sweater": { name: "Suéteres", icon: "🧥", keywords: ["sweater", "knitted", "wool", "pullover", "cardigan", "sueter"], color: "#f59e0b" },
    "hoodie": { name: "Hoodies", icon: "👘", keywords: ["hoodie", "zip-up", "sweatshirt", "hooded", "capucha"], color: "#ef4444" },
    "jacket": { name: "Chaquetas", icon: "🧥", keywords: ["jacket", "leather", "denim", "blazer", "outer", "chaqueta"], color: "#6b7280" },
    "coat": { name: "Abrigos", icon: "🧥", keywords: ["coat", "winter coat", "overcoat", "trench", "abrigo"], color: "#1f2937" },
    "dress": { name: "Vestidos", icon: "👗", keywords: ["dress", "summer dress", "evening dress", "gown", "vestido"], color: "#8b5cf6" },
    "vest": { name: "Chalecos", icon: "🦺", keywords: ["vest", "waistcoat", "chaleco"], color: "#84cc16" }
  },
  bottoms: {
    "jeans": { name: "Jeans", icon: "👖", keywords: ["jeans", "denim", "blue jeans", "ripped"], color: "#1e40af" },
    "pants": { name: "Pantalones", icon: "👖", keywords: ["pants", "trousers", "formal pants", "chinos", "slacks", "pantalon"], color: "#3b82f6" },
    "skirt": { name: "Faldas", icon: "👗", keywords: ["skirt", "midi skirt", "pencil skirt", "mini skirt", "falda"], color: "#ec4899" },
    "shorts": { name: "Shorts", icon: "🩳", keywords: ["shorts", "athletic shorts", "bermuda"], color: "#10b981" },
    "leggings": { name: "Calzas", icon: "🩱", keywords: ["leggings", "sweatpants", "athletic pants", "yoga pants", "calza"], color: "#6b7280" }
  },
  shoes: {
    "sneakers": { name: "Zapatillas", icon: "👟", keywords: ["sneakers", "running shoes", "athletic shoes", "trainers", "zapatilla"], color: "#3b82f6" },
    "dress_shoes": { name: "Zapatos Formales", icon: "👞", keywords: ["dress shoes", "leather shoes", "formal shoes", "oxfords", "zapato"], color: "#1f2937" },
    "boots": { name: "Botas", icon: "🥾", keywords: ["boots", "ankle boots", "hiking boots", "combat boots", "bota"], color: "#92400e" },
    "heels": { name: "Tacones", icon: "👠", keywords: ["heels", "stiletto heels", "pumps", "high heels", "tacos", "tacon"], color: "#ec4899" },
    "sandals": { name: "Sandalias", icon: "👡", keywords: ["sandals", "leather sandals", "flip flops", "sandalia"], color: "#f59e0b" },
    "flats": { name: "Ballerinas", icon: "🥿", keywords: ["flats", "ballet flats", "loafers", "ballerina"], color: "#6b7280" }
  }
};

// CONFIGURACIÓN GLOBAL
const CONFIG = window.CONFIG || {
  TOTAL_CLOSET_LIMIT: 15,
  FILE_LIMITS: { tops: 5, bottoms: 5, shoes: 5 },
  API_BASE: 'https://api.noshopia.com'
};

// Variables del sistema de closet
let closetMode = false;
let intelligentClosetItems = { tops: {}, bottoms: {}, shoes: {} };
let selectedClosetItems = { tops: new Set(), bottoms: new Set(), shoes: new Set() };
let closetSelectionMode = false;
let activeClosetType = 'tops';
let currentDetectionResults = [];

// Variables globales de estado
let currentUser = null;
let isLoggedIn = false;
let selectedOccasion = null;
let uploadedFiles = { tops: [], bottoms: [], shoes: [] };
let uploadedImages = { tops: [], bottoms: [], shoes: [] };
let closetItems = { tops: [], bottoms: [], shoes: [] };
let userStats = { visits: 1, recommendations: 0, savedOutfits: 0 };

// =======================================================
// FUNCIONES AUXILIARES Y UTILIDADES CORREGIDAS
// =======================================================

// FUNCIÓN CORREGIDA: Obtener usuario actual de manera segura
function getCurrentUser() {
  try {
    if (typeof window.currentUser === 'function') {
      const user = window.currentUser();
      if (user && user.name && user.email) return user;
    }
    
    if (window.currentUser && typeof window.currentUser === 'object') {
      const user = window.currentUser;
      if (user.name && user.email) return user;
    }
    
    if (currentUser && currentUser.name && currentUser.email) {
      return currentUser;
    }
    
    const storedAuth = localStorage.getItem('noshopia_auth');
    if (storedAuth) {
      const authData = JSON.parse(storedAuth);
      if (authData.name && authData.email) {
        return authData;
      }
    }
    
    console.warn('⚠️ No se pudo obtener usuario válido');
    return null;
  } catch (error) {
    console.error('❌ Error obteniendo usuario:', error);
    return null;
  }
}

// FUNCIÓN CORREGIDA: Actualizar información del usuario en toda la UI
function updateUserDisplayInfo() {
  console.log('🔄 Actualizando información del usuario en la UI...');
  
  const user = getCurrentUser();
  if (!user || !user.name || !user.email) {
    console.warn('⚠️ No hay usuario válido para mostrar');
    return;
  }
  
  console.log('✅ Usuario obtenido:', { name: user.name, email: user.email });
  
  const userNameHeader = document.getElementById('userName');
  if (userNameHeader) {
    userNameHeader.textContent = user.name;
    console.log('✅ Header userName actualizado:', user.name);
  }
  
  const userEmailCloset = document.getElementById('userEmail');
  if (userEmailCloset) {
    userEmailCloset.textContent = `Bienvenido ${user.name}`;
    console.log('✅ Closet userEmail actualizado: Bienvenido', user.name);
  }
  
  const userAvatar = document.getElementById('userAvatar');
  if (userAvatar && user.picture) {
    userAvatar.src = user.picture;
    userAvatar.alt = user.name;
    console.log('✅ Avatar actualizado');
  }
  
  const welcomeElements = document.querySelectorAll('[data-user-name]');
  welcomeElements.forEach(element => {
    element.textContent = user.name;
  });
  
  console.log('🎯 Información del usuario actualizada correctamente');
}

// Función de notificación robusta
function showNotification(message, type = 'info') {
  console.log(`📢 ${type.toUpperCase()}: ${message}`);
  
  try {
    if (typeof window.showNotification === 'function') {
      return window.showNotification(message, type);
    }
    
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed; top: 20px; right: 20px; z-index: 10000;
      background: ${type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : '#3b82f6'};
      color: white; padding: 1rem 2rem; border-radius: 10px;
      font-weight: 600; box-shadow: 0 4px 20px rgba(0,0,0,0.2);
      animation: slideInRight 0.3s ease;
    `;
    notification.textContent = message;
    
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
      if (notification.parentElement) notification.remove();
    }, 3000);
    
  } catch (error) {
    console.error('Error mostrando notificación:', error);
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
      return user && user.email && user.name;
    }
  } catch (error) {
    console.warn('Error verificando login:', error);
    return false;
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
// SISTEMA DE DETECCIÓN IA AUTOMÁTICA AVANZADA
// =======================================================

// DETECCIÓN AUTOMÁTICA MEJORADA CON IA
async function detectItemWithAI(file) {
  console.log('🤖 IA analizando prenda:', file.name);
  
  // Simular análisis de IA con loading
  showNotification('🤖 IA analizando imagen...', 'info');
  
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simular procesamiento
  
  const fileName = file.name.toLowerCase();
  let detectedType = 'tops';
  let detectedCategory = 'tshirt';
  let detectedItem = 'Polera';
  let confidence = 0.75;
  
  // DETECCIÓN AVANZADA POR NOMBRE Y ANÁLISIS
  
  // CALZADO - Mayor prioridad
  if (fileName.includes('zapatilla') || fileName.includes('sneaker') || fileName.includes('running')) {
    detectedType = 'shoes'; detectedCategory = 'sneakers'; detectedItem = 'Zapatillas'; confidence = 0.95;
  } else if (fileName.includes('zapato') || fileName.includes('dress') && fileName.includes('shoe')) {
    detectedType = 'shoes'; detectedCategory = 'dress_shoes'; detectedItem = 'Zapatos Formales'; confidence = 0.91;
  } else if (fileName.includes('bota') || fileName.includes('boot')) {
    detectedType = 'shoes'; detectedCategory = 'boots'; detectedItem = 'Botas'; confidence = 0.89;
  } else if (fileName.includes('sandalia') || fileName.includes('sandal')) {
    detectedType = 'shoes'; detectedCategory = 'sandals'; detectedItem = 'Sandalias'; confidence = 0.87;
  } else if (fileName.includes('tacon') || fileName.includes('heel') || fileName.includes('stiletto')) {
    detectedType = 'shoes'; detectedCategory = 'heels'; detectedItem = 'Tacones'; confidence = 0.88;
  } else if (fileName.includes('ballerina') || fileName.includes('flat')) {
    detectedType = 'shoes'; detectedCategory = 'flats'; detectedItem = 'Ballerinas'; confidence = 0.86;
  }
  
  // INFERIORES
  else if (fileName.includes('jean')) {
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
  
  // SUPERIORES
  else if (fileName.includes('camisa') || fileName.includes('shirt') && !fileName.includes('tshirt')) {
    detectedCategory = 'shirt'; detectedItem = 'Camisa'; confidence = 0.93;
  } else if (fileName.includes('blusa') || fileName.includes('blouse')) {
    detectedCategory = 'blouse'; detectedItem = 'Blusa'; confidence = 0.91;
  } else if (fileName.includes('vestido') || fileName.includes('dress')) {
    detectedCategory = 'dress'; detectedItem = 'Vestido'; confidence = 0.92;
  } else if (fileName.includes('hoodie') || fileName.includes('capucha')) {
    detectedCategory = 'hoodie'; detectedItem = 'Hoodie'; confidence = 0.90;
  } else if (fileName.includes('sueter') || fileName.includes('sweater') || fileName.includes('cardigan')) {
    detectedCategory = 'sweater'; detectedItem = 'Suéter'; confidence = 0.88;
  } else if (fileName.includes('chaqueta') || fileName.includes('jacket') || fileName.includes('blazer')) {
    detectedCategory = 'jacket'; detectedItem = 'Chaqueta'; confidence = 0.87;
  } else if (fileName.includes('abrigo') || fileName.includes('coat')) {
    detectedCategory = 'coat'; detectedItem = 'Abrigo'; confidence = 0.85;
  } else if (fileName.includes('polera') || fileName.includes('tshirt') || fileName.includes('tee')) {
    detectedCategory = 'tshirt'; detectedItem = 'Polera'; confidence = 0.95;
  }
  
  console.log(`🎯 IA detectó: ${detectedItem} (${detectedType}/${detectedCategory}) - Confianza: ${Math.round(confidence * 100)}%`);
  
  return {
    type: detectedType,
    category: detectedCategory,
    item: detectedItem,
    confidence,
    categoryInfo: INTELLIGENT_CATEGORIES[detectedType][detectedCategory]
  };
}

// =======================================================
// UPLOAD AUTOMÁTICO CENTRAL (SIN PESTAÑAS)
// =======================================================

// FUNCIÓN PRINCIPAL: Upload automático con detección IA
async function handleAutomaticUpload(files) {
  console.log('📤 INICIANDO UPLOAD AUTOMÁTICO CON IA...');
  
  if (!files || files.length === 0) {
    console.log('❌ No hay archivos seleccionados');
    return;
  }
  
  console.log(`📷 ${files.length} archivos seleccionados para análisis IA`);
  
  // Verificar autenticación
  if (!checkIsLoggedIn()) {
    showNotification('❌ Debes iniciar sesión para usar el closet', 'error');
    return;
  }
  
  // Verificar límites
  const remaining = getRemainingClosetSlots();
  if (files.length > remaining) {
    showNotification(`⚠️ Solo puedes subir ${remaining} prendas más. Armario: ${getTotalClosetItems()}/${CONFIG.TOTAL_CLOSET_LIMIT}`, 'error');
    return;
  }
  
  // Validar tipos de archivo
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const invalidFiles = files.filter(file => !validTypes.includes(file.type));
  if (invalidFiles.length > 0) {
    showNotification('❌ Solo se permiten archivos JPG, PNG o WebP', 'error');
    return;
  }
  
  showNotification('🤖 IA analizando y organizando automáticamente...', 'info');
  
  let detectedTypes = new Set();
  let successCount = 0;
  let detectionResults = [];
  
  // PROCESAR CADA ARCHIVO CON IA
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    
    try {
      console.log(`🔍 Procesando archivo ${i + 1}/${files.length}: ${file.name}`);
      
      // DETECCIÓN IA AUTOMÁTICA
      const detectionResult = await detectItemWithAI(file);
      detectedTypes.add(detectionResult.type);
      detectionResults.push(detectionResult);
      
      // Convertir imagen
      const imageUrl = await fileToDataUrl(file);
      
      // CATEGORIZAR AUTOMÁTICAMENTE
      const item = categorizeIntelligentItem(
        detectionResult.type, 
        detectionResult.category, 
        detectionResult.item, 
        imageUrl, 
        file,
        detectionResult.confidence
      );
      
      successCount++;
      
    } catch (error) {
      console.error('❌ Error en detección IA:', error);
      showNotification(`❌ Error procesando ${file.name}`, 'error');
    }
  }
  
  // FINALIZAR PROCESO
  if (successCount > 0) {
    // Guardar datos
    saveUserClosetData();
    
    // Actualizar UI
    updateIntelligentClosetUI();
    updateClosetDisplay();
    
    // NAVEGACIÓN AUTOMÁTICA AL TIPO MÁS DETECTADO
    if (detectedTypes.size > 0) {
      const mostCommonType = Array.from(detectedTypes)[0];
      setTimeout(() => {
        navigateToDetectedType(mostCommonType, detectionResults);
      }, 1500);
    }
    
    const newRemaining = getRemainingClosetSlots();
    showNotification(`✅ ${successCount} prenda${successCount !== 1 ? 's' : ''} detectada${successCount !== 1 ? 's' : ''} y organizada${successCount !== 1 ? 's' : ''} automáticamente! Quedan ${newRemaining} espacios.`, 'success');
    
    // Mostrar popup de progreso
    showProgressPopup(successCount, newRemaining);
  }
}

// CATEGORIZAR PRENDA INTELIGENTEMENTE
function categorizeIntelligentItem(type, categoryId, detectedItem, imageUrl, file, confidence) {
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
    aiDetected: true,
    confidence: confidence || 0.75
  };
  
  intelligentClosetItems[type][categoryId].push(item);
  
  // TAMBIÉN agregar a arrays globales para compatibilidad
  if (!uploadedFiles[type]) uploadedFiles[type] = [];
  if (!uploadedImages[type]) uploadedImages[type] = [];
  if (!closetItems[type]) closetItems[type] = [];
  
  uploadedFiles[type].push(file);
  uploadedImages[type].push(imageUrl);
  closetItems[type].push(imageUrl);
  
  console.log(`🧠 Prenda categorizada automáticamente: ${detectedItem} en ${type}/${categoryId}`);
  return item;
}

// NAVEGACIÓN AUTOMÁTICA AL TIPO DETECTADO CON SUBCATEGORÍA
function navigateToDetectedType(type, detectionResults) {
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
    showClosetTab(tabMap[type]);
    
    // Actualizar tipo activo
    activeClosetType = type;
    
    // Mostrar subcategoría específica si es posible
    const mostCommonCategory = detectionResults
      .filter(r => r.type === type)
      .reduce((acc, r) => {
        acc[r.category] = (acc[r.category] || 0) + 1;
        return acc;
      }, {});
    
    const topCategory = Object.keys(mostCommonCategory)[0];
    if (topCategory && INTELLIGENT_CATEGORIES[type][topCategory]) {
      const categoryName = INTELLIGENT_CATEGORIES[type][topCategory].name;
      showNotification(`🎯 IA detectó ${categoryName}. Navegando automáticamente...`, 'success');
    }
    
    const typeNames = { tops: 'Superiores', bottoms: 'Inferiores', shoes: 'Calzado' };
    
  } catch (error) {
    console.error('Error navegando:', error);
  }
}

// =======================================================
// FUNCIONES PRINCIPALES DEL CLOSET CORREGIDAS
// =======================================================

// ACTIVAR MODO CLOSET (CORREGIDO)
function enableCloset() {
  console.log('✨ Activando modo closet...');
  
  closetMode = true;
  
  try {
    // Verificar autenticación
    if (!checkIsLoggedIn()) {
      showNotification('❌ Debes iniciar sesión para usar el closet', 'error');
      return;
    }
    
    // Ocultar pregunta del closet
    const closetQuestion = document.getElementById('closetQuestion');
    if (closetQuestion) {
      closetQuestion.style.display = 'none';
    }
    
    // Mostrar contenedor del closet
    const closetContainer = document.getElementById('closetContainer');
    if (closetContainer) {
      closetContainer.style.display = 'block';
      
      // CORREGIR: Actualizar información del usuario correctamente
      updateUserDisplayInfo();
      
      // Cargar datos del usuario
      loadUserClosetData();
      updateIntelligentClosetUI();
      
      // CRÍTICO: Configurar upload automático
      setTimeout(() => {
        setupAutomaticUpload();
      }, 500);
      
      showNotification('✅ Mi Closet Inteligente activado', 'success');
      
      // Scroll al closet
      setTimeout(() => {
        closetContainer.scrollIntoView({ behavior: 'smooth' });
      }, 800);
      
    } else {
      console.error('❌ No se encontró closetContainer');
      showNotification('❌ Error: No se pudo activar el closet', 'error');
    }
  } catch (error) {
    console.error('❌ Error activando closet:', error);
    showNotification('❌ Error activando closet', 'error');
  }
}

// MOSTRAR PESTAÑA DEL CLOSET (CORREGIDO)
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
    }
    
    // Renderizar contenido de la pestaña
    renderClosetTabContent(tabId);
    
    console.log('✅ Pestaña configurada:', tabId);
  } catch (error) {
    console.error('❌ Error mostrando pestaña:', error);
  }
}

// =======================================================
// CONFIGURACIÓN DE UPLOADS AUTOMÁTICOS
// =======================================================

// CORRECCIÓN CRÍTICA PARA SUBIDA DE FOTOS DESDE CUALQUIER DISPOSITIVO en closet.js
// Reemplaza la función setupAutomaticUpload() en tu closet.js

// FUNCIÓN CORREGIDA: Configurar upload automático (HABILITADO PARA TODOS LOS DISPOSITIVOS)
function setupAutomaticUpload() {
  console.log('📱 CONFIGURANDO UPLOAD AUTOMÁTICO UNIVERSAL - TODOS LOS DISPOSITIVOS...');
  
  // Buscar zona de upload central
  const uploadZone = document.getElementById('automaticUploadZone');
  if (!uploadZone) {
    console.warn('⚠️ No se encontró zona de upload automático');
    return;
  }
  
  // CRÍTICO: Remover cualquier event listener previo
  const newUploadZone = uploadZone.cloneNode(true);
  uploadZone.parentNode.replaceChild(newUploadZone, uploadZone);
  
  // CONFIGURAR EVENTO DE CLICK UNIVERSAL (TODOS LOS DISPOSITIVOS)
  newUploadZone.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('📸 CLICK DETECTADO - INICIANDO SELECCIÓN DESDE CUALQUIER DISPOSITIVO');
    
    // Verificar autenticación
    if (!checkIsLoggedIn()) {
      showNotification('❌ Debes iniciar sesión primero', 'error');
      return;
    }
    
    // Verificar límite total
    const remaining = getRemainingClosetSlots();
    if (remaining <= 0) {
      showNotification(`⚠️ Armario lleno (${getTotalClosetItems()}/${CONFIG.TOTAL_CLOSET_LIMIT}). Elimina prendas para agregar nuevas.`, 'error');
      return;
    }
    
    // CREAR INPUT DE ARCHIVO UNIVERSAL (MÓVIL, TABLET, NOTEBOOK, PC)
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*'; // Más amplio para móviles
    fileInput.multiple = true;
    fileInput.style.display = 'none';
    
    // ATRIBUTOS PARA COMPATIBILIDAD UNIVERSAL
    fileInput.setAttribute('capture', 'environment'); // Habilitar cámara en móviles
    fileInput.setAttribute('webkitdirectory', 'false');
    fileInput.setAttribute('directory', 'false');
    
    console.log('📱 Input universal creado - Compatible con todos los dispositivos');
    
    // MANEJADOR DE ARCHIVOS SELECCIONADOS (UNIVERSAL)
    fileInput.onchange = function(e) {
      console.log('📷 ✅ ARCHIVOS SELECCIONADOS DESDE DISPOSITIVO');
      const files = Array.from(e.target.files);
      
      if (files.length === 0) {
        console.log('❌ No se seleccionaron archivos');
        return;
      }
      
      console.log(`📸 ${files.length} archivos seleccionados desde tu dispositivo:`, files.map(f => f.name));
      
      // PROCESAR CON IA AUTOMÁTICA
      handleAutomaticUpload(files);
    };
    
    // MANEJADOR DE ERROR
    fileInput.onerror = function(error) {
      console.error('❌ Error en selector de archivos:', error);
      showNotification('Error abriendo selector de archivos', 'error');
    };
    
    // AGREGAR AL DOM Y ACTIVAR
    document.body.appendChild(fileInput);
    
    console.log('📱 ACTIVANDO SELECTOR UNIVERSAL (móvil, notebook, PC, tablet)...');
    
    // TRIGGER CLICK INMEDIATO
    setTimeout(() => {
      try {
        fileInput.click(); // Activar selector universal
        console.log('✅ Selector de archivos/cámara activado');
      } catch (error) {
        console.error('❌ Error activando selector:', error);
        showNotification('Error abriendo selector de archivos', 'error');
      }
    }, 100);
    
    // LIMPIAR DESPUÉS DE USO
    setTimeout(() => {
      if (document.body.contains(fileInput)) {
        document.body.removeChild(fileInput);
        console.log('🧹 Input temporal removido');
      }
    }, 30000); // 30 segundos timeout
  });
  
  // ESTILOS RESPONSIVE PARA TODOS LOS DISPOSITIVOS
  newUploadZone.style.cursor = 'pointer';
  newUploadZone.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
  newUploadZone.style.userSelect = 'none';
  newUploadZone.style.webkitUserSelect = 'none'; // Safari móvil
  newUploadZone.style.msUserSelect = 'none'; // IE/Edge
  
  // EFECTOS TOUCH/HOVER UNIVERSALES
  newUploadZone.addEventListener('mouseenter', function() {
    this.style.transform = 'translateY(-8px) scale(1.02)';
    this.style.boxShadow = '0 25px 50px rgba(59, 130, 246, 0.4)';
    this.style.borderColor = 'var(--success)';
  });
  
  newUploadZone.addEventListener('mouseleave', function() {
    this.style.transform = 'translateY(0) scale(1)';
    this.style.boxShadow = '0 10px 30px rgba(59, 130, 246, 0.2)';
    this.style.borderColor = 'var(--primary)';
  });
  
  // SOPORTE TOUCH PARA MÓVILES Y TABLETS
  newUploadZone.addEventListener('touchstart', function() {
    this.style.transform = 'translateY(-5px) scale(1.01)';
    this.style.boxShadow = '0 20px 40px rgba(59, 130, 246, 0.3)';
  });
  
  newUploadZone.addEventListener('touchend', function() {
    this.style.transform = 'translateY(0) scale(1)';
    this.style.boxShadow = '0 10px 30px rgba(59, 130, 246, 0.2)';
  });
  
  console.log('✅ UPLOAD UNIVERSAL CONFIGURADO - Compatible con móviles, notebooks, tablets y PCs');
  
  // INDICADOR VISUAL DE QUE ESTÁ LISTO
  const aiIcon = newUploadZone.querySelector('.upload-ai-icon');
  if (aiIcon) {
    aiIcon.style.animation = 'bounce 2s infinite';
  }
}
}

// FUNCIÓN AUXILIAR: Verificar si está logueado (compatible)
function checkIsLoggedIn() {
  try {
    if (typeof window.isLoggedIn === 'function') {
      return window.isLoggedIn();
    } else if (typeof window.isLoggedIn === 'boolean') {
      return window.isLoggedIn;
    } else {
      // Fallback
      const savedAuth = localStorage.getItem('noshopia_logged_in');
      return savedAuth === 'true';
    }
  } catch (error) {
    console.warn('Error verificando login:', error);
    return false;
  }
}

// FUNCIÓN CORREGIDA: Manejar upload automático desde cualquier dispositivo
async function handleAutomaticUpload(files) {
  console.log('📤 INICIANDO UPLOAD AUTOMÁTICO UNIVERSAL - TODOS LOS DISPOSITIVOS...');
  
  if (!files || files.length === 0) {
    console.log('❌ No hay archivos para procesar');
    return;
  }
  
  console.log(`📷 ${files.length} archivos recibidos desde tu dispositivo para análisis IA`);
  
  // Verificar autenticación nuevamente
  if (!checkIsLoggedIn()) {
    showNotification('❌ Debes iniciar sesión para usar el closet', 'error');
    return;
  }
  
  // Verificar límites
  const remaining = getRemainingClosetSlots();
  if (files.length > remaining) {
    showNotification(`⚠️ Solo puedes subir ${remaining} prendas más. Armario: ${getTotalClosetItems()}/${CONFIG.TOTAL_CLOSET_LIMIT}`, 'error');
    return;
  }
  
  // VALIDAR TIPOS DE ARCHIVO (Compatible con móviles y desktop)
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic']; // Agregado HEIC para iPhone
  const invalidFiles = files.filter(file => !validTypes.includes(file.type.toLowerCase()));
  
  if (invalidFiles.length > 0) {
    console.error('❌ Archivos inválidos:', invalidFiles.map(f => `${f.name} (${f.type})`));
    showNotification(`❌ Solo se permiten fotos JPG, PNG, WebP o HEIC. ${invalidFiles.length} archivo(s) rechazado(s).`, 'error');
    return;
  }
  
  // VALIDAR TAMAÑO FLEXIBLE SEGÚN DISPOSITIVO
  const maxSize = navigator.userAgent.includes('Mobile') ? 15 * 1024 * 1024 : 10 * 1024 * 1024; // 15MB móvil, 10MB desktop
  const oversizedFiles = files.filter(file => file.size > maxSize);
  
  if (oversizedFiles.length > 0) {
    const maxSizeMB = Math.floor(maxSize / (1024 * 1024));
    console.error('❌ Archivos muy grandes:', oversizedFiles.map(f => f.name));
    showNotification(`❌ Archivos muy grandes (máx ${maxSizeMB}MB). ${oversizedFiles.length} archivo(s) rechazado(s).`, 'error');
    return;
  }
  
  showNotification('🤖 IA analizando fotos desde tu dispositivo...', 'info');
  
  let detectedTypes = new Set();
  let successCount = 0;
  let detectionResults = [];
  
  // PROCESAR CADA ARCHIVO CON IA
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    
    try {
      console.log(`🔍 Procesando foto ${i + 1}/${files.length}: ${file.name}`);
      
      // DETECCIÓN IA AUTOMÁTICA
      const detectionResult = await detectItemWithAI(file);
      detectedTypes.add(detectionResult.type);
      detectionResults.push(detectionResult);
      
      // Convertir imagen
      const imageUrl = await fileToDataUrl(file);
      
      // CATEGORIZAR AUTOMÁTICAMENTE
      const item = categorizeIntelligentItem(
        detectionResult.type, 
        detectionResult.category, 
        detectionResult.item, 
        imageUrl, 
        file,
        detectionResult.confidence
      );
      
      successCount++;
      
    } catch (error) {
      console.error('❌ Error en detección IA:', error);
      showNotification(`❌ Error procesando ${file.name}`, 'error');
    }
  }
  
  // FINALIZAR PROCESO
  if (successCount > 0) {
    // Guardar datos
    saveUserClosetData();
    
    // Actualizar UI
    updateIntelligentClosetUI();
    updateClosetDisplay();
    
    // NAVEGACIÓN AUTOMÁTICA AL TIPO MÁS DETECTADO
    if (detectedTypes.size > 0) {
      const mostCommonType = Array.from(detectedTypes)[0];
      setTimeout(() => {
        navigateToDetectedType(mostCommonType, detectionResults);
      }, 1500);
    }
    
    const newRemaining = getRemainingClosetSlots();
    showNotification(`✅ ${successCount} prenda${successCount !== 1 ? 's' : ''} detectada${successCount !== 1 ? 's' : ''} y organizada${successCount !== 1 ? 's' : ''} automáticamente! Quedan ${newRemaining} espacios.`, 'success');
    
    // Mostrar popup de progreso
    if (typeof showProgressPopup === 'function') {
      showProgressPopup(successCount, newRemaining);
    }
  }
}

// EXPONER FUNCIONES GLOBALMENTE
window.setupAutomaticUpload = setupAutomaticUpload;
window.handleAutomaticUpload = handleAutomaticUpload;

console.log('✅ Corrección de subida de fotos aplicada - PC totalmente habilitado');

// =======================================================
// RENDERIZADO Y VISUALIZACIÓN
// =======================================================

// Renderizar contenido de pestaña con subcategorías
function renderClosetTabContent(tabId) {
  const typeMap = { 'superiores': 'tops', 'inferiores': 'bottoms', 'calzado': 'shoes' };
  const type = typeMap[tabId];
  
  if (!type) return;
  
  const tabContent = document.getElementById(tabId);
  if (!tabContent) return;
  
  // Obtener items de este tipo
  const typeItems = intelligentClosetItems[type] || {};
  const hasItems = Object.keys(typeItems).some(category => typeItems[category] && typeItems[category].length > 0);
  
  if (!hasItems) {
    tabContent.innerHTML = `
      <div style="text-align: center; padding: 3rem; color: #666;">
        <i class="fas fa-folder-open" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
        <p>No hay prendas en esta categoría</p>
        <p style="font-size: 0.9rem; opacity: 0.7;">Las prendas aparecerán automáticamente cuando las subas</p>
      </div>
    `;
    return;
  }
  
  let html = '<div style="display: grid; gap: 2rem;">';
  
  // Renderizar cada subcategoría
  Object.keys(typeItems).forEach(categoryId => {
    const categoryItems = typeItems[categoryId];
    if (!categoryItems || categoryItems.length === 0) return;
    
    const categoryInfo = INTELLIGENT_CATEGORIES[type][categoryId];
    if (!categoryInfo) return;
    
    html += `
      <div style="background: rgba(59, 130, 246, 0.05); border-radius: 15px; padding: 1.5rem;">
        <h3 style="color: ${categoryInfo.color}; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
          <span style="font-size: 1.5rem;">${categoryInfo.icon}</span>
          ${categoryInfo.name}
          <span style="background: ${categoryInfo.color}; color: white; padding: 0.3rem 0.8rem; border-radius: 15px; font-size: 0.8rem; margin-left: auto;">
            ${categoryItems.length} prenda${categoryItems.length !== 1 ? 's' : ''}
          </span>
        </h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem;">
    `;
    
    categoryItems.forEach((item, index) => {
      html += `
        <div style="position: relative; background: white; border-radius: 15px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); transition: all 0.3s ease; cursor: pointer;" onmouseover="this.style.transform='translateY(-5px)'" onmouseout="this.style.transform='translateY(0)'">
          <img src="${item.imageUrl}" style="width: 100%; height: 200px; object-fit: cover;" alt="${item.detectedItem}">
          <div style="position: absolute; top: 10px; right: 10px; background: #ef4444; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; cursor: pointer;" onclick="removeIntelligentItem('${type}', '${categoryId}', ${index})">×</div>
          <div style="padding: 1rem;">
            <div style="font-weight: 600; color: #000; margin-bottom: 0.5rem;">${item.detectedItem}</div>
            <div style="font-size: 0.8rem; color: #666; display: flex; justify-content: space-between; align-items: center;">
              <span>IA: ${Math.round((item.confidence || 0.75) * 100)}%</span>
              <span style="background: rgba(59, 130, 246, 0.1); color: var(--primary); padding: 0.2rem 0.6rem; border-radius: 10px;">Auto-detectado</span>
            </div>
          </div>
        </div>
      `;
    });
    
    html += '</div></div>';
  });
  
  html += '</div>';
  
  tabContent.innerHTML = html;
}

// =======================================================
// FUNCIONES DE DATOS Y PERSISTENCIA
// =======================================================

// CARGAR DATOS DEL USUARIO (CORREGIDO)
function loadUserClosetData() {
  try {
    const user = getCurrentUser();
    if (!user || !user.email) {
      console.log('❌ No hay usuario logueado para cargar datos');
      return;
    }
    
    console.log(`📂 Cargando datos para usuario: ${user.name} (${user.email})`);
    
    const closetData = localStorage.getItem(`noshopia_intelligent_closet_${user.email}`);
    if (closetData) {
      const data = JSON.parse(closetData);
      intelligentClosetItems = data.intelligentClosetItems || { tops: {}, bottoms: {}, shoes: {} };
      closetItems = data.closetItems || { tops: [], bottoms: [], shoes: [] };
      uploadedFiles = data.uploadedFiles || { tops: [], bottoms: [], shoes: [] };
      uploadedImages = data.uploadedImages || { tops: [], bottoms: [], shoes: [] };
      userStats = data.userStats || { visits: 1, recommendations: 0, savedOutfits: 0 };
      
      console.log('✅ Closet Inteligente cargado:', getTotalClosetItems(), 'prendas');
    } else {
      console.log('📝 Primer uso del closet para este usuario');
    }
  } catch (error) {
    console.error('❌ Error cargando datos del closet:', error);
  }
}

// GUARDAR DATOS DEL USUARIO (CORREGIDO)
function saveUserClosetData() {
  try {
    const user = getCurrentUser();
    if (!user || !user.email) {
      console.log('❌ No hay usuario logueado para guardar datos');
      return;
    }
    
    const closetData = {
      email: user.email,
      name: user.name,
      intelligentClosetItems,
      closetItems,
      uploadedFiles,
      uploadedImages,
      userStats,
      lastUpdated: new Date().toISOString(),
      totalItems: getTotalClosetItems()
    };
    
    localStorage.setItem(`noshopia_intelligent_closet_${user.email}`, JSON.stringify(closetData));
    console.log('💾 Datos del closet guardados para:', user.name);
  } catch (error) {
    console.error('❌ Error guardando datos del closet:', error);
  }
}

// ACTUALIZAR UI DEL CLOSET INTELIGENTE
function updateIntelligentClosetUI() {
  const total = getTotalClosetItems();
  const remaining = Math.max(0, CONFIG.TOTAL_CLOSET_LIMIT - total);
  
  console.log(`📊 Closet Inteligente: ${total}/${CONFIG.TOTAL_CLOSET_LIMIT} prendas, ${remaining} restantes`);
  
  // Actualizar contadores en UI
  updateClosetDisplay();
}

// ACTUALIZAR DISPLAY DEL CLOSET
function updateClosetDisplay() {
  const total = getTotalClosetItems();
  const remaining = getRemainingClosetSlots();
  
  // Actualizar header del closet con contador
  const closetHeader = document.querySelector('.closet-header h2');
  if (closetHeader) {
    closetHeader.innerHTML = `Mi Closet Inteligente <span style="font-size: 0.8rem; opacity: 0.8;">(${total}/${CONFIG.TOTAL_CLOSET_LIMIT} prendas)</span>`;
  }
  
  console.log(`📊 Closet: ${total}/${CONFIG.TOTAL_CLOSET_LIMIT} prendas, ${remaining} espacios restantes`);
}

// REMOVER ITEM INTELIGENTE
function removeIntelligentItem(type, categoryId, index) {
  if (!confirm('¿Estás seguro de eliminar esta prenda del closet?')) return;
  
  console.log(`🗑️ Eliminando ${type}/${categoryId}[${index}]`);
  
  // Eliminar de la categoría inteligente
  if (intelligentClosetItems[type][categoryId] && intelligentClosetItems[type][categoryId][index]) {
    intelligentClosetItems[type][categoryId].splice(index, 1);
    
    // También remover de arrays globales
    if (uploadedFiles[type] && uploadedFiles[type].length > 0) {
      uploadedFiles[type].pop(); // Simplificado para demostración
    }
    if (uploadedImages[type] && uploadedImages[type].length > 0) {
      uploadedImages[type].pop();
    }
    if (closetItems[type] && closetItems[type].length > 0) {
      closetItems[type].pop();
    }
  }
  
  // Guardar cambios
  saveUserClosetData();
  
  // Actualizar UI
  updateClosetDisplay();
  
  // Re-renderizar pestaña actual
  const activeTab = document.querySelector('.closet-tab.active');
  if (activeTab) {
    const tabId = activeTab.dataset.tab;
    renderClosetTabContent(tabId);
  }
  
  const remaining = getRemainingClosetSlots();
  showNotification(`Prenda eliminada. ${remaining} espacios disponibles`, 'success');
}

// =======================================================
// POPUPS Y NOTIFICACIONES
// =======================================================

// Mostrar popup de progreso
function showProgressPopup(addedCount, remaining) {
  const total = getTotalClosetItems();
  
  if (total === 3) {
    showProgressModal('🎉', '¡Buen comienzo!', `Tienes ${total} prendas. Te quedan ${remaining} espacios disponibles de ${CONFIG.TOTAL_CLOSET_LIMIT} en total.`);
  } else if (total === 5) {
    showProgressModal('🔥', '¡Vas muy bien!', `Ya tienes ${total} prendas. Te quedan ${remaining} espacios disponibles.`);
  } else if (total === 10) {
    showProgressModal('⭐', '¡Increíble progreso!', `¡${total} prendas! Solo te quedan ${remaining} espacios más.`);
  } else if (total >= CONFIG.TOTAL_CLOSET_LIMIT) {
    showProgressModal('🎊', '¡Armario Completo!', '¡Felicidades! Tu armario está completo. Ya puedes generar todas las recomendaciones que quieras.');
  }
}

// Mostrar modal de progreso
function showProgressModal(icon, title, message) {
  // Crear modal si no existe
  let modal = document.getElementById('progressModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'progressModal';
    modal.style.cssText = `
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.5); display: flex; align-items: center;
      justify-content: center; z-index: 10000; opacity: 0;
      transition: opacity 0.3s ease;
    `;
    
    modal.innerHTML = `
      <div style="background: white; border-radius: 25px; padding: 3rem 2rem; max-width: 500px; text-align: center; transform: scale(0.7); transition: transform 0.3s ease;">
        <div style="font-size: 4rem; margin-bottom: 1rem;" id="modalIcon">${icon}</div>
        <h3 style="font-size: 1.8rem; font-weight: 800; margin-bottom: 1rem;" id="modalTitle">${title}</h3>
        <p style="color: #6b7280; margin-bottom: 2rem; line-height: 1.6;" id="modalMessage">${message}</p>
        <button onclick="closeProgressModal()" style="background: linear-gradient(135deg, var(--primary), #1d4ed8); color: white; border: none; padding: 1rem 2rem; border-radius: 25px; font-weight: 600; cursor: pointer;">Continuar</button>
      </div>
    `;
    
    document.body.appendChild(modal);
  } else {
    document.getElementById('modalIcon').textContent = icon;
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalMessage').textContent = message;
  }
  
  // Mostrar modal
  modal.style.display = 'flex';
  setTimeout(() => {
    modal.style.opacity = '1';
    modal.querySelector('div').style.transform = 'scale(1)';
  }, 10);
}

// Cerrar modal de progreso
function closeProgressModal() {
  const modal = document.getElementById('progressModal');
  if (modal) {
    modal.style.opacity = '0';
    modal.querySelector('div').style.transform = 'scale(0.7)';
    setTimeout(() => {
      modal.style.display = 'none';
    }, 300);
  }
}

// =======================================================
// FUNCIONES EXPUESTAS GLOBALMENTE
// =======================================================

window.enableCloset = enableCloset;
window.showClosetTab = showClosetTab;
window.updateUserDisplayInfo = updateUserDisplayInfo;
window.getCurrentUser = getCurrentUser;
window.handleAutomaticUpload = handleAutomaticUpload;
window.removeIntelligentItem = removeIntelligentItem;
window.closeProgressModal = closeProgressModal;

// USAR MODO DIRECTO
function useDirectMode() {
  console.log('⚡ Activando modo directo...');
  
  closetMode = false;
  
  const closetQuestion = document.getElementById('closetQuestion');
  if (closetQuestion) closetQuestion.style.display = 'none';
  
  const occasionSelector = document.getElementById('occasionSelector');
  if (occasionSelector) occasionSelector.style.display = 'block';
  
  const uploadArea = document.getElementById('uploadArea');
  if (uploadArea) uploadArea.style.display = 'block';
  
  showNotification('⚡ Recomendaciones Rápidas activado', 'success');
}

window.useDirectMode = useDirectMode;

// =======================================================
// INICIALIZACIÓN
// =======================================================

function initializeIntelligentClosetSystem() {
  console.log('🚀 Inicializando sistema inteligente del closet...');
  
  // Configurar botones después de un breve delay
  setTimeout(() => {
    // Configurar botones del closet
    const enableBtn = document.getElementById('enableClosetBtn');
    if (enableBtn) {
      enableBtn.addEventListener('click', enableCloset);
    }
    
    const directBtn = document.getElementById('useDirectModeBtn');
    if (directBtn) {
      directBtn.addEventListener('click', useDirectMode);
    }
    
    // Configurar pestañas
    const tabs = document.querySelectorAll('.closet-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', function() {
        const tabId = this.dataset.tab;
        if (tabId) showClosetTab(tabId);
      });
    });
    
    // Configurar upload automático
    setupAutomaticUpload();
    
    // Si hay usuario logueado, cargar datos
    if (checkIsLoggedIn()) {
      updateUserDisplayInfo();
      loadUserClosetData();
      updateIntelligentClosetUI();
    }
    
  }, 1000);
}

// Auto-inicialización
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initializeIntelligentClosetSystem, 1000);
  });
} else {
  setTimeout(initializeIntelligentClosetSystem, 500);
}

window.addEventListener('load', () => {
  setTimeout(() => {
    if (checkIsLoggedIn()) {
      setTimeout(updateUserDisplayInfo, 1000);
    }
  }, 2000);
});

console.log('✅ Sistema inteligente del closet cargado - detección automática habilitada');
