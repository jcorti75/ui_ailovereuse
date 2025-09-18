// closet.js - Sistema completo de closet con persistencia CORREGIDO

// Variables de estado del closet (closetMode y closetItems ahora están en config.js)
let savedRecommendations = [];

// Inicializar closet
function initializeCloset() {
  console.log('Inicializando sistema de closet...');
  
  // Cargar datos del usuario si está logueado
  if (isLoggedIn && currentUser?.email) {
    loadUserClosetData();
    loadSavedRecommendations();
  }
  
  setupClosetUI();
}

// Configurar interfaz del closet
function setupClosetUI() {
  // Botón para alternar modo closet
  const closetToggle = document.getElementById('closetToggle');
  if (closetToggle) {
    closetToggle.addEventListener('click', toggleClosetMode);
    updateClosetToggleButton();
  }
  
  // Contenedor del contador de closet
  createClosetCounter();
  
  // Sección de recomendaciones guardadas
  createSavedRecommendationsSection();
}

// Crear contador visual del closet
function createClosetCounter() {
  let counter = document.getElementById('closetCounter');
  if (!counter) {
    counter = document.createElement('div');
    counter.id = 'closetCounter';
    counter.className = 'closet-counter';
    counter.style.cssText = `
      display: none;
      text-align: center;
      padding: 10px;
      margin: 10px 0;
      border-radius: 8px;
      background: #f3f4f6;
      border: 1px solid #d1d5db;
      font-weight: 500;
    `;
    
    // Insertar después del toggle o en una ubicación apropiada
    const uploadSection = document.getElementById('upload-section') || document.body;
    uploadSection.insertBefore(counter, uploadSection.firstChild);
  }
  
  updateClosetCounterDisplay();
}

// Crear sección de recomendaciones guardadas
function createSavedRecommendationsSection() {
  let section = document.getElementById('savedRecommendations');
  if (!section) {
    section = document.createElement('div');
    section.id = 'savedRecommendations';
    section.className = 'saved-recommendations';
    section.innerHTML = `
      <h3>🎯 Mis Recomendaciones Guardadas</h3>
      <div id="savedRecommendationsList" class="recommendations-list"></div>
    `;
    section.style.cssText = `
      display: none;
      margin: 20px 0;
      padding: 20px;
      border-radius: 12px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
    `;
    
    // Insertar al final del contenido principal
    const mainContent = document.getElementById('main-content') || document.body;
    mainContent.appendChild(section);
  }
}

// Alternar modo closet
function toggleClosetMode() {
  if (!isLoggedIn) {
    showNotification('Debes estar logueado para usar el closet', 'error');
    return;
  }
  
  closetMode = !closetMode;
  console.log(`Modo closet ${closetMode ? 'ACTIVADO' : 'DESACTIVADO'}`);
  
  // Actualizar UI
  updateClosetToggleButton();
  updateClosetCounterDisplay();
  updateAllUploadLabels();
  updateGenerateButton();
  
  // Mostrar/ocultar secciones apropiadas
  toggleClosetSections();
  
  // Si se activa el closet, cargar items
  if (closetMode) {
    loadClosetItems();
    showSavedRecommendations();
  } else {
    hideSavedRecommendations();
  }
  
  const mode = closetMode ? 'closet' : 'recomendaciones directas';
  showNotification(`Modo ${mode} activado`, 'info');
}

// Actualizar botón de toggle
function updateClosetToggleButton() {
  const toggle = document.getElementById('closetToggle');
  if (!toggle) return;
  
  if (closetMode) {
    toggle.innerHTML = '📦 Salir del Closet';
    toggle.className = 'btn-closet active';
    toggle.style.background = 'var(--gold)';
    toggle.style.color = '#000';
  } else {
    toggle.innerHTML = '📦 Usar mi Closet';
    toggle.className = 'btn-closet';
    toggle.style.background = 'var(--primary)';
    toggle.style.color = '#fff';
  }
}

// Mostrar/ocultar secciones del closet
function toggleClosetSections() {
  const closetCounter = document.getElementById('closetCounter');
  const savedRecommendations = document.getElementById('savedRecommendations');
  
  if (closetCounter) {
    closetCounter.style.display = closetMode ? 'block' : 'none';
  }
  
  if (savedRecommendations) {
    savedRecommendations.style.display = closetMode ? 'block' : 'none';
  }
}

// Cargar datos del closet del usuario
function loadUserClosetData() {
  if (!currentUser?.email) return false;
  
  try {
    const userData = localStorage.getItem(`noshopia_closet_${currentUser.email}`);
    if (userData) {
      const data = JSON.parse(userData);
      closetItems = data.closetItems || { tops: [], bottoms: [], shoes: [] };
      console.log(`Closet cargado para ${currentUser.email}:`, getTotalClosetItems(), 'prendas');
      return true;
    }
  } catch (e) {
    console.error('Error cargando closet:', e);
  }
  
  // Inicializar closet vacío
  closetItems = { tops: [], bottoms: [], shoes: [] };
  return false;
}

// Guardar datos del closet
function saveUserClosetData() {
  if (!currentUser?.email) return;
  
  try {
    const userData = {
      email: currentUser.email,
      closetItems: closetItems,
      lastUpdated: new Date().toISOString(),
      totalItems: getTotalClosetItems()
    };
    
    localStorage.setItem(`noshopia_closet_${currentUser.email}`, JSON.stringify(userData));
    console.log(`Closet guardado para ${currentUser.email}:`, userData.totalItems, 'prendas');
  } catch (e) {
    console.error('Error guardando closet:', e);
    showNotification('Error guardando en closet', 'error');
  }
}

// Cargar items del closet en la UI
function loadClosetItems() {
  if (!closetMode) return;
  
  console.log('Cargando items del closet en UI...');
  
  ['tops', 'bottoms', 'shoes'].forEach(type => {
    const items = closetItems[type] || [];
    const preview = document.getElementById(`${type}-preview`);
    
    if (preview && items.length > 0) {
      // Limpiar preview actual
      preview.innerHTML = '';
      
      // Agregar cada item del closet
      items.forEach((imageUrl, index) => {
        const container = createClosetItemPreview(imageUrl, type, index);
        preview.appendChild(container);
      });
    }
  });
  
  updateClosetCounterDisplay();
}

// Crear preview para item del closet
function createClosetItemPreview(imageUrl, type, index) {
  const container = document.createElement('div');
  container.style.position = 'relative';
  container.style.display = 'inline-block';
  container.style.margin = '0.5rem';
  
  const img = document.createElement('img');
  img.src = imageUrl;
  img.className = 'preview-image closet-item';
  img.alt = `${type} ${index + 1}`;
  img.title = `${type} guardado en closet`;
  
  const removeBtn = document.createElement('button');
  removeBtn.className = 'remove-image closet-remove';
  removeBtn.innerHTML = '×';
  removeBtn.title = 'Eliminar del closet';
  removeBtn.onclick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    removeFromCloset(type, index, container);
  };
  
  // Indicador de que es del closet
  const closetBadge = document.createElement('span');
  closetBadge.className = 'closet-badge';
  closetBadge.innerHTML = '📦';
  closetBadge.title = 'En tu closet';
  closetBadge.style.cssText = `
    position: absolute;
    top: 5px;
    left: 5px;
    background: var(--gold);
    color: #000;
    padding: 2px 6px;
    border-radius: 10px;
    font-size: 10px;
    font-weight: bold;
  `;
  
  container.appendChild(img);
  container.appendChild(removeBtn);
  container.appendChild(closetBadge);
  
  return container;
}

// Eliminar item del closet
function removeFromCloset(type, index, container) {
  console.log(`Eliminando ${type}[${index}] del closet`);
  
  // Eliminar del array del closet
  closetItems[type].splice(index, 1);
  
  // También eliminar de arrays de sesión si existe
  if (uploadedFiles[type] && uploadedFiles[type][index]) {
    uploadedFiles[type].splice(index, 1);
  }
  if (uploadedImages[type] && uploadedImages[type][index]) {
    uploadedImages[type].splice(index, 1);
  }
  
  // Guardar cambios
  saveUserClosetData();
  
  // Actualizar UI
  container.remove();
  updateClosetCounterDisplay();
  updateAllUploadLabels();
  updateGenerateButton();
  
  // Recargar vista del closet para actualizar índices
  setTimeout(() => {
    loadClosetItems();
  }, 100);
  
  const total = getTotalClosetItems();
  const remaining = CONFIG.CLOSET_MAX_TOTAL - total;
  showNotification(`Prenda eliminada del closet. Te quedan ${remaining} por subir (${total}/${CONFIG.CLOSET_MAX_TOTAL})`, 'info');
}

// Sistema de recomendaciones guardadas
function saveRecommendation(recommendation) {
  if (!currentUser?.email || !closetMode) {
    showNotification('Solo puedes guardar recomendaciones en modo closet', 'error');
    return;
  }
  
  const savedRec = {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    occasion: selectedOccasion,
    recommendation: recommendation,
    userEmail: currentUser.email
  };
  
  savedRecommendations.push(savedRec);
  saveSavedRecommendations();
  updateSavedRecommendationsUI();
  
  showNotification('Recomendación guardada en tu closet', 'success');
}

// Cargar recomendaciones guardadas
function loadSavedRecommendations() {
  if (!currentUser?.email) return;
  
  try {
    const data = localStorage.getItem(`noshopia_saved_recs_${currentUser.email}`);
    if (data) {
      savedRecommendations = JSON.parse(data);
      console.log(`${savedRecommendations.length} recomendaciones guardadas cargadas`);
    }
  } catch (e) {
    console.error('Error cargando recomendaciones guardadas:', e);
    savedRecommendations = [];
  }
}

// Guardar recomendaciones en localStorage
function saveSavedRecommendations() {
  if (!currentUser?.email) return;
  
  try {
    localStorage.setItem(`noshopia_saved_recs_${currentUser.email}`, JSON.stringify(savedRecommendations));
  } catch (e) {
    console.error('Error guardando recomendaciones:', e);
  }
}

// Mostrar recomendaciones guardadas
function showSavedRecommendations() {
  const section = document.getElementById('savedRecommendations');
  if (section && savedRecommendations.length > 0) {
    section.style.display = 'block';
    updateSavedRecommendationsUI();
  }
}

// Ocultar recomendaciones guardadas
function hideSavedRecommendations() {
  const section = document.getElementById('savedRecommendations');
  if (section) {
    section.style.display = 'none';
  }
}

// Actualizar UI de recomendaciones guardadas
function updateSavedRecommendationsUI() {
  const list = document.getElementById('savedRecommendationsList');
  if (!list) return;
  
  if (savedRecommendations.length === 0) {
    list.innerHTML = '<p style="color: #666;">No tienes recomendaciones guardadas aún.</p>';
    return;
  }
  
  list.innerHTML = savedRecommendations.map((rec, index) => `
    <div class="saved-recommendation" data-index="${index}">
      <div class="rec-header">
        <span class="rec-occasion">${rec.occasion}</span>
        <span class="rec-date">${formatDate(rec.timestamp)}</span>
        <button class="btn-remove-saved" onclick="removeSavedRecommendation(${index})">×</button>
      </div>
      <div class="rec-preview">
        <img src="${rec.recommendation.top.image || 'placeholder.jpg'}" alt="Top" class="mini-preview">
        <img src="${rec.recommendation.bottom.image || 'placeholder.jpg'}" alt="Bottom" class="mini-preview">
        <img src="${rec.recommendation.shoe.image || 'placeholder.jpg'}" alt="Shoe" class="mini-preview">
      </div>
      <div class="rec-score">Puntuación: ${(rec.recommendation.final_score * 100).toFixed(0)}%</div>
    </div>
  `).join('');
}

// Formatear fecha para mostrar
function formatDate(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Eliminar recomendación guardada
function removeSavedRecommendation(index) {
  savedRecommendations.splice(index, 1);
  saveSavedRecommendations();
  updateSavedRecommendationsUI();
  showNotification('Recomendación eliminada', 'info');
}

// Limpiar todo el closet
function clearCloset() {
  if (!confirm('¿Estás seguro de que quieres vaciar tu closet? Se eliminarán todas las prendas guardadas.')) {
    return;
  }
  
  closetItems = { tops: [], bottoms: [], shoes: [] };
  savedRecommendations = [];
  
  saveUserClosetData();
  saveSavedRecommendations();
  
  // Limpiar UI
  ['tops', 'bottoms', 'shoes'].forEach(type => {
    const preview = document.getElementById(`${type}-preview`);
    if (preview) preview.innerHTML = '';
    updateUploadLabel(type);
  });
  
  updateClosetCounterDisplay();
  updateGenerateButton();
  updateSavedRecommendationsUI();
  
  showNotification('Closet vaciado completamente', 'info');
}

// Actualizar todos los labels de upload
function updateAllUploadLabels() {
  ['tops', 'bottoms', 'shoes'].forEach(type => {
    updateUploadLabel(type);
  });
}

// Exportar funciones globales
window.initializeCloset = initializeCloset;
window.toggleClosetMode = toggleClosetMode;
window.saveRecommendation = saveRecommendation;
window.removeSavedRecommendation = removeSavedRecommendation;
window.clearCloset = clearCloset;

// Auto-inicializar cuando se carga el script
document.addEventListener('DOMContentLoaded', function() {
  // Esperar un poco para que otros scripts se carguen
  setTimeout(initializeCloset, 500);
});

console.log('Closet.js cargado: Sistema de closet con persistencia y recomendaciones guardadas - CORREGIDO para usar CONFIG');
