// app.js - NoShopiA Aplicación Completa Simplificada
console.log('🚀 NoShopiA v2.0 - Versión Simplificada');

// ===================================================================
// VARIABLES GLOBALES
// ===================================================================
let isLoggedIn = false;
let currentUser = null;
let selectedOccasion = null;
let uploadedFiles = { tops: [], bottoms: [], shoes: [] };
let uploadedImages = { tops: [], bottoms: [], shoes: [] };
let closetItems = { tops: [], bottoms: [], shoes: [] };
let userStats = { visits: 1, recommendations: 0, savedOutfits: 0 };
let closetMode = false;
let processingStartTime = null;
let currentResults = [];
let savedRecommendations = [];

// ===================================================================
// UTILIDADES
// ===================================================================
function showNotification(message, type = 'info') {
  console.log(`📢 ${type.toUpperCase()}: ${message}`);
  
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed; top: 20px; right: 20px; z-index: 10000;
    background: ${type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : '#3b82f6'};
    color: white; padding: 1rem 2rem; border-radius: 10px;
    font-weight: 600; box-shadow: 0 4px 20px rgba(0,0,0,0.2);
    transform: translateX(100%); opacity: 0;
    transition: all 0.3s ease; max-width: 350px;
  `;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  requestAnimationFrame(() => {
    notification.style.transform = 'translateX(0)';
    notification.style.opacity = '1';
  });
  
  setTimeout(() => {
    notification.style.transform = 'translateX(100%)';
    notification.style.opacity = '0';
    setTimeout(() => notification.remove(), 300);
  }, 4000);
}

function scrollToSection(sectionId) {
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    
    // Actualizar navegación
    document.querySelectorAll('.nav-pill').forEach(pill => pill.classList.remove('active'));
    const activePill = document.querySelector(`[href="#${sectionId}"]`);
    if (activePill) activePill.classList.add('active');
  }
}

function toggleMobileMenu() {
  const mobileNav = document.getElementById('mobileNav');
  const toggle = document.querySelector('.mobile-menu-toggle i');
  
  if (mobileNav && toggle) {
    if (mobileNav.classList.contains('active')) {
      mobileNav.classList.remove('active');
      toggle.className = 'fas fa-bars';
    } else {
      mobileNav.classList.add('active');
      toggle.className = 'fas fa-times';
    }
  }
}

// ===================================================================
// SISTEMA DE LOGIN DIRECTO PROFESIONAL - CORREGIDO
// ===================================================================
function handleMainLogin() {
  console.log('🔐 Iniciando sesión directa...');
  
  if (isLoggedIn) {
    showNotification('Ya estás logueado', 'info');
    scrollToSection('upload');
    return;
  }
  
  // Intentar login con Google si está disponible
  if (typeof google !== 'undefined' && google.accounts) {
    try {
      // Usar el método estándar de Google
      google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          console.log('Prompt no mostrado, usando botón alternativo');
          // Si no funciona el prompt, mostrar botón manual
          showGoogleLoginButton();
        }
      });
    } catch (error) {
      console.error('Error con Google prompt:', error);
      showGoogleLoginButton();
    }
  } else {
    console.log('Google no disponible, usando login demo');
    // Para desarrollo/testing
    simulateLogin();
  }
}

// Mostrar botón de Google como alternativa
function showGoogleLoginButton() {
  // Crear botón temporal de Google si no funciona el prompt
  let googleBtn = document.getElementById('tempGoogleBtn');
  
  if (!googleBtn) {
    googleBtn = document.createElement('div');
    googleBtn.id = 'tempGoogleBtn';
    googleBtn.style.cssText = `
      position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
      background: white; padding: 2rem; border-radius: 15px; 
      box-shadow: 0 20px 50px rgba(0,0,0,0.3); z-index: 10000;
      text-align: center; border: 2px solid #4285f4;
    `;
    
    googleBtn.innerHTML = `
      <h3 style="color: #000; margin-bottom: 1rem;">Iniciar Sesión</h3>
      <p style="color: #666; margin-bottom: 2rem;">Elige una opción para continuar:</p>
      <button onclick="tryGoogleLogin()" style="
        background: #4285f4; color: white; border: none; padding: 1rem 2rem;
        border-radius: 25px; font-weight: 600; cursor: pointer; margin-right: 1rem;
        display: inline-flex; align-items: center; gap: 0.5rem;
      ">
        <i class="fab fa-google"></i> Login con Google
      </button>
      <button onclick="simulateLogin()" style="
        background: #10b981; color: white; border: none; padding: 1rem 2rem;
        border-radius: 25px; font-weight: 600; cursor: pointer;
        display: inline-flex; align-items: center; gap: 0.5rem;
      ">
        <i class="fas fa-user"></i> Demo Login
      </button>
      <button onclick="closeGoogleLoginButton()" style="
        position: absolute; top: 10px; right: 10px; background: #ef4444;
        color: white; border: none; border-radius: 50%; width: 30px; height: 30px;
        cursor: pointer; font-size: 1rem;
      ">×</button>
    `;
    
    document.body.appendChild(googleBtn);
  }
}

// Cerrar botón de Google
function closeGoogleLoginButton() {
  const googleBtn = document.getElementById('tempGoogleBtn');
  if (googleBtn) {
    googleBtn.remove();
  }
}

// Intentar login directo con Google
function tryGoogleLogin() {
  try {
    if (typeof google !== 'undefined' && google.accounts) {
      // Forzar renderizado del botón de Google
      const container = document.createElement('div');
      container.id = 'googleButtonContainer';
      container.style.display = 'none';
      document.body.appendChild(container);
      
      google.accounts.id.renderButton(container, {
        theme: 'filled_blue',
        size: 'large',
        type: 'standard',
        text: 'continue_with'
      });
      
      // Simular click en el botón renderizado
      setTimeout(() => {
        const googleBtn = container.querySelector('div[role="button"]');
        if (googleBtn) {
          googleBtn.click();
        } else {
          console.log('No se pudo renderizar botón de Google, usando demo');
          closeGoogleLoginButton();
          simulateLogin();
        }
      }, 500);
      
    } else {
      console.log('Google no disponible');
      closeGoogleLoginButton();
      simulateLogin();
    }
  } catch (error) {
    console.error('Error en tryGoogleLogin:', error);
    closeGoogleLoginButton();
    simulateLogin();
  }
}

// Login directo a Google sin popups (ALTERNATIVO - no usado por ahora)
function initiateDirectGoogleLogin() {
  console.log('🚀 Redirigiendo directamente a Google...');
  
  const googleAuthUrl = `https://accounts.google.com/oauth/v2/auth?` +
    `client_id=${CONFIG.GOOGLE_CLIENT_ID}&` +
    `redirect_uri=${encodeURIComponent(window.location.origin)}&` +
    `response_type=code&` +
    `scope=openid%20email%20profile&` +
    `access_type=offline&` +
    `prompt=select_account`;
  
  // Redirigir directamente sin popup
  window.location.href = googleAuthUrl;
}

function simulateLogin() {
  console.log('🧪 Login simulado para desarrollo');
  
  const userData = {
    name: 'Usuario Demo',
    email: 'demo@noshopia.com',
    picture: 'https://via.placeholder.com/40x40/3b82f6/ffffff?text=U'
  };
  
  processLogin(userData);
}

function handleGoogleCredentialResponse(response) {
  try {
    const payload = JSON.parse(atob(response.credential.split('.')[1]));
    const userData = {
      name: payload.name,
      email: payload.email,
      picture: payload.picture
    };
    
    processLogin(userData);
  } catch (error) {
    console.error('Error procesando Google login:', error);
    showNotification('Error en el login', 'error');
  }
}

function processLogin(userData) {
  isLoggedIn = true;
  currentUser = userData;
  
  // Guardar sesión
  localStorage.setItem('noshopia_auth', JSON.stringify(userData));
  localStorage.setItem('noshopia_logged_in', 'true');
  
  // Actualizar UI
  updateUserUI();
  loadUserData();
  
  // FLUJO CONDICIONAL: Verificar perfil y redirigir automáticamente
  setTimeout(() => {
    checkProfileAndRedirect();
  }, 1000);
  
  showNotification(`¡Bienvenido ${userData.name}!`, 'success');
}

function updateUserUI() {
  // Ocultar botón de login principal
  const mainLoginBtn = document.getElementById('mainLoginBtn');
  if (mainLoginBtn) {
    mainLoginBtn.style.display = 'none';
  }
  
  // Mostrar info usuario con botón profesional de logout
  const userInfo = document.getElementById('userInfo');
  const userName = document.getElementById('userName');
  const userAvatar = document.getElementById('userAvatar');
  const userEmail = document.getElementById('userEmail');
  
  if (userInfo) userInfo.style.display = 'flex';
  if (userName) userName.textContent = currentUser.name;
  if (userAvatar) {
    userAvatar.src = currentUser.picture;
    userAvatar.alt = currentUser.name;
  }
  if (userEmail) userEmail.textContent = `Bienvenido ${currentUser.name}`;
  
  // Crear o actualizar botón profesional de logout
  updateLogoutButton();
  
  // Mostrar welcome section
  const welcomeSection = document.getElementById('welcomeSection');
  if (welcomeSection) welcomeSection.style.display = 'block';
}

// BOTÓN PROFESIONAL DE CERRAR SESIÓN
function updateLogoutButton() {
  // Buscar si ya existe el botón
  let logoutBtn = document.getElementById('professionalLogoutBtn');
  
  if (!logoutBtn) {
    // Crear botón profesional si no existe
    logoutBtn = document.createElement('button');
    logoutBtn.id = 'professionalLogoutBtn';
    logoutBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Cerrar Sesión';
    
    // Estilos profesionales
    logoutBtn.style.cssText = `
      background: linear-gradient(135deg, #ef4444, #dc2626);
      color: white;
      border: none;
      padding: 0.8rem 1.5rem;
      border-radius: 25px;
      font-weight: 600;
      font-size: 0.9rem;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-left: 1rem;
    `;
    
    // Efectos hover profesionales
    logoutBtn.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-2px)';
      this.style.boxShadow = '0 8px 20px rgba(239, 68, 68, 0.4)';
    });
    
    logoutBtn.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0)';
      this.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.3)';
    });
    
    logoutBtn.addEventListener('click', logout);
    
    // Agregar al contenedor del usuario
    const userInfo = document.getElementById('userInfo');
    if (userInfo) {
      userInfo.appendChild(logoutBtn);
    }
  }
  
  // Asegurar que esté visible
  logoutBtn.style.display = 'flex';
}

function logout() {
  console.log('👋 Cerrando sesión...');
  
  // Confirmación profesional
  if (!confirm('¿Deseas cerrar tu sesión en NoShopiA?')) {
    return;
  }
  
  // Limpiar estado
  isLoggedIn = false;
  currentUser = null;
  selectedOccasion = null;
  uploadedFiles = { tops: [], bottoms: [], shoes: [] };
  uploadedImages = { tops: [], bottoms: [], shoes: [] };
  closetItems = { tops: [], bottoms: [], shoes: [] };
  intelligentClosetItems = { tops: {}, bottoms: {}, shoes: {} };
  closetMode = false;
  userProfile = { skin_color: null, age_range: null, gender: null };
  
  // Limpiar localStorage
  localStorage.removeItem('noshopia_auth');
  localStorage.removeItem('noshopia_logged_in');
  
  // Restaurar UI inicial
  const mainLoginBtn = document.getElementById('mainLoginBtn');
  if (mainLoginBtn) {
    mainLoginBtn.style.display = 'flex';
    // Actualizar texto del botón a "Iniciar Sesión"
    mainLoginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Iniciar Sesión';
  }
  
  const userInfo = document.getElementById('userInfo');
  if (userInfo) userInfo.style.display = 'none';
  
  // Ocultar botón profesional de logout
  const logoutBtn = document.getElementById('professionalLogoutBtn');
  if (logoutBtn) logoutBtn.style.display = 'none';
  
  // Ocultar todas las secciones de usuario logueado
  ['welcomeSection', 'profileForm', 'closetQuestion', 'closetContainer', 'occasionSelector', 'uploadArea'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
  
  const result = document.getElementById('result');
  if (result) {
    result.innerHTML = '';
    result.style.display = 'none';
  }
  
  showNotification('Sesión cerrada correctamente', 'success');
  
  // Scroll suave al inicio
  setTimeout(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, 500);
}

function checkExistingSession() {
  try {
    const savedAuth = localStorage.getItem('noshopia_auth');
    const loggedIn = localStorage.getItem('noshopia_logged_in') === 'true';
    
    if (savedAuth && loggedIn) {
      const userData = JSON.parse(savedAuth);
      if (userData.name && userData.email) {
        console.log('🔄 Restaurando sesión:', userData.name);
        processLogin(userData);
        return true;
      }
    }
  } catch (error) {
    console.error('Error verificando sesión:', error);
  }
  return false;
}

// ===================================================================
// ===================================================================
// FLUJO CONDICIONAL DEL PERFIL
// ===================================================================

// Verificar perfil y redirigir automáticamente según flujo
function checkProfileAndRedirect() {
  console.log('🔄 Verificando estado del perfil para flujo automático...');
  
  if (!currentUser?.email) return;
  
  try {
    const savedProfile = localStorage.getItem(`noshopia_profile_${currentUser.email}`);
    
    if (savedProfile) {
      // PERFIL COMPLETADO → Directo a opciones del closet
      console.log('✅ Perfil completado → Directo a opciones');
      const profileData = JSON.parse(savedProfile);
      userProfile = profileData;
      
      // Ocultar formulario de perfil si está visible
      const profileForm = document.getElementById('profileForm');
      if (profileForm) profileForm.style.display = 'none';
      
      // Mostrar directamente las opciones del closet
      showClosetQuestion();
      
      showNotification(`Perfil cargado: ${profileData.gender}, ${profileData.age_range}`, 'info');
      
    } else {
      // PERFIL NO COMPLETADO → Mostrar formulario → Scroll automático
      console.log('📋 Perfil incompleto → Mostrar formulario');
      
      // Ocultar welcome section
      const welcomeSection = document.getElementById('welcomeSection');
      if (welcomeSection) welcomeSection.style.display = 'none';
      
      // Mostrar formulario de perfil
      const profileForm = document.getElementById('profileForm');
      if (profileForm) {
        profileForm.style.display = 'block';
        
        // SCROLL AUTOMÁTICO al formulario después de breve delay
        setTimeout(() => {
          profileForm.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
          showNotification('Completa tu perfil para personalizar recomendaciones', 'info');
        }, 800);
      }
    }
    
  } catch (error) {
    console.error('Error verificando perfil:', error);
    // En caso de error, mostrar formulario
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
      profileForm.style.display = 'block';
      setTimeout(() => {
        profileForm.scrollIntoView({ behavior: 'smooth' });
      }, 500);
    }
  }
}

// PERFIL DE USUARIO - MEJORADO CON FLUJO AUTOMÁTICO
// ===================================================================
let userProfile = { skin_color: null, age_range: null, gender: null };

function showClosetQuestion() {
  const loginRequired = document.querySelector('.login-required');
  if (loginRequired) loginRequired.style.display = 'none';
  
  const closetQuestion = document.getElementById('closetQuestion');
  if (closetQuestion) {
    closetQuestion.style.display = 'block';
    setTimeout(() => {
      closetQuestion.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 500);
  }
}

function setupProfileForm() {
  document.querySelectorAll('.profile-option').forEach(option => {
    option.addEventListener('click', function() {
      const field = this.dataset.field;
      const value = this.dataset.value;
      
      // Limpiar selección anterior del mismo campo
      document.querySelectorAll(`[data-field="${field}"]`).forEach(opt => 
        opt.classList.remove('selected')
      );
      
      // Seleccionar actual
      this.classList.add('selected');
      userProfile[field] = value;
      
      // Verificar si está completo
      const isComplete = userProfile.skin_color && userProfile.age_range && userProfile.gender;
      const createBtn = document.getElementById('createProfileBtn');
      
      if (createBtn) {
        if (isComplete) {
          createBtn.disabled = false;
          createBtn.innerHTML = '<i class="fas fa-user-plus"></i> Crear Mi Perfil';
          createBtn.style.opacity = '1';
        } else {
          createBtn.disabled = true;
          createBtn.innerHTML = '<i class="fas fa-user-plus"></i> Selecciona todas las opciones';
          createBtn.style.opacity = '0.6';
        }
      }
    });
  });
}

function submitUserProfile() {
  if (!userProfile.skin_color || !userProfile.age_range || !userProfile.gender) {
    showNotification('Completa todos los campos', 'error');
    return;
  }
  
  console.log('👤 Perfil creado:', userProfile);
  
  // Guardar perfil
  if (currentUser?.email) {
    localStorage.setItem(`noshopia_profile_${currentUser.email}`, JSON.stringify(userProfile));
    showNotification('Perfil guardado correctamente', 'success');
  }
  
  // Ocultar formulario
  const profileForm = document.getElementById('profileForm');
  if (profileForm) profileForm.style.display = 'none';
  
  // FLUJO AUTOMÁTICO: Después de completar perfil → Scroll automático a opciones
  setTimeout(() => {
    showClosetQuestion();
    
    // SCROLL AUTOMÁTICO a las opciones del closet
    setTimeout(() => {
      const closetQuestion = document.getElementById('closetQuestion');
      if (closetQuestion) {
        closetQuestion.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }
    }, 500);
  }, 1000);
  
  showNotification('¡Listo! Ahora elige cómo quieres usar NoShopiA', 'success');
}

// ===================================================================
// SISTEMA DE OCASIONES
// ===================================================================
function selectOccasion(occasion) {
  console.log('📅 Ocasión seleccionada:', occasion);
  selectedOccasion = occasion;
  
  // Actualizar UI
  document.querySelectorAll('.occasion-btn').forEach(btn => btn.classList.remove('selected'));
  const selectedBtn = document.querySelector(`[data-occasion="${occasion}"]`);
  if (selectedBtn) selectedBtn.classList.add('selected');
  
  updateGenerateButton();
  
  const occasionNames = {
    'oficina': 'Oficina/Trabajo',
    'deportivo': 'Deportes/Gym',
    'casual': 'Casual',
    'formal': 'Formal',
    'matrimonio': 'Matrimonio'
  };
  
  showNotification(`Ocasión: ${occasionNames[occasion] || occasion}`, 'success');
}

function setupOccasionButtons() {
  document.querySelectorAll('.occasion-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const occasion = this.dataset.occasion;
      if (occasion) selectOccasion(occasion);
    });
  });
}

// ===================================================================
// SISTEMA DE CLOSET
// ===================================================================
function enableCloset() {
  console.log('✨ Activando modo closet...');
  
  if (!isLoggedIn) {
    showNotification('Debes iniciar sesión primero', 'error');
    return;
  }
  
  closetMode = true;
  
  const closetQuestion = document.getElementById('closetQuestion');
  if (closetQuestion) closetQuestion.style.display = 'none';
  
  const closetContainer = document.getElementById('closetContainer');
  if (closetContainer) {
    closetContainer.style.display = 'block';
    setTimeout(() => {
      closetContainer.scrollIntoView({ behavior: 'smooth' });
    }, 500);
  }
  
  showNotification('Mi Closet activado', 'success');
  updateClosetUI();
}

function useDirectMode() {
  console.log('⚡ Activando modo directo...');
  
  closetMode = false;
  
  const closetQuestion = document.getElementById('closetQuestion');
  if (closetQuestion) closetQuestion.style.display = 'none';
  
  const occasionSelector = document.getElementById('occasionSelector');
  const uploadArea = document.getElementById('uploadArea');
  
  if (occasionSelector) occasionSelector.style.display = 'block';
  if (uploadArea) uploadArea.style.display = 'block';
  
  showNotification('Modo directo activado', 'success');
}

function showClosetTab(tabId) {
  console.log('📂 Mostrando pestaña inteligente:', tabId);
  
  // Ocultar todas las pestañas
  document.querySelectorAll('.closet-tab-content').forEach(content => {
    content.style.display = 'none';
  });
  
  // Remover active de tabs
  document.querySelectorAll('.closet-tab').forEach(tab => {
    tab.classList.remove('active');
  });
  
  // Mostrar pestaña seleccionada
  const selectedContent = document.getElementById(tabId);
  if (selectedContent) selectedContent.style.display = 'block';
  
  const selectedTab = document.querySelector(`[data-tab="${tabId}"]`);
  if (selectedTab) selectedTab.classList.add('active');
  
  // RENDERIZAR CON SISTEMA INTELIGENTE
  const typeMap = { 'superiores': 'tops', 'inferiores': 'bottoms', 'calzado': 'shoes' };
  const type = typeMap[tabId];
  
  if (type && tabId !== 'recomendaciones') {
    renderIntelligentClosetTab(tabId, type);
    setupClosetFolderUploads(); // Configurar upload inteligente
  } else if (tabId === 'recomendaciones') {
    renderSavedRecommendations();
  }
}

// Renderizar recomendaciones guardadas
function renderSavedRecommendations() {
  const tabContent = document.getElementById('recomendaciones');
  if (!tabContent) return;
  
  if (savedRecommendations.length === 0) {
    tabContent.innerHTML = `
      <div style="text-align: center; padding: 3rem; color: #666;">
        <div style="font-size: 3rem; margin-bottom: 1rem;">⭐</div>
        <h3>Recomendaciones Guardadas</h3>
        <p>Aquí aparecerán tus combinaciones favoritas guardadas</p>
      </div>
    `;
    return;
  }
  
  const occasionNames = {
    'oficina': 'Oficina/Trabajo',
    'deportivo': 'Deportes/Gym',
    'casual': 'Casual',
    'formal': 'Formal', 
    'matrimonio': 'Matrimonio'
  };
  
  let html = '<div style="display: grid; gap: 1rem;">';
  
  savedRecommendations.forEach((rec, index) => {
    const isBest = index === 0;
    const score = Math.round((rec.final_score || 0) * 100);
    
    html += `
      <div style="background: white; border: 1px solid ${isBest ? '#fbbf24' : '#e5e7eb'}; border-radius: 15px; padding: 1.5rem; display: flex; align-items: center; gap: 1rem; position: relative;">
        ${isBest ? '<div style="position: absolute; top: -10px; right: -10px; background: #fbbf24; color: black; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center;">⭐</div>' : ''}
        <div style="flex: 1;">
          <h4 style="margin: 0; color: #000;">Combinación para ${occasionNames[rec.occasion] || rec.occasion}</h4>
          <p style="margin: 0.5rem 0; color: #666; font-size: 0.9rem;">${rec.top?.detected_item || 'Superior'} + ${rec.bottom?.detected_item || 'Inferior'} + ${rec.shoe?.detected_item || 'Calzado'}</p>
          <small style="color: #666;">Guardada el ${rec.saved_date}</small>
        </div>
        <div style="background: ${isBest ? '#fbbf24' : '#3b82f6'}; color: ${isBest ? 'black' : 'white'}; padding: 0.5rem 1rem; border-radius: 20px; font-weight: 700;">${score}%</div>
      </div>
    `;
  });
  
  html += '</div>';
  tabContent.innerHTML = html;
}

function setupClosetTabs() {
  document.querySelectorAll('.closet-tab').forEach(tab => {
    tab.addEventListener('click', function() {
      const tabId = this.dataset.tab;
      if (tabId) showClosetTab(tabId);
    });
  });
}

function updateClosetUI() {
  const total = getTotalClosetItems();
  const remaining = Math.max(0, CONFIG.TOTAL_CLOSET_LIMIT - total);
  
  const closetHeader = document.querySelector('.closet-header h2');
  if (closetHeader) {
    closetHeader.innerHTML = `Mi Closet Favorito <span style="font-size: 0.8rem; opacity: 0.8;">(${total}/${CONFIG.TOTAL_CLOSET_LIMIT} prendas)</span>`;
  }
  
  // Actualizar stats
  const stats = ['closetVisits', 'closetRecommendations', 'closetOutfits'];
  const values = [userStats.visits, userStats.recommendations, userStats.savedOutfits];
  
  stats.forEach((id, index) => {
    const el = document.getElementById(id);
    if (el) el.textContent = values[index];
  });
}

function getTotalClosetItems() {
  return Object.values(closetItems).reduce((total, items) => total + items.length, 0);
}

// ===================================================================
// SISTEMA DE UPLOAD - CLOSET INTELIGENTE MEJORADO
// ===================================================================

// Categorías inteligentes para detección automática
const INTELLIGENT_CATEGORIES = {
  tops: {
    "polera": { name: "Poleras", icon: "👕", keywords: ["polera", "t-shirt", "tee", "camiseta"] },
    "camisa": { name: "Camisas", icon: "👔", keywords: ["camisa", "shirt", "blouse"] },
    "sweater": { name: "Suéteres", icon: "🧥", keywords: ["sweater", "sueter", "cardigan", "pullover"] },
    "chaqueta": { name: "Chaquetas", icon: "🧥", keywords: ["chaqueta", "jacket", "blazer"] },
    "vestido": { name: "Vestidos", icon: "👗", keywords: ["vestido", "dress"] }
  },
  bottoms: {
    "jeans": { name: "Jeans", icon: "👖", keywords: ["jean", "jeans", "denim"] },
    "pantalon": { name: "Pantalones", icon: "👖", keywords: ["pantalon", "pants", "trouser"] },
    "falda": { name: "Faldas", icon: "👗", keywords: ["falda", "skirt"] },
    "shorts": { name

function setupDirectUpload() {
  ['tops', 'bottoms', 'shoes'].forEach(type => {
    const input = document.getElementById(`${type}-upload`);
    if (input) {
      input.addEventListener('change', function(e) {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
          handleFileUpload(type, files);
        }
      });
    }
  });
}

async function handleFileUpload(type, files) {
  console.log(`📤 Subiendo ${files.length} archivos para ${type}`);
  
  const maxFiles = CONFIG.FILE_LIMITS[type];
  const currentFiles = uploadedFiles[type].length;
  
  if (currentFiles + files.length > maxFiles) {
    showNotification(`Máximo ${maxFiles} archivos para ${type}`, 'error');
    return;
  }
  
  // Validar tipos
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const invalidFiles = files.filter(file => !validTypes.includes(file.type));
  
  if (invalidFiles.length > 0) {
    showNotification('Solo JPG, PNG o WebP permitidos', 'error');
    return;
  }
  
  showNotification(`Procesando ${files.length} imagen(es)...`, 'info');
  
  // Procesar archivos
  for (const file of files) {
    try {
      const imageUrl = await fileToDataUrl(file);
      
      uploadedFiles[type].push(file);
      uploadedImages[type].push(imageUrl);
      closetItems[type].push(imageUrl);
      
      console.log(`✅ Procesado: ${file.name}`);
    } catch (error) {
      console.error('Error procesando archivo:', error);
      showNotification(`Error procesando ${file.name}`, 'error');
    }
  }
  
  // Actualizar UI
  updateUploadUI(type);
  updateGenerateButton();
  saveUserData();
  
  if (closetMode) {
    updateClosetUI();
    showNotification(`${files.length} imagen(es) agregadas al closet`, 'success');
  } else {
    showNotification(`${files.length} imagen(es) procesadas`, 'success');
  }
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function updateUploadUI(type) {
  const files = uploadedFiles[type];
  const label = document.querySelector(`label[for="${type}-upload"]`);
  const preview = document.getElementById(`${type}-preview`);
  
  if (label) {
    const typeNames = { tops: 'Superiores', bottoms: 'Inferiores', shoes: 'Calzado' };
    const maxFiles = CONFIG.FILE_LIMITS[type];
    
    if (files.length === 0) {
      label.textContent = `📤 Subir ${typeNames[type]} (máx ${maxFiles})`;
    } else {
      label.textContent = `📤 ${typeNames[type]}: ${files.length}/${maxFiles} subidos`;
    }
  }
  
  if (preview) {
    preview.innerHTML = '';
    uploadedImages[type].forEach((imageUrl, index) => {
      const div = document.createElement('div');
      div.style.position = 'relative';
      div.innerHTML = `
        <img src="${imageUrl}" class="preview-image" style="width: 120px; height: 120px; object-fit: cover; border-radius: 15px; border: 2px solid var(--primary);">
        <button onclick="removeImage('${type}', ${index})" class="remove-image" style="position: absolute; top: -8px; right: -8px; background: #ef4444; color: white; border: none; border-radius: 50%; width: 24px; height: 24px; cursor: pointer; font-size: 12px;">×</button>
      `;
      preview.appendChild(div);
    });
  }
}

function removeImage(type, index) {
  uploadedFiles[type].splice(index, 1);
  uploadedImages[type].splice(index, 1);
  closetItems[type].splice(index, 1);
  
  updateUploadUI(type);
  updateGenerateButton();
  saveUserData();
  
  if (closetMode) updateClosetUI();
  
  showNotification('Imagen eliminada', 'success');
}

function updateGenerateButton() {
  const generateBtn = document.getElementById('generateBtn');
  if (!generateBtn) return;
  
  const hasTops = uploadedFiles.tops.length > 0;
  const hasBottoms = uploadedFiles.bottoms.length > 0;
  const hasShoes = uploadedFiles.shoes.length > 0;
  const hasOccasion = selectedOccasion !== null;
  
  if (hasTops && hasBottoms && hasShoes && hasOccasion) {
    generateBtn.disabled = false;
    generateBtn.innerHTML = '<i class="fas fa-magic"></i> Generar Recomendaciones';
    generateBtn.style.opacity = '1';
  } else {
    generateBtn.disabled = true;
    generateBtn.innerHTML = '<i class="fas fa-upload"></i> Completa todos los campos';
    generateBtn.style.opacity = '0.6';
  }
}

// ===================================================================
// API Y RECOMENDACIONES
// ===================================================================
async function getRecommendation() {
  if (!selectedOccasion) {
    showNotification('Selecciona una ocasión primero', 'error');
    return;
  }
  
  if (!isLoggedIn) {
    showNotification('Debes estar logueado', 'error');
    return;
  }
  
  const hasFiles = uploadedFiles.tops.length > 0 && 
                   uploadedFiles.bottoms.length > 0 && 
                   uploadedFiles.shoes.length > 0;
                   
  if (!hasFiles) {
    showNotification('Sube al menos 1 imagen de cada categoría', 'error');
    return;
  }
  
  const btn = document.getElementById('generateBtn');
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
    btn.innerHTML = '<span class="loading"></span> Generando...';
    btn.disabled = true;
  }
  
  try {
    console.log('🚀 Enviando solicitud de recomendación...');
    
    const formData = new FormData();
    formData.append('user_email', currentUser.email);
    formData.append('occasion', selectedOccasion);
    
    // Agregar archivos
    uploadedFiles.tops.forEach((file, index) => {
      formData.append('tops', file, file.name || `top_${index}.jpg`);
    });
    
    uploadedFiles.bottoms.forEach((file, index) => {
      formData.append('bottoms', file, file.name || `bottom_${index}.jpg`);
    });
    
    uploadedFiles.shoes.forEach((file, index) => {
      formData.append('shoes', file, file.name || `shoe_${index}.jpg`);
    });
    
    const response = await fetch(`${CONFIG.API_BASE}/api/recommend`, {
      method: 'POST',
      body: formData
    });
    
    clearInterval(timerInterval);
    const finalTime = (Date.now() - processingStartTime) / 1000;
    if (timerDisplay) timerDisplay.textContent = finalTime.toFixed(1) + 's';
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error ${response.status}: ${errorText}`);
    }
    
    const data = await response.json();
    
    if (data.success) {
      userStats.recommendations++;
      renderRecommendations(data);
      showNotification(`✅ Procesado en ${finalTime.toFixed(1)}s`, 'success');
    } else {
      throw new Error(data.message || 'Error generando recomendaciones');
    }
    
  } catch (error) {
    clearInterval(timerInterval);
    console.error('Error completo:', error);
    showNotification(`Error: ${error.message}`, 'error');
    
  } finally {
    setTimeout(() => {
      if (timer) timer.style.display = 'none';
    }, 2000);
    
    if (btn) {
      btn.innerHTML = '<i class="fas fa-magic"></i> Generar Recomendaciones';
      btn.disabled = false;
    }
  }
}

function renderRecommendations(data) {
  const result = document.getElementById('result');
  const results = data.results || [];
  
  if (results.length === 0) {
    result.innerHTML = '<p style="text-align: center;">No se encontraron recomendaciones.</p>';
    result.style.display = 'block';
    return;
  }
  
  // Encontrar mejor recomendación
  let bestIndex = 0;
  let highestScore = 0;
  results.forEach((item, index) => {
    const score = item.final_score || 0;
    if (score > highestScore) {
      highestScore = score;
      bestIndex = index;
    }
  });
  
  const occasionText = {
    'oficina': 'Oficina/Trabajo',
    'deportivo': 'Deportes/Gym', 
    'casual': 'Casual',
    'formal': 'Formal',
    'matrimonio': 'Matrimonio'
  };
  
  let html = `
    <div style="text-align: center; margin-bottom: 2rem;">
      <h2>🪄 Recomendaciones para ${occasionText[selectedOccasion] || selectedOccasion}</h2>
      <p style="opacity: 0.8;">${results.length} combinaciones encontradas</p>
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
      <div style="background: white; border: 2px solid ${isBest ? '#fbbf24' : '#e5e7eb'}; border-radius: 20px; padding: 2rem; position: relative;">
        ${isBest ? '<div style="position: absolute; top: -15px; left: 50%; transform: translateX(-50%); background: #fbbf24; color: black; padding: 0.5rem 1.5rem; border-radius: 20px; font-weight: 800;">⭐ MEJOR OPCIÓN</div>' : ''}
        
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
          <h3>Combinación ${idx + 1}</h3>
          <span style="background: ${isBest ? '#fbbf24' : '#3b82f6'}; color: ${isBest ? 'black' : 'white'}; padding: 0.5rem 1rem; border-radius: 15px; font-weight: 700;">${scorePercent}%</span>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 1rem;">
          <div style="text-align: center;">
            <h4>👕 Superior</h4>
            <div style="min-height: 200px; display: flex; align-items: center; justify-content: center; border: 1px dashed #ccc; border-radius: 15px;">
              ${topImage ? `<img src="${topImage}" style="max-width: 180px; max-height: 180px; object-fit: contain; border-radius: 10px;">` : '<div style="color: #666;">👕</div>'}
            </div>
            <p style="margin-top: 0.5rem; font-size: 0.9rem;">${item.top?.detected_item || 'Superior'}</p>
          </div>
          
          <div style="text-align: center;">
            <h4>👖 Inferior</h4>
            <div style="min-height: 200px; display: flex; align-items: center; justify-content: center; border: 1px dashed #ccc; border-radius: 15px;">
              ${bottomImage ? `<img src="${bottomImage}" style="max-width: 180px; max-height: 180px; object-fit: contain; border-radius: 10px;">` : '<div style="color: #666;">👖</div>'}
            </div>
            <p style="margin-top: 0.5rem; font-size: 0.9rem;">${item.bottom?.detected_item || 'Inferior'}</p>
          </div>
          
          <div style="text-align: center;">
            <h4>👞 Calzado</h4>
            <div style="min-height: 200px; display: flex; align-items: center; justify-content: center; border: 1px dashed #ccc; border-radius: 15px;">
              ${shoeImage ? `<img src="${shoeImage}" style="max-width: 180px; max-height: 180px; object-fit: contain; border-radius: 10px;">` : '<div style="color: #666;">👞</div>'}
            </div>
            <p style="margin-top: 0.5rem; font-size: 0.9rem;">${item.shoe?.detected_item || 'Calzado'}</p>
          </div>
        </div>
        
        <div style="background: rgba(59, 130, 246, 0.1); border-radius: 10px; padding: 1rem; text-align: center;">
          <strong>${item.harmony_type || 'Combinación Equilibrada'}</strong>
          <br>
          <span style="font-size: 0.9rem; opacity: 0.8;">${item.harmony_description || 'Combinación balanceada y armónica'}</span>
        </div>
        
        ${closetMode ? `<button onclick="saveRecommendation(${idx})" style="width: 100%; margin-top: 1rem; padding: 0.8rem; background: #10b981; color: white; border: none; border-radius: 10px; font-weight: 600; cursor: pointer;">💾 Guardar en Closet</button>` : ''}
      </div>
    `;
  });
  
  html += '</div>';
  result.innerHTML = html;
  result.style.display = 'block';
  
  currentResults = results;
  
  setTimeout(() => {
    result.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 100);
}

function getImageForCombination(type, item) {
  const images = uploadedImages[type];
  if (!images || images.length === 0) return null;
  
  let backendIndex;
  if (type === 'tops') {
    backendIndex = item.top?.index || 0;
  } else if (type === 'bottoms') {
    backendIndex = item.bottom?.index || 0;
  } else if (type === 'shoes') {
    backendIndex = item.shoe?.index || 0;
  }
  
  if (backendIndex >= 0 && backendIndex < images.length) {
    return images[backendIndex];
  }
  
  return images[0] || null;
}

function saveRecommendation(index) {
  if (!currentResults || !currentResults[index]) return;
  
  const recommendation = {
    id: Date.now(),
    ...currentResults[index],
    saved_date: new Date().toLocaleDateString('es-ES'),
    occasion: selectedOccasion
  };
  
  savedRecommendations.unshift(recommendation);
  if (savedRecommendations.length > 20) {
    savedRecommendations = savedRecommendations.slice(0, 20);
  }
  
  userStats.savedOutfits = savedRecommendations.length;
  saveUserData();
  updateClosetUI();
  
  showNotification('Recomendación guardada ⭐', 'success');
}

// ===================================================================
// PERSISTENCIA DE DATOS
// ===================================================================
function saveUserData() {
  if (!currentUser?.email) return;
  
  const userData = {
    email: currentUser.email,
    name: currentUser.name,
    uploadedFiles: uploadedFiles,
    uploadedImages: uploadedImages,
    closetItems: closetItems,
    userStats: userStats,
    savedRecommendations: savedRecommendations,
    lastUpdated: new Date().toISOString()
  };
  
  localStorage.setItem(`noshopia_user_data_${currentUser.email}`, JSON.stringify(userData));
}

function loadUserData() {
  if (!currentUser?.email) return;
  
  try {
    const userData = localStorage.getItem(`noshopia_user_data_${currentUser.email}`);
    if (userData) {
      const data = JSON.parse(userData);
      uploadedFiles = data.uploadedFiles || { tops: [], bottoms: [], shoes: [] };
      uploadedImages = data.uploadedImages || { tops: [], bottoms: [], shoes: [] };
      closetItems = data.closetItems || { tops: [], bottoms: [], shoes: [] };
      userStats = data.userStats || { visits: 1, recommendations: 0, savedOutfits: 0 };
      savedRecommendations = data.savedRecommendations || [];
      
      console.log('✅ Datos de usuario cargados');
    }
  } catch (error) {
    console.error('Error cargando datos:', error);
  }
}

// ===================================================================
// FUNCIONES DE PLANES
// ===================================================================
function startFreePlan() {
  console.log('🎁 Plan gratuito activado');
  showNotification('¡Plan gratuito activado! Inicia sesión para comenzar.', 'success');
  setTimeout(() => handleMainLogin(), 1500);
}

function upgradeToPremium() {
  console.log('⭐ Upgrade a premium solicitado');
  showNotification('Funcionalidad premium próximamente disponible', 'info');
  setTimeout(() => scrollToSection('equipo'), 1000);
}

// ===================================================================
// INICIALIZACIÓN
// ===================================================================
function initializeGoogleLogin() {
  try {
    if (typeof google !== 'undefined' && google.accounts) {
      google.accounts.id.initialize({
        client_id: CONFIG.GOOGLE_CLIENT_ID,
        callback: handleGoogleCredentialResponse,
        auto_select: false
      });
      console.log('✅ Google Sign-In configurado');
    } else {
      console.log('⚠️ Google Sign-In no disponible, usando modo demo');
    }
  } catch (error) {
    console.error('Error configurando Google Login:', error);
  }
}

function setupEventListeners() {
  // Ocasiones
  setupOccasionButtons();
  
  // Pestañas del closet
  setupClosetTabs();
  
  // Upload directo
  setupDirectUpload();
  
  // Perfil
  setupProfileForm();
  
  // Cerrar menú móvil
  document.querySelectorAll('.mobile-nav-item').forEach(item => {
    item.addEventListener('click', () => {
      const mobileNav = document.getElementById('mobileNav');
      if (mobileNav?.classList.contains('active')) {
        toggleMobileMenu();
      }
    });
  });
  
  // Animación de barras de impacto
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const fill = entry.target;
        const width = fill.dataset.width;
        if (width) {
          setTimeout(() => {
            fill.style.width = width + '%';
          }, 200);
        }
      }
    });
  });
  
  document.querySelectorAll('.impact-fill').forEach(fill => {
    observer.observe(fill);
  });
  
  console.log('✅ Event listeners configurados');
}

function initializeApp() {
  console.log('🔧 Inicializando NoShopiA...');
  
  // Configurar Google Login
  setTimeout(initializeGoogleLogin, 500);
  
  // Configurar event listeners
  setupEventListeners();
  
  // Verificar sesión existente
  setTimeout(checkExistingSession, 1000);
  
  console.log('✅ NoShopiA inicializada correctamente');
}

// ===================================================================
// EXPOSICIÓN GLOBAL DE FUNCIONES - AL FINAL DESPUÉS DE DEFINIRLAS
// ===================================================================
window.scrollToSection = scrollToSection;
window.toggleMobileMenu = toggleMobileMenu;
window.handleMainLogin = handleMainLogin;
window.logout = logout;
window.startFreePlan = startFreePlan;
window.upgradeToPremium = upgradeToPremium;
window.enableCloset = enableCloset;
window.useDirectMode = useDirectMode;
window.showClosetTab = showClosetTab;
window.submitUserProfile = submitUserProfile;
window.getRecommendation = getRecommendation;
window.removeImage = removeImage;
window.saveRecommendation = saveRecommendation;
window.removeIntelligentItem = removeIntelligentItem;
window.handleGoogleCredentialResponse = handleGoogleCredentialResponse;

// ===================================================================
// AUTO-INICIALIZACIÓN
// ===================================================================
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  setTimeout(initializeApp, 100);
}

console.log('✅ app.js cargado - NoShopiA v2.0 lista');
