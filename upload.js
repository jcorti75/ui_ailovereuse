// upload.js - Funciones de Subida de Archivos

// Manejar subida de archivos
async function handleFileUpload(type, input) {
  if (!isLoggedIn) {
    showNotification('Debes iniciar sesión primero', 'error');
    input.value = '';
    return;
  }
  
  const files = Array.from(input.files);
  const currentCount = uploadedFiles[type].length;
  const maxCount = CONFIG.FILE_LIMITS[type];
  
  if (currentCount + files.length > maxCount) {
    showNotification(`Máximo ${maxCount} archivos para ${type}`, 'error');
    input.value = '';
    return;
  }
  
  // Validar tipos de archivo
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const invalidFiles = files.filter(file => !validTypes.includes(file.type));
  
  if (invalidFiles.length > 0) {
    showNotification('Solo se permiten archivos JPG, PNG o WebP', 'error');
    input.value = '';
    return;
  }
  
  // Limpiar resultados cuando se suben nuevas imágenes
  if (window.currentResults) {
    clearPreviousResults();
  }
  
  for (const file of files) {
    const preview = await createPreview(file, type);
    document.getElementById(`${type}-preview`).appendChild(preview);
    
    uploadedFiles[type].push(file);
    
    const imageUrl = await getImageDataUrl(file);
    uploadedImages[type].push(imageUrl);
  }
  
  updateUploadLabel(type);
  updateGenerateButton();
  
  // Si está en modo closet, actualizar los items del closet
  if (closetMode) {
    loadClosetItems();
  }
  
  input.value = '';
}

// Obtener data URL de imagen
function getImageDataUrl(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.readAsDataURL(file);
  });
}

// Crear preview de imagen
function createPreview(file, type) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const container = document.createElement('div');
      container.style.position = 'relative';
      container.style.display = 'inline-block';
      
      const img = document.createElement('img');
      img.src = e.target.result;
      img.className = 'preview-image';
      img.alt = file.name;
      
      const removeBtn = document.createElement('button');
      removeBtn.className = 'remove-image';
      removeBtn.innerHTML = '×';
      removeBtn.onclick = (e) => {
        e.preventDefault();
        const index = Array.from(container.parentNode.children).indexOf(container);
        if (index !== -1) {
          uploadedFiles[type].splice(index, 1);
          uploadedImages[type].splice(index, 1);
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
        }
        container.remove();
      };
      
      container.appendChild(img);
      container.appendChild(removeBtn);
      resolve(container);
    };
    reader.readAsDataURL(file);
  });
}

// Actualizar etiqueta de subida
function updateUploadLabel(type) {
  const label = document.querySelector(`label[for="${type}-upload"]`);
  const count = uploadedFiles[type].length;
  const max = CONFIG.FILE_LIMITS[type];
  
  const labels = { tops: 'Superiores', bottoms: 'Inferiores', shoes: 'Zapatos' };
  const typeLabel = labels[type] || type;
  
  if (count === 0) {
    label.innerHTML = `📤 Subir ${typeLabel} (máx ${max})`;
  } else if (count < max) {
    label.innerHTML = `✅ ${count}/${max} - Agregar más`;
  } else {
    label.innerHTML = `🎯 ${count}/${max} - ¡Completo!`;
  }
}

// Actualizar botón de generar
function updateGenerateButton() {
  const btn = document.getElementById('generateBtn');
  if (!btn) return;
  
  const hasAll = uploadedFiles.tops.length > 0 && 
                 uploadedFiles.bottoms.length > 0 && 
                 uploadedFiles.shoes.length > 0;
  
  if (hasAll && selectedOccasion) {
    const total = uploadedFiles.tops.length * uploadedFiles.bottoms.length * uploadedFiles.shoes.length;
    btn.innerHTML = `<i class="fas fa-magic"></i> Generar ${total} Recomendaciones con IA`;
    btn.disabled = false;
    btn.style.opacity = '1';
    btn.style.cursor = 'pointer';
  } else {
    btn.innerHTML = '<i class="fas fa-upload"></i> Sube fotos de cada categoría para continuar';
    btn.disabled = true;
    btn.style.opacity = '0.6';
    btn.style.cursor = 'not-allowed';
  }
}