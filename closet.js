// closet.js - Funciones del Closet y Selección

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

// Mostrar pestaña del closet
function showClosetTab(tabId) {
  document.querySelectorAll('.closet-tab-content').forEach(content => {
    content.style.display = 'none';
  });
  
  document.querySelectorAll('.closet-tab').forEach(tab => {
    tab.classList.remove('active');
  });
  
  document.getElementById(tabId).style.display = 'block';
  document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
  
  // SIEMPRE reconfigurar subida desde carpetas cada vez que cambia la pestaña
  setTimeout(() => {
    setupClosetFolderUploads();
    updateClosetDisplay();
  }, 200);
  
  // Si está en modo selección, renderizar fotos para seleccionar
  if (closetSelectionMode && (tabId === 'superiores' || tabId === 'inferiores' || tabId === 'calzado')) {
    renderClosetTab(tabId);
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
  console.log('📁 Items en closet:', {
    tops: closetItems.tops.length,
    bottoms: closetItems.bottoms.length,
    shoes: closetItems.shoes.length,
    total: getTotalClosetItems()
  });
}

// CORREGIDA: Configurar subida desde carpetas del closet - VERSIÓN ROBUSTA
function setupClosetFolderUploads() {
  console.log('🗂️ Reconfigurar subida desde carpetas del closet...');
  
  // Obtener todas las carpetas sin importar si están vacías o llenas
  const allFolders = document.querySelectorAll('.folder-item');
  console.log(`Encontradas ${allFolders.length} carpetas para configurar`);
  
  allFolders.forEach((folder, index) => {
    // FORZAR reemplazo del elemento para limpiar listeners anteriores
    const newFolder = folder.cloneNode(true);
    folder.parentNode.replaceChild(newFolder, folder);
    
    console.log(`Configurando carpeta ${index + 1}: ${newFolder.querySelector('.folder-name')?.textContent}`);
    
    // Agregar nuevo listener SIEMPRE
    newFolder.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      console.log('🖱️ Click detectado en carpeta');
      
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
      
      const folderName = this.querySelector('.folder-name')?.textContent || 'Carpeta';
      console.log('📁 Procesando click en carpeta:', folderName);
      
      // Determinar tipo según la pestaña activa
      const activeTab = document.querySelector('.closet-tab.active');
      if (!activeTab) {
        showNotification('Error: No se pudo determinar la pestaña activa', 'error');
        return;
      }
      
      const tabId = activeTab.dataset.tab;
      const typeMap = {
        'superiores': 'tops',
        'inferiores': 'bottoms',
        'calzado': 'shoes'
      };
      
      const type = typeMap[tabId];
      if (!type) {
        showNotification('Error: No se pudo determinar el tipo de prenda', 'error');
        return;
      }
      
      console.log(`🎯 Tipo detectado: ${type} desde pestaña ${tabId}`);
      
      // Crear input de archivo temporal
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'image/*';
      fileInput.multiple = true;
      fileInput.style.display = 'none';
      
      console.log('📂 Input de archivo creado');
      
      // Cuando se seleccionen archivos
      fileInput.onchange = async function(e) {
        console.log('📁 Archivos seleccionados');
        const files = Array.from(e.target.files);
        if (files.length === 0) {
          console.log('❌ No se seleccionaron archivos');
          return;
        }
        
        console.log(`📷 ${files.length} archivos seleccionados`);
        
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
        
        showNotification(`Subiendo ${files.length} foto(s) a ${folderName}...`, 'info');
        
        // Limpiar resultados anteriores si existen
        if (window.currentResults) {
          clearPreviousResults();
        }
        
        // Procesar cada archivo
        for (const file of files) {
          try {
            console.log(`🔄 Procesando: ${file.name}`);
            
            // Obtener data URL
            const imageUrl = await getImageDataUrl(file);
            
            // Agregar a arrays globales
            uploadedFiles[type].push(file);
            closetItems[type].push(imageUrl);
            uploadedImages[type].push(imageUrl);
            
            console.log(`✅ Archivo procesado: ${file.name} para ${type}`);
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
        
        showNotification(`✅ ${files.length} foto(s) agregadas. Armario: ${newTotal}/${CONFIG.TOTAL_CLOSET_LIMIT} (${newRemaining} restantes)`, 'success');
        
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
    
    // Agregar estilos hover para feedback visual
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
