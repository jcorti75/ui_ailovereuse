// auth.js - Versión MINIMALISTA que FUNCIONA

// Variables globales simples
let currentUser = null;
let isLoggedIn = false;

// Exponer funciones globalmente
window.currentUser = () => currentUser;
window.isLoggedIn = () => isLoggedIn;

// Notificación simple
function showNotification(message, type) {
  console.log(message);
  alert(message); // Temporal hasta que funcione
}

// Cargar Google Script
function loadGoogleScript() {
  return new Promise((resolve) => {
    if (typeof google !== 'undefined') {
      resolve();
      return;
    }
    
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.onload = () => setTimeout(resolve, 2000);
    script.onerror = () => resolve(); // No fallar, continuar
    document.head.appendChild(script);
  });
}

// Inicializar Google Auth
async function initializeGoogleAuth() {
  try {
    await loadGoogleScript();
    
    if (typeof google === 'undefined') {
      throw new Error('Google no disponible');
    }
    
    google.accounts.id.initialize({
      client_id: '326940877598-ko13n1qcqkkugkoo6gu2n1avs46al09p.apps.googleusercontent.com',
      callback: handleGoogleResponse
    });
    
    updateLoginButton();
    
  } catch (error) {
    console.error('Error Google Auth:', error);
    showManualLogin();
  }
}

// Manejar respuesta de Google
function handleGoogleResponse(response) {
  try {
    const payload = JSON.parse(atob(response.credential.split('.')[1]));
    
    currentUser = {
      name: payload.name,
      email: payload.email,
      picture: payload.picture
    };
    
    isLoggedIn = true;
    
    updateUI();
    showNotification(`Bienvenido ${currentUser.name}!`);
    
    // Ir a sección de upload
    setTimeout(() => {
      document.getElementById('upload').scrollIntoView({behavior: 'smooth'});
      showUploadSection();
    }, 1000);
    
  } catch (error) {
    console.error('Error procesando login:', error);
    showNotification('Error en login');
  }
}

// Mostrar sección de upload
function showUploadSection() {
  const sections = ['welcomeSection', 'profileForm', 'closetQuestion'];
  sections.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'block';
  });
}

// Login manual como fallback
function showManualLogin() {
  const btn = document.getElementById('headerLoginBtn');
  if (btn) {
    btn.innerHTML = 'Continuar con Email';
    btn.onclick = () => {
      const email = prompt('Ingresa tu email:');
      if (email && email.includes('@')) {
        currentUser = {
          name: email.split('@')[0],
          email: email,
          picture: 'https://via.placeholder.com/40'
        };
        isLoggedIn = true;
        updateUI();
        showUploadSection();
      }
    };
  }
}

// Actualizar botón de login
function updateLoginButton() {
  const btn = document.getElementById('headerLoginBtn');
  if (btn) {
    btn.innerHTML = '<i class="fab fa-google"></i> Iniciar sesión';
    btn.disabled = false;
    btn.style.opacity = '1';
    btn.onclick = loginWithGoogle;
  }
}

// Login con Google
function loginWithGoogle() {
  try {
    if (typeof google !== 'undefined' && google.accounts) {
      google.accounts.id.prompt();
    } else {
      showManualLogin();
    }
  } catch (error) {
    showManualLogin();
  }
}

// Actualizar UI
function updateUI() {
  const userInfo = document.getElementById('userInfo');
  const loginBtn = document.getElementById('headerLoginBtn');
  
  if (isLoggedIn && currentUser) {
    if (userInfo) {
      userInfo.style.display = 'flex';
      const userName = document.getElementById('userName');
      const userAvatar = document.getElementById('userAvatar');
      if (userName) userName.textContent = currentUser.name;
      if (userAvatar) userAvatar.src = currentUser.picture;
    }
    if (loginBtn) loginBtn.style.display = 'none';
  } else {
    if (userInfo) userInfo.style.display = 'none';
    if (loginBtn) loginBtn.style.display = 'inline-flex';
  }
}

// Logout
function logout() {
  currentUser = null;
  isLoggedIn = false;
  updateUI();
  showNotification('Sesión cerrada');
}

// Funciones para botones del HTML
function handleMainLogin() {
  loginWithGoogle();
}

function startFreePlan() {
  if (!isLoggedIn) {
    loginWithGoogle();
  } else {
    showNotification('Plan activado');
    document.getElementById('upload').scrollIntoView({behavior: 'smooth'});
  }
}

function upgradeToPremium() {
  showNotification('Próximamente: Plan Premium');
}

// Exponer funciones globalmente
window.logout = logout;
window.handleMainLogin = handleMainLogin;
window.startFreePlan = startFreePlan;
window.upgradeToPremium = upgradeToPremium;
window.showNotification = showNotification;

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
  console.log('Inicializando auth...');
  
  // Configurar botón de logout
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.onclick = logout;
  }
  
  initializeGoogleAuth();
});

console.log('auth.js cargado');
