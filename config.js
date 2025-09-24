// closet.js - Funciones del Closet y Selección con Carpetas Dinámicas

// Sistema de normalización inteligente - agrupa categorías similares
const CATEGORY_GROUPS = {
  // Superiores - Grupos principales
  "tops": {
    "Poleras": ["t-shirt", "graphic t-shirt", "tank top"],
    "Camisas": ["shirt", "dress shirt", "blouse", "silk blouse"],
    "Sweaters": ["sweater", "knitted sweater", "wool pullover", "cardigan"],
    "Chaquetas": ["jacket", "leather jacket", "denim jacket", "blazer"],
    "Abrigos": ["coat", "winter coat"],
    "Hoodies": ["hoodie", "zip-up hoodie"],
    "Vestidos": ["dress", "summer dress", "evening dress"],
    "Chalecos": ["vest"]
  },
  
  // Inferiores - Grupos principales  
  "bottoms": {
    "Pantalones": ["pants", "trousers", "formal pants", "dress pants", "chinos"],
    "Jeans": ["jeans", "blue denim jeans", "ripped jeans"],
    "Shorts": ["shorts", "athletic shorts"],
    "Faldas": ["skirt", "midi skirt", "pencil skirt"],
    "Calzas": ["leggings", "sweatpants"]
  },
  
  // Calzado - Grupos principales
  "shoes": {
    "Zapatillas": ["sneakers", "running shoes", "athletic shoes"],
    "Zapatos": ["shoes", "dress shoes", "leather shoes", "loafers", "flats"],
    "Botas": ["boots", "ankle boots", "hiking boots"],
    "Tacos": ["heels", "stiletto heels"],
    "Sandalias": ["sandals", "leather sandals"]
  }
};

// Función para normalizar y agrupar categorías
function normalizeCategory(detectedLabel, type) {
  if (!detectedLabel || !type) return null;
  
  const groups = CATEGORY_GROUPS[type];
  if (!groups) return detectedLabel;
  
  const lowerLabel = detectedLabel.toLowerCase();
  
  // Buscar en qué grupo principal pertenece esta etiqueta
  for (const [groupName, labels] of Object.entries(groups)) {
    if (labels.includes(lowerLabel)) {
      console.log(`🎯 Normalizando "${detectedLabel}" → "${groupName}" (grupo de ${labels.length} items)`);
      return groupName;
    }
  }
  
  // Si no encuentra el grupo, usar traducción individual como fallback
  const fallbackTranslations = {
    // Traducciones individuales para casos no agrupados
    "dress": "Vestidos",
    "sweater": "Sweaters", 
    "jacket": "Chaquetas",
    "pants": "Pantalones",
    "shoes": "Zapatos",
    "boots": "Botas"
  };
  
  const normalized = fallbackTranslations[lowerLabel] || detectedLabel;
  console.log(`📝 Usando fallback: "${detectedLabel}" → "${normalized}"`);
  return normalized;
}

// Sistema de categorías dinámicas por usuario
let userDynamicCategories = {
  tops: new Set(),
  bottoms: new Set(),
  shoes: new Set()
};

// Activar modo closet
function enableCloset() {
  console.log('✨ Activando modo closet...');
  
  // Limpiar resultados anteriores al cambiar modo
  clearPreviousResults();
  
  closetMode = true;
  document.getElementById('closetQuestion').style.display = 'none';
  document.getElementById('closetContainer').style.display = 'block';
  document.getElementById('userEmail').textContent = currentUser.email;
  
  // Cargar datos del usuario si existen
  loadUserClosetData();
  updateStatsDisplay();
  updateClosetDisplay();
  
  // Cargar categorías dinámicas del usuario
  loadUserDynamicCategories();
  
  // Configurar subida desde carpetas SIEMPRE
  setTimeout(() => {
    setupClosetFolderUploads();
  }, 500);
  
  showNotification('Mi Closet Favorito activado', 'success');
}

// Usar modo directo
function useDirectMode() {
  console.log('⚡ Activando modo directo...');
  
  // Limpiar resultados anteriores al cambiar modo
  clearPreviousResults();
  
  closetMode = false;
  document.getElementById('closetQuestion').style.display = 'none';
  showOccasionSelector();
}

// Cargar categorías dinámicas del usuario
function loadUserDynamicCategories() {
  if (!isLoggedIn || !currentUser?.email) return;
  
  const key = `dynamic_categories_${currentUser.email}`;
  const savedCategories = localStorage.getItem(key);
  
  if (savedCategories) {
    try {
      const parsed = JSON.parse(savedCategories);
      userDynamicCategories = {
        tops: new Set(parsed.tops || []),
        bottoms: new Set(parsed.bottoms || []),
        shoes: new Set(parsed.shoes || [])
      };
      console.log('🗂️ Categorías dinámicas cargadas:', userDynamicCategories);
    } catch (error) {
      console.error('Error cargando categorías dinámicas:', error);
      // Inicializar con categorías vacías
      userDynamicCategories = { tops: new Set(), bottoms: new Set(), shoes: new Set() };
    }
  } else {
    // Inicializar con categorías vacías
    userDynamicCategories = { tops: new Set(), bottoms: new Set(), shoes: new Set() };
  }
}

// Guardar categorías dinámicas del usuario
function saveUserDynamicCategories() {
  if (!isLoggedIn || !currentUser?.email) return;
  
  const key = `dynamic_categories_${currentUser.email}`;
  const toSave = {
    tops: Array.from(userDynamicCategories.tops),
    bottoms: Array.from(userDynamicCategories.bottoms),
    shoes: Array.from(userDynamicCategories.shoes)
  };
  
  localStorage.setItem(key, JSON.stringify(toSave));
  console.log('💾 Categorías dinámicas guardadas');
}

// Agregar categoría detectada por IA - CON NORMALIZACIÓN INTELIGENTE  
function addDetectedCategory(type, detectedLabel) {
  if (!detectedLabel || !type) return;
  
  // Normalizar la etiqueta usando grupos inteligentes
  const normalizedLabel = normalizeCategory(detectedLabel, type);
  
  if (!normalizedLabel) {
    console.warn(`⚠️ No se pudo normalizar: ${detectedLabel} para tipo ${type}`);
    return;
  }
  
  // Agregar a las categorías del usuario
  if (userDynamicCategories[type]) {
    const wasNew = !userDynamicCategories[type].has(normalizedLabel);
    userDynamicCategories[type].add(normalizedLabel);
    
    if (wasNew) {
      console.log(`📂 Nueva categoría creada: "${normalizedLabel}" en ${type}`);
      showNotification(`📂 Nueva carpeta: "${normalizedLabel}"`, 'info');
    } else {
      console.log(`📁 Agregando a categoría existente: "${normalizedLabel}" en ${type}`);
    }
    
    // Guardar las categorías actualizadas
    saveUserDynamicCategories();
    
    // Actualizar la interfaz
    setTimeout(() => {
      renderDynamicFolders(type);
    }, 100);
  }
}

// Renderizar carpetas dinámicas para una pestaña
function renderDynamicFolders(type) {
  const tabMapping = {
    'tops': 'superiores',
    'bottoms': 'inferiores', 
    'shoes': 'calzado'
  };
  
  const tabId = tabMapping[type];
  if (!tabId) return;
  
  const tabContent = document.getElementById(tabId);
  if (!tabContent) return;
  
  // Obtener categorías para este tipo
  const categories = Array.from(userDynamicCategories[type] || []);
  
  // Preservar el header de contador
  const counterHeader = tabContent.querySelector('.tab-counter-header');
  const counterHTML = counterHeader ? counterHeader.outerHTML : '';
  
  if (categories.length === 0) {
    // Si no hay categorías, mostrar mensaje inicial
    tabContent.innerHTML = counterHTML + `
      <div style="text-align: center; padding: 3rem; color: #666;">
        <i class="fas fa-upload" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
        <h4>Sube tus primeras prendas</h4>
        <p>Las carpetas se crearán automáticamente según las prendas que detecte la IA</p>
        <div style="margin-top: 2rem; padding: 1rem; background: rgba(59, 130, 246, 0.1); border-radius: 10px;">
          <p style="font-size: 0.9rem; opacity: 0.8;">
            💡 La IA creará categorías como "Camisas", "Poleras", "Jeans", etc. basándose en lo que subas
          </p>
        </div>
      </div>
    `;
    return;
  }
  
  // Generar HTML para las carpetas dinámicas
  let foldersHTML = `
    <h3 style="margin-bottom: 1rem; color: #000000;">
      📂 ${type === 'tops' ? 'Prendas Superiores' : type === 'bottoms' ? 'Prendas Inferiores' : 'Calzado'} 
      (${categories.length} categoría${categories.length !== 1 ? 's' : ''})
    </h3>
    <div class="folder-grid">
  `;
  
  categories.forEach(categoryName => {
    const icon = getFolderIcon(categoryName, type);
    const description = getCategoryDescription(categoryName);
    const groupSize = getGroupSize(categoryName, type);
    
    foldersHTML += `
      <div class="folder-item" data-category="${categoryName}" data-type="${type}">
        <div class="folder-icon">${icon}</div>
        <div class="folder-name">${categoryName}</div>
        <div class="folder-count">${description}</div>
        ${groupSize > 1 ? `<div class="dynamic-category-badge">${groupSize}</div>` : ''}
      </div>
    `;
  });
  
  foldersHTML += '</div>';
  
  tabContent.innerHTML = counterHTML + foldersHTML;
  
  console.log(`🎨 Carpetas renderizadas para ${type}: ${categories.length} categorías`);
}

// Obtener tamaño del grupo (cuántos tipos de prendas agrupa esta categoría)
function getGroupSize(categoryName, type) {
  const groups = CATEGORY_GROUPS[type];
  if (!groups || !groups[categoryName]) return 1;
  
  return groups[categoryName].length;
}

// Obtener ícono apropiado para la categoría - ACTUALIZADO para categorías normalizadas
function getFolderIcon(categoryName, type) {
  const iconMap = {
    // Superiores - Grupos principales
    'Poleras': '👕', 'Camisas': '👔', 'Sweaters': '🧥', 'Chaquetas': '🧥', 
    'Abrigos': '🧥', 'Hoodies': '👕', 'Vestidos': '👗', 'Chalecos': '🦺',
    
    // Inferiores - Grupos principales  
    'Pantalones': '👖', 'Jeans': '👖', 'Shorts': '🩳', 'Faldas': '👗', 'Calzas': '🩱',
    
    // Calzado - Grupos principales
    'Zapatillas': '👟', 'Zapatos': '👞', 'Botas': '🥾', 'Tacos': '👠', 'Sandalias': '👡'
  };
  
  return iconMap[categoryName] || (type === 'tops' ? '👕' : type === 'bottoms' ? '👖' : '👞');
}

// Obtener descripción de la categoría - ACTUALIZADO para categorías normalizadas
function getCategoryDescription(categoryName) {
  const descriptions = {
    // Superiores
    'Poleras': 'poleras, tank tops y musculosas',
    'Camisas': 'camisas, blusas y vestir',
    'Sweaters': 'sweaters, cardiganes y tejidos',
    'Chaquetas': 'chaquetas, blazers y casacas',
    'Abrigos': 'abrigos y parkas',
    'Hoodies': 'hoodies y con capucha',
    'Vestidos': 'vestidos para toda ocasión',
    'Chalecos': 'chalecos y vests',
    
    // Inferiores
    'Pantalones': 'pantalones formales y casuales',
    'Jeans': 'jeans y mezclilla',
    'Shorts': 'shorts y bermudas',
    'Faldas': 'faldas de diferentes estilos',
    'Calzas': 'calzas, leggins y deportivos',
    
    // Calzado
    'Zapatillas': 'zapatillas deportivas y urbanas',
    'Zapatos': 'zapatos formales y casuales',
    'Botas': 'botas, botines y trekking',
    'Tacos': 'zapatos con taco',
    'Sandalias': 'sandalias y chalas'
  };
  
  return descriptions[categoryName] || 'prendas de esta categoría';
}

// Mostrar pestaña del closet (MODIFICADA para carpetas dinámicas)
function showClosetTab(tabId) {
  document.querySelectorAll('.closet-tab-content').forEach(content => {
    content.style.display = 'none';
  });
  
  document.querySelectorAll('.closet-tab').forEach(tab => {
    tab.classList.remove('active');
  });
  
  document.getElementById(tabId).style.display = 'block';
  document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
  
  // Mapear tabId a tipo
  const typeMapping = {
    'superiores': 'tops',
    'inferiores': 'bottoms', 
    'calzado': 'shoes'
  };
  
  const type = typeMapping[tabId];
  
  if (type) {
    // Renderizar carpetas dinámicas
    renderDynamicFolders(type);
    
    // SIEMPRE reconfigurar subida desde carpetas cada vez que cambia la pestaña
    setTimeout(() => {
      setupClosetFolderUploads();
      updateClosetDisplay();
    }, 200);
    
    // Si está en modo selección, renderizar fotos para seleccionar
    if (closetSelectionMode) {
      setTimeout(() => {
        renderClosetTab(tabId);
      }, 300);
    }
  } else if (tabId === 'recomendaciones') {
    // Para la pestaña de recomendaciones, mantener comportamiento original
    setTimeout(() => {
      updateSavedRecommendationsList();
    }, 200);
  }
}

// NUEVA: Actualizar display del closet con contador
function updateClosetDisplay() {
  const totalItems = getTotalClosetItems();
  const remaining = getRemainingClosetSlots();
  
  // Actualizar header del closet con contador
  const closetHeader = document.querySelector('.closet-header h2');
  if (closetHeader) {
    closetHeader.innerHTML = `Mi Closet Favorito <span style="font-size: 0.8rem; opacity: 0.8;">(${totalItems}/${CONFIG.TOTAL_CLOSET_LIMIT} prendas)</span>`;
  }
  
  // Mostrar contador en cada pestaña
  ['superiores', 'inferiores', 'calzado'].forEach(tabId => {
    const tabContent = document.getElementById(tabId);
    if (tabContent) {
      updateTabCounter(tabId);
    }
  });
  
  console.log(`📊 Closet: ${totalItems}/${CONFIG.TOTAL_CLOSET_LIMIT} prendas, ${remaining} espacios restantes`);
}

// NUEVA: Actualizar contador en pestaña
function updateTabCounter(tabId) {
  const tabContent = document.getElementById(tabId);
  if (!tabContent) return;
  
  const typeMap = {
    'superiores': 'tops',
    'inferiores': 'bottoms',
    'calzado': 'shoes'
  };
  
  const type = typeMap[tabId];
  if (!type) return;
  
  const itemCount = closetItems[type]?.length || 0;
  const remaining = getRemainingClosetSlots();
  
  // Buscar o crear header de contador
  let counterHeader = tabContent.querySelector('.tab-counter-header');
  if (!counterHeader) {
    counterHeader = document.createElement('div');
    counterHeader.className = 'tab-counter-header';
    counterHeader.style.cssText = `
      background: rgba(59, 130, 246, 0.1);
      border-radius: 10px;
      padding: 1rem;
      margin-bottom: 1rem;
      text-align: center;
      border: 2px solid rgba(59, 130, 246, 0.2);
    `;
    
    // Insertar al principio del contenido
    const firstChild = tabContent.firstChild;
    tabContent.insertBefore(counterHeader, firstChild);
  }
  
  const typeNames = {
    'tops': 'Superiores',
    'bottoms': 'Inferiores',
    'shoes': 'Calzado'
  };
  
  counterHeader.innerHTML = `
    <div style="font-weight: 600; color: var(--primary); margin-bottom: 0.5rem;">
      ${typeNames[type]}: ${itemCount} prendas subidas
    </div>
    <div style="font-size: 0.9rem; color: #666;">
      ${remaining > 0 ? `${remaining} espacios restantes en el armario total` : '⚠️ Armario lleno (15/15)'}
    </div>
  `;
}

// Cargar items del closet
function loadClosetItems() {
  // Los datos ya se cargan desde loadUserClosetData()
  console.log('🔍 Items en closet:', {
    tops: closetItems.tops.length,
    bottoms: closetItems.bottoms.length,
    shoes: closetItems.shoes.length,
    total: getTotalClosetItems()
  });
}

// MODIFICADA: Configurar subida desde carpetas del closet con categorías dinámicas
function setupClosetFolderUploads() {
  console.log('🗂️ Reconfigurar subida desde carpetas del closet...');
  
  // Obtener todas las carpetas dinámicas
  const allFolders = document.querySelectorAll('.folder-item[data-category]');
  console.log(`Encontradas ${allFolders.length} carpetas dinámicas para configurar`);
  
  allFolders.forEach((folder, index) => {
    // FORZAR reemplazo del elemento para limpiar listeners anteriores
    const newFolder = folder.cloneNode(true);
    folder.parentNode.replaceChild(newFolder, folder);
    
    const categoryName = newFolder.getAttribute('data-category');
    const type = newFolder.getAttribute('data-type');
    
    console.log(`Configurando carpeta ${index + 1}: ${categoryName} (${type})`);
    
    // Agregar nuevo listener SIEMPRE
    newFolder.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      console.log('🖱️ Click detectado en carpeta dinámica:', categoryName);
      
      if (!isLoggedIn) {
        showNotification('Debes iniciar sesión primero', 'error');
        return;
      }
      
      // Verificar límite total ANTES de permitir subir
      const totalItems = getTotalClosetItems();
      const remaining = getRemainingClosetSlots();
      
      if (remaining <= 0) {
        showNotification(`⚠️ Armario lleno (${totalItems}/${CONFIG.TOTAL_CLOSET_LIMIT}). Elimina prendas para agregar nuevas.`, 'error');
        return;
      }
      
      console.log(`🎯 Subiendo a categoría: ${categoryName} (${type})`);
      
      // Crear input de archivo temporal
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'image/*';
      fileInput.multiple = true;
      fileInput.style.display = 'none';
      
      // Cuando se seleccionen archivos
      fileInput.onchange = async function(e) {
        console.log('📁 Archivos seleccionados para categoría dinámica');
        const files = Array.from(e.target.files);
        if (files.length === 0) {
          console.log('❌ No se seleccionaron archivos');
          return;
        }
        
        console.log(`📷 ${files.length} archivos seleccionados para ${categoryName}`);
        
        // Verificar límite total otra vez
        const currentTotal = getTotalClosetItems();
        const currentRemaining = CONFIG.TOTAL_CLOSET_LIMIT - currentTotal;
        
        if (files.length > currentRemaining) {
          showNotification(`Solo puedes subir ${currentRemaining} fotos más. Armario: ${currentTotal}/${CONFIG.TOTAL_CLOSET_LIMIT}`, 'error');
          return;
        }
        
        // Validar tipos de archivo
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        const invalidFiles = files.filter(file => !validTypes.includes(file.type));
        
        if (invalidFiles.length > 0) {
          showNotification('Solo se permiten archivos JPG, PNG o WebP', 'error');
          return;
        }
        
        showNotification(`Subiendo ${files.length} foto(s) a ${categoryName}...`, 'info');
        
        // Limpiar resultados anteriores si existen
        if (window.currentResults) {
          clearPreviousResults();
        }
        
        // Procesar cada archivo
        for (const file of files) {
          try {
            console.log(`📄 Procesando: ${file.name} en categoría ${categoryName}`);
            
            // Obtener data URL
            const imageUrl = await getImageDataUrl(file);
            
            // Agregar metadatos de categoría dinámica al archivo
            file.dynamicCategory = categoryName;
            file.detectedType = type;
            
            // Agregar a arrays globales
            uploadedFiles[type].push(file);
            closetItems[type].push(imageUrl);
            uploadedImages[type].push(imageUrl);
            
            console.log(`✅ Archivo procesado: ${file.name} para categoría ${categoryName}`);
          } catch (error) {
            console.error('❌ Error procesando archivo:', error);
            showNotification(`Error procesando ${file.name}`, 'error');
          }
        }
        
        // Guardar datos del usuario
        saveUserClosetData();
        
        // Actualizar UI
        updateUploadLabel(type);
        updateGenerateButton();
        updateClosetDisplay();
        
        // Mostrar notificación de éxito
        const newTotal = getTotalClosetItems();
        const newRemaining = getRemainingClosetSlots();
        
        showNotification(`✅ ${files.length} foto(s) agregadas a ${categoryName}. Armario: ${newTotal}/${CONFIG.TOTAL_CLOSET_LIMIT} (${newRemaining} restantes)`, 'success');
        
        // Reconfigurar carpetas después de subir
        setTimeout(() => {
          setupClosetFolderUploads();
        }, 1000);
        
        // Limpiar input
        if (document.body.contains(fileInput)) {
          document.body.removeChild(fileInput);
        }
      };
      
      // Agregar al DOM y hacer click
      document.body.appendChild(fileInput);
      console.log('🖱️ Abriendo selector de archivos...');
      fileInput.click();
    });
    
    // Agregar estilos hover para feedback visual y tooltips
    newFolder.style.cursor = 'pointer';
    
    newFolder.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-5px)';
      this.style.boxShadow = '0 10px 30px rgba(0,0,0,0.15)';
      this.style.borderColor = 'var(--primary)';
      
      // Mostrar tooltip si la carpeta agrupa múltiples tipos
      const tooltip = showCategoryTooltip(categoryName, type, this);
    });
    
    newFolder.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0)';
      this.style.boxShadow = '0 2px 10px rgba(0,0,0,0.05)';
      this.style.borderColor = 'var(--border)';
      
      // Ocultar tooltip
      hideCategoryTooltip(this);
    });
  });
  
  console.log('✅ Todas las carpetas dinámicas configuradas para subida');
}

// NUEVA: Procesar detección de IA y crear categorías
function processAIDetectionAndCreateCategories(files, detectionResults) {
  console.log('🤖 Procesando detección de IA para crear categorías');
  
  files.forEach((file, index) => {
    if (detectionResults && detectionResults[index]) {
      const detection = detectionResults[index];
      
      // Obtener el tipo de prenda desde el archivo o detección
      let type = file.detectedType;
      if (!type) {
        // Inferir tipo desde la detección
        if (detection.top && detection.top.detected_item) {
          type = 'tops';
        } else if (detection.bottom && detection.bottom.detected_item) {
          type = 'bottoms';
        } else if (detection.shoe && detection.shoe.detected_item) {
          type = 'shoes';
        }
      }
      
      if (type) {
        // Obtener la etiqueta detectada
        let detectedLabel = '';
        if (type === 'tops' && detection.top) {
          detectedLabel = detection.top.detected_item;
        } else if (type === 'bottoms' && detection.bottom) {
          detectedLabel = detection.bottom.detected_item;
        } else if (type === 'shoes' && detection.shoe) {
          detectedLabel = detection.shoe.detected_item;
        }
        
        if (detectedLabel) {
          // Agregar la categoría detectada
          addDetectedCategory(type, detectedLabel);
        }
      }
    }
  });
}

// Resto del código permanece igual...
// [Mantener todas las demás funciones del archivo original sin cambios]

// Activar modo selección del closet
function activateClosetSelectionMode() {
  console.log('✨ Activando modo selección del closet...');
  
  closetSelectionMode = true;
  
  // Limpiar selecciones anteriores
  closetSelectedItems = { tops: [], bottoms: [], shoes: [] };
  
  // Mostrar botón de generar
  showClosetGenerateSection();
  
  // Mostrar ocasiones si no hay una seleccionada
  if (!selectedOccasion) {
    document.getElementById('occasionSelector').style.display = 'block';
  }
  
  // Renderizar la pestaña activa
  const activeTab = document.querySelector('.closet-tab.active');
  if (activeTab) {
    const tabId = activeTab.dataset.tab;
    if (tabId === 'superiores' || tabId === 'inferiores' || tabId === 'calzado') {
      renderClosetTab(tabId);
    }
  }
}

// Renderizar fotos en pestaña del closet
function renderClosetTab(tabId) {
  const tabContent = document.getElementById(tabId);
  if (!tabContent) return;
  
  const typeMap = {
    'superiores': 'tops',
    'inferiores': 'bottoms',
    'calzado': 'shoes'
  };
  
  const type = typeMap[tabId];
  if (!type) return;
  
  const items = closetItems[type];
  const selected = closetSelectedItems[type];
  
  if (items.length === 0) {
    // Preservar el header de contador
    const counterHeader = tabContent.querySelector('.tab-counter-header');
    const counterHTML = counterHeader ? counterHeader.outerHTML : '';
    
    tabContent.innerHTML = counterHTML + `
      <div style="text-align: center; padding: 3rem; color: #666;">
        <i class="fas fa-folder-open" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
        <p>No hay prendas en esta categoría</p>
        <p style="font-size: 0.9rem; opacity: 0.7;">Haz click en las carpetas de abajo para subir fotos</p>
      </div>
    `;
    
    // IMPORTANTE: Reconfigurar carpetas después de mostrar mensaje vacío
    setTimeout(() => {
      setupClosetFolderUploads();
    }, 500);
    
    return;
  }
  
  // Preservar el header de contador
  const counterHeader = tabContent.querySelector('.tab-counter-header');
  const counterHTML = counterHeader ? counterHeader.outerHTML : '';
  
  let html = counterHTML + `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
      <div>
        <h3 style="margin: 0; color: #000000;">Selecciona ${type === 'tops' ? 'Superiores' : type === 'bottoms' ? 'Inferiores' : 'Calzado'}</h3>
        <p style="margin: 0.5rem 0 0 0; color: #666; font-size: 0.9rem;">
          Seleccionadas: ${selected.length}/${CONFIG.FILE_LIMITS[type]} máximo para recomendaciones
        </p>
      </div>
      <div style="background: rgba(59, 130, 246, 0.1); padding: 0.5rem 1rem; border-radius: 10px;">
        <span style="font-weight: 600; color: var(--primary);">${items.length} en closet</span>
      </div>
    </div>
    
    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem;">
  `;
  
  items.forEach((imageUrl, index) => {
    const isSelected = selected.includes(index);
    html += `
      <div class="closet-photo-item" data-type="${type}" data-index="${index}" 
           style="position: relative; cursor: pointer; border-radius: 15px; overflow: hidden; transition: all 0.3s ease; ${isSelected ? 'transform: scale(0.95); box-shadow: 0 0 20px rgba(59, 130, 246, 0.5);' : ''}"
           onclick="handleClosetPhotoClick('${type}', ${index})">
        
        <img src="${imageUrl}" 
             style="width: 100%; height: 200px; object-fit: cover; display: block;" 
             alt="${type} ${index + 1}">
        
        ${isSelected ? `
          <div style="position: absolute; top: 10px; right: 10px; background: var(--primary); color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-weight: bold;">
            ✓
          </div>
          <div style="position: absolute; inset: 0; background: rgba(59, 130, 246, 0.3); border: 3px solid var(--primary);"></div>
        ` : ''}
        
        <!-- Botón de eliminar -->
        <div style="position: absolute; top: 10px; left: 10px; background: #ef4444; color: white; border-radius: 50%; width: 25px; height: 25px; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; cursor: pointer; opacity: 0.8;" 
             onclick="event.stopPropagation(); removeClosetItem('${type}', ${index})">
          ×
        </div>
        
        <div style="position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(transparent, rgba(0,0,0,0.7)); color: white; padding: 1rem 0.5rem 0.5rem; font-size: 0.85rem; text-align: center;">
          ${type === 'tops' ? 'Superior' : type === 'bottoms' ? 'Inferior' : 'Calzado'} ${index + 1}
        </div>
      </div>
    `;
  });
  
  html += '</div>';
  
  tabContent.innerHTML = html;
}

// CORREGIDA: Eliminar prenda del closet
function removeClosetItem(type, index) {
  if (!confirm('¿Estás seguro de eliminar esta prenda del closet?')) return;
  
  console.log(`🗑️ Eliminando ${type}[${index}]`);
  
  // Eliminar de todos los arrays
  closetItems[type].splice(index, 1);
  uploadedFiles[type].splice(index, 1);
  uploadedImages[type].splice(index, 1);
  
  // Si estaba seleccionada, quitar de selección
  const selectedIndex = closetSelectedItems[type].indexOf(index);
  if (selectedIndex !== -1) {
    closetSelectedItems[type].splice(selectedIndex, 1);
  }
  
  // Ajustar índices de selecciones mayores
  closetSelectedItems[type] = closetSelectedItems[type].map(idx => idx > index ? idx - 1 : idx);
  
  // Guardar cambios
  saveUserClosetData();
  
  // Actualizar UI
  updateClosetDisplay();
  
  // Re-renderizar pestaña actual
  const activeTab = document.querySelector('.closet-tab.active');
  if (activeTab) {
    const tabId = activeTab.dataset.tab;
    renderClosetTab(tabId);
  }
  
  updateClosetGenerateButton();
  
  // IMPORTANTE: Reconfigurar carpetas después de eliminar
  setTimeout(() => {
    setupClosetFolderUploads();
  }, 500);
  
  const remaining = getRemainingClosetSlots();
  showNotification(`Prenda eliminada. ${remaining} espacios disponibles`, 'success');
}

// CORREGIDA: Manejar click en foto del closet (permitir deselección)
function handleClosetPhotoClick(type, index) {
  const maxLimit = CONFIG.FILE_LIMITS[type];
  const currentSelected = closetSelectedItems[type];
  const isSelected = currentSelected.includes(index);
  
  if (isSelected) {
    // DESELECCIONAR - CORREGIDO
    const indexToRemove = currentSelected.indexOf(index);
    closetSelectedItems[type].splice(indexToRemove, 1);
    showNotification(`${type === 'tops' ? 'Superior' : type === 'bottoms' ? 'Inferior' : 'Calzado'} deseleccionado`, 'info');
  } else {
    // Seleccionar si no se excede el límite
    if (currentSelected.length >= maxLimit) {
      showNotification(`Máximo ${maxLimit} ${type === 'tops' ? 'superiores' : type === 'bottoms' ? 'inferiores' : 'zapatos'} para recomendaciones`, 'error');
      return;
    }
    
    closetSelectedItems[type].push(index);
    showNotification(`${type === 'tops' ? 'Superior' : type === 'bottoms' ? 'Inferior' : 'Calzado'} seleccionado`, 'success');
  }
  
  // Re-renderizar la pestaña actual
  const activeTab = document.querySelector('.closet-tab.active');
  if (activeTab) {
    const tabId = activeTab.dataset.tab;
    renderClosetTab(tabId);
  }
  
  // Actualizar botón de generar
  updateClosetGenerateButton();
}

// Mostrar sección de generar del closet
function showClosetGenerateSection() {
  const closetContent = document.querySelector('.closet-content');
  
  // Verificar si ya existe la sección
  let generateSection = document.getElementById('closetGenerateSection');
  if (!generateSection) {
    generateSection = document.createElement('div');
    generateSection.id = 'closetGenerateSection';
    generateSection.className = 'generate-section';
    generateSection.style.margin = '2rem 0';
    
    closetContent.appendChild(generateSection);
  }
  
  updateClosetGenerateButton();
}

// Actualizar botón de generar del closet
function updateClosetGenerateButton() {
  const generateSection = document.getElementById('closetGenerateSection');
  if (!generateSection) return;
  
  const hasAll = closetSelectedItems.tops.length > 0 && 
                 closetSelectedItems.bottoms.length > 0 && 
                 closetSelectedItems.shoes.length > 0;
  
  let html = `
    <h3 style="color: #000000; margin-bottom: 1rem;">🚀 Generar desde Mi Closet</h3>
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 1rem; text-align: center;">
      <div style="background: rgba(59, 130, 246, 0.1); padding: 1rem; border-radius: 10px;">
        <div style="font-weight: 600; color: var(--primary);">${closetSelectedItems.tops.length}/3</div>
        <div style="font-size: 0.9rem; color: #666;">Superiores</div>
      </div>
      <div style="background: rgba(59, 130, 246, 0.1); padding: 1rem; border-radius: 10px;">
        <div style="font-weight: 600; color: var(--primary);">${closetSelectedItems.bottoms.length}/3</div>
        <div style="font-size: 0.9rem; color: #666;">Inferiores</div>
      </div>
      <div style="background: rgba(59, 130, 246, 0.1); padding: 1rem; border-radius: 10px;">
        <div style="font-weight: 600; color: var(--primary);">${closetSelectedItems.shoes.length}/5</div>
        <div style="font-size: 0.9rem; color: #666;">Calzado</div>
      </div>
    </div>
  `;
  
  if (hasAll && selectedOccasion) {
    const total = closetSelectedItems.tops.length * closetSelectedItems.bottoms.length * closetSelectedItems.shoes.length;
    html += `
      <button class="generate-btn" onclick="generateFromCloset()" style="opacity: 1; cursor: pointer;">
        <i class="fas fa-magic"></i>
        Generar ${total} Recomendaciones del Closet
      </button>
    `;
  } else if (!selectedOccasion) {
    html += `
      <button class="generate-btn" disabled style="opacity: 0.6; cursor: not-allowed;">
        <i class="fas fa-calendar"></i>
        Selecciona una ocasión para continuar
      </button>
    `;
  } else {
    html += `
      <button class="generate-btn" disabled style="opacity: 0.6; cursor: not-allowed;">
        <i class="fas fa-upload"></i>
        Selecciona al menos 1 de cada categoría
      </button>
    `;
  }
  
  generateSection.innerHTML = html;
}

// Generar recomendaciones desde closet
async function generateFromCloset() {
  if (!selectedOccasion) {
    showNotification('Selecciona una ocasión primero', 'error');
    return;
  }
  
  if (!isLoggedIn) {
    showNotification('Debes estar logueado', 'error');
    return;
  }
  
  // Verificar que hay selecciones
  const hasAll = closetSelectedItems.tops.length > 0 && 
                 closetSelectedItems.bottoms.length > 0 && 
                 closetSelectedItems.shoes.length > 0;
                 
  if (!hasAll) {
    showNotification('Selecciona al menos 1 de cada categoría', 'error');
    return;
  }
  
  // Preparar archivos seleccionados del closet
  const selectedFiles = {
    tops: closetSelectedItems.tops.map(index => uploadedFiles.tops[index]).filter(Boolean),
    bottoms: closetSelectedItems.bottoms.map(index => uploadedFiles.bottoms[index]).filter(Boolean),
    shoes: closetSelectedItems.shoes.map(index => uploadedFiles.shoes[index]).filter(Boolean)
  };
  
  // Usar la función de generación existente con archivos seleccionados
  await generateRecommendationsWithFiles(selectedFiles);
}

// Guardar recomendación en closet
function saveRecommendationToCloset(index) {
  if (!window.currentResults || !window.currentResults[index]) return;
  
  const recommendation = window.currentResults[index];
  saveRecommendation(recommendation);
  showNotification('Recomendación guardada en tu closet ⭐', 'success');
}

// Guardar recomendación
function saveRecommendation(recommendation) {
  const saved = {
    id: Date.now(),
    ...recommendation,
    saved_date: new Date().toLocaleDateString('es-ES'),
    occasion: selectedOccasion
  };
  
  savedRecommendations.unshift(saved);
  if (savedRecommendations.length > 20) {
    savedRecommendations = savedRecommendations.slice(0, 20);
  }
  
  userStats.savedOutfits = savedRecommendations.length;
  updateStatsDisplay();
  updateSavedRecommendationsList();
  saveUserClosetData();
}

// Actualizar lista de recomendaciones guardadas
function updateSavedRecommendationsList() {
  const list = document.getElementById('savedRecommendationsList');
  if (!list || savedRecommendations.length === 0) {
    if (list) {
      list.innerHTML = '<p style="text-align: center; color: #000000; opacity: 0.7; padding: 2rem;">Aquí aparecerán tus combinaciones favoritas guardadas</p>';
    }
    return;
  }

  const occasionNames = {
    'oficina': 'Oficina/Trabajo',
    'deportivo': 'Deportes/Gym',
    'casual': 'Casual',
    'formal': 'Formal', 
    'matrimonio': 'Matrimonio'
  };

  list.innerHTML = savedRecommendations.map((rec, index) => {
    const isBest = index === 0;
    const score = Math.round((rec.final_score || 0) * 100);
    
    return `
      <div style="background: var(--background); border: 1px solid var(--border); border-radius: 15px; padding: 1.5rem; margin-bottom: 1rem; display: flex; align-items: center; gap: 1rem; transition: all 0.3s ease; position: relative; ${isBest ? 'border-color: var(--gold); background: rgba(251, 191, 36, 0.05);' : ''}">
        ${isBest ? '<div style="position: absolute; top: -10px; right: -10px; background: var(--gold); color: #000000; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-size: 1rem;">⭐</div>' : ''}
        <div style="flex: 1;">
          <h4 style="margin: 0; color: #000000;">Combinación para ${occasionNames[rec.occasion] || rec.occasion}</h4>
          <p style="margin: 0.5rem 0; color: #000000; opacity: 0.8; font-size: 0.9rem;">${rec.top?.detected_item || 'Superior'} + ${rec.bottom?.detected_item || 'Inferior'} + ${rec.shoe?.detected_item || 'Calzado'}</p>
          <small style="color: #000000; opacity: 0.7;">Guardada el ${rec.saved_date}</small>
        </div>
        <div style="background: ${isBest ? 'var(--gold)' : 'var(--primary)'}; color: ${isBest ? '#000000' : 'white'}; padding: 0.5rem 1rem; border-radius: 20px; font-weight: 700;">${score}%</div>
      </div>
    `;
  }).join('');
}
