// upload.js - Funciones de Subida con Mensajes Amigables

// FUNCIÓN SILENCIOSA: Limpiar automáticamente sin mostrar errores técnicos
function silentlyFixFiles() {
  console.log('🔧 Auto-corrigiendo contadores...');
  
  let needsUpdate = false;
  
  ['tops', 'bottoms', 'shoes'].forEach(type => {
    const before = uploadedFiles[type].length;
    
    // Filtrar solo archivos válidos silenciosamente
    uploadedFiles[type] = uploadedFiles[type].filter(file => file instanceof File);
    uploadedImages[type] = uploadedImages[type].filter(img => typeof img === 'string' && img.startsWith('data:'));
    
    // Sincronizar longitudes
    const minLength = Math.min(uploadedFiles[type].length, uploadedImages[type].length);
    uploadedFiles[type] = uploadedFiles[type].slice(0, minLength);
    uploadedImages[type] = uploadedImages[type].slice(0, minLength);
    
    const after = uploadedFiles[type].length;
    
    if (before !== after) {
      needsUpdate = true;
      console.log(`🔧 ${type}: Corregido de ${before} a ${after} archivos`);
    }
  });
  
  if (needsUpdate) {
    // Actualizar UI silenciosamente
    ['tops', 'bottoms', 'shoes'].forEach(type => {
      updateUploadLabel(type);
    });
    updateGenerateButton();
    
    // Guardar estado corregido
    if (closetMode) {
      saveUserClosetData();
    }
  }
  
  return needsUpdate;
}

// CORREGIDA: Manejar subida con auto-corrección silenciosa
async function handleFileUpload(type, input) {
  // Auto-corregir silenciosamente antes de cualquier operación
  silentlyFixFiles();
  
  if (!isLoggedIn) {
    showNotification('Debes iniciar sesión primero', 'error');
    input.value = '';
    return;
  }
  
  const files = Array.from(input.files);
  if (files.length === 0) return;
  
  console.log(`📁 Subiendo ${files.length} archivos para ${type}`);
  
  // Conteo real de archivos válidos
  const currentValidFiles = uploadedFiles[type].filter(f => f instanceof File).length;
  const recommendationLimit = CONFIG.FILE_LIMITS[type];
  const available = recommendationLimit - currentValidFiles;
  
  if (available < files.length) {
    const typeNames = { tops: 'superiores', bottoms: 'inferiores', shoes: 'zapatos' };
    const typeName = typeNames[type];
    const message = available === 0 
      ? `Ya tienes el máximo de ${typeName} (${recommendationLimit}). Elimina algunas fotos para subir nuevas.`
      : `Solo puedes subir ${available} foto${available > 1 ? 's' : ''} más de ${typeName}. Máximo: ${recommendationLimit}`;
    
    showNotification(message, 'error');
    input.value = '';
    return;
  }
  
  // Validaciones básicas
  const invalidFiles = files.filter(file => !CONFIG.ALLOWED_TYPES.includes(file.type));
  if (invalidFiles.length > 0) {
    showNotification('Solo se permiten archivos JPG, PNG o WebP', 'error');
    input.value = '';
    return;
  }
  
  const oversizedFiles = files.filter(file => file.size > CONFIG.MAX_FILE_SIZE);
  if (oversizedFiles.length > 0) {
    showNotification(`Las imágenes son muy grandes. Máximo ${CONFIG.MAX_FILE_SIZE / 1024 / 1024}MB por archivo`, 'error');
    input.value = '';
    return;
  }
  
  // Limpiar resultados anteriores
  if (window.currentResults) {
    clearPreviousResults();
  }
  
  try {
    showNotification(`Subiendo ${files.length} foto${files.length > 1 ? 's' : ''}...`, 'info');
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      console.log(`📷 Procesando: ${file.name}`);
      
      const preview = await createPreview(file, type);
      document.getElementById(`${type}-preview`).appendChild(preview);
      
      // Guardar archivo original
      uploadedFiles[type].push(file);
      
      const imageUrl = await getImageDataUrl(file);
      uploadedImages[type].push(imageUrl);
      
      if (closetMode) {
        closetItems[type].push(imageUrl);
      }
    }
    
    // Actualizar UI
    updateUploadLabel(type);
    updateGenerateButton();
    
    if (closetMode) {
      saveUserClosetData();
      loadClosetItems();
    }
    
    const finalCount = uploadedFiles[type].filter(f => f instanceof File).length;
    const remaining = CONFIG.FILE_LIMITS[type] - finalCount;
    
    const typeNames = { tops: 'superiores', bottoms: 'inferiores', shoes: 'zapatos' };
    const typeName = typeNames[type];
    
    let message = `${files.length} foto${files.length > 1 ? 's' : ''} subida${files.length > 1 ? 's' : ''}`;
    if (remaining > 0) {
      message += `. Puedes subir ${remaining} ${typeName} más`;
    } else {
      message += `. Ya tienes el máximo de ${typeName}`;
    }
    
    showNotification(message, 'success');
    
  } catch (error) {
    console.error('Error procesando archivos:', error);
    showNotification('Hubo un problema subiendo algunas fotos. Intenta de nuevo.', 'error');
  }
  
  input.value = '';
}

function getImageDataUrl(file) {
  return new Promise((resolve, reject) => {
    if (!(file instanceof File)) {
      reject(new Error('Archivo inválido'));
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
}

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
          
          // Eliminar de ambos arrays
          uploadedFiles[type].splice(index, 1);
          uploadedImages[type].splice(index, 1);
          
          if (closetMode && closetItems[type]) {
            closetItems[type].splice(index, 1);
            saveUserClosetData();
          }
          
          updateUploadLabel(type);
          updateGenerateButton();
          
          if (window.currentResults) {
            clearPreviousResults();
          }
          
          if (closetMode) {
            loadClosetItems();
          }
          
          const remaining = CONFIG.FILE_LIMITS[type] - uploadedFiles[type].filter(f => f instanceof File).length;
          const typeNames = { tops: 'superiores', bottoms: 'inferiores', shoes: 'zapatos' };
          const typeName = typeNames[type];
          
          if (remaining > 0) {
            showNotification(`Imagen eliminada. Puedes subir ${remaining} ${typeName} más`, 'info');
          } else {
            showNotification(`Imagen eliminada. Ya tienes el máximo de ${typeName}`, 'info');
          }
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

// CORREGIDA: Labels con conteo real y mensajes claros
function updateUploadLabel(type) {
  const label = document.querySelector(`label[for="${type}-upload"]`);
  if (!label) return;
  
  // Contar solo archivos válidos
  const validFiles = uploadedFiles[type].filter(file => file instanceof File);
  const count = validFiles.length;
  const limit = CONFIG.FILE_LIMITS[type];
  const remaining = limit - count;
  
  const labels = { 
    tops: { name: 'Superiores', max: 3 }, 
    bottoms: { name: 'Inferiores', max: 3 }, 
    shoes: { name: 'Zapatos', max: 5 }
  };
  const typeInfo = labels[type];
  const limit = CONFIG.FILE_LIMITS[type];
  
  if (count === 0) {
    label.innerHTML = `📤 Subir ${typeInfo.name} (mín 1, máx ${limit})`;
    label.style.background = 'var(--primary)';
    label.style.color = 'white';
  } else if (remaining > 0) {
    label.innerHTML = `${count}/${limit} - Subir ${remaining} más`;
    label.style.background = 'var(--success)';
    label.style.color = 'white';
  } else {
    label.innerHTML = `${count}/${limit} - ¡Máximo alcanzado!`;
    label.style.background = 'var(--gold)';
    label.style.color = '#000000';
  }
  
  label.title = `${typeInfo.name}: ${count} de ${limit} fotos subidas. Mínimo 1 para generar recomendaciones.`;
}

// CORREGIDA: Botón con auto-corrección silenciosa y mensajes amigables
function updateGenerateButton() {
  const btn = document.getElementById('generateBtn');
  if (!btn) return;
  
  // Auto-corregir silenciosamente si es necesario
  const wasFixed = silentlyFixFiles();
  
  // Contar archivos válidos
  const validTops = uploadedFiles.tops.filter(file => file instanceof File);
  const validBottoms = uploadedFiles.bottoms.filter(file => file instanceof File);
  const validShoes = uploadedFiles.shoes.filter(file => file instanceof File);
  
  const hasAll = validTops.length > 0 && validBottoms.length > 0 && validShoes.length > 0;
  
  // Verificación final: si algo sigue mal, mostrar mensaje simple
  const totalExpected = validTops.length + validBottoms.length + validShoes.length;
  const totalInArrays = uploadedFiles.tops.length + uploadedFiles.bottoms.length + uploadedFiles.shoes.length;
  
  if (totalInArrays > totalExpected && !wasFixed) {
    // Algo todavía está mal, mostrar mensaje simple y resolver
    btn.innerHTML = `<i class="fas fa-sync"></i> Actualizando...`;
    btn.disabled = true;
    btn.style.opacity = '0.6';
    btn.style.background = '#6b7280';
    
    // Intentar corregir una vez más y actualizar en 1 segundo
    setTimeout(() => {
      silentlyFixFiles();
      updateGenerateButton();
    }, 1000);
    
    return;
  }
  
  if (hasAll && selectedOccasion) {
    const totalCombinations = validTops.length * validBottoms.length * validShoes.length;
    
    // Consistente con backend: máximo 3 recomendaciones, mínimo 1
    let buttonText;
    let expectedRecommendations;
    
    if (totalCombinations === 1) {
      expectedRecommendations = 1;
      buttonText = `<i class="fas fa-magic"></i> Generar 1 Recomendación`;
    } else if (totalCombinations === 2) {
      expectedRecommendations = 2;
      buttonText = `<i class="fas fa-magic"></i> Generar 2 Recomendaciones`;
    } else {
      // 3 o más combinaciones = máximo 3 recomendaciones del backend
      expectedRecommendations = 3;
      buttonText = `<i class="fas fa-magic"></i> Generar 3 Recomendaciones`;
    }
    
    btn.innerHTML = buttonText;
    btn.disabled = false;
    btn.style.opacity = '1';
    btn.style.cursor = 'pointer';
    btn.style.background = 'linear-gradient(135deg, var(--success), #059669)';
    btn.onclick = getRecommendation;
  } else if (!selectedOccasion) {
    btn.innerHTML = '<i class="fas fa-calendar"></i> Selecciona una ocasión primero';
    btn.disabled = true;
    btn.style.opacity = '0.6';
    btn.style.cursor = 'not-allowed';
    btn.style.background = '#6b7280';
  } else {
    const missing = [];
    if (validTops.length === 0) missing.push('superiores');
    if (validBottoms.length === 0) missing.push('inferiores');  
    if (validShoes.length === 0) missing.push('zapatos');
    
    btn.innerHTML = `<i class="fas fa-upload"></i> Falta subir: ${missing.join(', ')}`;
    btn.disabled = true;
    btn.style.opacity = '0.6';
    btn.style.cursor = 'not-allowed';
    btn.style.background = '#6b7280';
  }
}

// NUEVA: Función para limpiar todo si el usuario lo pide (opcional)
function resetAllUploads() {
  uploadedFiles = { tops: [], bottoms: [], shoes: [] };
  uploadedImages = { tops: [], bottoms: [], shoes: [] };
  
  ['tops', 'bottoms', 'shoes'].forEach(type => {
    const preview = document.getElementById(`${type}-preview`);
    if (preview) preview.innerHTML = '';
    updateUploadLabel(type);
  });
  
  updateGenerateButton();
  
  if (closetMode) {
    saveUserClosetData();
  }
  
  showNotification('Todas las fotos han sido eliminadas', 'info');
}

// Exponer función de reset globalmente si se necesita
window.resetAllUploads = resetAllUploads;
