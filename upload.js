// upload.js - Sistema de Subida Unificado y Optimizado

// Manejar subida de archivos con lógica unificada
async function handleFileUpload(type, input) {
  if (!window.isLoggedIn()) {
    window.showNotification('Debes iniciar sesión primero', 'error');
    input.value = '';
    return;
  }
  
  const files = Array.from(input.files);
  if (files.length === 0) return;
  
  // Validar límites usando funciones unificadas del config
  const validation = window.validateUploadLimits(type, files.length);
  if (!validation.valid) {
    window.showNotification(validation.message, 'error');
    input.value = '';
    return;
  }
  
  // Validar tipos de archivo
  const invalidFiles = files.filter(file => !window.validateFileType(file));
  if (invalidFiles.length > 0) {
    window.showNotification('Solo se permiten archivos JPG, PNG o WebP', 'error');
    input.value = '';
    return;
  }
  
  // Validar tamaño de archivos
  const oversizedFiles = files.filter(file => !window.validateFileSize(file));
  if (oversizedFiles.length > 0) {
    window.showNotification('Archivos muy grandes. Máximo 5MB por imagen', 'error');
    input.value = '';
    return;
  }
  
  // Limpiar resultados previos cuando se suben nuevas imágenes
  clearPreviousResults();
  
  // Procesar archivos
  for (const file of files) {
    try {
      // Crear preview visual
      const preview = await createPreview(file, type);
      const previewContainer = document.getElementById(`${type}-preview`);
      if (previewContainer) {
        previewContainer.appendChild(preview);
      }
      
      // Agregar a arrays globales
      uploadedFiles[type].push(file);
      
      // Convertir a data URL para display
      const imageUrl = await getImageDataUrl(file);
      uploadedImages[type].push(imageUrl);
      
      // Si está en modo closet, agregar también al closet
      if (window.closetMode()) {
        closetItems[type].push(imageUrl);
      }
      
    } catch (error) {
      console.error('Error procesando archivo:', error);
      window.showNotification(`Error procesando ${file.name}`, 'error');
    }
  }
  
  // Actualizar UI
  updateUploadLabel(type);
  updateGenerateButton();
  
  // Guardar estado si está en modo closet
  if (window.closetMode() && typeof window.saveUserClosetData === 'function') {
    window.saveUserClosetData();
  }
  
  // Mostrar mensaje de éxito
  const successMessage = window.generateSuccessMessage(type, files.length);
  window.showNotification(successMessage, 'success');
  
  // Limpiar input
  input.value = '';
}

// Obtener data URL de imagen de forma segura
function getImageDataUrl(file) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      reject(new Error('Archivo inválido'));
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = () => reject(new Error('Error leyendo archivo'));
    reader.readAsDataURL(file);
  });
}

// Crear preview de imagen con controles mejorados
function createPreview(file, type) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const container = document.createElement('div');
      container.style.cssText = `
        position: relative;
        display: inline-block;
        margin: 0.25rem;
        border-radius: 10px;
        overflow: hidden;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        transition: transform 0.2s ease;
      `;
      
      // Efecto hover
      container.addEventListener('mouseenter', () => {
        container.style.transform = 'scale(1.05)';
      });
      container.addEventListener('mouseleave', () => {
        container.style.transform = 'scale(1)';
      });
      
      const img = document.createElement('img');
      img.src = e.target.result;
      img.className = 'preview-image';
      img.alt = `${window.getTypeName(type)} - ${file.name}`;
      img.style.cssText = `
        width: 120px;
        height: 120px;
        object-fit: cover;
        display: block;
      `;
      
      const removeBtn = document.createElement('button');
      removeBtn.className = 'remove-image';
      removeBtn.innerHTML = '×';
      removeBtn.title = 'Eliminar imagen';
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
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        transition: all 0.2s ease;
      `;
      
      removeBtn.addEventListener('mouseenter', () => {
        removeBtn.style.background = '#dc2626';
        removeBtn.style.transform = 'scale(1.1)';
      });
      removeBtn.addEventListener('mouseleave', () => {
        removeBtn.style.background = '#ef4444';
        removeBtn.style.transform = 'scale(1)';
      });
      
      removeBtn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (confirm('¿Eliminar esta imagen?')) {
          removeImage(container, type);
        }
      };
      
      container.appendChild(img);
      container.appendChild(removeBtn);
      resolve(container);
    };
    
    reader.onerror = () => reject(new Error('Error creando preview'));
    reader.readAsDataURL(file);
  });
}

// Eliminar imagen con limpieza completa
function removeImage(container, type) {
  const previewContainer = container.parentNode;
  const index = Array.from(previewContainer.children).indexOf(container);
  
  if (index !== -1) {
    // Limpiar arrays globales
    uploadedFiles[type].splice(index, 1);
    uploadedImages[type].splice(index, 1);
    
    // Limpiar closet si está en modo closet
    if (window.closetMode() && closetItems[type]) {
      closetItems[type].splice(index, 1);
    }
    
    // Actualizar UI
    updateUploadLabel(type);
    updateGenerateButton();
    
    // Limpiar resultados previos
    clearPreviousResults();
    
    // Guardar estado
    if (window.closetMode() && typeof window.saveUserClosetData === 'function') {
      window.saveUserClosetData();
    }
    
    window.showNotification(`Imagen eliminada de ${window.getTypeName(type)}`, 'info');
  }
  
  container.remove();
}

// Actualizar etiqueta de subida con información contextual
function updateUploadLabel(type) {
  const label = document.querySelector(`label[for="${type}-upload"]`);
  if (!label) return;
  
  const count = uploadedFiles[type].length;
  const typeName = window.getTypeName(type);
  
  let labelText = '';
  let maxInfo = '';
  
  if (window.closetMode()) {
    const totalItems = window.getTotalClosetItems();
    const remaining = Math.max(0, CONFIG.TOTAL_CLOSET_LIMIT - totalItems);
    
    if (count === 0) {
      labelText = `📤 Subir ${typeName}`;
      maxInfo = remaining > 0 ? ` (${remaining} espacios restantes)` : ' (Closet lleno)';
    } else {
      labelText = `✅ ${count} ${typeName} subidas`;
      maxInfo = remaining > 0 ? ` - ${remaining} espacios restantes` : ' - Closet lleno';
    }
  } else {
    const max = CONFIG.FILE_LIMITS[type];
    const remaining = Math.max(0, max - count);
    
    if (count === 0) {
      labelText = `📤 Subir ${typeName}`;
      maxInfo = ` (máx ${max})`;
    } else if (remaining > 0) {
      labelText = `✅ ${count}/${max} - Agregar más`;
      maxInfo = ` (${remaining} restantes)`;
    } else {
      labelText = `🎯 ${count}/${max} - ¡Completo!`;
      maxInfo = '';
    }
  }
  
  label.innerHTML = labelText + maxInfo;
}

// Actualizar botón de generar con lógica unificada
function updateGenerateButton() {
  const btn = document.getElementById('generateBtn');
  if (!btn) return;
  
  const hasMinimum = uploadedFiles.tops.length >= CONFIG.MIN_REQUIRED.tops &&
                    uploadedFiles.bottoms.length >= CONFIG.MIN_REQUIRED.bottoms &&
                    uploadedFiles.shoes.length >= CONFIG.MIN_REQUIRED.shoes;
  
  const hasOccasion = window.selectedOccasion() !== null;
  
  if (hasMinimum && hasOccasion) {
    const total = Math.min(
      uploadedFiles.tops.length * uploadedFiles.bottoms.length * uploadedFiles.shoes.length,
      10 // Limitar combinaciones mostradas
    );
    
    btn.innerHTML = `<i class="fas fa-magic"></i> Generar ${total} Recomendaciones con IA`;
    btn.disabled = false;
    btn.style.opacity = '1';
    btn.style.cursor = 'pointer';
    btn.style.transform = 'none';
    
    // Efecto hover mejorado
    btn.onmouseenter = () => {
      btn.style.transform = 'translateY(-2px)';
      btn.style.boxShadow = '0 8px 20px rgba(16, 185, 129, 0.4)';
    };
    btn.onmouseleave = () => {
      btn.style.transform = 'translateY(0)';
      btn.style.boxShadow = '0 10px 30px rgba(16, 185, 129, 0.3)';
    };
    
  } else if (!hasOccasion) {
    btn.innerHTML = '<i class="fas fa-calendar"></i> Selecciona una ocasión primero';
    btn.disabled = true;
    btn.style.opacity = '0.6';
    btn.style.cursor = 'not-allowed';
    btn.onmouseenter = btn.onmouseleave = null;
    
  } else {
    const needed = [];
    if (uploadedFiles.tops.length === 0) needed.push('superiores');
    if (uploadedFiles.bottoms.length === 0) needed.push('inferiores');
    if (uploadedFiles.shoes.length === 0) needed.push('zapatos');
    
    btn.innerHTML = `<i class="fas fa-upload"></i> Falta subir: ${needed.join(', ')}`;
    btn.disabled = true;
    btn.style.opacity = '0.6';
    btn.style.cursor = 'not-allowed';
    btn.onmouseenter = btn.onmouseleave = null;
  }
}

// Limpiar resultados previos de forma segura
function clearPreviousResults() {
  const resultContainer = document.getElementById('result');
  if (resultContainer) {
    resultContainer.style.display = 'none';
    resultContainer.innerHTML = '';
  }
  
  // Limpiar variable global
  window.currentResults = null;
  
  console.log('🧹 Resultados previos limpiados');
}

// Resetear todo el estado de upload
function resetUploadState() {
  console.log('🔄 Reseteando estado de upload...');
  
  // Limpiar arrays
  uploadedFiles = { tops: [], bottoms: [], shoes: [] };
  uploadedImages = { tops: [], bottoms: [], shoes: [] };
  
  // Limpiar previews visuales
  ['tops', 'bottoms', 'shoes'].forEach(type => {
    const preview = document.getElementById(`${type}-preview`);
    if (preview) {
      preview.innerHTML = '';
    }
    
    // Resetear labels
    updateUploadLabel(type);
  });
  
  // Limpiar resultados
  clearPreviousResults();
  
  // Actualizar botón
  updateGenerateButton();
  
  console.log('✅ Estado de upload reseteado');
}

// Configurar event listeners de upload
function setupUploadEventListeners() {
  const uploadInputs = [
    { id: 'tops-upload', type: 'tops' },
    { id: 'bottoms-upload', type: 'bottoms' },
    { id: 'shoes-upload', type: 'shoes' }
  ];
  
  uploadInputs.forEach(({ id, type }) => {
    const input = document.getElementById(id);
    if (input) {
      // Remover listeners anteriores
      input.removeEventListener('change', input._uploadHandler);
      
      // Crear nuevo handler
      const handler = (e) => handleFileUpload(type, e.target);
      input._uploadHandler = handler;
      
      // Agregar listener
      input.addEventListener('change', handler);
      
      console.log(`📂 Upload listener configurado para ${type}`);
    } else {
      console.warn(`⚠️ Input ${id} no encontrado`);
    }
  });
}

// Inicializar sistema de upload
function initializeUploadSystem() {
  console.log('🚀 Inicializando sistema de upload...');
  
  // Configurar event listeners
  setupUploadEventListeners();
  
  // Inicializar labels
  ['tops', 'bottoms', 'shoes'].forEach(type => {
    updateUploadLabel(type);
  });
  
  // Inicializar botón de generar
  updateGenerateButton();
  
  console.log('✅ Sistema de upload inicializado');
}

// Exponer funciones globalmente
window.handleFileUpload = handleFileUpload;
window.updateGenerateButton = updateGenerateButton;
window.clearPreviousResults = clearPreviousResults;
window.resetUploadState = resetUploadState;
window.initializeUploadSystem = initializeUploadSystem;

// Auto-inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeUploadSystem);
  } else {
    setTimeout(initializeUploadSystem, 100);
  }
});

console.log('✅ upload.js - Sistema de Subida Unificado cargado');
