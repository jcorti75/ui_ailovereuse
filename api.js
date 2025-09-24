// api.js - Funciones de Comunicación con Backend INTEGRADAS con Sistema Dinámico

// CORREGIDA: Generar recomendaciones con archivos específicos + Integración carpetas dinámicas
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
    console.log('=== ENVIANDO RECOMENDACIÓN CON SISTEMA DINÁMICO ===');
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
      // 🚀 NUEVO: PROCESAR DETECCIÓN DE IA Y CREAR CATEGORÍAS DINÁMICAS
      console.log('🤖 Procesando detecciones de IA para crear categorías...');
      
      // Si la respuesta contiene información de detección de IA
      if (data.results && Array.isArray(data.results)) {
        try {
          // Crear array de detecciones desde los resultados
          const detectionResults = data.results.map(result => ({
            top: result.top,
            bottom: result.bottom, 
            shoe: result.shoe
          }));
          
          // Procesar detecciones y crear categorías dinámicas
          if (typeof processAIDetectionAndCreateCategories === 'function') {
            processAIDetectionAndCreateCategories(allFiles, detectionResults);
            console.log('✅ Categorías dinámicas procesadas exitosamente');
          } else {
            console.warn('⚠️ Función processAIDetectionAndCreateCategories no encontrada');
          }
          
        } catch (categoryError) {
          console.error('❌ Error procesando categorías dinámicas:', categoryError);
          // No interrumpir el flujo principal por este error
        }
      }
      
      // Actualizar estadísticas y renderizar resultados
      userStats.recommendations++;
      updateStatsDisplay();
      renderRecommendations(data);
      showNotification(`✅ Procesado en ${finalTime.toFixed(1)}s
