// upload.js - Sistema de Upload Corregido y Unificado

console.log('📤 Iniciando sistema de upload corregido...');

// MANEJAR SUBIDA DE ARCHIVOS UNIFICADA (función principal)
async function handleFileUpload(type, input) {
  console.log(`📁 Procesando upload para ${type}...`);
  
  // Verificar login
  if (!window.isLoggedIn()) {
    window.showNotification('Debes iniciar sesión primero', 'error');
    input.value = '';
    return;
  }
  
  const files = Array.from(input.files);
  if (files.length === 0) {
    console.log('No se seleccionaron archivos');
    return;
  }
  
  console.log(`📷 ${files.length} archivos seleccionados para ${type}`);
  
  // VALIDAR LÍMITES Y ARCHIVOS
  const validation = validateUploadRequest(type, files);
  if (!validation.valid) {
    window.showNotification(validation.message, 'error');
    input.value = '';
    return;
  }
  
  // LIMPIAR RESULTADOS ANTERIORES
  clearPreviousResults();
  
  // MOSTRAR PROGRESO
  window.showNotification(`📤 Subiendo ${files.length} archivo(s)...`, 'info');
  
  // PROCESAR ARCHIVOS
  let processedCount = 0;
  const successfulUploads = [];
  
  for (const file of files) {
    try {
      console.log(`🔄 Procesando: ${file.name}`);
      
      // Convertir a data URL
      const imageUrl = await convertFileToDataUrl(file);
      
      // Agregar a arrays globales usando las variables del config
      if (!window.uploadedFiles) window.uploadedFiles = { tops: [], bottoms: [], shoes: [] };
      if (!window.uploadedImages) window.uploadedImages = { tops: [], bottoms: [], shoes: [] };
      
      window.uploadedFiles[type].push(file);
      window.uploadedImages[type].push(imageUrl);
      
      // Si está en modo closet, agregar también al closet
      if (window.closetMode()) {
        if (!window.closetItems) window.closetItems = { tops: [], bottoms: [], shoes: [] };
        window.closetItems[type].push(imageUrl);
      }
      
      // Crear preview visual
      createPreviewElement(file, imageUrl, type, window.uploadedFiles[type].length - 1);
      
      successfulUploads.push(file.name);
      processedCount++;
      
      console.log(`✅ Procesado: ${file.name}`);
      
    } catch (error) {
      console.error(`❌ Error procesando ${file.name}:`, error);
      window.showNotification(`Error procesando ${file.name}`, 'error');
    }
  }
  
  // FINALIZAR PROCESO
  if (processedCount > 0) {
    // Actualizar UI
    updateUploadLabel(type);
    updateGenerateButton();
    
    // Guardar datos si está en modo closet
    if (window.closetMode() && typeof window.saveUserData === 'function') {
      window.saveUserData();
    }
    
    // Mensaje de éxito
    const successMessage = window.generateSuccessMessage(type, processedCount);
    window.showNotification(successMessage, 'success');
    
    console.log(`🎉 Upload completado: ${processedCount}/${files.length} archivos procesados`);
  }
  
  // Limpiar input
  input.value = '';
}

// VALIDAR REQUEST DE UPLOAD
function validateUploadRequest(type, files) {
  console.log(`🔍 Validando upload: ${files.length} archivos para ${type}`);
  
  // Validar límites usando funciones centralizadas
  const limitValidation = window.validateUploadLimits(type, files.length);
  if (!limitValidation.valid) {
    return limitValidation;
  }
  
  // Validar tipos de archivo
  const invalidFiles = files.filter(file => !window.validateFileType(file));
  if (invalidFiles.length > 0) {
    return {
      valid: false,
      message: `Archivos no válidos: ${invalidFiles.map(f => f.name).join(', ')}. Solo JPG, PNG y WebP permitidos.`
    };
  }
  
  // Validar tamaño de archivos
  const oversizedFiles = files.filter(file => !window.validateFileSize(file));
  if (oversizedFiles.length > 0) {
    return {
      valid: false,
      message: `Archivos muy grandes: ${oversizedFiles.map(f => f.name).join(', ')}. Máximo 5MB por imagen.`
    };
  }
  
  console.log('✅ Validación de upload exitosa');
  return { valid: true };
}

// CONVERTIR ARCHIVO A DATA URL
function convertFileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      reject(new Error('Archivo no es una imagen válida'));
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = () => reject(new Error('Error leyendo archivo'));
    reader.readAsDataURL(file);
  });
}

// CREAR ELEMENTO DE PREVIEW VISUAL
function createPreviewElement(file, imageUrl, type, index) {
  const previewContainer = document.getElementById(`${type}-preview`);
  if (!previewContainer) {
    console.warn(`Container de preview ${type}-preview no encontrado`);
    return;
  }
  
  // Crear contenedor del preview
  const previewItem = document.createElement('div');
  previewItem.className = 'preview-item';
  previewItem.style.cssText = `
    position: relative;
    display: inline-block;
    margin: 0.5rem 0.25rem;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    transition: all 0.3s ease;
  `;
  
  // Imagen
  const img = document.createElement('img');
  img.src = imageUrl;
  img.alt = `${window.getTypeName(type)} ${index + 1}`;
  img.className = 'preview-image';
  img.style.cssText = `
    width: 120px;
    height: 120px;
    object-fit: cover;
    display: block;
    border-radius: 10px;
  `;
  
  // Botón de eliminar
  const removeBtn = document.createElement('button');
  removeBtn.className = 'remove-image';
  removeBtn.innerHTML = '×';
  removeBtn.title = `Eliminar ${file.name}`;
  removeBtn.style.cssText = `
    position: absolute;
    top: -8px;
    right: -8px;
    background: #ef4444;
    color: white;
    border: none;
    border-radius: 50%;
    width: 24px;
    height: 24px;
    cursor: pointer;
    font-size: 14px;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    transition: all 0.2s ease;
  `;
  
  // Efectos hover
  previewItem.addEventListener('mouseenter', () => {
    previewItem.style.transform = 'scale(1.05)';
    removeBtn.style.background = '#dc2626';
    removeBtn.style.transform = 'scale(1.1)';
  });
  
  previewItem.addEventListener('mouseleave', () => {
    previewItem.style.transform = 'scale(1)';
    removeBtn.style.background = '#ef4444';
    removeBtn.style.transform = 'scale(1)';
  });
  
  // Evento de eliminación
  removeBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (confirm(`¿Eliminar ${file.name}?`)) {
      removeImage(previewItem, type, index);
    }
  });
  
  // Nombre del archivo (opcional, para debug)
  const fileName = document.createElement('div');
  fileName.textContent = file.name.length > 15 ? file.name.substring(0, 15) + '...' : file.name;
  fileName.style.cssText = `
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: linear-gradient(transparent, rgba(0,0,0,0.7));
    color: white;
    padding: 0.5rem 0.25rem 0.25rem;
    font-size: 0.7rem;
    text-align: center;
    border-radius: 0 0 10px 10px;
  `;
  
  // Ensamblar elementos
  previewItem.appendChild(img);
  previewItem.appendChild(removeBtn);
  previewItem.appendChild(fileName);
  
  // Agregar al container
  previewContainer.appendChild(previewItem);
  
  console.log(`🖼️ Preview creado para ${file.name}`);
}

// ELIMINAR IMAGEN CON LIMPIEZA COMPLETA
function removeImage(previewElement, type, originalIndex) {
  console.log(`🗑️ Eliminando imagen ${originalIndex} de ${type}`);
  
  // Encontrar índice actual en el DOM
  const previewContainer = previewElement.parentNode;
  const currentIndex = Array.from(previewContainer.children).indexOf(previewElement);
  
  if (currentIndex !== -1 && window.uploadedFiles && window.uploadedFiles[type]) {
    // Eliminar de arrays globales
    window.uploadedFiles[type].splice(currentIndex, 1);
    
    if (window.uploadedImages && window.uploadedImages[type]) {
      window.uploadedImages[type].splice(currentIndex, 1);
    }
    
    // Eliminar del closet si está en modo closet
    if (window.closetMode() && window.closetItems && window.closetItems[type]) {
      window.closetItems[type].splice(currentIndex, 1);
    }
    
    // Actualizar UI
    updateUploadLabel(type);
    updateGenerateButton();
    clearPreviousResults();
    
    // Guardar cambios
    if (window.closetMode() && typeof window.saveUserData === 'function') {
      window.saveUserData();
    }
    
    // Mensaje de confirmación
    window.showNotification(`Imagen eliminada de ${window.getTypeName(type)}`, 'info');
  }
  
  // Eliminar elemento visual
  previewElement.remove();
  
  console.log(`✅ Imagen eliminada y arrays actualizados`);
}

// ACTUALIZAR LABEL DE UPLOAD CON INFORMACIÓN CONTEXTUAL
function updateUploadLabel(type) {
  const label = document.querySelector(`label[for="${type}-upload"]`);
  if (!label) return;
  
  const currentCount = (window.uploadedFiles && window.uploadedFiles[type]) ? 
                      window.uploadedFiles[type].length : 0;
  const typeName = window.getTypeName(type);
  
  let labelText = '';
  let contextInfo = '';
  
  if (window.closetMode()) {
    // Modo closet: mostrar espacios restantes
    const totalItems = window.getTotalClosetItems();
    const remaining = window.getRemainingClosetSlots();
    
    if (currentCount === 0) {
      labelText = `📤 Subir ${typeName}`;
      contextInfo = remaining > 0 ? 
        ` (${remaining} espacios restantes en closet)` : 
        ' (Closet lleno - elimina prendas)';
    } else {
      labelText = `✅ ${currentCount} ${typeName} en closet`;
      contextInfo = remaining > 0 ? 
        ` - ${remaining} espacios restantes` : 
        ' - Closet lleno';
    }
    
  } else {
    // Modo directo: mostrar límites por tipo
    const maxAllowed = CONFIG.FILE_LIMITS[type];
    const remaining = Math.max(0, maxAllowed - currentCount);
    
    if (currentCount === 0) {
      labelText = `📤 Subir ${typeName}`;
      contextInfo = ` (máx ${maxAllowed})`;
    } else if (remaining > 0) {
      labelText = `✅ ${currentCount}/${maxAllowed} - Agregar más`;
      contextInfo = ` (${remaining} restantes)`;
    } else {
      labelText = `🎯 ${currentCount}/${maxAllowed} - ¡Completo!`;
      contextInfo = '';
    }
  }
  
  label.innerHTML = labelText + contextInfo;
  
  // Actualizar color según estado
  if (currentCount === 0) {
    label.style.background = 'var(--primary)';
  } else if (window.closetMode() ? window.getRemainingClosetSlots() > 0 : currentCount < CONFIG.FILE_LIMITS[type]) {
    label.style.background = 'var(--success)';
  } else {
    label.style.background = 'var(--warning)';
  }
}

// ACTUALIZAR BOTÓN DE GENERAR CON LÓGICA COMPLETA
function updateGenerateButton() {
  const btn = document.getElementById('generateBtn');
  if (!btn) {
    console.warn('Botón generateBtn no encontrado');
    return;
  }
  
  // Verificar archivos mínimos requeridos
  const hasMinimumFiles = Object.keys(CONFIG.MIN_REQUIRED).every(type => {
    const currentCount = (window.uploadedFiles && window.uploadedFiles[type]) ? 
                        window.uploadedFiles[type].length : 0;
    return currentCount >= CONFIG.MIN_REQUIRED[type];
  });
  
  // Verificar ocasión seleccionada
  const hasOccasion = window.selectedOccasion() !== null;
  
  console.log('Estado del botón generar:', {
    hasMinimumFiles,
    hasOccasion,
    uploadedFiles: window.uploadedFiles,
    selectedOccasion: window.selectedOccasion()
  });
  
  if (hasMinimumFiles && hasOccasion) {
    // HABILITAR BOTÓN
    const totalCombinations = calculatePossibleCombinations();
    const displayCombinations = Math.min(totalCombinations, 5); // Limitar a 5 para UI
    
    btn.disabled = false;
    btn.style.opacity = '1';
    btn.style.cursor = 'pointer';
    btn.style.background = 'linear-gradient(135deg, var(--success), #059669)';
    btn.innerHTML = `<i class="fas fa-magic"></i> Generar ${displayCombinations} Recomendación${displayCombinations !== 1 ? 'es' : ''} con IA`;
    
    // Efectos hover
    btn.onmouseenter = () => {
      btn.style.transform = 'translateY(-3px)';
      btn.style.boxShadow = '0 15px 40px rgba(16, 185, 129, 0.4)';
    };
    btn.onmouseleave = () => {
      btn.style.transform = 'translateY(0)';
      btn.style.boxShadow = '0 10px 30px rgba(16, 185, 129, 0.3)';
    };
    
    // Configurar click
    btn.onclick = function() {
      if (typeof window.getRecommendation === 'function') {
        window.getRecommendation();
      } else {
        console.warn('Función getRecommendation no disponible');
        window.showNotification('Sistema de recomendaciones no disponible', 'error');
      }
    };
    
  } else {
    // DESHABILITAR BOTÓN
    btn.disabled = true;
    btn.style.opacity = '0.6';
    btn.style.cursor = 'not-allowed';
    btn.style.background = 'linear-gradient(135deg, #6b7280, #4b5563)';
    btn.onmouseenter = btn.onmouseleave = null;
    btn.onclick = null;
    
    if (!hasOccasion) {
      btn.innerHTML = '<i class="fas fa-calendar"></i> Selecciona una ocasión primero';
    } else {
      const needed = [];
      Object.keys(CONFIG.MIN_REQUIRED).forEach(type => {
        const currentCount = (window.uploadedFiles && window.uploadedFiles[type]) ? 
                            window.uploadedFiles[type].length : 0;
        if (currentCount < CONFIG.MIN_REQUIRED[type]) {
          needed.push(window.getTypeName(type));
        }
      });
      
      btn.innerHTML = `<i class="fas fa-upload"></i> Falta subir: ${needed.join(', ')}`;
    }
  }
}

// CALCULAR COMBINACIONES POSIBLES
function calculatePossibleCombinations() {
  if (!window.uploadedFiles) return 0;
  
  const tops = window.uploadedFiles.tops?.length || 0;
  const bottoms = window.uploadedFiles.bottoms?.length || 0;
  const shoes = window.uploadedFiles.shoes?.length || 0;
  
  return tops * bottoms * shoes;
}

// LIMPIAR RESULTADOS PREVIOS
function clearPreviousResults() {
  const resultContainer = document.getElementById('result');
  if (resultContainer) {
    resultContainer.style.display = 'none';
    resultContainer.innerHTML = '';
  }
  
  // Limpiar variable global de resultados
  if (typeof window.currentResults !== 'undefined') {
    window.currentResults = null;
  }
  
  console.log('🧹 Resultados previos limpiados');
}

// RESETEAR ESTADO COMPLETO DE UPLOAD
function resetUploadState() {
  console.log('🔄 Reseteando estado completo de upload...');
  
  try {
    // Limpiar arrays globales
    window.uploadedFiles = { tops: [], bottoms: [], shoes: [] };
    window.uploadedImages = { tops: [], bottoms: [], shoes: [] };
    
    if (window.closetMode()) {
      window.closetItems = { tops: [], bottoms: [], shoes: [] };
    }
    
    // Limpiar previews visuales
    ['tops', 'bottoms', 'shoes'].forEach(type => {
      const preview = document.getElementById(`${type}-preview`);
      if (preview) {
        preview.innerHTML = '';
      }
      updateUploadLabel(type);
    });
    
    // Limpiar resultados y ocasión
    clearPreviousResults();
    window.setSelectedOccasion(null);
    
    // Actualizar botón
    updateGenerateButton();
    
    console.log('✅ Estado de upload completamente reseteado');
    
  } catch (error) {
    console.error('Error reseteando estado de upload:', error);
  }
}

// CONFIGURAR EVENT LISTENERS DE INPUTS DE ARCHIVOS
function setupFileInputListeners() {
  console.log('🔧 Configurando event listeners de file inputs...');
  
  const fileInputs = [
    { id: 'tops-upload', type: 'tops' },
    { id: 'bottoms-upload', type: 'bottoms' },
    { id: 'shoes-upload', type: 'shoes' }
  ];
  
  fileInputs.forEach(({ id, type }) => {
    const input = document.getElementById(id);
    if (input) {
      // Limpiar listeners anteriores
      input.removeEventListener('change', input._uploadHandler);
      
      // Crear nuevo handler
      const handler = (e) => handleFileUpload(type, e.target);
      input._uploadHandler = handler;
      
      // Agregar listener
      input.addEventListener('change', handler);
      
      console.log(`✅ Listener configurado para ${id}`);
    } else {
      console.warn(`⚠️ Input ${id} no encontrado`);
    }
  });
}

// INICIALIZAR SISTEMA DE UPLOAD
function initializeUploadSystem() {
  console.log('🚀 Inicializando sistema de upload...');
  
  try {
    // Configurar event listeners
    setupFileInputListeners();
    
    // Inicializar labels de todos los tipos
    Object.keys(CONFIG.FILE_LIMITS).forEach(type => {
      updateUploadLabel(type);
    });
    
    // Inicializar botón de generar
    updateGenerateButton();
    
    console.log('✅ Sistema de upload inicializado correctamente');
    
  } catch (error) {
    console.error('Error inicializando sistema de upload:', error);
  }
}

// EXPONER FUNCIONES GLOBALMENTE
window.handleFileUpload = handleFileUpload;
window.updateGenerateButton = updateGenerateButton;
window.updateUploadLabel = updateUploadLabel;
window.clearPreviousResults = clearPreviousResults;
window.resetUploadState = resetUploadState;
window.initializeUploadSystem = initializeUploadSystem;

// AUTO-INICIALIZACIÓN
document.addEventListener('DOMContentLoaded', function() {
  console.log('📄 upload.js cargando...');
  
  // Inicializar después de un pequeño delay para asegurar que el DOM esté listo
  setTimeout(initializeUploadSystem, 200);
  
  console.log('✅ upload.js cargado');
});

console.log('✅ upload.js - Sistema de Upload Corregido y Unificado cargado');
