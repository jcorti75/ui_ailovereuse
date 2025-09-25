// recommendations.js - Sistema de Renderizado Alineado con Variables Unificadas

// MAPEO DE OCASIONES UNIFICADO (desde config)
const OCCASION_DISPLAY_NAMES = {
  'oficina': 'Oficina/Trabajo',
  'deportivo': 'Deportes/Gym', 
  'casual': 'Casual',
  'formal': 'Formal',
  'matrimonio': 'Matrimonio'
};

// OBTENER IMAGEN PARA COMBINACIÓN (usando variables globales unificadas)
function getImageForCombination(type, item) {
  // Usar uploadedImages desde variables globales
  const images = uploadedImages[type];
  if (!images || images.length === 0) return null;
  
  // Obtener índice del backend
  let backendIndex;
  if (type === 'tops') {
    backendIndex = item.top?.index ?? 0;
  } else if (type === 'bottoms') {
    backendIndex = item.bottom?.index ?? 0;
  } else if (type === 'shoes') {
    backendIndex = item.shoe?.index ?? 0;
  } else {
    return null;
  }
  
  // Verificar rango de índice
  if (backendIndex >= 0 && backendIndex < images.length) {
    console.log(`🖼️ ${type}: usando índice ${backendIndex}`);
    return images[backendIndex];
  }
  
  console.warn(`⚠️ ${type}: índice ${backendIndex} fuera de rango [0-${images.length-1}]`);
  return images[0]; // Fallback seguro
}

// RENDERIZAR RECOMENDACIONES (lógica principal optimizada)
function renderRecommendations(data) {
  const result = document.getElementById('result');
  if (!result) {
    console.error('❌ Contenedor #result no encontrado');
    return;
  }
  
  const results = data.results || [];
  
  if (results.length === 0) {
    showEmptyResults(result);
    return;
  }
  
  // Encontrar mejor recomendación
  const { bestIndex, highestScore } = findBestRecommendation(results);
  
  // Obtener ocasión actual usando función unificada
  const currentOccasion = window.selectedOccasion();
  const occasionText = OCCASION_DISPLAY_NAMES[currentOccasion] || currentOccasion;
  
  // Construir HTML de recomendaciones
  const html = buildRecommendationsHTML({
    results,
    bestIndex,
    occasionText,
    currentOccasion,
    data
  });
  
  // Mostrar resultados
  result.innerHTML = html;
  result.style.display = 'block';
  
  // Guardar resultados globalmente para referencia
  window.currentResults = results;
  
  // Scroll suave a resultados
  setTimeout(() => {
    result.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 100);
  
  console.log(`✅ ${results.length} recomendaciones renderizadas`);
}

// MOSTRAR RESULTADOS VACÍOS
function showEmptyResults(container) {
  container.innerHTML = `
    <div style="text-align: center; padding: 3rem; color: #666;">
      <i class="fas fa-search" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
      <h3>No se encontraron recomendaciones</h3>
      <p>Intenta con diferentes prendas o ajusta tus criterios</p>
    </div>
  `;
  container.style.display = 'block';
}

// ENCONTRAR MEJOR RECOMENDACIÓN
function findBestRecommendation(results) {
  let bestIndex = 0;
  let highestScore = 0;
  
  results.forEach((item, index) => {
    const score = item.final_score || 0;
    if (score > highestScore) {
      highestScore = score;
      bestIndex = index;
    }
  });
  
  return { bestIndex, highestScore };
}

// CONSTRUIR HTML DE RECOMENDACIONES
function buildRecommendationsHTML({ results, bestIndex, occasionText, currentOccasion, data }) {
  let html = buildRecommendationsHeader(occasionText, results.length, data);
  
  html += '<div style="display: grid; gap: 2rem;">';
  
  results.forEach((item, idx) => {
    const isBest = idx === bestIndex;
    html += buildRecommendationCard(item, idx, isBest, occasionText);
  });
  
  html += '</div>';
  
  return html;
}

// CONSTRUIR HEADER DE RECOMENDACIONES
function buildRecommendationsHeader(occasionText, resultCount, data) {
  return `
    <div style="text-align: center; margin-bottom: 2rem;">
      <h2 style="color: #000000;">🪄 Recomendaciones para ${occasionText}</h2>
      <div style="background: linear-gradient(135deg, var(--primary), #1d4ed8); color: white; border-radius: 15px; padding: 1rem; margin: 1rem 0; display: inline-block;">
        <strong>📍 Ocasión: ${occasionText}</strong>
      </div>
      <p style="color: #000000; opacity: 0.8;">
        ${data.message || `${resultCount} combinaciones optimizadas para esta ocasión`}
      </p>
      ${data.processing_stats?.total_time ? `
        <div style="background: rgba(59, 130, 246, 0.1); border-radius: 10px; padding: 1rem; margin: 1rem 0;">
          <strong>Procesamiento:</strong> ${data.processing_stats.total_time}
        </div>
      ` : ''}
    </div>
  `;
}

// CONSTRUIR TARJETA DE RECOMENDACIÓN INDIVIDUAL
function buildRecommendationCard(item, index, isBest, occasionText) {
  const scorePercent = Math.round((item.final_score || 0) * 100);
  
  const topImage = getImageForCombination('tops', item);
  const bottomImage = getImageForCombination('bottoms', item);
  const shoeImage = getImageForCombination('shoes', item);
  
  const bestBadge = isBest ? `
    <div style="position: absolute; top: -15px; left: 50%; transform: translateX(-50%); background: var(--gold); color: #000000; padding: 0.5rem 1.5rem; border-radius: 20px; font-weight: 800; font-size: 0.9rem;">
      ⭐ MEJOR PARA ${occasionText.toUpperCase()}
    </div>
  ` : '';
  
  const cardStyle = isBest ? 
    'background: var(--background); border: 2px solid var(--gold); border-radius: 20px; padding: 2rem; position: relative; box-shadow: 0 0 30px rgba(251, 191, 36, 0.3);' :
    'background: var(--background); border: 2px solid var(--border); border-radius: 20px; padding: 2rem; position: relative;';
  
  return `
    <div style="${cardStyle}">
      ${bestBadge}
      
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; ${isBest ? 'margin-top: 1rem;' : ''}">
        <h3 style="color: #000000; margin: 0;">${isBest ? '👑' : ''} Combinación ${index + 1}</h3>
        <div style="display: flex; gap: 0.5rem; align-items: center;">
          <span style="background: rgba(59, 130, 246, 0.1); color: var(--primary); padding: 0.3rem 0.8rem; border-radius: 10px; font-size: 0.8rem; font-weight: 600;">
            ${occasionText}
          </span>
          <span style="background: ${isBest ? 'var(--gold)' : 'var(--primary)'}; color: ${isBest ? '#000000' : 'white'}; padding: 0.5rem 1rem; border-radius: 15px; font-weight: 700;">
            ${scorePercent}%
          </span>
        </div>
      </div>
      
      ${buildClothingGrid(topImage, bottomImage, shoeImage, item)}
      
      ${buildHarmonySection(item)}
      
      ${buildActionButtons(index)}
    </div>
  `;
}

// CONSTRUIR GRID DE PRENDAS
function buildClothingGrid(topImage, bottomImage, shoeImage, item) {
  return `
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 1rem;">
      ${buildClothingItem('👕 SUPERIOR', topImage, item.top?.detected_item || 'Superior')}
      ${buildClothingItem('👖 INFERIOR', bottomImage, item.bottom?.detected_item || 'Inferior')}  
      ${buildClothingItem('👢 CALZADO', shoeImage, item.shoe?.detected_item || 'Calzado')}
    </div>
  `;
}

// CONSTRUIR ITEM DE ROPA INDIVIDUAL
function buildClothingItem(title, imageUrl, itemName) {
  const imageContent = imageUrl ? 
    `<img src="${imageUrl}" style="max-width: 200px; max-height: 200px; object-fit: contain; border-radius: 15px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);" alt="${title}">` :
    `<div style="color: #666; font-size: 2rem;">${title.split(' ')[0]}</div>`;
  
  return `
    <div style="text-align: center;">
      <div style="font-size: 0.8rem; color: #000000; font-weight: 600; margin-bottom: 0.5rem;">${title}</div>
      <div style="background: transparent; border-radius: 20px; padding: 1.5rem; min-height: 240px; display: flex; align-items: center; justify-content: center; margin-bottom: 0.5rem; border: 1px dashed rgba(59, 130, 246, 0.3);">
        ${imageContent}
      </div>
      <div style="font-size: 0.9rem; color: #000000; opacity: 0.8;">${itemName}</div>
    </div>
  `;
}

// CONSTRUIR SECCIÓN DE ARMONÍA
function buildHarmonySection(item) {
  return `
    <div style="background: rgba(59, 130, 246, 0.1); border-radius: 10px; padding: 1rem; text-align: center;">
      <div style="color: #000000; font-weight: 600; margin-bottom: 0.5rem;">
        ${item.harmony_type || item.scores?.harmony?.type_display || 'Equilibrada'}
      </div>
      <div style="color: #000000; opacity: 0.8; font-size: 0.9rem;">
        ${item.harmony_description || item.scores?.harmony?.description || 'Combinación balanceada'}
      </div>
    </div>
  `;
}

// CONSTRUIR BOTONES DE ACCIÓN
function buildActionButtons(index) {
  // Solo mostrar botón de guardar si está en modo closet
  const isClosetMode = window.closetMode && window.closetMode();
  
  if (isClosetMode) {
    return `
      <button onclick="saveRecommendationToCloset(${index})" 
              style="width: 100%; margin-top: 1rem; padding: 0.8rem; background: var(--success); color: white; border: none; border-radius: 10px; font-weight: 600; cursor: pointer; transition: all 0.3s ease;"
              onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(16, 185, 129, 0.3)';"
              onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none';">
        💾 Guardar en Mi Closet
      </button>
    `;
  }
  
  return ''; // Sin botones para modo directo
}

// GUARDAR RECOMENDACIÓN EN CLOSET (función auxiliar)
function saveRecommendationToCloset(index) {
  // Usar función de API si está disponible
  if (typeof window.saveRecommendationToCloset === 'function') {
    window.saveRecommendationToCloset(index);
    return;
  }
  
  // Implementación local como fallback
  if (!window.currentResults || !window.currentResults[index]) {
    window.showNotification('Error: Recomendación no encontrada', 'error');
    return;
  }
  
  const recommendation = window.currentResults[index];
  const currentOccasion = window.selectedOccasion();
  
  const saved = {
    id: Date.now(),
    ...recommendation,
    saved_date: new Date().toLocaleDateString('es-ES'),
    occasion: currentOccasion
  };
  
  // Agregar a recomendaciones guardadas
  if (typeof savedRecommendations !== 'undefined') {
    savedRecommendations.unshift(saved);
    
    // Limitar a 20 recomendaciones
    if (savedRecommendations.length > 20) {
      savedRecommendations = savedRecommendations.slice(0, 20);
    }
    
    // Actualizar lista si existe la función
    if (typeof updateSavedRecommendationsList === 'function') {
      updateSavedRecommendationsList();
    }
  }
  
  window.showNotification('Recomendación guardada en tu closet ⭐', 'success');
}

// ACTUALIZAR LISTA DE RECOMENDACIONES GUARDADAS
function updateSavedRecommendationsList() {
  const list = document.getElementById('savedRecommendationsList');
  if (!list) return;
  
  if (!savedRecommendations || savedRecommendations.length === 0) {
    list.innerHTML = `
      <p style="text-align: center; color: #000000; opacity: 0.7; padding: 2rem;">
        Aquí aparecerán tus combinaciones favoritas guardadas
      </p>
    `;
    return;
  }
  
  list.innerHTML = savedRecommendations.map((rec, index) => {
    const isBest = index === 0;
    const score = Math.round((rec.final_score || 0) * 100);
    const occasionText = OCCASION_DISPLAY_NAMES[rec.occasion] || rec.occasion;
    
    return buildSavedRecommendationItem(rec, isBest, score, occasionText);
  }).join('');
}

// CONSTRUIR ITEM DE RECOMENDACIÓN GUARDADA
function buildSavedRecommendationItem(rec, isBest, score, occasionText) {
  const cardStyle = isBest ? 
    'background: var(--background); border: 1px solid var(--gold); border-radius: 15px; padding: 1.5rem; margin-bottom: 1rem; display: flex; align-items: center; gap: 1rem; transition: all 0.3s ease; position: relative; border-color: var(--gold); background: rgba(251, 191, 36, 0.05);' :
    'background: var(--background); border: 1px solid var(--border); border-radius: 15px; padding: 1.5rem; margin-bottom: 1rem; display: flex; align-items: center; gap: 1rem; transition: all 0.3s ease; position: relative;';
  
  const bestBadge = isBest ? 
    '<div style="position: absolute; top: -10px; right: -10px; background: var(--gold); color: #000000; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-size: 1rem;">⭐</div>' :
    '';
  
  return `
    <div style="${cardStyle}">
      ${bestBadge}
      <div style="flex: 1;">
        <h4 style="margin: 0; color: #000000;">Combinación para ${occasionText}</h4>
        <p style="margin: 0.5rem 0; color: #000000; opacity: 0.8; font-size: 0.9rem;">
          ${rec.top?.detected_item || 'Superior'} + ${rec.bottom?.detected_item || 'Inferior'} + ${rec.shoe?.detected_item || 'Calzado'}
        </p>
        <small style="color: #000000; opacity: 0.7;">Guardada el ${rec.saved_date}</small>
      </div>
      <div style="background: ${isBest ? 'var(--gold)' : 'var(--primary)'}; color: ${isBest ? '#000000' : 'white'}; padding: 0.5rem 1rem; border-radius: 20px; font-weight: 700;">
        ${score}%
      </div>
    </div>
  `;
}

// FUNCIONES DE UTILIDAD Y MANTENIMIENTO

// Limpiar recomendaciones actuales
function clearCurrentRecommendations() {
  const result = document.getElementById('result');
  if (result) {
    result.style.display = 'none';
    result.innerHTML = '';
  }
  
  window.currentResults = null;
  console.log('🧹 Recomendaciones actuales limpiadas');
}

// Obtener estadísticas de recomendaciones
function getRecommendationsStats() {
  const currentCount = window.currentResults ? window.currentResults.length : 0;
  const savedCount = savedRecommendations ? savedRecommendations.length : 0;
  
  return {
    current: currentCount,
    saved: savedCount,
    total: currentCount + savedCount
  };
}

// Verificar disponibilidad de imágenes
function validateRecommendationImages(results) {
  if (!results || results.length === 0) return { valid: true, warnings: [] };
  
  const warnings = [];
  
  results.forEach((item, index) => {
    ['tops', 'bottoms', 'shoes'].forEach(type => {
      const image = getImageForCombination(type, item);
      if (!image) {
        warnings.push(`Recomendación ${index + 1}: Imagen faltante para ${type}`);
      }
    });
  });
  
  return {
    valid: warnings.length === 0,
    warnings
  };
}

// EXPONER FUNCIONES GLOBALMENTE
window.renderRecommendations = renderRecommendations;
window.saveRecommendationToCloset = saveRecommendationToCloset;
window.updateSavedRecommendationsList = updateSavedRecommendationsList;
window.clearCurrentRecommendations = clearCurrentRecommendations;
window.getRecommendationsStats = getRecommendationsStats;

// AUTO-INICIALIZACIÓN
document.addEventListener('DOMContentLoaded', function() {
  console.log('🎨 Recommendations.js cargado');
  
  // Inicializar lista de guardados si existe el contenedor
  setTimeout(() => {
    if (document.getElementById('savedRecommendationsList')) {
      updateSavedRecommendationsList();
    }
  }, 1000);
});

console.log('✅ recommendations.js - Sistema de Renderizado Alineado cargado');
