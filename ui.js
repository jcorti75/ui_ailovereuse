// ui.js - Funciones de UI, Navegación y Notificaciones

// Funciones de navegación
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

// Funciones de limpieza de estado
function clearAllUserState() {
  console.log('🧹 Limpiando todo el estado de usuario...');
  
  // Limpiar archivos subidos
  uploadedFiles = { tops: [], bottoms: [], shoes: [] };
  uploadedImages = { tops: [], bottoms: [], shoes: [] };
  
  // Limpiar selecciones del closet
  closetSelectedItems = { tops: [], bottoms: [], shoes: [] };
  closetItems = { tops: [], bottoms: [], shoes: [] };
  closetSelectionMode = false;
  
  // Limpiar selecciones
  selectedOccasion = null;
  closetMode = false;
  
  // Limpiar resultados globales
  window.currentResults = null;
  
  // Limpiar previews de imágenes
  ['tops', 'bottoms', 'shoes'].forEach(type => {
    const preview = document.getElementById(`${type}-preview`);
    if (preview) preview.innerHTML = '';
    
    // Reset labels
    const label = document.querySelector(`label[for="${type}-upload"]`);
    if (label) {
      const typeLabels = { tops: 'Superiores', bottoms: 'Inferiores', shoes: 'Zapatos' };
      const max = CONFIG.FILE_LIMITS[type];
      label.innerHTML = `📤 Subir ${typeLabels[type]} (máx ${max})`;
    }
    
    // Reset file inputs
    const input = document.getElementById(`${type}-upload`);
    if (input) input.value = '';
  });
  
  // Limpiar selecciones de ocasión
  document.querySelectorAll('.occasion-btn').forEach(btn => {
    btn.classList.remove('selected');
  });
  
  // Limpiar selecciones de perfil
  document.querySelectorAll('.profile-option').forEach(btn => {
    btn.classList.remove('selected');
  });
  
  // Reset stats
  userStats = { visits: 1, recommendations: 0, savedOutfits: 0 };
  savedRecommendations = [];
  
  // Reset perfil
  userProfile = { skin_color: null, age_range: null, gender: null };
  
  // Ocultar resultados
  const result = document.getElementById('result');
  if (result) {
    result.style.display = 'none';
    result.innerHTML = '';
  }
  
  console.log('✅ Estado de usuario limpiado completamente');
}

// Funciones de secciones
function resetAllSections() {
  document.getElementById('welcomeSection').style.display = 'none';
  document.getElementById('profileForm').style.display = 'none';
  document.getElementById('closetQuestion').style.display = 'none';
  document.getElementById('closetContainer').style.display = 'none';
  document.getElementById('occasionSelector').style.display = 'none';
  document.getElementById('uploadArea').style.display = 'none';
  document.getElementById('result').style.display = 'none';
}

// Mostrar welcome section con verificación mejorada
async function showWelcomeSection() {
  console.log('🎉 Iniciando welcome section con limpieza de estado...');
  
  // Limpiar estado al inicio (excepto datos de usuario actual)
  const currentUserBackup = currentUser;
  const isLoggedInBackup = isLoggedIn;
  clearAllUserState();
  currentUser = currentUserBackup;
  isLoggedIn = isLoggedInBackup;
  
  resetAllSections();
  document.getElementById('welcomeSection').style.display = 'block';
  
  if (!currentUser?.email) {
    showNotification('Error: Usuario no válido', 'error');
    return;
  }

  console.log('🔍 Verificando perfil para usuario:', currentUser.email);
  
  // Verificar si ya tiene perfil con retry
  let hasProfile = false;
  let attempts = 0;
  const maxAttempts = 2;
  
  while (!hasProfile && attempts < maxAttempts) {
    attempts++;
    console.log(`Intento ${attempts}/${maxAttempts} de verificación`);
    hasProfile = await checkExistingProfile(currentUser.email);
    
    if (!hasProfile && attempts < maxAttempts) {
      // Esperar un poco antes del siguiente intento
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  console.log('Resultado final - hasProfile:', hasProfile);
  
  if (hasProfile) {
    // Ya tiene perfil, ir directo a closet question
    console.log('✅ Usuario ya tiene perfil, saltando formulario');
    document.getElementById('profileForm').style.display = 'none';
    document.getElementById('closetQuestion').style.display = 'block';
    showNotification('¡Bienvenido de vuelta!', 'success');
  } else {
    // Primera vez, mostrar formulario de perfil
    console.log('📝 Primera vez, mostrando formulario de perfil');
    document.getElementById('closetQuestion').style.display = 'none';
    document.getElementById('profileForm').style.display = 'block';
  }
  
  updateStatsDisplay();
  scrollToSection('upload');
}

function updateStatsDisplay() {
  document.getElementById('visitCounter').textContent = userStats.visits;
  document.getElementById('recommendationCounter').textContent = userStats.recommendations;
  document.getElementById('outfitCounter').textContent = userStats.savedOutfits;
  
  document.getElementById('closetVisits').textContent = userStats.visits;
  document.getElementById('closetRecommendations').textContent = userStats.recommendations;
  document.getElementById('closetOutfits').textContent = userStats.savedOutfits;
}

// Función para limpiar resultados anteriores
function clearPreviousResults() {
  const result = document.getElementById('result');
  if (result) {
    result.style.display = 'none';
    result.innerHTML = '';
  }
  
  // Limpiar variables globales
  window.currentResults = null;
}

// Función para mostrar selector de ocasión
function showOccasionSelector() {
  document.getElementById('occasionSelector').style.display = 'block';
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

// Configurar event listeners de ocasiones
function setupEventListeners() {
  // Configurar listeners de ocasiones
  document.querySelectorAll('.occasion-btn').forEach(btn => {
    btn.replaceWith(btn.cloneNode(true));
  });
  
  document.querySelectorAll('.occasion-btn').forEach(btn => {
    btn.addEventListener('click', handleOccasionSelect);
  });
}

// Handle ocasion select con limpieza de resultados
function handleOccasionSelect(e) {
  e.preventDefault();
  const btn = e.currentTarget;
  const newOccasion = btn.dataset.occasion;
  
  // Si cambió la ocasión, limpiar resultados anteriores
  if (selectedOccasion && selectedOccasion !== newOccasion) {
    clearPreviousResults();
    showNotification('Ocasión cambiada - Los resultados se actualizarán con la nueva selección', 'info');
  }
  
  selectedOccasion = newOccasion;
  
  document.querySelectorAll('.occasion-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  
  document.getElementById('uploadArea').style.display = 'block';
  updateGenerateButton();
  
  const occasionNames = {
    'oficina': 'Oficina/Trabajo',
    'deportivo': 'Deportes/Gym',
    'casual': 'Casual',
    'formal': 'Formal', 
    'matrimonio': 'Matrimonio'
  };
  
  showNotification(`Ocasión seleccionada: ${occasionNames[newOccasion] || newOccasion}`, 'info');
}