// api.js - Funciones de Comunicación con Backend CORREGIDAS

// CORREGIDA: Generar recomendaciones con archivos específicos
async function generateRecommendationsWithFiles(files) {
  if (!selectedOccasion) {
    showNotification('Selecciona una ocasión primero', 'error');
    return;
  }
  
  if (!isLoggedIn) {
    showNotification('Debes estar logueado', 'error');
    return;
  }

  // VALIDACIÓN CRÍTICA: Asegurar que tenemos archivos válidos
  if (!files.tops || !files.bottoms || !files.shoes || 
      files.tops.length === 0 || files.bottoms.length === 0 || files.shoes.length === 0) {
    showNotification('Error: Faltan archivos para procesar', 'error');
    console.error('❌ Archivos inválidos:', files);
    return;
  }

  // VALIDACIÓN: Verificar que son archivos reales
  const allFiles = [...files.tops, ...files.bottoms, ...files.shoes];
  const invalidFiles = allFiles.filter(file => !(file instanceof File));
  
  if (invalidFiles.length > 0) {
    showNotification('Error: Algunos elementos no son archivos válidos', 'error');
    console.error('❌ Archivos inválidos detectados:', invalidFiles);
    return;
  }
  
  const btn = document.getElementById('generateBtn') || document.querySelector('.generate-btn');
  const timer = document.getElementById('processingTimer');
  const timerDisplay = document.getElementById('timerDisplay');
  
  // Iniciar timer
  processingStartTime = Date.now();
  if (timer) timer.style.display = 'block';
  
  let timerInterval = setInterval(() => {
    const elapsed = (Date.now() - processingStartTime) / 1000;
    if (timerDisplay) timerDisplay.textContent = elapsed.toFixed(1) + 's';
  }, 100);
  
  if (btn) {
    btn.innerHTML = '<span class="loading"></span> Generando recomendaciones...';
    btn.disabled = true;
  }
  
  try {
    console.log('=== ENVIANDO RECOMENDACIÓN ===');
    console.log('Usuario:', currentUser.email);
    console.log('Ocasión:', selectedOccasion);
    console.log('Archivos a enviar:', {
      tops: files.tops.length,
      bottoms: files.bottoms.length,
      shoes: files.shoes.length
    });
    
    // CRÍTICO: Crear FormData correctamente
    const formData = new FormData();
    formData.append('user_email', currentUser.email);
    formData.append('occasion', selectedOccasion);
    
    // CORREGIDO: Agregar archivos con validación estricta
    files.tops.forEach((file, index) => {
      if (file instanceof File) {
        formData.append('tops', file, file.name || `top_${index}.jpg`);
        console.log(`✅ Top ${index}: ${file.name} (${file.size} bytes)`);
      } else {
        console.error(`❌ Top ${index} no es un archivo válido:`, file);
        throw new Error(`Top ${index} no es un archivo válido`);
      }
    });
    
    files.bottoms.forEach((file, index) => {
      if (file instanceof File) {
        formData.append('bottoms', file, file.name || `bottom_${index}.jpg`);
        console.log(`✅ Bottom ${index}: ${file.name} (${file.size} bytes)`);
      } else {
        console.error(`❌ Bottom ${index} no es un archivo válido:`, file);
        throw new Error(`Bottom ${index} no es un archivo válido`);
      }
    });
    
    files.shoes.forEach((file, index) => {
      if (file instanceof File) {
        formData.append('shoes', file, file.name || `shoe_${index}.jpg`);
        console.log(`✅ Shoe ${index}: ${file.name} (${file.size} bytes)`);
      } else {
        console.error(`❌ Shoe ${index} no es un archivo válido:`, file);
        throw new Error(`Shoe ${index} no es un archivo válido`);
      }
    });
    
    // DEPURACIÓN: Mostrar contenido del FormData
    console.log('=== CONTENIDO FORMDATA ===');
    for (let pair of formData.entries()) {
      console.log(`${pair[0]}:`, pair[1] instanceof File ? `File(${pair[1].name}, ${pair[1].size}b)` : pair[1]);
    }
    
    const response = await fetch(`${CONFIG.API_BASE}/api/recommend`, {
      method: 'POST',
      body: formData
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    clearInterval(timerInterval);
    const finalTime = (Date.now() - processingStartTime) / 1000;
    if (timerDisplay) timerDisplay.textContent = finalTime.toFixed(1) + 's';
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error response body:', errorText);
      
      // Intentar parsear el error como JSON
      let errorDetails = errorText;
      try {
        const errorJson = JSON.parse(errorText);
        errorDetails = JSON.stringify(errorJson, null, 2);
        console.error('❌ Error JSON parsed:', errorJson);
      } catch (e) {
        console.error('❌ Error no es JSON válido');
      }
      
      throw new Error(`Error ${response.status}: ${errorDetails}`);
    }
    
    const data = await response.json();
    console.log('✅ Response data:', data);
    
    if (data.success) {
      userStats.recommendations++;
      updateStatsDisplay();
      renderRecommendations(data);
      showNotification(`✅ Procesado en ${finalTime.toFixed(1)}s`, 'success');
    } else {
      throw new Error(data.message || 'Error generando recomendaciones');
    }
    
  } catch (error) {
    clearInterval(timerInterval);
    console.error('❌ Error completo:', error);
    console.error('❌ Stack trace:', error.stack);
    
    // Mostrar error más informativo
    let errorMessage = 'Error desconocido';
    if (error.message) {
      if (error.message.includes('422')) {
        errorMessage = 'Error de validación en archivos. Verifica que las imágenes sean válidas.';
      } else if (error.message.includes('413')) {
        errorMessage = 'Archivos muy grandes. Reduce el tamaño de las imágenes.';
      } else if (error.message.includes('500')) {
        errorMessage = 'Error interno del servidor. Intenta de nuevo.';
      } else {
        errorMessage = error.message;
      }
    }
    
    showNotification(`Error: ${errorMessage}`, 'error');
    
  } finally {
    setTimeout(() => {
      if (timer) timer.style.display = 'none';
    }, 2000);
    
    if (btn) {
      btn.innerHTML = '<i class="fas fa-magic"></i> Generar Nuevas Recomendaciones';
      btn.disabled = false;
    }
  }
}

// Función principal de generación de recomendaciones
async function getRecommendation() {
  const files = {
    tops: uploadedFiles.tops || [],
    bottoms: uploadedFiles.bottoms || [],
    shoes: uploadedFiles.shoes || []
  };
  
  console.log('🎯 Iniciando generación con archivos:', files);
  await generateRecommendationsWithFiles(files);
}
