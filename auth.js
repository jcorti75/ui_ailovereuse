// auth.js - CORREGIDO con Perfilamiento Único

// FUNCIONES AUXILIARES VERIFICADAS
function safeShowNotification(message, type = 'info') {
  console.log(`[${type.toUpperCase()}] ${message}`);
  
  try {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed; top: 20px; right: 20px; z-index: 10000;
      background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
      color: white; padding: 1rem; border-radius: 8px; max-width: 300px;
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
  } catch (e) {
    console.log(`NOTIFICATION: ${message}`);
  }
}

function safeLoadGoogleScript() {
  return new Promise((resolve) => {
    try {
      if (typeof google !== 'undefined' && google.accounts?.id) {
        resolve();
        return;
      }
      
      if (typeof window.loadGoogleScript === 'function') {
        window.loadGoogleScript().then(resolve).catch(() => resolve());
        return;
      }
      
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.onload = () => setTimeout(resolve, 2000);
      script.onerror = () => resolve();
      document.head.appendChild(script);
    } catch (e) {
      resolve();
    }
  });
}

function getGoogleClientId() {
  try {
    if (typeof CONFIG !== 'undefined' && CONFIG.GOOGLE_CLIENT_ID) {
      return CONFIG.GOOGLE_CLIENT_ID;
    }
    return '326940877598-ko13n1qcqkkugkoo6gu2n1avs46al09p.apps.googleusercontent.com';
  } catch (e) {
    return '326940877598-ko13n1qcqkkugkoo6gu2n1avs46al09p.apps.googleusercontent.com';
  }
}

// VERIFICAR SI EL USUARIO YA COMPLETÓ SU PERFIL
function hasCompletedProfile(email) {
  try {
    // Verificar flag de perfil completado
    const profileCompleted = localStorage.getItem(`noshopia_profile_completed_${email}`);
    if (profileCompleted === 'true') {
      console.log('Usuario ya completó perfil (flag)');
      return true;
    }
    
    // Verificar datos de perfil
    const profileData = localStorage.getItem(`noshopia_profile_${email}`);
    if (profileData) {
      try {
        const data = JSON.parse(profileData);
        if (data.skin_color && data.age_range && data.gender) {
          console.log('Usuario ya completó perfil (datos)');
          return true;
        }
      } catch (e) {
        console.log('Error parseando datos de perfil');
      }
    }
    
    console.log('Usuario NO ha completado perfil');
    return false;
  } catch (e) {
    console.log('Error verificando perfil:', e);
    return false;
  }
}

// FUNCIONES PRINCIPALES
async function checkGoogleAuth() {
  console.log('Iniciando verificación Google Auth...');
  
  try {
    await safeLoadGoogleScript();
    console.log('Google Script verificado');
    initializeGoogleAuth();
  } catch (error) {
    console.log('Fallback a auth alternativo');
    showAlternativeAuth();
  }
}

function initializeGoogleAuth() {
  try {
    if (typeof google === 'undefined' || !google.accounts?.id) {
      throw new Error('Google no disponible');
    }
    
    google.accounts.id.initialize({
      client_id: getGoogleClientId(),
      callback: handleGoogleSignIn,
      auto_select: false,
      ux_mode: 'popup'
    });
    
    updateHeaderLoginButton();
    
  } catch (e) {
    console.log('Error inicializando Google Auth, usando fallback');
    showAlternativeAuth();
  }
}

function updateHeaderLoginButton() {
  const headerBtn = document.getElementById('headerLoginBtn');
  if (headerBtn) {
    headerBtn.innerHTML = '<i class="fab fa-google"></i> Iniciar sesión';
    headerBtn.onclick = handleMainLogin;
    headerBtn.disabled = false;
    headerBtn.style.opacity = '1';
  }
}

function showAlternativeAuth() {
  const headerBtn = document.getElementById('headerLoginBtn');
  if (headerBtn) {
    headerBtn.innerHTML = '<i class="fas fa-envelope"></i> Continuar con Email';
    headerBtn.onclick = showManualEmailForm;
    headerBtn.disabled = false;
    headerBtn.style.opacity = '1';
  }
}

function showManualEmailForm() {
  const email = prompt('Ingresa tu email para continuar:');
  if (email && email.includes('@')) {
    processManualLogin(email);
  } else if (email) {
    safeShowNotification('Email inválido', 'error');
  }
}

function processManualLogin(email) {
  try {
    if (typeof window.clearAllUserState === 'function') {
      window.clearAllUserState();
    }
    
    const user = {
      name: email.split('@')[0],
      email: email,
      picture: 'https://via.placeholder.com/40',
      token: 'manual_' + Date.now()
    };
    
    if (typeof window.setCurrentUser === 'function') {
      window.setCurrentUser(user);
    }
    
    if (typeof window.setLoggedIn === 'function') {
      window.setLoggedIn(true);
    }
    
    updateAuthUI();
    safeShowNotification(`Bienvenido ${user.name}!`, 'success');
    
    // VERIFICAR PERFIL Y REDIRIGIR CORRECTAMENTE
    setTimeout(() => {
      checkProfileAndRedirect(user.email);
    }, 1000);
    
  } catch (e) {
    console.log('Error en login manual:', e);
    safeShowNotification('Error procesando login', 'error');
  }
}

async function handleGoogleSignIn(response) {
  if (!response.credential) return;
  
  try {
    const payload = JSON.parse(atob(response.credential.split('.')[1]));
    
    if (typeof window.clearAllUserState === 'function') {
      window.clearAllUserState();
    }
    
    const user = {
      name: payload.name,
      email: payload.email,
      picture: payload.picture,
      token: response.credential
    };
    
    if (typeof window.setCurrentUser === 'function') {
      window.setCurrentUser(user);
    }
    
    if (typeof window.setLoggedIn === 'function') {
      window.setLoggedIn(true);
    }
    
    updateAuthUI();
    safeShowNotification(`Bienvenido ${user.name}!`, 'success');
    
    // VERIFICAR PERFIL Y REDIRIGIR CORRECTAMENTE
    setTimeout(() => {
      checkProfileAndRedirect(user.email);
    }, 1000);
    
  } catch (e) {
    console.log('Error en Google login:', e);
    safeShowNotification('Error al iniciar sesión', 'error');
  }
}

// VERIFICAR PERFIL Y REDIRIGIR (LA FUNCIÓN CLAVE)
function checkProfileAndRedirect(email) {
  try {
    // Scroll a la sección de upload
    const uploadSection = document.getElementById('upload');
    if (uploadSection) {
      uploadSection.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Verificar si ya completó el perfil
    if (hasCompletedProfile(email)) {
      // USUARIO EXISTENTE - Ir directo a opciones del closet
      console.log('Usuario existente - saltando perfilamiento');
      
      setTimeout(() => {
        hideAllSections();
        document.getElementById('closetQuestion').style.display = 'block';
        setupClosetOptions();
      }, 1500);
      
      safeShowNotification('Bienvenido de nuevo! Elige tu método de recomendación.', 'success');
      
    } else {
      // USUARIO NUEVO - Mostrar perfilamiento único
      console.log('Usuario nuevo - mostrando perfilamiento por primera vez');
      
      setTimeout(() => {
        hideAllSections();
        document.getElementById('welcomeSection').style.display = 'block';
        document.getElementById('profileForm').style.display = 'block';
        setupProfileForm(email);
      }, 1500);
      
      safeShowNotification('Completa tu perfil una sola vez.', 'info');
    }
    
  } catch (error) {
    console.log('Error en verificación de perfil:', error);
    // Fallback: mostrar perfilamiento
    setTimeout(() => {
      hideAllSections();
      document.getElementById('profileForm').style.display = 'block';
      setupProfileForm(email);
    }, 1500);
  }
}

// CONFIGURAR FORMULARIO DE PERFIL (solo primera vez)
function setupProfileForm(email) {
  console.log('Configurando formulario de perfil para:', email);
  
  const profileOptions = document.querySelectorAll('.profile-option');
  const createBtn = document.getElementById('createProfileBtn');
  let selectedOptions = { skin_color: null, age_range: null, gender: null };
  
  profileOptions.forEach(option => {
    option.addEventListener('click', function() {
      const field = this.dataset.field;
      const value = this.dataset.value;
      
      // Deseleccionar otras del mismo campo
      document.querySelectorAll(`[data-field="${field}"]`).forEach(opt => {
        opt.classList.remove('selected');
      });
      
      // Seleccionar esta
      this.classList.add('selected');
      selectedOptions[field] = value;
      
      console.log('Opciones seleccionadas:', selectedOptions);
      
      // Verificar si todas están seleccionadas
      const allSelected = selectedOptions.skin_color && 
                         selectedOptions.age_range && 
                         selectedOptions.gender;
      
      if (createBtn) {
        if (allSelected) {
          createBtn.disabled = false;
          createBtn.style.opacity = '1';
          createBtn.innerHTML = '<i class="fas fa-user-plus"></i> Completar Perfil';
          
          createBtn.onclick = function() {
            completeProfile(email, selectedOptions);
          };
        } else {
          createBtn.disabled = true;
          createBtn.style.opacity = '0.6';
          createBtn.innerHTML = '<i class="fas fa-user-plus"></i> Selecciona todas las opciones';
        }
      }
    });
  });
}

// COMPLETAR PERFIL (guardar para siempre)
function completeProfile(email, profileData) {
  try {
    console.log('Completando perfil para:', email, profileData);
    
    // Guardar datos del perfil
    localStorage.setItem(`noshopia_profile_${email}`, JSON.stringify(profileData));
    
    // Guardar flag de perfil completado
    localStorage.setItem(`noshopia_profile_completed_${email}`, 'true');
    
    // Ocultar formulario de perfil
    document.getElementById('profileForm').style.display = 'none';
    document.getElementById('welcomeSection').style.display = 'none';
    
    // Mostrar opciones del closet
    setTimeout(() => {
      document.getElementById('closetQuestion').style.display = 'block';
      setupClosetOptions();
    }, 500);
    
    safeShowNotification('¡Perfil completado! No volverás a ver este formulario.', 'success');
    
  } catch (error) {
    console.log('Error completando perfil:', error);
    safeShowNotification('Error guardando perfil', 'error');
  }
}

// CONFIGURAR OPCIONES DEL CLOSET
function setupClosetOptions() {
  const enableClosetBtn = document.getElementById('enableClosetBtn');
  const useDirectModeBtn = document.getElementById('useDirectModeBtn');
  
  if (enableClosetBtn) {
    enableClosetBtn.onclick = function() {
      hideAllSections();
      document.getElementById('closetContainer').style.display = 'block';
      document.getElementById('occasionSelector').style.display = 'block';
      safeShowNotification('Closet Digital activado!', 'success');
    };
  }
  
  if (useDirectModeBtn) {
    useDirectModeBtn.onclick = function() {
      hideAllSections();
      document.getElementById('uploadArea').style.display = 'block';
      document.getElementById('occasionSelector').style.display = 'block';
      safeShowNotification('Recomendaciones Rápidas activado!', 'success');
    };
  }
}

// FUNCIONES AUXILIARES
function hideAllSections() {
  const sections = [
    'welcomeSection', 'profileForm', 'closetQuestion',
    'closetContainer', 'uploadArea', 'occasionSelector'
  ];
  
  sections.forEach(sectionId => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.style.display = 'none';
    }
  });
}

function handleMainLogin() {
  loginWithGoogle();
}

function loginWithGoogle() {
  console.log('Intentando login con Google...');
  
  try {
    if (typeof google !== 'undefined' && google.accounts?.id) {
      google.accounts.id.prompt();
    } else {
      console.log('Google no disponible, usando email manual');
      showManualEmailForm();
    }
  } catch (e) {
    console.log('Error en login, fallback a manual');
    showManualEmailForm();
  }
}

function logout() {
  try {
    if (typeof window.clearAllUserState === 'function') {
      window.clearAllUserState();
    }
    
    if (typeof window.setLoggedIn === 'function') {
      window.setLoggedIn(false);
    }
    
    if (typeof window.setCurrentUser === 'function') {
      window.setCurrentUser(null);
    }
    
    updateAuthUI();
    hideAllSections();
    safeShowNotification('Sesión cerrada', 'info');
  } catch (e) {
    console.log('Error en logout:', e);
  }
}

function updateAuthUI() {
  try {
    const userInfo = document.getElementById('userInfo');
    const headerLoginBtn = document.getElementById('headerLoginBtn');
    
    let isLoggedIn = false;
    let currentUser = null;
    
    if (typeof window.isLoggedIn === 'function') {
      isLoggedIn = window.isLoggedIn();
    }
    
    if (typeof window.currentUser === 'function') {
      currentUser = window.currentUser();
    }
    
    if (isLoggedIn && currentUser) {
      if (userInfo) {
        userInfo.style.display = 'flex';
        const userName = document.getElementById('userName');
        const userAvatar = document.getElementById('userAvatar');
        if (userName) userName.textContent = currentUser.name;
        if (userAvatar) userAvatar.src = currentUser.picture;
      }
      if (headerLoginBtn) headerLoginBtn.style.display = 'none';
    } else {
      if (userInfo) userInfo.style.display = 'none';
      if (headerLoginBtn) headerLoginBtn.style.display = 'inline-flex';
    }
  } catch (e) {
    console.log('Error actualizando UI');
  }
}

function startFreePlan() {
  try {
    let isLoggedIn = false;
    if (typeof window.isLoggedIn === 'function') {
      isLoggedIn = window.isLoggedIn();
    }
    
    if (!isLoggedIn) {
      loginWithGoogle();
    } else {
      safeShowNotification('Plan Gratis activado', 'success');
      const uploadSection = document.getElementById('upload');
      if (uploadSection) {
        uploadSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  } catch (e) {
    console.log('Error en startFreePlan');
  }
}

function upgradeToPremium() {
  safeShowNotification('Próximamente: Sistema de pagos Premium', 'info');
}

// EXPONER FUNCIONES GLOBALMENTE
window.handleMainLogin = handleMainLogin;
window.startFreePlan = startFreePlan;
window.upgradeToPremium = upgradeToPremium;
window.logout = logout;

// INICIALIZAR
document.addEventListener('DOMContentLoaded', function() {
  console.log('Inicializando sistema de auth con perfilamiento único...');
  
  try {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.onclick = logout;
    }
    
    checkGoogleAuth();
  } catch (e) {
    console.log('Error en inicialización:', e);
    setTimeout(() => {
      const headerBtn = document.getElementById('headerLoginBtn');
      if (headerBtn) {
        headerBtn.onclick = showManualEmailForm;
        headerBtn.disabled = false;
        headerBtn.style.opacity = '1';
        headerBtn.innerHTML = 'Continuar con Email';
      }
    }, 1000);
  }
});

console.log('auth.js con perfilamiento único cargado correctamente');
