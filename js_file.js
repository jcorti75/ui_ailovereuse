// js_file.js - Todo el JavaScript modular consolidado

/* =============================================================================
   CONFIGURACIONES Y CONSTANTES
   ============================================================================= */
const CONFIG = {
  GOOGLE_CLIENT_ID: '326940877598-ko13n1qcqkkugkoo6gu2n1avs46al09p.apps.googleusercontent.com',
  API_BASE: "https://outfit-recommender-production-cab0.up.railway.app",
  FILE_LIMITS: { tops: 3, bottoms: 3, shoes: 5 }
};

const MESSAGES = {
  AUTH: {
    WELCOME: (name) => `¡Bienvenido ${name}!`,
    LOGIN_ERROR: 'Error al iniciar sesión',
    LOGOUT: 'Sesión cerrada',
    LOGIN_REQUIRED: 'Debes iniciar sesión primero'
  },
  UPLOAD: {
    FILE_LIMIT: (limit, type) => `Máximo ${limit} archivos para ${type}`,
    OCCASION_REQUIRED: 'Selecciona una ocasión primero'
  },
  API: {
    GENERATING: 'Generando recomendaciones...',
    ERROR_PREFIX: 'Error: '
  }
};

/* =============================================================================
   ESTADO GLOBAL DE LA APLICACIÓN
   ============================================================================= */
let isLoggedIn = false;
let currentUser = null;
let uploadedFiles = { tops: [], bottoms: [], shoes: [] };
let selectedOccasion = null;

/* =============================================================================
   UTILIDADES Y HELPERS
   ============================================================================= */
function showNotification(message, type = 'info', duration = 4000) {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  
  // Estilos en línea para asegurar que funcione
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 1rem 2rem;
    border-radius: 15px;
    color: white;
    font-weight: 600;
    z-index: 10000;
    max-width: 350px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    animation: slideInRight 0.3s ease;
  `;

  // Colores según tipo
  const colors = {
    success: 'linear-gradient(135deg, #10b981, #059669)',
    error: 'linear-gradient(135deg, #ef4444, #dc2626)',
    info: 'linear-gradient(135deg, #3b82f6, #1e3a8a)',
    warning: 'linear-gradient(135deg, #f59e0b, #d97706)'
  };
  
  notification.style.background = colors[type] || colors.info;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    if (notification.parentNode) {
      notification.remove();
    }
  }, duration);
}

/* =============================================================================
   NAVEGACIÓN
   ============================================================================= */
function scrollToSection(sectionId) {
  const element = document.getElementById(sectionId);
  if (element) {
    // Actualizar pills activos
    document.querySelectorAll('.nav-pill').forEach(pill => {
      pill.classList.remove('active');
      if (pill.getAttribute('onclick') && pill.getAttribute('onclick').includes(sectionId)) {
        pill.classList.add('active');
      }
    });
    
    // Scroll suave
    element.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  }
}

function toggleMobileMenu() {
  const menu = document.getElementById('mobileMenu');
  const overlay = document.getElementById('mobileMenuOverlay');
  const hamburger = document.getElementById('hamburgerBtn');
  
  if (menu && overlay && hamburger) {
    menu.classList.toggle('active');
    overlay.classList.toggle('active');
    hamburger.classList.toggle('active');
  }
}

function closeMobileMenu() {
  const menu = document.getElementById('mobileMenu');
  const overlay = document.getElementById('mobileMenuOverlay');
  const hamburger = document.getElementById('hamburgerBtn');
  
  if (menu && overlay && hamburger) {
    menu.classList.remove('active');
    overlay.classList.remove('active');
    hamburger.classList.remove('active');
  }
}

/* =============================================================================
   AUTENTICACIÓN
   ============================================================================= */
function checkGoogleAuth() {
  const checkInterval = setInterval(() => {
    if (typeof google !== 'undefined' && google.accounts?.id) {
      clearInterval(checkInterval);
      initializeGoogleAuth();
    }
  }, 500);
}

function initializeGoogleAuth() {
  try {
    google.accounts.id.initialize({
      client_id: CONFIG.GOOGLE_CLIENT_ID,
      callback: handleGoogleSignIn,
      auto_select: false,
      ux_mode: 'popup'
    });
  } catch (e) {
    console.error('Error inicializando Google Auth:', e);
  }
}

async function handleGoogleSignIn(response) {
  if (!response.credential) return;
  
  try {
    const payload = JSON.parse(atob(response.credential.split('.')[1]));
    currentUser = {
      name: payload.name,
      email: payload.email,
      picture: payload.picture,
      token: response.credential
    };
    
    isLoggedIn = true;
    updateAuthUI();
    showOccasionSelector();
    showNotification(MESSAGES.AUTH.WELCOME(currentUser.name), 'success');
    scrollToSection('upload');
  } catch (e) {
    console.error('Error en login:', e);
    showNotification(MESSAGES.AUTH.LOGIN_ERROR, 'error');
  }
}

async function loginWithGoogle() {
  try {
    if (typeof google !== 'undefined' && google.accounts?.id) {
      google.accounts.id.prompt();
    } else {
      showNotification('Google Auth no está listo', 'error');
    }
  } catch (e) {
    showNotification('Error: ' + e.message, 'error');
  }
}

function logout() {
  isLoggedIn = false;
  currentUser = null;
  selectedOccasion = null;
  uploadedFiles = { tops: [], bottoms: [], shoes: [] };
  updateAuthUI();
  document.getElementById('occasionSelector').style.display = 'none';
  document.getElementById('uploadArea').style.display = 'none';
  document.getElementById('loginRequired').style.display = 'block';
  showNotification(MESSAGES.AUTH.LOGOUT, 'info');
}

function updateAuthUI() {
  const userInfo = document.getElementById('userInfo');
  if (isLoggedIn && currentUser) {
    userInfo.style.display = 'flex';
    document.getElementById('userName').textContent = currentUser.name;
    document.getElementById('userAvatar').src = currentUser.picture;
  } else {
    userInfo.style.display = 'none';
  }
}

function handleStartNowClick(e) {
  e.preventDefault();
  if (!isLoggedIn) {
    loginWithGoogle();
  } else {
    scrollToSection('upload');
    showOccasionSelector();
  }
}

function showOccasionSelector() {
  document.getElementById('loginRequired').style.display = 'none';
  document.getElementById('occasionSelector').style.display = 'block';
}

/* =============================================================================
   MANEJO DE OCASIONES
   ============================================================================= */
function setupEventListeners() {
  // Ocasiones
  document.querySelectorAll('.occasion-btn').forEach(btn => {
    btn.addEventListener('click', handleOccasionSelect);
  });
  
  // Other occasion input
  const otherInput = document.getElementById('otherOccasionInput');
  if (otherInput) {
    otherInput.addEventListener('input', handleOtherOccasionInput);
  }
}

function handleOccasionSelect(e) {
  const btn = e.currentTarget;
  selectedOccasion = btn.dataset.occasion;
  
  // Limpiar selección previa
  document.querySelectorAll('.occasion-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  
  // Mostrar input adicional si es "otros"
  const otherInput = document.getElementById('otherOccasionInput');
  if (selectedOccasion === 'otros') {
    otherInput.style.display = 'block';
  } else {
    otherInput.style.display = 'none';
  }
  
  // Mostrar área de upload
  document.getElementById('uploadArea').style.display = 'block';
  updateGenerateButton();
}

function handleOtherOccasionInput(e) {
  if (selectedOccasion === 'otros') {
    selectedOccasion = e.target.value || 'otros';
  }
}

/* =============================================================================
   MANEJO DE ARCHIVOS
   ============================================================================= */
async function handleFileUpload(type, input) {
  if (!isLoggedIn) {
    showNotification(MESSAGES.AUTH.LOGIN_REQUIRED, 'error');
    input.value = '';
    return;
  }
  
  const files = Array.from(input.files);
  const currentCount = uploadedFiles[type].length;
  const maxCount = CONFIG.FILE_LIMITS[type];
  
  if (currentCount + files.length > maxCount) {
    showNotification(MESSAGES.UPLOAD.FILE_LIMIT(maxCount, type), 'warning');
    input.value = '';
    return;
  }
  
  for (const file of files) {
    const preview = await createPreview(file, type);
    document.getElementById(`${type}-preview`).appendChild(preview);
    uploadedFiles[type].push(file);
  }
  
  updateUploadLabel(type);
  updateGenerateButton();
  input.value = '';
}

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
      
      const removeBtn = document.createElement('button');
      removeBtn.className = 'remove-image';
      removeBtn.innerHTML = '×';
      removeBtn.onclick = () => {
        const index = Array.from(container.parentNode.children).indexOf(container);
        if (index !== -1) {
          uploadedFiles[type].splice(index, 1);
          updateUploadLabel(type);
          updateGenerateButton();
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

function updateUploadLabel(type) {
  const label = document.querySelector(`label[for="${type}-upload"]`);
  const count = uploadedFiles[type].length;
  const max = CONFIG.FILE_LIMITS[type];
  
  if (count === 0) {
    label.innerHTML = `📤 Subir ${getTypeLabel(type)} (máx ${max})`;
  } else if (count < max) {
    label.innerHTML = `✅ ${count}/${max} - Agregar más`;
  } else {
    label.innerHTML = `🎯 ${count}/${max} - ¡Completo!`;
  }
}

function getTypeLabel(type) {
  const labels = { tops: 'Superiores', bottoms: 'Inferiores', shoes: 'Zapatos' };
  return labels[type] || type;
}

function updateGenerateButton() {
  const btn = document.getElementById('generateBtn');
  const hasAll = uploadedFiles.tops.length > 0 && 
                 uploadedFiles.bottoms.length > 0 && 
                 uploadedFiles.shoes.length > 0;
  
  if (hasAll && selectedOccasion) {
    const total = uploadedFiles.tops.length * uploadedFiles.bottoms.length * uploadedFiles.shoes.length;
    btn.innerHTML = `🪄 Generar ${total} Recomendaciones con IA`;
    btn.disabled = false;
  } else {
    btn.innerHTML = '🪄 Sube fotos de cada categoría y selecciona ocasión';
    btn.disabled = true;
  }
}

/* =============================================================================
   API Y RECOMENDACIONES
   ============================================================================= */
async function getRecommendation() {
  if (!selectedOccasion) {
    showNotification(MESSAGES.UPLOAD.OCCASION_REQUIRED, 'warning');
    return;
  }
  
  const btn = document.getElementById('generateBtn');
  btn.innerHTML = '<span class="loading"></span> ' + MESSAGES.API.GENERATING;
  btn.disabled = true;
  
  try {
    const formData = new FormData();
    formData.append('user_email', currentUser.email);
    
    const occasionValue = selectedOccasion === 'otros' ? 
                         document.getElementById('otherOccasionInput').value || 'otros' : 
                         selectedOccasion;
    formData.append('occasion', occasionValue);
    
    uploadedFiles.tops.forEach(f => formData.append('tops', f));
    uploadedFiles.bottoms.forEach(f => formData.append('bottoms', f));
    uploadedFiles.shoes.forEach(f => formData.append('shoes', f));
    
    console.log('Enviando a:', `${CONFIG.API_BASE}/api/recommend`);
    console.log('Ocasión enviada:', occasionValue);
    
    const response = await fetch(`${CONFIG.API_BASE}/api/recommend`, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error ${response.status}: ${errorText}`);
    }
    
    const data = await response.json();
    
    if (data.success) {
      renderRecommendations(data);
    } else {
      throw new Error(data.message || 'Error generando recomendaciones');
    }
  } catch (e) {
    console.error('Error completo:', e);
    showNotification(`${MESSAGES.API.ERROR_PREFIX}${e.message}`, 'error');
  } finally {
    btn.innerHTML = '🪄 Generar Nuevas Recomendaciones';
    btn.disabled = false;
  }
}

/* =============================================================================
   RENDERIZADO DE RECOMENDACIONES - DISEÑO VERTICAL SIN ESPACIOS
   ============================================================================= */
function renderRecommendations(data) {
  const result = document.getElementById('result');
  const results = data.results || [];
  
  // Encontrar la combinación con el score más alto
  let bestCombinationIndex = 0;
  let highestScore = 0;
  results.forEach((item, index) => {
    const score = item.final_score || 0.85;
    if (score > highestScore) {
      highestScore = score;
      bestCombinationIndex = index;
    }
  });
  
  let html = `
    <div class="section-title">
      <h2 style="color: var(--text-primary);">🪄 Tus Mejores Combinaciones</h2>
      <p style="color: var(--text-secondary); font-size: 1rem; margin-top: 0.5rem;">
        ${data.message || `Mostrando las mejores ${results.length} combinaciones`}
      </p>
    </div>
    <div class="recommendations-container">
  `;
  
  results.forEach((item, idx) => {
    // Usar índices correctos del backend
    const topIndex = item.top?.index || 0;
    const bottomIndex = item.bottom?.index || 0;
    const shoeIndex = item.shoe?.index || 0;
    
    // Obtener archivos usando los índices del backend
    const topFile = uploadedFiles.tops[topIndex] || uploadedFiles.tops[0];
    const bottomFile = uploadedFiles.bottoms[bottomIndex] || uploadedFiles.bottoms[0];
    const shoeFile = uploadedFiles.shoes[shoeIndex] || uploadedFiles.shoes[0];
    
    const topURL = topFile ? URL.createObjectURL(topFile) : '';
    const bottomURL = bottomFile ? URL.createObjectURL(bottomFile) : '';
    const shoeURL = shoeFile ? URL.createObjectURL(shoeFile) : '';
    
    // Score del backend
    const scorePercent = Math.round((item.final_score || 0.85) * 100);
    
    // Información enriquecida del backend
    const harmonyType = item.harmony_type || 'Equilibrada';
    const harmonyDesc = item.harmony_description || '';
    const occasionMatch = item.occasion_match || selectedOccasion;
    const styleTips = item.style_tips || [];
    
    // Información de prendas detectadas
    const topDetected = item.top?.detected_item || 'Prenda superior';
    const bottomDetected = item.bottom?.detected_item || 'Prenda inferior';
    const shoeDetected = item.shoe?.detected_item || 'Calzado';
    
    const topFormality = item.top?.formality || 'casual';
    const bottomFormality = item.bottom?.formality || 'casual';
    const shoeFormality = item.shoe?.formality || 'casual';
    
    // Verificar si es la mejor combinación
    const isBestCombination = idx === bestCombinationIndex;
    const cardClass = isBestCombination ? 'rec-card best-combination' : 'rec-card';
    const crownIcon = isBestCombination ? '<div class="best-badge">⭐ MEJOR COMBINACIÓN</div>' : '';
    
    html += `
      <div class="${cardClass}">
        ${crownIcon}
        <div class="rec-header">
          <h3 class="rec-title">
            ${isBestCombination ? '👑 ' : ''}Combinación ${idx + 1}
            ${isBestCombination ? ' <span class="star-icon">⭐</span>' : ''}
          </h3>
          <div class="rec-score">
            <span class="score-badge ${isBestCombination ? 'best-score' : ''}">${scorePercent}%</span>
          </div>
        </div>
        
        <!-- LAYOUT VERTICAL DE DOS COLUMNAS SIN ESPACIOS -->
        <div class="rec-layout">
          
          <!-- COLUMNA IZQUIERDA - Prendas como cuerpo humano -->
          <div class="outfit-column">
            
            <!-- SUPERIOR -->
            <div class="outfit-item">
              ${topURL ? `
                <img src="${topURL}" 
                     alt="${topDetected}" 
                     class="outfit-item-image ${isBestCombination ? 'best-photo' : ''}" 
                     title="${topDetected}">
              ` : ''}
              <div class="category-label category-superior">👔 SUPERIOR</div>
              <div class="item-name">${topDetected}</div>
              <div class="item-formality">${topFormality}</div>
            </div>

            <!-- INFERIOR -->
            <div class="outfit-item">
              ${bottomURL ? `
                <img src="${bottomURL}" 
                     alt="${bottomDetected}" 
                     class="outfit-item-image ${isBestCombination ? 'best-photo' : ''}" 
                     title="${bottomDetected}">
              ` : ''}
              <div class="category-label category-inferior">👖 INFERIOR</div>
              <div class="item-name">${bottomDetected}</div>
              <div class="item-formality">${bottomFormality}</div>
            </div>

            <!-- CALZADO -->
            <div class="outfit-item">
              ${shoeURL ? `
                <img src="${shoeURL}" 
                     alt="${shoeDetected}" 
                     class="outfit-item-image ${isBestCombination ? 'best-photo' : ''}" 
                     title="${shoeDetected}">
              ` : ''}
              <div class="category-label category-calzado">👢 CALZADO</div>
              <div class="item-name">${shoeDetected}</div>
              <div class="item-formality">${shoeFormality}</div>
            </div>
          </div>

          <!-- COLUMNA DERECHA - Información SIN ESPACIOS EN BLANCO -->
          <div class="info-column">
            
            <!-- ARMONÍA -->
            <div class="info-card harmony-card">
              <div class="info-card-title">ARMONÍA</div>
              <div class="info-card-value">${harmonyType}</div>
            </div>

            <!-- INFORMACIÓN ADICIONAL CON ESTRELLA -->
            <div class="info-card recommendation-card ${isBestCombination ? 'best-analysis' : ''}">
              <svg class="recommendation-icon" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
              </svg>
              <div class="recommendation-text">
                ${harmonyDesc || 'Armonía monocromática sofisticada con variación tonal'}
              </div>
            </div>

            <!-- TIPS DE ESTILO -->
            <div class="info-card tips-card">
              <div class="tips-header">
                <span class="tips-icon">💡</span>
                <span class="tips-title">Tips de Estilo</span>
              </div>
              <div class="tips-list">
                ${styleTips.length > 0 ? 
                  styleTips.map(tip => `<div class="tip-item">${tip}</div>`).join('') :
                  `
                    <div class="tip-item">Añade texturas diferentes para crear interés visual</div>
                    <div class="tip-item">Juega con accesorios metálicos para romper la monotonía</div>
                    <div class="tip-item">Excelente combinación con gran potencial</div>
                  `
                }
              </div>
            </div>
            
            <!-- COHERENCIA -->
            <div class="info-card coherence-card">
              <div class="info-card-title">COHERENCIA</div>
              <div class="info-card-value coherence-value">
                ${Math.round((item.scores?.style_coherence || 0.75) * 100)}%
              </div>
            </div>
          </div>
        </div>

        <!-- Información adicional de ocasión -->
        <div style="margin-top: 1.5rem; text-align: center; padding: 1rem; background: var(--bg-tertiary); border-radius: 15px;">
          <div style="font-size: 0.9rem; color: var(--text-secondary);">
            <strong>Ocasión:</strong> ${occasionMatch}
          </div>
        </div>
      </div>
    `;
  });
  
  html += '</div>';
  result.innerHTML = html;
  result.style.display = 'block';
  
  // Scroll suave a los resultados
  setTimeout(() => {
    result.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 100);
}

/* =============================================================================
   FUNCIONES DE PLANES
   ============================================================================= */
function startFreePlan() {
  if (!isLoggedIn) {
    loginWithGoogle();
    return;
  }
  showNotification('Plan gratuito activado!', 'success');
  scrollToSection('upload');
}

function upgradeToPremium() {
  showNotification('Funcionalidad en desarrollo', 'info');
}

/* =============================================================================
   INICIALIZACIÓN
   ============================================================================= */
document.addEventListener('DOMContentLoaded', () => {
  updateAuthUI();
  checkGoogleAuth();
  setupEventListeners();
  
  // Animar las barras de impacto cuando se carga la página
  setTimeout(() => {
    document.querySelectorAll('.impact-fill').forEach((bar, index) => {
      setTimeout(() => {
        bar.style.width = bar.getAttribute('data-width') + '%';
      }, index * 200);
    });
  }, 1500);
});

/* =============================================================================
   FUNCIÓN DE EMERGENCIA
   ============================================================================= */
function emergencyReset() {
  try {
    console.log('🚨 Ejecutando reset de emergencia...');
    
    // Reset variables
    isLoggedIn = false;
    currentUser = null;
    selectedOccasion = null;
    uploadedFiles = { tops: [], bottoms: [], shoes: [] };
    
    // Reset UI
    updateAuthUI();
    document.getElementById('occasionSelector').style.display = 'none';
    document.getElementById('uploadArea').style.display = 'none';
    document.getElementById('loginRequired').style.display = 'block';
    
    // Limpiar ocasiones
    document.querySelectorAll('.occasion-btn').forEach(btn => {
      btn.classList.remove('selected');
    });
    
    // Limpiar previews
    ['tops', 'bottoms', 'shoes'].forEach(type => {
      const preview = document.getElementById(`${type}-preview`);
      if (preview) preview.innerHTML = '';
      updateUploadLabel(type);
    });
    
    // Limpiar resultados
    const result = document.getElementById('result');
    if (result) {
      result.innerHTML = '';
      result.style.display = 'none';
    }
    
    updateGenerateButton();
    setupEventListeners();
    
    showNotification('Estado resetado exitosamente', 'success');
    scrollToSection('inicio');
    
    console.log('✅ Reset de emergencia completado');
  } catch (error) {
    console.error('❌ Error en reset de emergencia:', error);
    showNotification('Error en reset. Recarga la página.', 'error');
  }
}

// Agregar atajo de teclado para reset de emergencia
document.addEventListener('keydown', function(e) {
  if (e.ctrlKey && e.shiftKey && e.key === 'R') {
    e.preventDefault();
    emergencyReset();
  }
});
