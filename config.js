// closet.js - Sistema del Closet Alineado con Flujo Corregido

console.log('🚀 Iniciando sistema del closet alineado con flujo...');

// VARIABLES DE ESTADO DEL CLOSET
let closetMode = false;
let activeClosetType = 'tops';

// CATEGORÍAS INTELIGENTES PARA DETECCIÓN IA (mantenidas)
const INTELLIGENT_CATEGORIES = {
  tops: {
    "tshirt": { name: "Poleras", icon: "👕", keywords: ["t-shirt", "tee", "polera", "tank"], color: "#10b981" },
    "shirt": { name: "Camisas", icon: "👔", keywords: ["shirt", "dress shirt", "camisa", "collar"], color: "#3b82f6" },
    "blouse": { name: "Blusas", icon: "👚", keywords: ["blouse", "blusa", "silk"], color: "#ec4899" },
    "sweater": { name: "Suéteres", icon: "🧶", keywords: ["sweater", "sueter", "pullover", "cardigan"], color: "#f59e0b" },
    "hoodie": { name: "Hoodies", icon: "🤘", keywords: ["hoodie", "sudadera", "capucha"], color: "#ef4444" },
    "jacket": { name: "Chaquetas", icon: "🧥", keywords: ["jacket", "chaqueta", "blazer"], color: "#6b7280" },
    "coat": { name: "Abrigos", icon: "❄️", keywords: ["coat", "abrigo", "parka"], color: "#1f2937" },
    "dress": { name: "Vestidos", icon: "👗", keywords: ["dress", "vestido", "gown"], color: "#8b5cf6" },
    "vest": { name: "Chalecos", icon: "🦺", keywords: ["vest", "chaleco"], color: "#84cc16" }
  },
  bottoms: {
    "jeans": { name: "Jeans", icon: "👖", keywords: ["jeans", "denim", "mezclilla"], color: "#1e40af" },
    "pants": { name: "Pantalones", icon: "👖", keywords: ["pants", "pantalon", "trousers"], color: "#3b82f6" },
    "skirt": { name: "Faldas", icon: "👗", keywords: ["skirt", "falda", "mini"], color: "#ec4899" },
    "shorts": { name: "Shorts", icon: "🩳", keywords: ["shorts", "bermuda"], color: "#10b981" },
    "leggings": { name: "Calzas", icon: "🩱", keywords: ["leggings", "calza", "yoga"], color: "#6b7280" }
  },
  shoes: {
    "sneakers": { name: "Zapatillas", icon: "👟", keywords: ["sneakers", "zapatilla", "running"], color: "#3b82f6" },
    "dress_shoes": { name: "Zapatos Formales", icon: "👞", keywords: ["dress shoes", "zapato", "formal"], color: "#1f2937" },
    "boots": { name: "Botas", icon: "🥾", keywords: ["boots", "bota", "botines"], color: "#92400e" },
    "heels": { name: "Tacones", icon: "👠", keywords: ["heels", "taco", "stiletto"], color: "#ec4899" },
    "sandals": { name: "Sandalias", icon: "👡", keywords: ["sandals", "sandalia", "flip"], color: "#f59e0b" },
    "flats": { name: "Ballerinas", icon: "🥿", keywords: ["flats", "ballerina"], color: "#6b7280" }
  }
};

// SISTEMA DE DETECCIÓN IA (mantenido)
async function simulateAIDetection(file) {
  console.log('🤖 IA detectando prenda:', file.name);
  
  const fileName = file.name.toLowerCase();
  
  let detectedType = 'tops';
  let detectedCategory = 'tshirt';
  let detectedItem = 'Polera';
  let confidence = 0.75;
  
  // DETECCIÓN POR NOMBRE DE ARCHIVO
  
  // BOTTOMS - Alta prioridad
  if (fileName.includes('jean')) {
    detectedType = 'bottoms'; detectedCategory = 'jeans'; detectedItem = 'Jeans'; confidence = 0.95;
  } else if (fileName.includes('pantalon') || fileName.includes('pants')) {
    detectedType = 'bottoms'; detectedCategory = 'pants'; detectedItem = 'Pantalones'; confidence = 0.92;
  } else if (fileName.includes('falda') || fileName.includes('skirt')) {
    detectedType = 'bottoms'; detectedCategory = 'skirt'; detectedItem = 'Falda'; confidence = 0.90;
  } else if (fileName.includes('short')) {
    detectedType = 'bottoms'; detectedCategory = 'shorts'; detectedItem = 'Shorts'; confidence = 0.88;
  } else if (fileName.includes('calza') || fileName.includes('legging')) {
    detectedType = 'bottoms'; detectedCategory = 'leggings'; detectedItem = 'Calzas'; confidence = 0.89;
  }
  
  // SHOES - Alta prioridad
  else if (fileName.includes('zapatilla') || fileName.includes('sneaker')) {
    detectedType = 'shoes'; detectedCategory = 'sneakers'; detectedItem = 'Zapatillas'; confidence = 0.94;
  } else if (fileName.includes('zapato') || fileName.includes('dress')) {
    detectedType = 'shoes'; detectedCategory = 'dress_shoes'; detectedItem = 'Zapatos Formales'; confidence = 0.91;
  } else if (fileName.includes('bota') || fileName.includes('boot')) {
    detectedType = 'shoes'; detectedCategory = 'boots'; detectedItem = 'Botas'; confidence = 0.89;
  } else if (fileName.includes('taco') || fileName.includes('heel')) {
    detectedType = 'shoes'; detectedCategory = 'heels'; detectedItem = 'Tacones'; confidence = 0.92;
  } else if (fileName.includes('sandalia') || fileName.includes('sandal')) {
    detectedType = 'shoes'; detectedCategory = 'sandals'; detectedItem = 'Sandalias'; confidence = 0.87;
  }
  
  // TOPS - Por defecto si no es bottom/shoe
  else if (fileName.includes('camisa') || fileName.includes('shirt')) {
    detectedCategory = 'shirt'; detectedItem = 'Camisa'; confidence = 0.93;
  } else if (fileName.includes('polera') || fileName.includes('tshirt')) {
    detectedCategory = 'tshirt'; detectedItem = 'Polera'; confidence = 0.95;
  } else if (fileName.includes('blusa') || fileName.includes('blouse')) {
    detectedCategory = 'blouse'; detectedItem = 'Blusa'; confidence = 0.89;
  } else if (fileName.includes('sweater') || fileName.includes('sueter')) {
    detectedCategory = 'sweater'; detectedItem = 'Suéter'; confidence = 0.87;
  } else if (fileName.includes('hoodie') || fileName.includes('capucha')) {
    detectedCategory = 'hoodie'; detectedItem = 'Hoodie'; confidence = 0.91;
  } else if (fileName.includes('chaqueta') || fileName.includes('jacket')) {
    detectedCategory = 'jacket'; detectedItem = 'Chaqueta'; confidence = 0.88;
  } else if (fileName.includes('vestido') || fileName.includes('dress')) {
    detectedCategory = 'dress'; detectedItem = 'Vestido'; confidence = 0.92;
  }
  
  console.log(`🎯 IA detectó: ${detectedItem} (${detectedType}/${detectedCategory}) - ${Math.round(confidence * 100)}%`);
  
  // Simular tiempo de procesamiento
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return { type: detectedType, category: detectedCategory, item: detectedItem, confidence };
}

// ============================================================================
// FUNCIONES PRINCIPALES DEL CLOSET - ALINEADAS CON FLUJO CORREGIDO
// ============================================================================

// FUNCIÓN CORREGIDA: enableCloset con flujo secuencial
function enableCloset() {
  console.log('✨ Activando Mi Closet Digital - FLUJO CORREGIDO...');
  
  closetMode = true;
  
  try {
    // PASO 1: Ocultar opciones
    const closetQuestion = document.getElementById('closetQuestion');
    if (closetQuestion) {
      closetQuestion.style.display = 'none';
    }
    
    // PASO 2: Mostrar selector de ocasión PRIMERO
    const occasionSelector = document.getElementById('occasionSelector');
    if (occasionSelector) {
      occasionSelector.style.display = 'block';
      setupOccasionButtonsForClosetMode();
      
      // Scroll al selector de ocasión
      setTimeout(() => {
        occasionSelector.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    }
    
    // PASO 3: El closet se mostrará DESPUÉS de seleccionar ocasión
    
    if (typeof window.showNotification === 'function') {
      window.showNotification('Mi Closet Digital - Selecciona una ocasión primero', 'info');
    }
    
    console.log('✅ Mi Closet Digital iniciado - esperando selección de ocasión');
    
  } catch (error) {
    console.error('Error activando closet:', error);
    if (typeof window.showNotification === 'function') {
      window.showNotification('Error activando closet', 'error');
    }
  }
}

// FUNCIÓN CORREGIDA: useDirectMode con flujo secuencial  
function useDirectMode() {
  console.log('⚡ Activando Recomendaciones Rápidas - FLUJO CORREGIDO...');
  
  closetMode = false;
  
  try {
    // PASO 1: Ocultar opciones
    const closetQuestion = document.getElementById('closetQuestion');
    if (closetQuestion) {
      closetQuestion.style.display = 'none';
    }
    
    // PASO 2: Mostrar selector de ocasión PRIMERO
    const occasionSelector = document.getElementById('occasionSelector');
    if (occasionSelector) {
      occasionSelector.style.display = 'block';
      setupOccasionButtonsForDirectMode();
      
      // Scroll al selector de ocasión
      setTimeout(() => {
        occasionSelector.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    }
    
    // PASO 3: Asegurar que el área de upload esté oculta inicialmente
    const uploadArea = document.getElementById('uploadArea');
    if (uploadArea) {
      uploadArea.style.display = 'none';
    }
    
    if (typeof window.showNotification === 'function') {
      window.showNotification('Recomendaciones Rápidas - Selecciona una ocasión primero', 'info');
    }
    
    console.log('✅ Recomendaciones Rápidas iniciadas - esperando selección de ocasión');
    
  } catch (error) {
    console.error('Error activando modo directo:', error);
    if (typeof window.showNotification === 'function') {
      window.showNotification('Error activando modo directo', 'error');
    }
  }
}

// NUEVA FUNCIÓN: Configurar botones de ocasión para MODO CLOSET
function setupOccasionButtonsForClosetMode() {
  console.log('🎯 Configurando botones de ocasión para modo CLOSET...');
  
  const occasionBtns = document.querySelectorAll('.occasion-btn');
  
  occasionBtns.forEach(btn => {
    // Limpiar listeners anteriores clonando elementos
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
    
    newBtn.addEventListener('click', function() {
      console.log('🎯 Ocasión seleccionada en modo CLOSET');
      
      // Marcar selección visual
      document.querySelectorAll('.occasion-btn').forEach(b => {
        b.classList.remove('selected');
        b.style.borderColor = 'var(--border)';
        b.style.background = 'var(--background)';
      });
      
      this.classList.add('selected');
      this.style.borderColor = 'var(--primary)';
      this.style.background = 'rgba(59, 130, 246, 0.1)';
      
      // Guardar ocasión globalmente
      const occasion = this.dataset.occasion;
      window.selectedOccasion = occasion;
      
      console.log(`Ocasión seleccionada: ${occasion}`);
      
      if (typeof window.showNotification === 'function') {
        window.showNotification(`Ocasión: ${occasion}`, 'success');
      }
      
      // MOSTRAR CLOSET DESPUÉS DE SELECCIONAR OCASIÓN
      setTimeout(() => {
        showClosetAfterOccasionSelection();
      }, 1000);
    });
  });
}

// NUEVA FUNCIÓN: Configurar botones de ocasión para MODO DIRECTO
function setupOccasionButtonsForDirectMode() {
  console.log('⚡ Configurando botones de ocasión para modo DIRECTO...');
  
  const occasionBtns = document.querySelectorAll('.occasion-btn');
  
  occasionBtns.forEach(btn => {
    // Limpiar listeners anteriores clonando elementos
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
    
    newBtn.addEventListener('click', function() {
      console.log('⚡ Ocasión seleccionada en modo DIRECTO');
      
      // Marcar selección visual
      document.querySelectorAll('.occasion-btn').forEach(b => {
        b.classList.remove('selected');
        b.style.borderColor = 'var(--border)';
        b.style.background = 'var(--background)';
      });
      
      this.classList.add('selected');
      this.style.borderColor = 'var(--primary)';
      this.style.background = 'rgba(59, 130, 246, 0.1)';
      
      // Guardar ocasión globalmente
      const occasion = this.dataset.occasion;
      window.selectedOccasion = occasion;
      
      console.log(`Ocasión seleccionada: ${occasion}`);
      
      if (typeof window.showNotification === 'function') {
        window.showNotification(`Ocasión: ${occasion}`, 'success');
      }
      
      // MOSTRAR UPLOAD ÁREA DESPUÉS DE SELECCIONAR OCASIÓN
      setTimeout(() => {
        showUploadAreaAfterOccasionSelection();
      }, 1000);
    });
  });
}

// NUEVA FUNCIÓN: Mostrar closet después de seleccionar ocasión
function showClosetAfterOccasionSelection() {
  console.log('📁 Mostrando closet después de seleccionar ocasión...');
  
  const closetContainer = document.getElementById('closetContainer');
  if (closetContainer) {
    closetContainer.style.display = 'block';
    
    // Configurar información del usuario EN EL CLOSET
    setupUserInfoInCloset();
    
    // Cargar datos existentes
    loadUserClosetData();
    
    // CONFIGURAR CARPETAS FUNCIONALES
    setTimeout(() => {
      setupFunctionalFolders();
      setupClosetTabs();
    }, 500);
    
    // Scroll al closet
    setTimeout(() => {
      closetContainer.scrollIntoView({ behavior: 'smooth' });
    }, 800);
    
    if (typeof window.showNotification === 'function') {
      window.showNotification('Usa las carpetas para subir fotos con IA', 'info');
    }
  }
}

// NUEVA FUNCIÓN: Mostrar área de upload después de seleccionar ocasión
function showUploadAreaAfterOccasionSelection() {
  console.log('📤 Mostrando área de upload después de seleccionar ocasión...');
  
  const uploadArea = document.getElementById('uploadArea');
  if (uploadArea) {
    uploadArea.style.display = 'block';
    
    // Scroll al área de upload
    setTimeout(() => {
      uploadArea.scrollIntoView({ behavior: 'smooth' });
    }, 500);
    
    if (typeof window.showNotification === 'function') {
      window.showNotification('Sube fotos de cada categoría', 'info');
    }
  }
}

// ============================================================================
// FUNCIONES DE SOPORTE (mantenidas de la versión anterior)
// ============================================================================

// CONFIGURAR INFORMACIÓN DEL USUARIO EN EL CLOSET
function setupUserInfoInCloset() {
  const userEmail = document.getElementById('userEmail');
  if (userEmail && window.currentUser && typeof window.currentUser === 'function') {
    const user = window.currentUser();
    if (user && user.name && user.email) {
      userEmail.textContent = `Bienvenido ${user.name}`;
      console.log(`👤 Usuario configurado en closet: ${user.name}`);
    } else if (user && user.email) {
      const displayName = user.email.split('@')[0].replace(/[._-]/g, ' ');
      userEmail.textContent = `Bienvenido ${displayName}`;
    }
  }
}

// CONFIGURAR CARPETAS FUNCIONALES (CRÍTICO)
function setupFunctionalFolders() {
  console.log('🗂️ Configurando carpetas funcionales...');
  
  const allFolders = document.querySelectorAll('.folder-item');
  
  if (allFolders.length === 0) {
    console.warn('No se encontraron carpetas para configurar');
    return;
  }
  
  console.log(`Configurando ${allFolders.length} carpetas...`);
  
  allFolders.forEach((folder, index) => {
    // LIMPIAR LISTENERS ANTERIORES CLONANDO
    const newFolder = folder.cloneNode(true);
    folder.parentNode.replaceChild(newFolder, folder);
    
    // EVENTO CLICK FUNCIONAL
    newFolder.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      console.log('📂 Click en carpeta detectado');
      
      // Verificar login
      if (!window.isLoggedIn || !window.isLoggedIn()) {
        if (typeof window.showNotification === 'function') {
          window.showNotification('Debes iniciar sesión primero', 'error');
        }
        return;
      }
      
      // Verificar que hay ocasión seleccionada
      if (!window.selectedOccasion) {
        if (typeof window.showNotification === 'function') {
          window.showNotification('Selecciona una ocasión primero', 'error');
        }
        return;
      }
      
      // Verificar límites del closet
      const currentTotal = getTotalClosetItems();
      const remaining = Math.max(0, CONFIG.TOTAL_CLOSET_LIMIT - currentTotal);
      
      if (remaining <= 0) {
        if (typeof window.showNotification === 'function') {
          window.showNotification(`Closet lleno (${currentTotal}/${CONFIG.TOTAL_CLOSET_LIMIT}). Elimina prendas para agregar nuevas.`, 'error');
        }
        return;
      }
      
      const folderName = this.querySelector('.folder-name')?.textContent || 'Carpeta';
      console.log(`📁 Abriendo selector de archivos para: ${folderName}`);
      
      // CREAR INPUT DE ARCHIVO DINÁMICO (LA CLAVE)
      createFileInput(folderName, activeClosetType);
    });
    
    // EFECTOS VISUALES MEJORADOS
    newFolder.style.cursor = 'pointer';
    newFolder.style.transition = 'all 0.3s ease';
    
    newFolder.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-8px)';
      this.style.boxShadow = '0 15px 35px rgba(59, 130, 246, 0.2)';
      this.style.borderColor = 'var(--primary)';
    });
    
    newFolder.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0)';
      this.style.boxShadow = '0 2px 10px rgba(0,0,0,0.05)';
      this.style.borderColor = 'var(--border)';
    });
    
    console.log(`✅ Carpeta ${index + 1} configurada: ${newFolder.querySelector('.folder-name')?.textContent}`);
  });
  
  console.log('✅ Todas las carpetas configuradas como funcionales');
}

// CREAR INPUT DE ARCHIVO DINÁMICO (FUNCIÓN CRÍTICA)
function createFileInput(folderName, type) {
  console.log(`🎯 Creando file input para ${folderName} (${type})`);
  
  // Crear input temporal
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'image/*';
  fileInput.multiple = true;
  fileInput.style.display = 'none';
  
  // EVENTO CHANGE - PROCESAR ARCHIVOS SELECCIONADOS
  fileInput.onchange = async function(e) {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) {
      console.log('No se seleccionaron archivos');
      return;
    }
    
    console.log(`📷 ${files.length} archivos seleccionados para ${type}`);
    
    // Verificar límites nuevamente
    const currentTotal = getTotalClosetItems();
    const remaining = Math.max(0, CONFIG.TOTAL_CLOSET_LIMIT - currentTotal);
    
    if (files.length > remaining) {
      if (typeof window.showNotification === 'function') {
        window.showNotification(`Solo puedes subir ${remaining} imágenes más`, 'error');
      }
      return;
    }
    
    // Validar tipos de archivo
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const invalidFiles = files.filter(file => !validTypes.includes(file.type));
    
    if (invalidFiles.length > 0) {
      if (typeof window.showNotification === 'function') {
        window.showNotification('Solo se permiten archivos JPG, PNG o WebP', 'error');
      }
      return;
    }
    
    // PROCESAR ARCHIVOS CON IA
    if (typeof window.showNotification === 'function') {
      window.showNotification(`🤖 Procesando ${files.length} imagen(es) con IA...`, 'info');
    }
    
    await processFilesWithAI(files);
  };
  
  // Agregar al DOM y hacer click
  document.body.appendChild(fileInput);
  fileInput.click();
  
  // Limpiar después de usar
  setTimeout(() => {
    if (document.body.contains(fileInput)) {
      document.body.removeChild(fileInput);
    }
  }, 1000);
}

// PROCESAR ARCHIVOS CON IA (FUNCIÓN PRINCIPAL)
async function processFilesWithAI(files) {
  let processedCount = 0;
  let detectedTypes = new Set();
  
  for (const file of files) {
    try {
      // DETECCIÓN IA
      const detection = await simulateAIDetection(file);
      detectedTypes.add(detection.type);
      
      // Convertir a data URL
      const imageUrl = await fileToDataUrl(file);
      
      // AGREGAR A ARRAYS GLOBALES (usar las del config.js)
      if (!window.uploadedFiles) window.uploadedFiles = { tops: [], bottoms: [], shoes: [] };
      if (!window.uploadedImages) window.uploadedImages = { tops: [], bottoms: [], shoes: [] };
      if (!window.closetItems) window.closetItems = { tops: [], bottoms: [], shoes: [] };
      
      window.uploadedFiles[detection.type].push(file);
      window.uploadedImages[detection.type].push(imageUrl);
      window.closetItems[detection.type].push(imageUrl);
      
      processedCount++;
      
      console.log(`✅ Procesado ${processedCount}/${files.length}: ${detection.item} (${detection.type})`);
      
    } catch (error) {
      console.error('Error procesando archivo:', error);
    }
  }
  
  // GUARDAR DATOS
  saveUserClosetData();
  
  // NAVEGACIÓN AUTOMÁTICA AL TIPO MÁS DETECTADO
  if (detectedTypes.size > 0) {
    const mostDetected = Array.from(detectedTypes)[0];
    setTimeout(() => {
      navigateToDetectedType(mostDetected);
    }, 1000);
  }
  
  // FINALIZAR
  const remaining = Math.max(0, CONFIG.TOTAL_CLOSET_LIMIT - getTotalClosetItems());
  
  if (typeof window.showNotification === 'function') {
    window.showNotification(`🎉 ${processedCount} prenda(s) agregada(s) y detectada(s) automáticamente. ${remaining} espacios restantes.`, 'success');
  }
  
  console.log('✅ Procesamiento con IA completado');
}

// NAVEGACIÓN AUTOMÁTICA AL TIPO DETECTADO
function navigateToDetectedType(type) {
  console.log(`🧭 Navegando automáticamente a: ${type}`);
  
  const typeMapping = { tops: 'superiores', bottoms: 'inferiores', shoes: 'calzado' };
  const tabId = typeMapping[type];
  
  if (tabId) {
    showClosetTab(tabId);
    
    if (typeof window.showNotification === 'function') {
      window.showNotification(`Navegando a ${type === 'tops' ? 'Superiores' : type === 'bottoms' ? 'Inferiores' : 'Calzado'}`, 'info');
    }
  }
}

// CONFIGURAR PESTAÑAS DEL CLOSET
function setupClosetTabs() {
  console.log('📂 Configurando pestañas del closet...');
  
  const tabs = document.querySelectorAll('.closet-tab');
  
  tabs.forEach(tab => {
    // Limpiar listeners anteriores
    const newTab = tab.cloneNode(true);
    tab.parentNode.replaceChild(newTab, tab);
    
    newTab.addEventListener('click', function() {
      const tabId = this.dataset.tab;
      if (tabId) {
        showClosetTab(tabId);
      }
    });
  });
  
  console.log('✅ Pestañas configuradas');
}

// MOSTRAR PESTAÑA DEL CLOSET
function showClosetTab(tabId) {
  console.log('📂 Mostrando pestaña:', tabId);
  
  // Ocultar todas las pestañas
  document.querySelectorAll('.closet-tab-content').forEach(content => {
    content.style.display = 'none';
  });
  
  // Remover clase active
  document.querySelectorAll('.closet-tab').forEach(tab => {
    tab.classList.remove('active');
  });
  
  // Mostrar pestaña seleccionada
  const targetContent = document.getElementById(tabId);
  if (targetContent) {
    targetContent.style.display = 'block';
  }
  
  // Activar tab
  const targetTab = document.querySelector(`[data-tab="${tabId}"]`);
  if (targetTab) {
    targetTab.classList.add('active');
  }
  
  // Actualizar tipo activo
  const typeMapping = { superiores: 'tops', inferiores: 'bottoms', calzado: 'shoes' };
  if (typeMapping[tabId]) {
    activeClosetType = typeMapping[tabId];
    console.log(`Tipo activo cambiado a: ${activeClosetType}`);
  }
  
  // Reconfigurar carpetas para el nuevo tipo
  setTimeout(() => {
    setupFunctionalFolders();
  }, 200);
}

// FUNCIONES AUXILIARES
function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function getTotalClosetItems() {
  if (!window.closetItems) return 0;
  
  const total = (window.closetItems.tops?.length || 0) + 
                (window.closetItems.bottoms?.length || 0) + 
                (window.closetItems.shoes?.length || 0);
  
  return total;
}

// FUNCIONES DE PERSISTENCIA (simplificadas)
function saveUserClosetData() {
  try {
    if (!window.currentUser || typeof window.currentUser !== 'function') {
      console.warn('No hay usuario logueado para guardar datos');
      return;
    }
    
    const user = window.currentUser();
    if (!user || !user.email) {
      console.warn('Email de usuario no disponible');
      return;
    }
    
    const data = {
      email: user.email,
      closetItems: window.closetItems || { tops: [], bottoms: [], shoes: [] },
      uploadedFiles: window.uploadedFiles || { tops: [], bottoms: [], shoes: [] },
      uploadedImages: window.uploadedImages || { tops: [], bottoms: [], shoes: [] },
      totalItems: getTotalClosetItems(),
      lastSaved: new Date().toISOString()
    };
    
    localStorage.setItem(`noshopia_closet_${user.email}`, JSON.stringify(data));
    console.log(`💾 Datos del closet guardados para ${user.name || user.email}`);
    
  } catch (error) {
    console.error('Error guardando datos del closet:', error);
  }
}

function loadUserClosetData() {
  try {
    if (!window.currentUser || typeof window.currentUser !== 'function') {
      console.warn('No hay usuario logueado para cargar datos');
      return false;
    }
    
    const user = window.currentUser();
    if (!user || !user.email) {
      console.warn('Email de usuario no disponible');
      return false;
    }
    
    const savedData = localStorage.getItem(`noshopia_closet_${user.email}`);
    if (!savedData) {
      console.log('No hay datos previos del closet');
      return false;
    }
    
    const data = JSON.parse(savedData);
    
    // Restaurar datos a variables globales
    if (!window.closetItems) window.closetItems = { tops: [], bottoms: [], shoes: [] };
    if (!window.uploadedFiles) window.uploadedFiles = { tops: [], bottoms: [], shoes: [] };
    if (!window.uploadedImages) window.uploadedImages = { tops: [], bottoms: [], shoes: [] };
    
    window.closetItems = data.closetItems || { tops: [], bottoms: [], shoes: [] };
    window.uploadedFiles = data.uploadedFiles || { tops: [], bottoms: [], shoes: [] };
    window.uploadedImages = data.uploadedImages || { tops: [], bottoms: [], shoes: [] };
    
    const totalItems = getTotalClosetItems();
    console.log(`📂 Datos del closet cargados: ${totalItems} prendas totales`);
    
    return true;
    
  } catch (error) {
    console.error('Error cargando datos del closet:', error);
    return false;
  }
}

// EXPONER FUNCIONES GLOBALMENTE
window.enableCloset = enableCloset;
window.useDirectMode = useDirectMode;
window.showClosetTab = showClosetTab;

// INICIALIZACIÓN SIMPLIFICADA
document.addEventListener('DOMContentLoaded', function() {
  console.log('📄 closet.js inicializando...');
  
  // No hacer nada automáticamente, solo esperar a que se activen las funciones
  
  console.log('✅ closet.js inicializado - esperando activación con flujo corregido');
});

console.log('✅ closet.js - Sistema del Closet Alineado con Flujo Corregido cargado');
