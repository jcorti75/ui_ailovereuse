// recommendations.js - Funciones de Recomendaciones y Render

// Obtener imagen para combinación usando índices directos del backend
function getImageForCombination(type, item) {
  const images = uploadedImages[type];
  if (!images || images.length === 0) return null;
  
  // Usar directamente el índice que viene del backend
  let backendIndex;
  if (type === 'tops') {
    backendIndex = item.top?.index || 0;
  } else if (type === 'bottoms') {
    backendIndex = item.bottom?.index || 0;
  } else if (type === 'shoes') {
    backendIndex = item.shoe?.index || 0;
  } else {
    return null;
  }
  
  // Verificar que el índice esté dentro del rango
  if (backendIndex >= 0 && backendIndex < images.length) {
    console.log(`🖼️ ${type}: usando índice ${backendIndex} del backend`);
    return images[backendIndex];
  }
  
  console.warn(`⚠️ ${type}: índice ${backendIndex} fuera de rango [0-${images.length-1}]`);
  return images[0]; // Fallback a primera imagen
}

// Render recomendaciones con ocasión específica y stats simplificadas
function renderRecommendations(data) {
  const result = document.getElementById('result');
  const results = data.results || [];
  
  if (results.length === 0) {
    result.innerHTML = '<p style="text-align: center; color: #000000;">No se encontraron recomendaciones.</p>';
    result.style.display = 'block';
    return;
  }
  
  // Encontrar la mejor recomendación
  let bestIndex = 0;
  let highestScore = 0;
  results.forEach((item, index) => {
    const score = item.final_score || 0;
    if (score > highestScore) {
      highestScore = score;
      bestIndex = index;
    }
  });
  
  // Mapear ocasiones a texto legible
  const occasionText = {
    'oficina': 'Oficina/Trabajo',
    'deportivo': 'Deportes/Gym', 
    'casual': 'Casual',
    'formal': 'Formal',
    'matrimonio': 'Matrimonio'
  };
  
  let html = `
    <div style="text-align: center; margin-bottom: 2rem;">
      <h2 style="color: #000000;">🪄 Recomendaciones para ${occasionText[selectedOccasion] || selectedOccasion}</h2>
      <div style="background: linear-gradient(135deg, var(--primary), #1d4ed8); color: white; border-radius: 15px; padding: 1rem; margin: 1rem 0; display: inline-block;">
        <strong>📍 Ocasión Actual: ${occasionText[selectedOccasion] || selectedOccasion}</strong>
      </div>
      <p style="color: #000000; opacity: 0.8;">
        ${data.message || `${results.length} combinaciones optimizadas para esta ocasión`}
      </p>
      <div style="background: rgba(59, 130, 246, 0.1); border-radius: 10px; padding: 1rem; margin: 1rem 0;">
        <strong>Procesamiento:</strong> ${data.processing_stats?.total_time || 'N/A'}
      </div>
    </div>
    <div style="display: grid; gap: 2rem;">
  `;
  
  results.forEach((item, idx) => {
    const scorePercent = Math.round((item.final_score || 0) * 100);
    const isBest = idx === bestIndex;
    
    const topImage = getImageForCombination('tops', item);
    const bottomImage = getImageForCombination('bottoms', item);
    const shoeImage = getImageForCombination('shoes', item);
    
    html += `
      <div style="background: var(--background); border: 2px solid ${isBest ? 'var(--gold)' : 'var(--border)'}; border-radius: 20px; padding: 2rem; position: relative; ${isBest ? 'box-shadow: 0 0 30px rgba(251, 191, 36, 0.3);' : ''}">
        ${isBest ? '<div style="position: absolute; top: -15px; left: 50%; transform: translateX(-50%); background: var(--gold); color: #000000; padding: 0.5rem 1.5rem; border-radius: 20px; font-weight: 800; font-size: 0.9rem;">⭐ MEJOR PARA ' + (occasionText[selectedOccasion] || selectedOccasion).toUpperCase() + '</div>' : ''}
        
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; ${isBest ? 'margin-top: 1rem;' : ''}">
          <h3 style="color: #000000; margin: 0;">${isBest ? '👑' : ''} Combinación ${idx + 1}</h3>
          <div style="display: flex; gap: 0.5rem; align-items: center;">
            <span style="background: rgba(59, 130, 246, 0.1); color: var(--primary); padding: 0.3rem 0.8rem; border-radius: 10px; font-size: 0.8rem; font-weight: 600;">${occasionText[selectedOccasion] || selectedOccasion}</span>
            <span style="background: ${isBest ? 'var(--gold)' : 'var(--primary)'}; color: ${isBest ? '#000000' : 'white'}; padding: 0.5rem 1rem; border-radius: 15px; font-weight: 700;">${scorePercent}%</span>
          </div>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 1rem;">
          <div style="text-align: center;">
            <div style="font-size: 0.8rem; color: #000000; font-weight: 600; margin-bottom: 0.5rem;">👕 SUPERIOR</div>
            <div style="background: transparent; border-radius: 20px; padding: 1.5rem; min-height: 240px; display: flex; align-items: center; justify-content: center; margin-bottom: 0.5rem; border: 1px dashed rgba(59, 130, 246, 0.3);">
              ${topImage ? `<img src="${topImage}" style="max-width: 200px; max-height: 200px; object-fit: contain; border-radius: 15px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);" alt="Superior">` : '<div style="color: #666; font-size: 2rem;">👕</div>'}
            </div>
            <div style="font-size: 0.9rem; color: #000000; opacity: 0.8;">${item.top?.detected_item || 'Superior'}</div>
          </div>
          <div style="text-align: center;">
            <div style="font-size: 0.8rem; color: #000000; font-weight: 600; margin-bottom: 0.5rem;">👖 INFERIOR</div>
            <div style="background: transparent; border-radius: 20px; padding: 1.5rem; min-height: 240px; display: flex; align-items: center; justify-content: center; margin-bottom: 0.5rem; border: 1px dashed rgba(59, 130, 246, 0.3);">
              ${bottomImage ? `<img src="${bottomImage}" style="max-width: 200px; max-height: 200px; object-fit: contain; border-radius: 15px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);" alt="Inferior">` : '<div style="color: #666; font-size: 2rem;">👖</div>'}
            </div>
            <div style="font-size: 0.9rem; color: #000000; opacity: 0.8;">${item.bottom?.detected_item || 'Inferior'}</div>
          </div>
          <div style="text-align: center;">
            <div style="font-size: 0.8rem; color: #000000; font-weight: 600; margin-bottom: 0.5rem;">👢 CALZADO</div>
            <div style="background: transparent; border-radius: 20px; padding: 1.5rem; min-height: 240px; display: flex; align-items: center; justify-content: center; margin-bottom: 0.5rem; border: 1px dashed rgba(59, 130, 246, 0.3);">
              ${shoeImage ? `<img src="${shoeImage}" style="max-width: 200px; max-height: 200px; object-fit: contain; border-radius: 15px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);" alt="Calzado">` : '<div style="color: #666; font-size: 2rem;">👢</div>'}
            </div>
            <div style="font-size: 0.9rem; color: #000000; opacity: 0.8;">${item.shoe?.detected_item || 'Calzado'}</div>
          </div>
        </div>
        
        <div style="background: rgba(59, 130, 246, 0.1); border-radius: 10px; padding: 1rem; text-align: center;">
          <div style="color: #000000; font-weight: 600; margin-bottom: 0.5rem;">
            ${item.harmony_type || item.scores?.harmony?.type_display || 'Equilibrada'}
          </div>
          <div style="color: #000000; opacity: 0.8; font-size: 0.9rem;">
            ${item.harmony_description || item.scores?.harmony?.description || 'Combinación balanceada'}
          </div>
        </div>
        
        ${closetMode ? `<button onclick="saveRecommendationToCloset(${idx})" style="width: 100%; margin-top: 1rem; padding: 0.8rem; background: var(--success); color: white; border: none; border-radius: 10px; font-weight: 600; cursor: pointer;">💾 Guardar en Mi Closet</button>` : ''}
      </div>
    `;
  });
  
  html += '</div>';
  result.innerHTML = html;
  result.style.display = 'block';
  
  // Guardar resultados globalmente para referencia
  window.currentResults = results;
  
  setTimeout(() => {
    result.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 100);
}