// auth.js - Versión CONSERVADORA (Mantiene compatibilidad total)

// FUNCIONES AUXILIARES VERIFICADAS
function safeShowNotification(message, type = 'info') {
  console.log(`[${type.toUpperCase()}] ${message}`);
  
  try {
    // Intentar usar la función global si existe
    if (typeof window.showNotification === 'function') {
      window.showNotification(message, type);
      return;
    }
    
    // Crear notificación simple
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
    // Fallback total
    console.log(`NOTIFICATION: ${message}`);
  }
}

function safeLoadGoogleScript() {
  return new Promise((resolve) => {
    try {
      // Verificar si ya existe
      if (typeof google !== 'undefined' && google.accounts?.id) {
        resolve();
        return;
      }
      
      // Intentar usar loadGoogleScript de config.js si existe
      if (typeof window.loadGoogleScript === 'function') {
        window.loadGoogleScript().then(resolve).catch(() => resolve());
        return;
      }
      
      // Cargar manualmente
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.onload = () => setTimeout(resolve, 2000);
      script.onerror = () => resolve(); // No fallar
      document.head.appendChild(script);
    } catch (e) {
      resolve(); // No fallar nunca
    }
  });
}

// VERIFICAR CONFIG SEGURO
function getGoogleClientId() {
  try {
    if (typeof CONFIG !== 'undefined' && CONFIG.GOOGLE_CLIENT_ID) {
      return CONFIG.GOOGLE_CLIENT_ID;
    }
    // Fallback al ID hardcoded
    return '326940877598-ko13n1qcqkkugkoo6gu2n1avs46al09p.apps.googleusercontent.com';
  } catch (e) {
    return '326940877598-ko13n1qcqkkugkoo6gu2n1avs46al09p.apps.googleusercontent.com';
  }
}

// FUNCIONES PRINCIPALES CON VALIDACIÓN
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
    // Usar funciones globales si existen, sino usar locales
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
    
    // Navegación segura
    setTimeout(() => {
      const uploadSection = document.getElementById('upload');
      if (uploadSection) {
        uploadSection.scrollIntoView({ behavior: 'smooth' });
      }
      showUploadFlow();
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
    
    // Usar funciones globales si existen
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
    
    // Intentar flujo completo si existe, sino básico
    if (typeof checkProfileAndRedirectCorrect === 'function') {
      await checkProfileAndRedirectCorrect();
    } else {
      // Flujo básico
      setTimeout(() => {
        const uploadSection = document.getElementById('upload');
        if (uploadSection) {
          uploadSection.scrollIntoView({ behavior: 'smooth' });
        }
        showUploadFlow();
      }, 1000);
    }
    
  } catch (e) {
    console.log('Error en Google login:', e);
    safeShowNotification('Error al iniciar sesión', 'error');
  }
}

function showUploadFlow() {
  try {
    // Mostrar secciones básicas
    const sections = ['welcomeSection', 'profileForm', 'closetQuestion'];
    sections.forEach(id => {
      const element = document.getElementById(id);
      if (element) {
        element.style.display = 'block';
      }
    });
  } catch (e) {
    console.log('Error mostrando upload flow');
  }
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
    safeShowNotification('Sesión cerrada', 'info');
  } catch (e) {
    console.log('Error en logout:', e);
  }
}

function updateAuthUI() {
  try {
    const userInfo = document.getElementById('userInfo');
    const headerLoginBtn = document.getElementById('headerLoginBtn');
    
    // Verificar estado de login
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

// EXPONER FUNCIONES GLOBALMENTE (conservar interfaz)
window.handleMainLogin = handleMainLogin;
window.startFreePlan = startFreePlan;
window.upgradeToPremium = upgradeToPremium;
window.logout = logout;

// INICIALIZAR CUANDO DOM ESTÉ LISTO
document.addEventListener('DOMContentLoaded', function() {
  console.log('Inicializando sistema de auth...');
  
  try {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.onclick = logout;
    }
    
    checkGoogleAuth();
  } catch (e) {
    console.log('Error en inicialización:', e);
    // Intentar configurar botón básico como fallback
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

console.log('auth.js cargado correctamente');
