// upload.js - Funciones de Subida de Archivos CORREGIDAS

// CORREGIDA: Manejar subida de archivos con AMBOS sistemas de límites
async function handleFileUpload(type, input) {
  if (!isLoggedIn) {
    showNotification('Debes iniciar sesión primero', 'error');
    input.value = '';
    return;
  }
  
  const files = Array.from(input.files);
  if (files.length === 0) return;
  
  console.log(`📁 Intentando subir ${files.length} archivos para ${type}`);
  
  // VALIDACIÓN 1: Límite para recomendaciones (FILE_LIMITS)
  const recommendationStatus = canUploadForRecommendations(type, files.length);
  if (!recommendationStatus.canUpload) {
    const message = recommendationStatus.available === 0 
      ? `❌ Límite de recomendaciones alcanzado para ${type}: ${recommendationStatus.current}/${recommendationStatus.limit}. Elimina archivos para subir nuevos.`
      : `❌ Solo puedes subir ${recommendationStatus.available} archivos más de ${type} para recomendaciones. Límite: ${recommendationStatus.limit}`;
    
    showNotification(message, 'error');
    input.value = '';
    return;
  }
  
  // VALIDACIÓN 2: Límite total del closet (si está en modo closet)
  if (closetMode) {
    const closetStatus = canUploadToCloset(files.length);
    if (!closetStatus.canUpload) {
      const message = closetStatus.available === 0 
        ? `❌ Closet lleno: ${closetStatus.current}/${closetStatus.limit}. Elimina prendas para subir nuevas.`
        : `❌ Solo puedes subir ${closetStatus.available} prendas más al closet. Total: ${closetStatus.limit}`;
      
      showNotification(message, 'error');
      input.value = '';
      return;
    }
  }
  
  // Validar tipos de archivo
  const invalidFiles = files.filter(file => !CONFIG.ALLOWED_TYPES.includes(file.type));
  if (invalidFiles.length > 0) {
    showNotification('Solo se permiten archivos JPG, PNG o WebP', 'error');
    input.value = '';
    return;
  }
  
  // Validar tamaño de archivos
  const oversizedFiles = files.filter(file => file.size > CONFIG.MAX_FILE_SIZE);
  if (oversizedFiles.length > 0) {
    showNotification(`Archivos muy grandes. Máximo ${CONFIG.MAX_FILE_SIZE / 1024 / 1024}MB por archivo`, 'error');
    input.value = '';
    return;
  }
  
  // Limpiar resultados cuando se suben nuevas imágenes
  if (window.currentResults) {
    clearPreviousResults();
  }
  
  console.log(`✅ Validaciones pasadas. Procesando ${files.length} archivos...`);
  
  try {
    showNotification(`📤 Subiendo ${files.length} archivos...`, 'info');
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      console.log(`📷 Procesando archivo ${i + 1}/${files.length}: ${file.name}`);
      
      // CRÍTICO: Mantener el archivo como File object
      console.log(`🔍 Tipo de archivo antes de guardar:`, file.constructor.name, file instanceof File);
      
      const preview = await createPreview(file, type);
      document.getElementById(`${type}-preview`).appendChild(preview);
      
      // CRÍTICO: Guardar el archivo original sin modificar
      uploadedFiles[type].push(file);
      
      // Para mostrar preview, generar imageUrl pero no reemplazar el archivo
      const imageUrl = await getImageDataUrl(file);
      uploadedImages[type].push(imageUrl);
      
      // Si está en modo closet, también agregarlo al closet
      if (closetMode) {
        closetItems[type].push(imageUrl);
      }
      
      console.log(`✅ Archivo guardado: ${file.name}, Tipo final:`, uploadedFiles[type][uploadedFiles[type].length - 1].constructor.name);
    }
    
    // Actualizar UI
    updateUploadLabel(type);
    updateGenerateButton();
    
    // Si está en modo closet, guardar y actualizar
    if (closetMode) {
      saveUserClosetData();
      loadClosetItems();
    }
    
    const newRecommendationCount = uploadedFiles[type].length;
    const remainingRecommendation = CONFIG.FILE_LIMITS[type] - newRecommendationCount;
    
    let message = `✅ ${files.length} archivos subidos. ${type}: ${newRecommendationCount}/${CONFIG.FILE_LIMITS[type]} para recomendaciones`;
    
    if (closetMode) {
      const newClosetTotal = getTotalClosetItems();
      const remainingCloset = getRemainingClosetSlots();
      message += ` • Closet: ${newClosetTotal}/${CONFIG.TOTAL_CLOSET_LIMIT} (${remainingCloset} disponibles)`;
    }
    
    showNotification(message, 'success');
    
  } catch (error) {
    console.error('❌ Error procesando archivos:', error);
    showNotification('Error procesando algunos archivos', 'error');
  }
  
  input.value = '';
}

// CRÍTICA: Función para obtener data URL sin corromper el archivo original
function getImageDataUrl(file) {
  return new Promise((resolve, reject) => {
    // Verificar que es un archivo válido
    if (!(file instanceof File)) {
      console.error('❌ No es un archivo válido:', file);
      reject(new Error('No es un archivo válido'));
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      console.log(`✅ Data URL generado para: ${file.name}`);
      resolve(e.target.result);
    };
    reader.onerror = (e) => {
      console.error('❌ Error leyendo archivo:', file.name, e);
      reject(e);
    };
    reader.readAsDataURL(file);
  });
}

// CORREGIDA: Crear preview manteniendo integridad del archivo
function createPreview(file, type) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const container = document.createElement('div');
      container.style.position = 'relative';
      container.style.display = 'inline-block';
      container.style.margin = '0.5rem';
      
      const img = document.createElement('img');
      img.src = e.target.result;
      img.className = 'preview-image';
      img.alt = file.name;
      img.title = `${file.name} (${(file.size / 1024).toFixed(1)}KB)`;
      
      img.onerror = () => {
        console.error('Error cargando imagen:', file.name);
        container.innerHTML = '<div style="width: 120px; height: 120px; background: #f3f4f6; display: flex; align-items: center; justify-content: center; border-radius: 15px; color: #666;">Error</div>';
      };
      
      const removeBtn = document.createElement('button');
      removeBtn.className = 'remove-image';
      removeBtn.innerHTML = '×';
      removeBtn.title = 'Eliminar imagen';
      removeBtn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const index = Array.from(container.parentNode.children).indexOf(container);
        if (index !== -1) {
          console.log(`🗑️ Eliminando imagen ${index} de ${type}`);
          
          // Eliminar de arrays manteniendo consistencia
          const removedFile = uploadedFiles[type][index];
          console.log(`📄 Archivo eliminado:`, removedFile ? removedFile.name : 'undefined');
          
          uploadedFiles[type].splice(index, 1);
          uploadedImages[type].splice(index, 1);
          
          // Si está en modo closet, también eliminar del closet
          if (closetMode && closetItems[type]) {
            closetItems[type].splice(index, 1);
            saveUserClosetData();
          }
          
          updateUploadLabel(type);
          updateGenerateButton();
          
          // Limpiar resultados si se quitan imágenes
          if (window.currentResults) {
            clearPreviousResults();
          }
          
          // Actualizar closet si está en modo closet
          if (closetMode) {
            loadClosetItems();
          }
          
          const remainingRecommendations = CONFIG.FILE_LIMITS[type] - uploadedFiles[type].length;
          let message = `Imagen eliminada. ${remainingRecommendations} espacios disponibles para recomendaciones en ${type}`;
          
          if (closetMode) {
            const remainingCloset = getRemainingClosetSlots();
            message += ` • ${remainingCloset} espacios en closet total`;
          }
          
          showNotification(message, 'info');
        }
        container.remove();
      };
      
      container.appendChild(img);
      container.appendChild(removeBtn);
      resolve(container);
    };
    
    reader.onerror = (e) => {
      console.error('Error leyendo archivo:', file.name, e);
      reject(e);
    };
    
    reader.readAsDataURL(file);
  });
}

// CORREGIDA: Actualizar etiqueta con información de ambos límites
function updateUploadLabel(type) {
  const label = document.querySelector(`label[for="${type}-upload"]`);
  if (!label) return;
  
  const recommendationCount = uploadedFiles[type] ? uploadedFiles[type].length : 0;
  const recommendationLimit = CONFIG.FILE_LIMITS[type];
  const recommendationRemaining = recommendationLimit - recommendationCount;
  
  const labels = { tops: 'Superiores', bottoms: 'Inferiores', shoes: 'Zapatos' };
  const typeLabel = labels[type] || type;
  
  if (recommendationCount === 0) {
    label.innerHTML = `📤 Subir ${typeLabel} (máx ${recommendationLimit} para recomendaciones)`;
    label.style.background = 'var(--primary)';
  } else if (recommendationRemaining > 0) {
    label.innerHTML = `✅ ${recommendationCount}/${recommendationLimit} - Subir ${recommendationRemaining} más para recomendaciones`;
    label.style.background = 'var(--success)';
  } else {
    label.innerHTML = `🎯 ${recommendationCount}/${recommendationLimit} - ¡Completo para recomendaciones!`;
    label.style.background = 'var(--gold)';
    label.style.color = '#000000';
  }
  
  // Información adicional en hover
  let hoverInfo = `${typeLabel}: ${recommendationCount} archivos subidos para recomendaciones, ${recommendationRemaining} espacios disponibles`;
  
  if (closetMode) {
    const closetTotal = getTotalClosetItems();
    const closetRemaining = getRemainingClosetSlots();
    hoverInfo += ` • Closet total: ${closetTotal}/${CONFIG.TOTAL_CLOSET_LIMIT}, ${closetRemaining} espacios restantes`;
  }
  
  label.title = hoverInfo;
}

// CORREGIDA: Actualizar botón de generar con mejor feedback
function updateGenerateButton() {
  const btn = document.getElementById('generateBtn');
  if (!btn) return;
  
  const hasAll = uploadedFiles.tops.length > 0 && 
                 uploadedFiles.bottoms.length > 0 && 
                 uploadedFiles.shoes.length > 0;
  
  if (hasAll && selectedOccasion) {
    const total = uploadedFiles.tops.length * uploadedFiles.bottoms.length * uploadedFiles.shoes.length;
    
    // VALIDACIÓN CRÍTICA: Verificar que todos los archivos son válidos
    const allFiles = [...uploadedFiles.tops, ...uploadedFiles.bottoms, ...uploadedFiles.shoes];
    const invalidFiles = allFiles.filter(file => !(file instanceof File));
    
    if (invalidFiles.length > 0) {
      btn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Error: Archivos corruptos detectados';
      btn.disabled = true;
      btn.style.opacity = '0.6';
      btn.style.cursor = 'not-allowed';
      btn.style.background = '#ef4444';
      console.error('❌ Archivos corruptos detectados:', invalidFiles);
      return;
    }
    
    btn.innerHTML = `<i class="fas fa-magic"></i> Generar ${total} Recomendaciones con IA`;
    btn.disabled = false;
    btn.style.opacity = '1';
    btn.style.cursor = 'pointer';
    btn.style.background = 'linear-gradient(135deg, var(--success), #059669)';
  } else if (!selectedOccasion) {
    btn.innerHTML = '<i class="fas fa-calendar"></i> Selecciona una ocasión primero';
    btn.disabled = true;
    btn.style.opacity = '0.6';
    btn.style.cursor = 'not-allowed';
    btn.style.background = '#6b7280';
  } else {
    // Mostrar qué falta específicamente
    const missing = [];
    if (uploadedFiles.tops.length === 0) missing.push('superiores');
    if (uploadedFiles.bottoms.length === 0) missing.push('inferiores');  
    if (uploadedFiles.shoes.length === 0) missing.push('zapatos');
    
    btn.innerHTML = `<i class="fas fa-upload"></i> Falta: ${missing.join(', ')}`;
    btn.disabled = true;
    btn.style.opacity = '0.6';
    btn.style.cursor = 'not-allowed';
    btn.style.background = '#6b7280';
  }
}
