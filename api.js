// api.js - Funciones de Comunicación con Backend

// Generar recomendaciones con archivos específicos
async function generateRecommendationsWithFiles(files) {
  if (!selectedOccasion) {
    showNotification('Selecciona una ocasión primero', 'error');
    return;
  }
  
  if (!isLoggedIn) {
    showNotification('Debes estar logueado', 'error');
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
    console.log('Archivos:', {
      tops: files.tops.length,
      bottoms: files.bottoms.length,
      shoes: files.shoes.length
    });
    
    const formData = new FormData();
    formData.append('user_email', currentUser.email);
    formData.append('occasion', selectedOccasion);
    
    files.tops.forEach((file, index) => {
      formData.append('tops', file);
      console.log(`Top ${index}: ${file.name} (${file.size} bytes)`);
    });
    
    files.bottoms.forEach((file, index) => {
      formData.append('bottoms', file);
      console.log(`Bottom ${index}: ${file.name} (${file.size} bytes)`);
    });
    
    files.shoes.forEach((file, index) => {
      formData.append('shoes', file);
      console.log(`Shoe ${index}: ${file.name} (${file.size} bytes)`);
    });
    
    const response = await fetch(`${CONFIG.API_BASE}/api/recommend`, {
      method: 'POST',
      body: formData
    });
    
    console.log('Response status:', response.status);
    
    clearInterval(timerInterval);
    const finalTime = (Date.now() - processingStartTime) / 1000;
    if (timerDisplay) timerDisplay.textContent = finalTime.toFixed(1) + 's';
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`Error ${response.status}: ${errorText}`);
    }
    
    const data = await response.json();
    console.log('Response data:', data);
    
    if (data.success) {
      userStats.recommendations++;
      updateStatsDisplay();
      renderRecommendations(data);
      showNotification(`✅ Procesado en ${finalTime.toFixed(1)}s`, 'success');
    } else {
      throw new Error(data.message || 'Error generando recomendaciones');
    }
  } catch (e) {
    clearInterval(timerInterval);
    console.error('Error completo:', e);
    showNotification(`Error: ${e.message}`, 'error');
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
    tops: uploadedFiles.tops,
    bottoms: uploadedFiles.bottoms,
    shoes: uploadedFiles.shoes
  };
  
  await generateRecommendationsWithFiles(files);
}