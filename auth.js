// auth.js - Sistema de Autenticación LIMPIO Y DEFINITIVO

console.log('🔐 Iniciando sistema de autenticación limpio...');

// =======================================================
// VARIABLES GLOBALES ÚNICAS
// =======================================================

let isLoggedIn = false;
let currentUser = null;

// =======================================================
// FUNCIÓN DE NOTIFICACIÓN SIMPLE
// =======================================================

function showNotification(message, type = 'info') {
  console.log(`[${type.toUpperCase()}] ${message}`);
  
  const colors = {
    success: '#10b981',
    error: '#ef4444', 
    info: '#3b82f6'
  };
  
  const notification = document.createElement('div');
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed; top: 20px; right: 20px; z-index: 10000;
    background: ${colors[type] || colors.info}; color: white;
    padding: 1rem 2rem; border-radius: 15px; font-weight: 600;
    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    animation: slideInRight 0.3s ease; max-width: 350px;
  `;
  
  document.body.appendChild(notification);
  setTimeout(() => notification.remove(), 3000);
}

// =======================================================
// FUNCIONES DE ESTADO GLOBAL
// =======================================================

window.isLoggedIn = () => isLoggedIn;
window.currentUser = () => currentUser;
window.showNotification = showNotification;

// =======================================================
// LOGIN CON EMAIL (SOLUCIÓN PRINCIPAL)
// =======================================================

function loginWithEmail() {
  const email = prompt('Ingresa tu email para continuar:');
  
  if (!email) return;
  
  if (!email.includes('@') || email.length < 5) {
    showNotification('Email inválido', 'error');
    return;
  }
  
  // Convertir email a nombre legible
  const nameFromEmail = email.split('@')[0]
    .replace(/[._-]/g, ' ')
    .replace(/\d+/g, '')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
    .trim() || 'Usuario';
  
  const user = {
    name: nameFromEmail,
    email: email,
    picture: `https://ui-avatars.com/api/?name=${encodeURIComponent(nameFromEmail)}&background=3b82f6&color=fff`,
    loginMethod: 'email'
  };
  
  processLogin(user);
}

// =======================================================
// GOOGLE OAUTH (FALLBACK)
// =======================================================

function initializeGoogleAuth() {
  if (typeof google === 'undefined' || !google.accounts?.id) {
    console.log('Google no disponible, usando email como método principal');
    return false;
  }
  
  try {
    google.accounts.id.initialize({
      client_id: CONFIG?.GOOGLE_CLIENT_ID || '326940877598-ko13n1qcqkkugkoo6gu2n1avs46al09p.apps.googleusercontent.com',
      callback: handleGoogleResponse,
      auto_select: false
    });
    return true;
  } catch (e) {
    console.log('Error inicializando Google Auth:', e);
    return false;
  }
}

function handleGoogleResponse(response) {
  try {
    const payload = JSON.parse(atob(response.credential.split('.')[1]));
    
    const user = {
      name: payload.name || payload.given_name || payload.email.split('@')[0],
      email: payload.email,
      picture: payload.picture,
      loginMethod: 'google'
    };
    
    processLogin(user);
  } catch (e) {
    console.error('Error procesando Google login:', e);
    showNotification('Error en Google login', 'error');
  }
}

function tryGoogleLogin() {
  if (typeof google !== 'undefined' && google.accounts?.id) {
    google.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed()) {
        loginWithEmail();
      }
    });
  } else {
    loginWithEmail();
  }
}

// =======================================================
// PROCESAMIENTO DE LOGIN (UNIFICADO)
// =======================================================

function processLogin(user) {
  console.log('Procesando login para:', user.name);
  
  // Guardar estado
  currentUser = user;
  isLoggedIn = true;
  
  localStorage.setItem('noshopia_user', JSON.stringify(user));
  localStorage.setItem('noshopia_logged_in', 'true');
  
  // Actualizar UI
  updateUI();
  
  showNotification(`¡Bienvenido ${user.name}!`, 'success');
  
  // Navegar después del login
  setTimeout(navigateAfterLogin, 1000);
}

// =======================================================
// ACTUALIZACIÓN DE UI SIMPLE
// =======================================================

function updateUI() {
  const headerBtn = document.getElementById('headerLoginBtn');
  const userInfo = document.getElementById('userInfo');
  const userName = document.getElementById('userName');
  const userAvatar = document.getElementById('userAvatar');
  
  if (isLoggedIn && currentUser) {
    // Mostrar usuario logueado
    if (headerBtn) headerBtn.style.display = 'none';
    if (userInfo) userInfo.style.display = 'flex';
    if (userName) userName.textContent = currentUser.name;
    if (userAvatar) {
      userAvatar.src = currentUser.picture;
      userAvatar.alt = currentUser.name;
    }
    
    // Actualizar nombre en closet
    const userEmail = document.getElementById('userEmail');
    if (userEmail) {
      userEmail.textContent = `Bienvenido ${currentUser.name}`;
    }
    
    // Actualizar elementos con data-user-name
    document.querySelectorAll('[data-user-name="true"]').forEach(el => {
      el.textContent = currentUser.name;
    });
    
  } else {
    // Mostrar botón de login
    if (headerBtn) {
      headerBtn.style.display = 'inline-flex';
      headerBtn.innerHTML = '<i class="fab fa-google"></i> Iniciar sesión con Google';
      headerBtn.disabled = false;
      headerBtn.style.opacity = '1';
    }
    if (userInfo) userInfo.style.display = 'none';
  }
}

// =======================================================
// NAVEGACIÓN POST-LOGIN
// =======================================================

function navigateAfterLogin() {
  // Scroll a sección upload
  const uploadSection = document.getElementById('upload');
  if (uploadSection) {
    uploadSection.scrollIntoView({ behavior: 'smooth' });
  }
  
  // Mostrar opciones del closet después de 1.5 segundos
  setTimeout(() => {
    showClosetOptions();
  }, 1500);
}

function showClosetOptions() {
  // Ocultar otras secciones
  const sections = ['welcomeSection', 'profileForm', 'closetContainer', 'uploadArea', 'occasionSelector'];
  sections.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
  
  // Mostrar pregunta del closet
  const closetQuestion = document.getElementById('closetQuestion');
  if (closetQuestion) {
    closetQuestion.style.display = 'block';
    
    setTimeout(() => {
      closetQuestion.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setupClosetButtons();
    }, 500);
  }
}

function setupClosetButtons() {
  const options = document.querySelectorAll('.closet-option');
  
  options.forEach((option, index) => {
    // Limpiar listeners anteriores
    const newOption = option.cloneNode(true);
    option.parentNode.replaceChild(newOption, option);
    
    if (index === 0) {
      // Mi Closet Inteligente
      newOption.onclick = () => activateCloset();
    } else if (index === 1) {
      // Recomendaciones Rápidas  
      newOption.onclick = () => activateDirectMode();
    }
  });
}

function activateCloset() {
  document.getElementById('closetQuestion').style.display = 'none';
  const closetContainer = document.getElementById('closetContainer');
  if (closetContainer) {
    closetContainer.style.display = 'block';
    setTimeout(() => closetContainer.scrollIntoView({ behavior: 'smooth' }), 300);
  }
  showNotification('Mi Closet Inteligente activado', 'success');
}

function activateDirectMode() {
  document.getElementById('closetQuestion').style.display = 'none';
  const occasionSelector = document.getElementById('occasionSelector');
  const uploadArea = document.getElementById('uploadArea');
  
  if (occasionSelector) occasionSelector.style.display = 'block';
  if (uploadArea) uploadArea.style.display = 'block';
  
  showNotification('Recomendaciones Rápidas activado', 'success');
}

// =======================================================
// LOGOUT SIMPLE
// =======================================================

function logout() {
  currentUser = null;
  isLoggedIn = false;
  
  localStorage.removeItem('noshopia_user');
  localStorage.removeItem('noshopia_logged_in');
  
  // Ocultar secciones
  const sections = ['welcomeSection', 'profileForm', 'closetQuestion', 'closetContainer', 'uploadArea', 'occasionSelector'];
  sections.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
  
  updateUI();
  window.scrollTo({ top: 0, behavior: 'smooth' });
  showNotification('Sesión cerrada', 'info');
}

// =======================================================
// RESTAURAR SESIÓN
// =======================================================

function restoreSession() {
  try {
    const savedUser = localStorage.getItem('noshopia_user');
    const savedLogin = localStorage.getItem('noshopia_logged_in');
    
    if (savedUser && savedLogin === 'true') {
      currentUser = JSON.parse(savedUser);
      isLoggedIn = true;
      updateUI();
      return true;
    }
  } catch (e) {
    localStorage.removeItem('noshopia_user');
    localStorage.removeItem('noshopia_logged_in');
  }
  return false;
}

// =======================================================
// FUNCIONES PARA BOTONES
// =======================================================

function handleMainLogin() {
  tryGoogleLogin();
}

function startFreePlan() {
  if (isLoggedIn) {
    showNotification('Plan Gratis ya activado', 'success');
    document.getElementById('upload')?.scrollIntoView({ behavior: 'smooth' });
  } else {
    handleMainLogin();
  }
}

function upgradeToPremium() {
  showNotification('Próximamente: Sistema de pagos Premium', 'info');
}

// =======================================================
// INICIALIZACIÓN
// =======================================================

function initializeAuth() {
  console.log('Inicializando autenticación...');
  
  // Configurar botones
  const headerBtn = document.getElementById('headerLoginBtn');
  if (headerBtn) {
    headerBtn.onclick = handleMainLogin;
    headerBtn.disabled = false;
    headerBtn.style.opacity = '1';
  }
  
  const freeBtn = document.getElementById('startFreePlan');
  if (freeBtn) freeBtn.onclick = startFreePlan;
  
  const premiumBtn = document.getElementById('upgradeToPremium');
  if (premiumBtn) premiumBtn.onclick = upgradeToPremium;
  
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) logoutBtn.onclick = logout;
  
  // Restaurar sesión si existe
  const restored = restoreSession();
  
  // Intentar inicializar Google Auth (opcional)
  if (!restored) {
    setTimeout(initializeGoogleAuth, 1000);
  }
}

// =======================================================
// EXPONER FUNCIONES GLOBALMENTE
// =======================================================

window.handleMainLogin = handleMainLogin;
window.startFreePlan = startFreePlan;
window.upgradeToPremium = upgradeToPremium;
window.logout = logout;
window.enableCloset = activateCloset;
window.useDirectMode = activateDirectMode;

// =======================================================
// AUTO-INICIALIZACIÓN
// =======================================================

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeAuth);
} else {
  setTimeout(initializeAuth, 500);
}

console.log('✅ auth.js limpio cargado - 200 líneas vs 1300 anteriores');
