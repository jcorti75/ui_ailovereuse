// upload.js - VERSION DEBUG - Para encontrar por qué no deja subir

// FUNCIÓN DEBUG: Verificar estado de inputs
function debugInputsState() {
  console.log('=== DEBUG INPUTS STATE ===');
  ['tops', 'bottoms', 'shoes'].forEach(type => {
    const input = document.getElementById(`${type}-upload`);
    const label = document.querySelector(`label[for="${type}-upload"]`);
    
    console.log(`${type}:`);
    console.log(`  Input exists: ${!!input}`);
    console.log(`  Input disabled: ${input ? input.disabled : 'N/A'}`);
    console.log(`  Input style.display: ${input ? input.style.display : 'N/A'}`);
    console.log(`  Label exists: ${!!label}`);
    console.log(`  Label clickable: ${label ? getComputedStyle(label).pointerEvents : 'N/A'}`);
    
    if (label) {
      label.style.cursor = 'pointer';
      label.style.pointerEvents = 'auto';
    }
    
    if (input) {
      input.disabled = false;
      input.style.display = 'none'; // Los file inputs siempre están hidden
    }
  });
}

// FUNCIÓN SIMPLIFICADA: Solo limpiar si realmente hay problemas
function silentlyFixFiles() {
  console.log('Verificando archivos...');
  
  let needsUpdate = false;
  
  ['tops', 'bottoms', 'shoes'].forEach(type => {
    const before = uploadedFiles[type].length;
    
    // Filtrar solo archivos válidos
    uploadedFiles[type] = uploadedFiles[type].filter(file => file instanceof File);
    uploadedImages[type] = uploadedImages[type].filter(img => typeof img === 'string' && img.startsWith('data:'));
    
    // Sincronizar longitudes
    const minLength = Math.min(uploadedFiles[type].length, uploadedImages[type].length);
    uploadedFiles[type] = uploadedFiles[type].slice(0, minLength);
    uploadedImages[type] = uploadedImages[type].slice(0, minLength);
    
    const after = uploadedFiles[type].length;
    
    if (before !== after) {
      needsUpdate = true;
      console.log(`${type}: Corregido de ${before} a ${after} archivos`);
    }
  });
  
  if (needsUpdate) {
    ['tops', 'bottoms', 'shoes'].forEach(type => {
      updateUploadLabel(type);
    });
    updateGenerateButton();
    
    if (closetMode) {
      saveUserClosetData();
    }
  }
  
  // SIEMPRE verificar que los inputs estén habilitados
  debugInputsState();
  
  return needsUpdate;
}

// VERSIÓN SIMPLIFICADA: Manejar subida sin validaciones complejas
async function handleFileUpload(type, input) {
  console.log(`=== INICIANDO SUBIDA ${type} ===`);
  console.log(`Usuario logueado: ${isLoggedIn}`);
  console.log(`Input existe: ${!!input}`);
  console.log(`Files seleccionados: ${input?.files?.length || 0}`);
  
  if (!isLoggedIn) {
    showNotification('Debes iniciar sesión primero', 'error');
    input.value = '';
    return;
  }
  
  const files = Array.from(input.files || []);
  if (files.length === 0) {
    console.log('No hay archivos seleccionados');
    return;
  }
  
  console.log(`Procesando ${files.length} archivos para ${type}`);
  
  // Validación BÁSICA de límites
  const currentCount = uploadedFiles[type].filter(f => f instanceof File).length;
  const limit = CONFIG.FILE_LIMITS[type];
  const available = limit - currentCount;
  
  console.log(`Estado actual: ${currentCount}/${limit}, disponibles: ${available}`);
  
  if (available < files.length) {
    const typeNames = { tops: 'superiores', bottoms: 'inferiores', shoes: 'zapatos' };
    const typeName = typeNames[type];
    const message = available === 0 
      ? `Ya tienes el máximo de ${typeName} (${limit}). Elimina algunas fotos para subir nuevas.`
      : `Solo puedes subir ${available} foto${available > 1 ? 's' : ''} más de ${typeName}. Máximo: ${limit}`;
    
    showNotification(message, 'error');
    input.value = '';
    return;
  }
  
  // Validación BÁSICA de tipos
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const invalidFiles = files.filter(file => !validTypes.includes(file.type));
  
  if (invalidFiles.length > 0) {
    showNotification('Solo se permiten archivos JPG, PNG o WebP', 'error');
    input.value = '';
    return;
  }
  
  // Limpiar resultados anteriores
  if (window.currentResults) {
    clearPreviousResults();
  }
  
  console.log(`Validaciones pasadas. Procesando ${files.length} archivos...`);
  
  try {
    showNotification(`Subiendo ${files.length} archivo${files.length > 1 ? 's' : ''}...`, 'info');
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      console.log(`Procesando archivo ${i + 1}: ${file.name}`);
      
      // Crear preview
      try {
        const preview = await createPreview(file, type);
        const previewContainer = document.getElementById(`${type}-preview`);
        if (previewContainer) {
          previewContainer.appendChild(preview);
        }
      } catch (previewError) {
        console.error(`Error creando preview: ${previewError}`);
      }
      
      // Guardar archivo
      uploadedFiles[type].push(file);
      
      // Generar data URL para mostrar
      try {
        const imageUrl = await getImageDataUrl(file);
        uploadedImages[type].push(imageUrl);
        
        if (closetMode) {
          closetItems[type].push(imageUrl);
        }
      } catch (dataUrlError) {
        console.error(`Error generando data URL: ${dataUrlError}`);
      }
    }
    
    console.log(`Archivos procesados exitosamente para ${type}`);
    
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
    
    let message = `${files.length} archivo${files.length > 1 ? 's' : ''} subido${files.length > 1 ? 's' : ''}`;
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
  
  // DEBUG: Verificar estado final
  console.log(`=== ESTADO FINAL ${type} ===`);
  console.log(`Archivos válidos: ${uploadedFiles[type].filter(f => f instanceof File).length}`);
  console.log(`Data URLs: ${uploadedImages[type].length}`);
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
          console.log(`Eliminando imagen ${index} de ${type}`);
          
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
          
          showNotification(`Imagen eliminada`, 'info');
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

// SIMPLIFICADA: Labels con debugging
function updateUploadLabel(type) {
  console.log(`Actualizando label para ${type}`);
  
  const label = document.querySelector(`label[for="${type}-upload"]`);
  if (!label) {
    console.error(`No se encontró label para ${type}-upload`);
    return;
  }
  
  const validFiles = uploadedFiles[type].filter(file => file instanceof File);
  const count = validFiles.length;
  const limit = CONFIG.FILE_LIMITS[type];
  const remaining = limit - count;
  
  console.log(`${type}: ${count}/${limit}, remaining: ${remaining}`);
  
  const labels = { 
    tops: { name: 'Superiores', max: 3 }, 
    bottoms: { name: 'Inferiores', max: 3 }, 
    shoes: { name: 'Zapatos', max: 5 }
  };
  const typeInfo = labels[type];
  
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
  
  // ASEGURAR que el label sea clickeable
  label.style.cursor = 'pointer';
  label.style.pointerEvents = 'auto';
  
  label.title = `${typeInfo.name}: ${count} de ${limit} fotos subidas. Mínimo 1 para generar recomendaciones.`;
}

// SIMPLIFICADA: Botón sin validaciones complejas
function updateGenerateButton() {
  console.log('Actualizando botón de generar...');
  
  const btn = document.getElementById('generateBtn');
  if (!btn) {
    console.error('No se encontró generateBtn');
    return;
  }
  
  // Auto-corregir archivos si es necesario
  silentlyFixFiles();
  
  const validTops = uploadedFiles.tops.filter(file => file instanceof File);
  const validBottoms = uploadedFiles.bottoms.filter(file => file instanceof File);
  const validShoes = uploadedFiles.shoes.filter(file => file instanceof File);
  
  console.log(`Archivos válidos: tops=${validTops.length}, bottoms=${validBottoms.length}, shoes=${validShoes.length}`);
  console.log(`Ocasión seleccionada: ${selectedOccasion}`);
  
  const hasAll = validTops.length > 0 && validBottoms.length > 0 && validShoes.length > 0;
  
  if (hasAll && selectedOccasion) {
    const totalCombinations = validTops.length * validBottoms.length * validShoes.length;
    
    let buttonText;
    if (totalCombinations === 1) {
      buttonText = `<i class="fas fa-magic"></i> Generar 1 Recomendación`;
    } else if (totalCombinations === 2) {
      buttonText = `<i class="fas fa-magic"></i> Generar 2 Recomendaciones`;
    } else {
      buttonText = `<i class="fas fa-magic"></i> Generar 3 Recomendaciones`;
    }
    
    btn.innerHTML = buttonText;
    btn.disabled = false;
    btn.style.opacity = '1';
    btn.style.cursor = 'pointer';
    btn.style.background = 'linear-gradient(135deg, var(--success), #059669)';
    btn.onclick = getRecommendation;
    
    console.log('✅ Botón habilitado');
    
  } else if (!selectedOccasion) {
    btn.innerHTML = '<i class="fas fa-calendar"></i> Selecciona una ocasión primero';
    btn.disabled = true;
    btn.style.opacity = '0.6';
    btn.style.cursor = 'not-allowed';
    btn.style.background = '#6b7280';
    
    console.log('❌ Botón deshabilitado - falta ocasión');
    
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
    
    console.log(`❌ Botón deshabilitado - faltan: ${missing.join(', ')}`);
  }
}

// Función global para debug manual
window.debugUploads = function() {
  console.log('=== DEBUG MANUAL ===');
  debugInputsState();
  console.log('Upload files:', uploadedFiles);
  console.log('Selected occasion:', selectedOccasion);
  console.log('Is logged in:', isLoggedIn);
  console.log('Closet mode:', closetMode);
};
