// api.js - Funciones de Comunicación con Backend CORREGIDAS

console.log('📡 Inicializando sistema de comunicación con backend...');

// Variables locales para evitar errores
let processingStartTime = 0;
let userStats = window.userStats || { visits: 1, recommendations: 0, savedOutfits: 0 };

// PROBLEMA CORREGIDO 1: Función principal que faltaba
async function getRecommendation() {
  console.log('🎯 Iniciando generación de recomendaciones...');
  
  // Usar referencias seguras a variables globales
  const files = {
    tops: window.uploadedFiles?.tops || [],
    bottoms: window.uploadedFiles?.bottoms || [],
    shoes: window.uploadedFiles?.shoes || []
  };
  
  console.log('📁 Archivos disponibles:', files);
  await generateRecommendationsWithFiles(files);
}

// PROBLEMA CORREGIDO 2: Referencias a variables globales usando window
async function generateRecommendationsWithFiles(files) {
  // CORREGIDO: Usar window. para variables globales
  const selectedOccasion = window.selectedOccasion;
  const isLoggedIn = window.checkIsLoggedIn ? window.checkIsLoggedIn() : false;
  const currentUser = window.getCurrentUser ? window.getCurrentUser() : null;
  
  if (!selectedOccasion) {
    showNotification('Selecciona una ocasión primero', 'error');
    return;
  }
  
  if (!isLoggedIn || !currentUser) {
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
    
    // PROBLEMA CORREGIDO 3: Verificar que CONFIG existe
    const apiBase = window.CONFIG?.API_BASE || 'https://noshopia-production.up.railway.app';
    
    const response = await fetch(`${apiBase}/api/recommend`, {
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
      // PROBLEMA CORREGIDO 4: Verificar que las funciones existen antes de llamarlas
      
      // Actualizar estadísticas de manera segura
      userStats.recommendations++;
      window.userStats = userStats;
      
      if (typeof updateStatsDisplay === 'function') {
        updateStatsDisplay();
      } else if (typeof window.updateStatsDisplay === 'function') {
        window.updateStatsDisplay();
      }
      
      // Renderizar recomendaciones de manera segura
      if (typeof renderRecommendations === 'function') {
        renderRecommendations(data);
      } else if (typeof window.renderRecommendations === 'function') {
        window.renderRecommendations(data);
      } else {
        console.warn('⚠️ renderRecommendations no encontrada, mostrando resultados básicos');
        displayBasicResults(data);
      }
      
      // PROCESAMIENTO DE DETECCIONES DE IA (OPCIONAL)
      if (data.results && Array.isArray(data.results)) {
        try {
          const detectionResults = data.results.map(result => ({
            top: result.top,
            bottom: result.bottom, 
            shoe: result.shoe
          }));
          
          if (typeof processAIDetectionAndCreateCategories === 'function') {
            processAIDetectionAndCreateCategories(allFiles, detectionResults);
            console.log('✅ Categorías dinámicas procesadas exitosamente');
          }
        } catch (categoryError) {
          console.error('❌ Error procesando categorías dinámicas:', categoryError);
        }
      }
      
      showNotification(`✅ Procesado en ${finalTime.toFixed(1)}s`, 'success');
      
    } else {
      throw new Error(data.message || 'Error generando recomendaciones');
    }
    
  } catch (error) {
    clearInterval(timerInterval);
    console.error('❌ Error completo:', error);
    
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
    // PROBLEMA CORREGIDO 5: Restaurar botón de manera segura
    setTimeout(() => {
      if (timer) timer.style.display = 'none';
    }, 2000);
    
    if (btn) {
      btn.innerHTML = '<i class="fas fa-magic"></i> Generar Nuevas Recomendaciones';
      btn.disabled = false;
    }
  }
}

// PROBLEMA CORREGIDO 6: Función fallback para mostrar resultados básicos
function displayBasicResults(data) {
  console.log('📋 Mostrando resultados básicos');
  
  const resultDiv = document.getElementById('result');
  if (!resultDiv) {
    console.warn('⚠️ No se encontró div de resultados');
    return;
  }
  
  if (!data.results || data.results.length === 0) {
    resultDiv.innerHTML = '<p style="text-align: center; color: #666;">No se encontraron recomendaciones.</p>';
    resultDiv.style.display = 'block';
    return;
  }
  
  let html = `
    <div style="text-align: center; margin-bottom: 2rem;">
      <h2 style="color: #000;">🎨 Recomendaciones Generadas</h2>
      <p style="color: #666;">Se encontraron ${data.results.length} combinaciones</p>
    </div>
    <div style="display: grid; gap: 2rem;">
  `;
  
  data.results.forEach((item, idx) => {
    const score = Math.round((item.final_score || 0) * 100);
    
    html += `
      <div style="background: white; border: 1px solid #e5e7eb; border-radius: 15px; padding: 2rem; text-align: center;">
        <h3 style="color: #000; margin-bottom: 1rem;">Combinación ${idx + 1}</h3>
        <div style="background: #f3f4f6; padding: 1rem; border-radius: 10px; margin-bottom: 1rem;">
          <p><strong>Superior:</strong> ${item.top?.detected_item || 'Detectado'}</p>
          <p><strong>Inferior:</strong> ${item.bottom?.detected_item || 'Detectado'}</p>
          <p><strong>Calzado:</strong> ${item.shoe?.detected_item || 'Detectado'}</p>
        </div>
        <div style="background: #3b82f6; color: white; padding: 0.5rem 1rem; border-radius: 15px; display: inline-block;">
          Compatibilidad: ${score}%
        </div>
      </div>
    `;
  });
  
  html += '</div>';
  
  resultDiv.innerHTML = html;
  resultDiv.style.display = 'block';
  
  // Scroll a resultados
  setTimeout(() => {
    resultDiv.scrollIntoView({ behavior: 'smooth' });
  }, 100);
}

// PROBLEMA CORREGIDO 7: Función showNotification con fallback
function showNotification(message, type = 'info') {
  try {
    if (typeof window.showNotification === 'function') {
      return window.showNotification(message, type);
    }
    
    console.log(`[${type.toUpperCase()}] ${message}`);
    
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed; top: 20px; right: 20px; z-index: 10000;
      background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
      color: white; padding: 1rem 2rem; border-radius: 15px;
      font-weight: 600; max-width: 350px;
      animation: slideInRight 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
    
  } catch (e) {
    console.log(`NOTIFICATION: ${message}`);
  }
}

// EXPONER FUNCIONES GLOBALMENTE
window.getRecommendation = getRecommendation;
window.generateRecommendationsWithFiles = generateRecommendationsWithFiles;

console.log('✅ api.js - Sistema de comunicación con backend inicializado correctamente');
