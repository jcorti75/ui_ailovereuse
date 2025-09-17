// closet.js - Funciones del Closet CORREGIDAS para ambos límites

function enableCloset() {
  console.log('✨ Activando modo closet...');
  
  clearPreviousResults();
  
  closetMode = true;
  document.getElementById('closetQuestion').style.display = 'none';
  document.getElementById('closetContainer').style.display = 'block';
  document.getElementById('userEmail').textContent = currentUser.email;
  
  loadUserClosetData();
  updateStatsDisplay();
  updateClosetDisplay();
  
  setTimeout(() => {
    setupClosetFolderUploads();
  }, 500);
  
  showNotification('Mi Closet Favorito activado', 'success');
}

function useDirectMode() {
  console.log('⚡ Activando modo directo...');
  
  clearPreviousResults();
  
  closetMode = false;
  document.getElementById('closetQuestion').style.display = 'none';
  showOccasionSelector();
}

function showClosetTab(tabId) {
  document.querySelectorAll('.closet-tab-content').forEach(content => {
    content.style.display = 'none';
  });
  
  document.querySelectorAll('.closet-tab').forEach(tab => {
    tab.classList.remove('active');
  });
  
  document.getElementById(tabId).style.display = 'block';
  document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
  
  setTimeout(() => {
    setupClosetFolderUploads();
    updateClosetDisplay();
  }, 200);
  
  if (closetSelectionMode && (tabId === 'superiores' || tabId === 'inferiores' || tabId === 'calzado')) {
    renderClosetTab(tabId);
  }
}

// CORREGIDA: Display del closet con ambos límites claramente diferenciados
function updateClosetDisplay() {
  const closetTotal = getTotalClosetItems();
  
  // Actualizar header con información del closet total
  const closetHeader = document.querySelector('.closet-header h2');
  if (closetHeader) {
    closetHeader.innerHTML = `Mi Closet Favorito <span style="font-size: 0.8rem; opacity: 0.8;">(${closetTotal}/${CONFIG.TOTAL_CLOSET_LIMIT} prendas total)</span>`;
  }
  
  ['superiores', 'inferiores', 'calzado'].forEach(tabId => {
    const tabContent = document.getElementById(tabId);
    if (tabContent) {
      updateTabCounter(tabId);
    }
  });
  
  console.log(`📊 Closet total: ${closetTotal}/${CONFIG.TOTAL_CLOSET_LIMIT}`);
}

// CORREGIDA: Contador de pestaña con información clara de ambos límites
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
  
  // Datos para recomendaciones (FILE_LIMITS)
  const recommendationCount = uploadedFiles[type] ? uploadedFiles[type].length : 0;
  const recommendationLimit = CONFIG.FILE_LIMITS[type];
  const recommendationAvailable = recommendationLimit - recommendationCount;
  
  // Datos del closet total
  const closetCount = closetItems[type] ? closetItems[type].length : 0;
  const closetTotal = getTotalClosetItems();
  const closetAvailable = getRemainingClosetSlots();
  
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
    
    const firstChild = tabContent.firstChild;
    tabContent.insertBefore(counterHeader, firstChild);
  }
  
  const typeNames = {
    'tops': 'Superiores',
    'bottoms': 'Inferiores', 
    'shoes': 'Calzado'
  };
  
  counterHeader.innerHTML = `
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; text-align: center;">
      <div style="background: rgba(34, 197, 94, 0.1); padding: 0.8rem; border-radius: 8px; border: 1px solid rgba(34, 197, 94, 0.3);">
        <div style="font-weight: 600; color: var(--success); margin-bottom: 0.3rem;">
          Para Recomendaciones
        </div>
        <div style="font-size: 1.2rem; font-weight: 700; color: var(--success);">
          ${recommendationCount}/${recommendationLimit}
        </div>
        <div style="font-size: 0.8rem; color: #666;">
          ${recommendationAvailable > 0 ? `${recommendationAvailable} disponibles` : '✅ Completo'}
        </div>
      </div>
      
      <div style="background: rgba(59, 130, 246, 0.1); padding: 0.8rem; border-radius: 8px; border: 1px solid rgba(59, 130, 246, 0.3);">
        <div style="font-weight: 600; color: var(--primary); margin-bottom: 0.3rem;">
          En Mi Closet
        </div>
        <div style="font-size: 1.2rem; font-weight: 700; color: var(--primary);">
          ${closetCount} prendas
        </div>
        <div style="font-size: 0.8rem; color: #666;">
          Total: ${closetTotal}/${CONFIG.TOTAL_CLOSET_LIMIT} ${closetAvailable > 0 ? `(${closetAvailable} libres)` : '(lleno)'}
        </div>
      </div>
    </div>
    
    <div style="margin-top: 0.8rem; padding: 0.8rem; background: rgba(251, 191, 36, 0.1); border-radius: 8px; border: 1px solid rgba(251, 191, 36, 0.3);">
      <div style="font-size: 0.9rem; color: #92400e; font-weight: 500;">
        💡 ${typeNames[type]}: Puedes tener muchas en tu closet, pero máximo ${recommendationLimit} para generar recomendaciones por sesión
      </div>
    </div>
  `;
}

function loadClosetItems() {
  console.log('🔍 Items en closet:', {
    tops: closetItems.tops ? closetItems.tops.length : 0,
    bottoms: closetItems.bottoms ? closetItems.bottoms.length : 0,
    shoes: closetItems.shoes ? closetItems.shoes.length : 0,
    total: getTotalClosetItems()
  });
}

// CORREGIDA: Setup de carpetas con validación de AMBOS límites
function setupClosetFolderUploads() {
  console.log('🗂️ Configurando subida desde carpetas...');
  
  const allFolders = document.querySelectorAll('.folder-item');
  console.log(`Encontradas ${allFolders.length} carpetas para configurar`);
  
  allFolders.forEach((folder, index) => {
    const newFolder = folder.cloneNode(true);
    folder.parentNode.replaceChild(newFolder, folder);
    
    console.log(`Configurando carpeta ${index + 1}: ${newFolder.querySelector('.folder-name')?.textContent}`);
    
    newFolder.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      console.log('🖱️ Click detectado en carpeta');
      
      if (!isLoggedIn) {
        showNotification('Debes iniciar sesión primero', 'error');
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
      
      // VALIDACIÓN COMBINADA: Verificar AMBOS límites
      const closetStatus = canUploadToCloset(1);
      const recommendationStatus = canUploadForRecommendations(type, 1);
      
      // Priorizar el límite más restrictivo
      let canUpload = false;
      let errorMessage = '';
      
      if (!closetStatus.canUpload) {
        errorMessage = `⚠️ Closet lleno: ${closetStatus.current}/${closetStatus.limit} prendas. Elimina algunas para subir nuevas.`;
      } else if (!recommendationStatus.canUpload) {
        errorMessage = `⚠️ Límite de recomendaciones alcanzado para ${type}: ${recommendationStatus.current}/${recommendationStatus.limit}. Puedes tenerlas en el closet pero no usarlas para recomendaciones hasta eliminar otras.`;
        // Permitir subir al closet aunque no se puedan usar para recomendaciones
        canUpload = true;
      } else {
        canUpload = true;
      }
      
      if (!canUpload) {
        showNotification(errorMessage, 'error');
        return;
      }
      
      if (errorMessage) {
        // Advertir pero permitir subir
        showNotification(errorMessage, 'warning');
      }
      
      // Crear input de archivo temporal
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'image/*';
      fileInput.multiple = true;
      fileInput.style.display = 'none';
      
      console.log('📂 Input de archivo creado');
      
      fileInput.onchange = async function(e) {
        console.log('📁 Archivos seleccionados');
        const files = Array.from(e.target.files);
        if (files.length === 0) return;
        
        console.log(`📷 ${files.length} archivos seleccionados`);
        
        // Validar límite del closet total
        const finalClosetStatus = canUploadToCloset(files.length);
        if (!finalClosetStatus.canUpload) {
          showNotification(
            `Solo puedes subir ${finalClosetStatus.available} archivos más al closet. Total permitido: ${finalClosetStatus.limit}`,
            'error'
          );
          return;
        }
        
        // Validar tipos y tamaño
        const invalidFiles = files.filter(file => !CONFIG.ALLOWED_TYPES.includes(file.type));
        if (invalidFiles.length > 0) {
          showNotification('Solo se permiten archivos JPG, PNG o WebP', 'error');
          return;
        }
        
        const oversizedFiles = files.filter(file => file.size > CONFIG.MAX_FILE_SIZE);
        if (oversizedFiles.length > 0) {
          showNotification(`Archivos muy grandes. Máximo ${CONFIG.MAX_FILE_SIZE / 1024 / 1024}MB por archivo`, 'error');
          return;
        }
        
        showNotification(`📤 Subiendo ${files.length} foto(s) a ${folderName}...`, 'info');
        
        if (window.currentResults) {
          clearPreviousResults();
        }
        
        try {
          // Procesar cada archivo manteniendo integridad
          for (const file of files) {
            console.log(`📄 Procesando: ${file.name}`);
            console.log(`🔍 Verificando tipo de archivo:`, file.constructor.name, file instanceof File);
            
            const imageUrl = await getImageDataUrl(file);
            
            // Determinar si se puede agregar para recomendaciones
            const canAddForRecommendations = canUploadForRecommendations(type, 1);
            
            if (canAddForRecommendations.canUpload) {
              // Agregar tanto al closet como para recomendaciones
              uploadedFiles[type].push(file);
              uploadedImages[type].push(imageUrl);
              console.log(`✅ Agregado para recomendaciones: ${file.name}`);
            } else {
              console.log(`⚠️ Solo agregado al closet (límite de recomendaciones alcanzado): ${file.name}`);
            }
            
            // Siempre agregar al closet
            closetItems[type].push(imageUrl);
            
            console.log(`✅ Archivo procesado: ${file.name} para ${type}`);
          }
          
          // Guardar datos del usuario
          saveUserClosetData();
          
          // Actualizar UI
          updateUploadLabel(type);
          updateGenerateButton();
          updateClosetDisplay();
          
          // Mensaje informativo sobre el estado
          const recommendationCount = uploadedFiles[type].length;
          const recommendationLimit = CONFIG.FILE_LIMITS[type];
          const closetCount = closetItems[type].length;
          const closetTotal = getTotalClosetItems();
          const closetRemaining = getRemainingClosetSlots();
          
          let message = `✅ ${files.length} foto(s) agregadas. `;
          message += `Closet: ${closetTotal}/${CONFIG.TOTAL_CLOSET_LIMIT} (${closetRemaining} libres) • `;
          message += `Recomendaciones ${type}: ${recommendationCount}/${recommendationLimit}`;
          
          showNotification(message, 'success');
          
          setTimeout(setupClosetFolderUploads, 1000);
          
        } catch (error) {
          console.error('❌ Error procesando archivos:', error);
          showNotification('Error procesando algunos archivos', 'error');
        }
        
        if (document.body.contains(fileInput)) {
          document.body.removeChild(fileInput);
        }
      };
      
      document.body.appendChild(fileInput);
      console.log('🖱️ Abriendo selector de archivos...');
      fileInput.click();
    });
    
    // Agregar estilos hover
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

// Resto de funciones sin cambios mayores
function activateClosetSelectionMode() {
  console.log('✨ Activando modo selección del closet...');
  
  closetSelectionMode = true;
  closetSelectedItems = { tops: [], bottoms: [], shoes: [] };
  
  showClosetGenerateSection();
  
  if (!selectedOccasion) {
    document.getElementById('occasionSelector').style.display = 'block';
  }
  
  const activeTab = document.querySelector('.closet-tab.active');
  if (activeTab) {
    const tabId = activeTab.dataset.tab;
    if (tabId === 'superiores' || tabId === 'inferiores' || tabId === 'calzado') {
      renderClosetTab(tabId);
    }
  }
}

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
  
  const items = closetItems[type] || [];
  const selected = closetSelectedItems[type] || [];
  
  if (items.length === 0) {
    const counterHeader = tabContent.querySelector('.tab-counter-header');
    const counterHTML = counterHeader ? counterHeader.outerHTML : '';
    
    tabContent.innerHTML = counterHTML + `
      <div style="text-align: center; padding: 3rem; color: #666;">
        <i class="fas fa-folder-open" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
        <p>No hay prendas en esta categoría</p>
        <p style="font-size: 0.9rem; opacity: 0.7;">Haz click en las carpetas de abajo para subir fotos</p>
      </div>
    `;
    
    setTimeout(setupClosetFolderUploads, 500);
    return;
  }
  
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

// CORREGIDA: Eliminar con gestión correcta de ambos arrays
function removeClosetItem(type, index) {
  if (!confirm('¿Estás seguro de eliminar esta prenda del closet?')) return;
  
  console.log(`🗑️ Eliminando ${type}[${index}]`);
  
  // Eliminar del closet
  closetItems[type].splice(index, 1);
  
  // Si también estaba en recomendaciones, eliminar de ahí
  const recommendationIndex = index; // Asumir mismo índice inicialmente
  if (recommendationIndex < uploadedFiles[type].length) {
    uploadedFiles[type].splice(recommendationIndex, 1);
    uploadedImages[type].splice(recommendationIndex, 1);
  }
  
  // Actualizar selecciones
  const selectedIndex = closetSelectedItems[type].indexOf(index);
  if (selectedIndex !== -1) {
    closetSelectedItems[type].splice(selectedIndex, 1);
  }
  
  closetSelectedItems[type] = closetSelectedItems[type].map(idx => idx > index ? idx - 1 : idx);
  
  saveUserClosetData();
  updateClosetDisplay();
  
  const activeTab = document.querySelector('.closet-tab.active');
  if (activeTab) {
    const tabId = activeTab.dataset.tab;
    renderClosetTab(tabId);
  }
  
  updateClosetGenerateButton();
  setTimeout(setupClosetFolderUploads, 500);
  
  const closetRemaining = getRemainingClosetSlots();
  const recommendationRemaining = CONFIG.FILE_LIMITS[type] - uploadedFiles[type].length;
  
  showNotification(`Prenda eliminada. Closet: ${closetRemaining} espacios • Recomendaciones ${type}: ${recommendationRemaining} disponibles`, 'success');
}

function handleClosetPhotoClick(type, index) {
  const maxLimit = CONFIG.FILE_LIMITS[type];
  const currentSelected = closetSelectedItems[type];
  const isSelected = currentSelected.includes(index);
  
  if (isSelected) {
    const indexToRemove = currentSelected.indexOf(index);
    closetSelectedItems[type].splice(indexToRemove, 1);
    showNotification(`${type === 'tops' ? 'Superior' : type === 'bottoms' ? 'Inferior' : 'Calzado'} deseleccionado`, 'info');
  } else {
    if (currentSelected.length >= maxLimit) {
      showNotification(`Máximo ${maxLimit} ${type === 'tops' ? 'superiores' : type === 'bottoms' ? 'inferiores' : 'zapatos'} para recomendaciones`, 'error');
      return;
    }
    
    closetSelectedItems[type].push(index);
    showNotification(`${type === 'tops' ? 'Superior' : type === 'bottoms' ? 'Inferior' : 'Calzado'} seleccionado`, 'success');
  }
  
  const activeTab = document.querySelector('.closet-tab.active');
  if (activeTab) {
    const tabId = activeTab.dataset.tab;
    renderClosetTab(tabId);
  }
  
  updateClosetGenerateButton();
}

function showClosetGenerateSection() {
  const closetContent = document.querySelector('.closet-content');
  
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
        <div style="font-weight: 600; color: var(--primary);">${closetSelectedItems.tops.length}/${CONFIG.FILE_LIMITS.tops}</div>
        <div style="font-size: 0.9rem; color: #666;">Superiores</div>
      </div>
      <div style="background: rgba(59, 130, 246, 0.1); padding: 1rem; border-radius: 10px;">
        <div style="font-weight: 600; color: var(--primary);">${closetSelectedItems.bottoms.length}/${CONFIG.FILE_LIMITS.bottoms}</div>
        <div style="font-size: 0.9rem; color: #666;">Inferiores</div>
      </div>
      <div style="background: rgba(59, 130, 246, 0.1); padding: 1rem; border-radius: 10px;">
        <div style="font-weight: 600; color: var(--primary);">${closetSelectedItems.shoes.length}/${CONFIG.FILE_LIMITS.shoes}</div>
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

async function generateFromCloset() {
  if (!selectedOccasion) {
    showNotification('Selecciona una ocasión primero', 'error');
    return;
  }
  
  if (!isLoggedIn) {
    showNotification('Debes estar logueado', 'error');
    return;
  }
  
  const hasAll = closetSelectedItems.tops.length > 0 && 
                 closetSelectedItems.bottoms.length > 0 && 
                 closetSelectedItems.shoes.length > 0;
                 
  if (!hasAll) {
    showNotification('Selecciona al menos 1 de cada categoría', 'error');
    return;
  }
  
  const selectedFiles = {
    tops: closetSelectedItems.tops.map(index => uploadedFiles.tops[index]).filter(Boolean),
    bottoms: closetSelectedItems.bottoms.map(index => uploadedFiles.bottoms[index]).filter(Boolean),
    shoes: closetSelectedItems.shoes.map(index => uploadedFiles.shoes[index]).filter(Boolean)
  };
  
  await generateRecommendationsWithFiles(selectedFiles);
}

function saveRecommendationToCloset(index) {
  if (!window.currentResults || !window.currentResults[index]) return;
  
  const recommendation = window.currentResults[index];
  saveRecommendation(recommendation);
  showNotification('Recomendación guardada en tu closet ⭐', 'success');
}

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
