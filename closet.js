// closet.js - Funciones del Closet y Selección

// Activar modo closet
function enableCloset() {
  console.log('✨ Activando modo closet con limpieza de resultados...');
  
  // Limpiar resultados anteriores al cambiar modo
  clearPreviousResults();
  
  closetMode = true;
  document.getElementById('closetQuestion').style.display = 'none';
  document.getElementById('closetContainer').style.display = 'block';
  document.getElementById('userEmail').textContent = currentUser.email;
  updateStatsDisplay();
  
  // Cargar items del closet
  loadClosetItems();
  
  // Configurar subida desde carpetas
  setupClosetFolderUploads();
  
  showNotification('Mi Closet Favorito activado', 'success');
}

// Usar modo directo
function useDirectMode() {
  console.log('⚡ Activando modo directo con limpieza de resultados...');
  
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
  
  // Reconfigurar subida desde carpetas cada vez que cambia la pestaña
  setTimeout(() => {
    setupClosetFolderUploads();
  }, 100);
  
  // Si está en modo selección, renderizar fotos para seleccionar
  if (closetSelectionMode && (tabId === 'superiores' || tabId === 'inferiores' || tabId === 'calzado')) {
    renderClosetTab(tabId);
  }
}

// Cargar items del closet
function loadClosetItems() {
  // Copiar las imágenes subidas al closet
  closetItems.tops = [...uploadedImages.tops];
  closetItems.bottoms = [...uploadedImages.bottoms];
  closetItems.shoes = [...uploadedImages.shoes];
  
  console.log('📁 Items cargados en closet:', {
    tops: closetItems.tops.length,
    bottoms: closetItems.bottoms.length,
    shoes: closetItems.shoes.length
  });
}

// NUEVA FUNCIÓN: Configurar subida desde carpetas del closet
function setupClosetFolderUploads() {
  console.log('🗂️ Configurando subida desde carpetas del closet...');
  
  // Obtener todas las carpetas y reconfigurar event listeners
  document.querySelectorAll('.folder-item').forEach(folder => {
    // Remover listeners anteriores clonando el elemento
    const newFolder = folder.cloneNode(true);
    folder.parentNode.replaceChild(newFolder, folder);
    
    // Agregar nuevo listener
    newFolder.addEventListener('click', function() {
      if (!isLoggedIn) {
        showNotification('Debes iniciar sesión primero', 'error');
        return;
      }
      
      const folderName = this.querySelector('.folder-name').textContent;
      console.log('📁 Click en carpeta:', folderName);
      
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
      
      // Verificar límites actuales
      const currentCount = uploadedFiles[type].length;
      const maxCount = CONFIG.FILE_LIMITS[type];
      
      if (currentCount >= maxCount) {
        showNotification(`Ya tienes el máximo de ${maxCount} prendas en ${type}`, 'error');
        return;
      }
      
      // Crear input de archivo temporal
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'image/*';
      fileInput.multiple = true;
      fileInput.style.display = 'none';
      
      // Cuando se seleccionen archivos
      fileInput.onchange = async function(e) {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;
        
        const remainingSlots = maxCount - currentCount;
        if (files.length > remainingSlots) {
          showNotification(`Solo puedes subir ${remainingSlots} fotos más en esta categoría`, 'error');
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
        
        // Procesar cada archivo usando las funciones existentes
        for (const file of files) {
          try {
            // Agregar a arrays globales
            uploadedFiles[type].push(file);
            
            const imageUrl = await getImageDataUrl(file);
            uploadedImages[type].push(imageUrl);
            
            console.log(`✅ Archivo procesado: ${file.name} para ${type}`);
          } catch (error) {
            console.error('Error procesando archivo:', error);
            showNotification(`Error procesando ${file.name}`, 'error');
          }
        }
        
        // Actualizar UI usando funciones existentes
        updateUploadLabel(type);
        updateGenerateButton();
        
        // Actualizar closet
        loadClosetItems();
        
        // Mostrar notificación de éxito
        const typeNames = {
          'tops': 'superiores',
          'bottoms': 'inferiores', 
          'shoes': 'calzado'
        };
        
        showNotification(`✅ ${files.length} foto(s) agregadas a ${typeNames[type]}`, 'success');
        
        // Limpiar input
        document.body.removeChild(fileInput);
      };
      
      // Agregar al DOM y hacer click
      document.body.appendChild(fileInput);
      fileInput.click();
    });
  });
  
  console.log('✅ Subida desde carpetas configurada correctamente');
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
    tabContent.innerHTML = `
      <div style="text-align: center; padding: 3rem; color: #666;">
        <i class="fas fa-folder-open" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
        <p>No hay prendas en esta categoría</p>
        <p style="font-size: 0.9rem; opacity: 0.7;">Haz click en las carpetas de abajo para subir fotos</p>
      </div>
    `;
    return;
  }
  
  let html = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
      <div>
        <h3 style="margin: 0; color: #000000;">Selecciona ${type === 'tops' ? 'Superiores' : type === 'bottoms' ? 'Inferiores' : 'Calzado'}</h3>
        <p style="margin: 0.5rem 0 0 0; color: #666; font-size: 0.9rem;">
          Seleccionadas: ${selected.length}/${CONFIG.FILE_LIMITS[type]} máximo
        </p>
      </div>
      <div style="background: rgba(59, 130, 246, 0.1); padding: 0.5rem 1rem; border-radius: 10px;">
        <span style="font-weight: 600; color: var(--primary);">${items.length} disponibles</span>
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
        
        <div style="position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(transparent, rgba(0,0,0,0.7)); color: white; padding: 1rem 0.5rem 0.5rem; font-size: 0.85rem; text-align: center;">
          ${type === 'tops' ? 'Superior' : type === 'bottoms' ? 'Inferior' : 'Calzado'} ${index + 1}
        </div>
      </div>
    `;
  });
  
  html += '</div>';
  
  tabContent.innerHTML = html;
}

// Manejar click en foto del closet
function handleClosetPhotoClick(type, index) {
  const maxLimit = CONFIG.FILE_LIMITS[type];
  const currentSelected = closetSelectedItems[type];
  const isSelected = currentSelected.includes(index);
  
  if (isSelected) {
    // Deseleccionar
    const indexToRemove = currentSelected.indexOf(index);
    closetSelectedItems[type].splice(indexToRemove, 1);
    showNotification(`${type === 'tops' ? 'Superior' : type === 'bottoms' ? 'Inferior' : 'Calzado'} deseleccionado`, 'info');
  } else {
    // Seleccionar si no se excede el límite
    if (currentSelected.length >= maxLimit) {
      showNotification(`Máximo ${maxLimit} ${type === 'tops' ? 'superiores' : type === 'bottoms' ? 'inferiores' : 'zapatos'}`, 'error');
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
