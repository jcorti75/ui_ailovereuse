// ui.js - Funciones de UI CORREGIDAS para el flujo exacto

function scrollToSection(sectionId) {
  const element = document.getElementById(sectionId);
  if (element) {
    document.querySelectorAll('.nav-pill').forEach(pill => {
      pill.classList.remove('active');
    });
    const activeLink = document.querySelector(`[onclick*="${sectionId}"]`);
    if (activeLink) activeLink.classList.add('active');
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function toggleMobileMenu() {
  const mobileNav = document.getElementById('mobileNav');
  mobileNav.classList.toggle('active');
}

function clearAllUserState() {
  console.log('Limpiando todo el estado de usuario...');
  
  uploadedFiles = { tops: [], bottoms: [], shoes: [] };
  uploadedImages = { tops: [], bottoms: [], shoes: [] };
  closetSelectedItems = { tops: [], bottoms: [], shoes: [] };
  closetItems = { tops: [], bottoms: [], shoes: [] };
  closetSelectionMode = false;
  selectedOccasion = null;
  closetMode = false;
  window.currentResults = null;
  
  ['tops', 'bottoms', 'shoes'].forEach(type => {
    const preview = document.getElementById(`${type}-preview`);
    if (preview) preview.innerHTML = '';
    
    const label = document.querySelector(`label[for="${type}-upload"]`);
    if (label) {
      const typeLabels = { tops: 'Superiores', bottoms: 'Inferiores', shoes: 'Zapatos' };
      const max = CONFIG.FILE_LIMITS[type];
      label.innerHTML = `📤 Subir ${typeLabels[type]} (mín 1, máx ${max})`;
    }
    
    const input = document.getElementById(`${type}-upload`);
    if (input) input.value = '';
  });
  
  document.querySelectorAll('.occasion-btn').forEach(btn => {
    btn.classList.remove('selected');
  });
  
  document.querySelectorAll('.profile-option').forEach(btn => {
    btn.classList.remove('selected');
  });
  
  userStats = { visits: 1, recommendations: 0, savedOutfits: 0 };
  savedRecommendations = [];
  userProfile = { skin_color: null, age_range: null, gender: null };
  
  const result = document.getElementById('result');
  if (result) {
    result.style.display = 'none';
    result.innerHTML = '';
  }
  
  console.log('Estado limpiado completamente');
}

function resetAllSections() {
  document.getElementById('welcomeSection').style.display = 'none';
  document.getElementById('profileForm').style.display = 'none';
  document.getElementById('closetQuestion').style.display = 'none';
  document.getElementById('closetContainer').style.display = 'none';
  document.getElementById('occasionSelector').style.display = 'none';
  document.getElementById('uploadArea').style.display = 'none';
  document.getElementById('result').style.display = 'none';
}

async function showWelcomeSection() {
  console.log('Iniciando welcome section...');
  
  loadUserClosetData();
  resetAllSections();
  document.getElementById('welcomeSection').style.display = 'block';
  
  if (!currentUser?.email) {
    showNotification('Error: Usuario no válido', 'error');
    return;
  }

  console.log('Verificando perfil para usuario:', currentUser.email);
  
  if (profileCompleted) {
    console.log('Perfil ya completado, saltando formulario');
    document.getElementById('profileForm').style.display = 'none';
    document.getElementById('closetQuestion').style.display = 'block';
    showNotification('¡Bienvenido de vuelta!', 'success');
    updateStatsDisplay();
    scrollToSection('upload');
    return;
  }
  
  const hasProfile = await checkExistingProfile(currentUser.email);
  
  if (hasProfile || profileCompleted) {
    console.log('Usuario ya tiene perfil, saltando formulario');
    document.getElementById('profileForm').style.display = 'none';
    document.getElementById('closetQuestion').style.display = 'block';
    showNotification('¡Bienvenido de vuelta!', 'success');
  } else {
    console.log('Primera vez, mostrando formulario de perfil');
    document.getElementById('closetQuestion').style.display = 'none';
    document.getElementById('profileForm').style.display = 'block';
  }
  
  updateStatsDisplay();
  scrollToSection('upload');
}

function updateStatsDisplay() {
  const visitCounter = document.getElementById('visitCounter');
  const recommendationCounter = document.getElementById('recommendationCounter');
  const outfitCounter = document.getElementById('outfitCounter');
  
  if (visitCounter) visitCounter.textContent = userStats.visits;
  if (recommendationCounter) recommendationCounter.textContent = userStats.recommendations;
  if (outfitCounter) outfitCounter.textContent = userStats.savedOutfits;
  
  const closetVisits = document.getElementById('closetVisits');
  const closetRecommendations = document.getElementById('closetRecommendations');
  const closetOutfits = document.getElementById('closetOutfits');
  
  if (closetVisits) closetVisits.textContent = userStats.visits;
  if (closetRecommendations) closetRecommendations.textContent = userStats.recommendations;
  if (closetOutfits) closetOutfits.textContent = userStats.savedOutfits;
}

function clearPreviousResults() {
  const result = document.getElementById('result');
  if (result) {
    result.style.display = 'none';
    result.innerHTML = '';
  }
  window.currentResults = null;
}

// CRÍTICA: Mostrar selector de ocasión (para modo NO-closet)
function showOccasionSelector() {
  console.log('Mostrando selector de ocasión para modo directo...');
  document.getElementById('occasionSelector').style.display = 'block';
  setupEventListeners();
}

// Configurar event listeners de ocasiones
function setupEventListeners() {
  console.log('Configurando event listeners...');
  
  document.querySelectorAll('.occasion-btn').forEach(btn => {
    // Limpiar listeners anteriores
    btn.replaceWith(btn.cloneNode(true));
  });
  
  document.querySelectorAll('.occasion-btn').forEach(btn => {
    btn.addEventListener('click', handleOccasionSelect);
  });
}

// CORREGIDA: Handle ocasión select - FLUJO EXACTO
function handleOccasionSelect(e) {
  e.preventDefault();
  const btn = e.currentTarget;
  const newOccasion = btn.dataset.occasion;
  
  console.log(`Ocasión seleccionada: ${newOccasion}`);
  
  // Si cambió la ocasión, limpiar resultados anteriores
  if (selectedOccasion && selectedOccasion !== newOccasion) {
    clearPreviousResults();
    showNotification('Ocasión cambiada - Los resultados se actualizarán con la nueva selección', 'info');
  }
  
  selectedOccasion = newOccasion;
  
  // Actualizar UI de botones
  document.querySelectorAll('.occasion-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  
  // CRÍTICO: Mostrar área de subida inmediatamente
  const uploadArea = document.getElementById('uploadArea');
  if (uploadArea) {
    uploadArea.style.display = 'block';
    console.log('✅ Upload area mostrada');
  } else {
    console.error('❌ No se encontró uploadArea');
  }
  
  // Actualizar botón de generar
  updateGenerateButton();
  
  const occasionNames = {
    'oficina': 'Oficina/Trabajo',
    'deportivo': 'Deportes/Gym',
    'casual': 'Casual',
    'formal': 'Formal', 
    'matrimonio': 'Matrimonio'
  };
  
  showNotification(`Ocasión seleccionada: ${occasionNames[newOccasion] || newOccasion}`, 'info');
  
  // Scroll suave hacia el área de subida
  setTimeout(() => {
    uploadArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 300);
}

// Notificaciones
function showNotification(message, type = 'info', duration = 4000) {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    if (notification.parentNode) {
      notification.remove();
    }
  }, duration);
}
