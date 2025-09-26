// ===================================================================
// SOLUCIÓN DEFINITIVA - AUTENTICACIÓN CORREGIDA PARA TODOS LOS NAVEGADORES
// ===================================================================

(function() {
  'use strict';
  
  console.log('🔧 INICIALIZANDO SISTEMA DE AUTENTICACIÓN CORREGIDO...');
  
  // VARIABLES GLOBALES DE ESTADO
  let googleInitialized = false;
  let authSystemReady = false;
  
  // ===================================================================
  // 1. INICIALIZACIÓN CORRECTA DE GOOGLE SIGN-IN
  // ===================================================================
  function initializeGoogleAuth() {
    console.log('📡 Inicializando Google Sign-In...');
    
    // Verificar que Google API esté disponible
    if (typeof google === 'undefined' || !google.accounts) {
      console.warn('⚠️ Google API no disponible, configurando botón manual...');
      setupManualLoginButton();
      return;
    }
    
    try {
      // Inicializar con el Client ID correcto
      google.accounts.id.initialize({
        client_id: CONFIG.GOOGLE_CLIENT_ID,
        callback: handleGoogleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true
      });
      
      googleInitialized = true;
      console.log('✅ Google Sign-In inicializado correctamente');
      setupGoogleLoginButton();
      
    } catch (error) {
      console.error('❌ Error inicializando Google Sign-In:', error);
      setupManualLoginButton();
    }
  }
  
  // ===================================================================
  // 2. CONFIGURACIÓN DE BOTÓN DE LOGIN REAL (NO DEMO)
  // ===================================================================
  function setupGoogleLoginButton() {
    const loginBtn = document.getElementById('headerLoginBtn');
    if (!loginBtn) return;
    
    // Habilitar botón con texto correcto
    loginBtn.disabled = false;
    loginBtn.style.opacity = '1';
    loginBtn.innerHTML = '<i class="fab fa-google"></i> Iniciar Sesión con Google';
    
    // REMOVER TODOS los event listeners anteriores
    const newBtn = loginBtn.cloneNode(true);
    loginBtn.parentNode.replaceChild(newBtn, loginBtn);
    
    // Agregar nuevo event listener para Google Sign-In
    newBtn.addEventListener('click', function(e) {
      e.preventDefault();
      console.log('🔐 Iniciando Google Sign-In...');
      
      if (googleInitialized && google.accounts) {
        try {
          google.accounts.id.prompt((notification) => {
            if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
              console.log('📱 Prompt no mostrado, abriendo selector manual...');
              // Fallback a selector manual de Google
              showGoogleAccountSelector();
            }
          });
        } catch (error) {
          console.error('❌ Error con Google prompt:', error);
          showGoogleAccountSelector();
        }
      } else {
        console.warn('⚠️ Google no inicializado, mostrando selector manual...');
        showGoogleAccountSelector();
      }
    });
    
    console.log('✅ Botón de Google Sign-In configurado');
  }
  
  // ===================================================================
  // 3. CONFIGURACIÓN DE BOTÓN MANUAL (SIN SALTO A DEMO)
  // ===================================================================
  function setupManualLoginButton() {
    const loginBtn = document.getElementById('headerLoginBtn');
    if (!loginBtn) return;
    
    // Habilitar botón con texto de login manual
    loginBtn.disabled = false;
    loginBtn.style.opacity = '1';
    loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Iniciar Sesión';
    
    // REMOVER TODOS los event listeners anteriores
    const newBtn = loginBtn.cloneNode(true);
    loginBtn.parentNode.replaceChild(newBtn, loginBtn);
    
    // Agregar event listener para login manual
    newBtn.addEventListener('click', function(e) {
      e.preventDefault();
      console.log('🔐 Iniciando proceso de login manual...');
      showManualLoginDialog();
    });
    
    console.log('✅ Botón de login manual configurado');
  }
  
  // ===================================================================
  // 4. SELECTOR DE CUENTA DE GOOGLE
  // ===================================================================
  function showGoogleAccountSelector() {
    console.log('📱 Mostrando selector de cuenta de Google...');
    
    // Crear overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      z-index: 10001;
      display: flex;
      align-items: center;
      justify-content: center;
    `;
    
    // Crear modal
    const modal = document.createElement('div');
    modal.style.cssText = `
      background: white;
      border-radius: 20px;
      padding: 3rem 2rem;
      max-width: 400px;
      width: 90%;
      text-align: center;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    `;
    
    modal.innerHTML = `
      <h3 style="color: #000; margin-bottom: 1rem;">🔐 Iniciar Sesión</h3>
      <p style="color: #666; margin-bottom: 2rem;">Elige una opción para continuar:</p>
      
      <button id="tryGoogleAgain" style="
        width: 100%;
        padding: 1rem;
        background: #4285f4;
        color: white;
        border: none;
        border-radius: 10px;
        font-weight: 600;
        margin-bottom: 1rem;
        cursor: pointer;
      ">
        <i class="fab fa-google"></i> Intentar Google Sign-In
      </button>
      
      <button id="useDemoMode" style="
        width: 100%;
        padding: 1rem;
        background: #f59e0b;
        color: white;
        border: none;
        border-radius: 10px;
        font-weight: 600;
        margin-bottom: 1rem;
        cursor: pointer;
      ">
        🧪 Modo Demo (Solo prueba)
      </button>
      
      <button id="closeModal" style="
        width: 100%;
        padding: 0.8rem;
        background: transparent;
        color: #666;
        border: 1px solid #ddd;
        border-radius: 10px;
        cursor: pointer;
      ">
        Cancelar
      </button>
    `;
    
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    // Event listeners del modal
    document.getElementById('tryGoogleAgain').onclick = () => {
      document.body.removeChild(overlay);
      retryGoogleSignIn();
    };
    
    document.getElementById('useDemoMode').onclick = () => {
      document.body.removeChild(overlay);
      console.log('🧪 Usuario eligió modo demo');
      activateDemoUser();
    };
    
    document.getElementById('closeModal').onclick = () => {
      document.body.removeChild(overlay);
    };
    
    overlay.onclick = (e) => {
      if (e.target === overlay) {
        document.body.removeChild(overlay);
      }
    };
  }
  
  // ===================================================================
  // 5. DIALOG DE LOGIN MANUAL
  // ===================================================================
  function showManualLoginDialog() {
    console.log('📱 Mostrando dialog de login manual...');
    
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      z-index: 10001;
      display: flex;
      align-items: center;
      justify-content: center;
    `;
    
    const modal = document.createElement('div');
    modal.style.cssText = `
      background: white;
      border-radius: 20px;
      padding: 3rem 2rem;
      max-width: 500px;
      width: 90%;
      text-align: center;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    `;
    
    modal.innerHTML = `
      <h3 style="color: #000; margin-bottom: 1rem;">🔐 Opciones de Acceso</h3>
      <p style="color: #666; margin-bottom: 2rem;">Selecciona cómo quieres acceder a NoShopiA:</p>
      
      <div style="margin-bottom: 1rem;">
        <input type="email" id="userEmail" placeholder="tu@email.com" style="
          width: 100%;
          padding: 1rem;
          border: 2px solid #ddd;
          border-radius: 10px;
          font-size: 1rem;
          margin-bottom: 1rem;
        ">
        <input type="text" id="userName" placeholder="Tu nombre" style="
          width: 100%;
          padding: 1rem;
          border: 2px solid #ddd;
          border-radius: 10px;
          font-size: 1rem;
          margin-bottom: 1rem;
        ">
      </div>
      
      <button id="loginManual" style="
        width: 100%;
        padding: 1rem;
        background: #10b981;
        color: white;
        border: none;
        border-radius: 10px;
        font-weight: 600;
        margin-bottom: 1rem;
        cursor: pointer;
      ">
        ✅ Crear Cuenta Manual
      </button>
      
      <button id="loginDemo" style="
        width: 100%;
        padding: 1rem;
        background: #f59e0b;
        color: white;
        border: none;
        border-radius: 10px;
        font-weight: 600;
        margin-bottom: 1rem;
        cursor: pointer;
      ">
        🧪 Usar Modo Demo
      </button>
      
      <button id="closeManualModal" style="
        width: 100%;
        padding: 0.8rem;
        background: transparent;
        color: #666;
        border: 1px solid #ddd;
        border-radius: 10px;
        cursor: pointer;
      ">
        Cancelar
      </button>
    `;
    
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    // Event listeners
    document.getElementById('loginManual').onclick = () => {
      const email = document.getElementById('userEmail').value.trim();
      const name = document.getElementById('userName').value.trim();
      
      if (email && name) {
        document.body.removeChild(overlay);
        activateManualUser(email, name);
      } else {
        alert('Por favor completa todos los campos');
      }
    };
    
    document.getElementById('loginDemo').onclick = () => {
      document.body.removeChild(overlay);
      activateDemoUser();
    };
    
    document.getElementById('closeManualModal').onclick = () => {
      document.body.removeChild(overlay);
    };
  }
  
  // ===================================================================
  // 6. FUNCIONES DE ACTIVACIÓN DE USUARIO
  // ===================================================================
  function retryGoogleSignIn() {
    console.log('🔄 Reintentando Google Sign-In...');
    if (googleInitialized && google.accounts) {
      google.accounts.id.prompt();
    } else {
      initializeGoogleAuth();
    }
  }
  
  function activateManualUser(email, name) {
    console.log('👤 Activando usuario manual:', email);
    
    // Simular usuario manual
    const user = {
      email: email,
      name: name,
      picture: 'https://via.placeholder.com/40/3b82f6/ffffff?text=' + name.charAt(0).toUpperCase(),
      manual: true
    };
    
    // Activar sesión
    activateUserSession(user);
  }
  
  function activateDemoUser() {
    console.log('🧪 Activando modo demo...');
    
    const demoUser = {
      email: 'demo@noshopia.com',
      name: 'Usuario Demo',
      picture: 'https://via.placeholder.com/40/f59e0b/ffffff?text=D',
      demo: true
    };
    
    activateUserSession(demoUser);
  }
  
  function activateUserSession(user) {
    console.log('✅ Activando sesión de usuario:', user.name);
    
    // Actualizar variables globales
    window.isLoggedIn = true;
    window.currentUser = user;
    
    // Actualizar UI
    updateAuthUI(user);
    
    // Mostrar secciones apropiadas
    showUserSections();
    
    // Configurar event listeners de la aplicación
    setupAppEventListeners();
    
    console.log('🎉 Usuario activado correctamente');
  }
  
  // ===================================================================
  // 7. ACTUALIZACIÓN DE UI
  // ===================================================================
  function updateAuthUI(user) {
    // Ocultar botón de login
    const loginBtn = document.getElementById('headerLoginBtn');
    if (loginBtn) {
      loginBtn.style.display = 'none';
    }
    
    // Mostrar info de usuario
    const userInfo = document.getElementById('userInfo');
    const userAvatar = document.getElementById('userAvatar');
    const userName = document.getElementById('userName');
    
    if (userInfo && userAvatar && userName) {
      userInfo.style.display = 'flex';
      userAvatar.src = user.picture;
      userName.textContent = user.name;
      
      // Configurar botón de logout
      const logoutBtn = document.getElementById('logoutBtn');
      if (logoutBtn) {
        logoutBtn.onclick = logout;
      }
    }
  }
  
  function showUserSections() {
    // Mostrar sección de bienvenida
    const welcomeSection = document.getElementById('welcomeSection');
    if (welcomeSection) {
      welcomeSection.style.display = 'block';
      
      // Actualizar nombre en bienvenida
      const welcomeUserName = document.getElementById('welcomeUserName');
      if (welcomeUserName && window.currentUser) {
        welcomeUserName.textContent = window.currentUser.name;
      }
    }
    
    // Mostrar formulario de perfil si es necesario
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
      profileForm.style.display = 'block';
    }
  }
  
  // ===================================================================
  // 8. CONFIGURACIÓN DE EVENT LISTENERS DE LA APP
  // ===================================================================
  function setupAppEventListeners() {
    console.log('🔧 Configurando event listeners de la aplicación...');
    
    // Configurar botones del closet
    setupClosetButtons();
    
    // Configurar botones de ocasiones
    setupOccasionButtons();
    
    // Configurar formulario de perfil
    setupProfileForm();
  }
  
  function setupClosetButtons() {
    const enableClosetBtn = document.getElementById('enableClosetBtn');
    const useDirectModeBtn = document.getElementById('useDirectModeBtn');
    
    if (enableClosetBtn) {
      enableClosetBtn.onclick = () => {
        console.log('✨ Activando modo closet...');
        // Aquí iría la lógica del closet
        if (typeof enableCloset === 'function') {
          enableCloset();
        }
      };
    }
    
    if (useDirectModeBtn) {
      useDirectModeBtn.onclick = () => {
        console.log('⚡ Activando modo directo...');
        // Aquí iría la lógica del modo directo
        if (typeof useDirectMode === 'function') {
          useDirectMode();
        }
      };
    }
  }
  
  function setupOccasionButtons() {
    const occasionBtns = document.querySelectorAll('.occasion-btn');
    occasionBtns.forEach(btn => {
      btn.onclick = (e) => {
        const occasion = btn.dataset.occasion;
        console.log('📅 Ocasión seleccionada:', occasion);
        
        // Actualizar UI
        occasionBtns.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        
        // Actualizar variable global
        window.selectedOccasion = occasion;
      };
    });
  }
  
  function setupProfileForm() {
    const profileOptions = document.querySelectorAll('.profile-option');
    const createProfileBtn = document.getElementById('createProfileBtn');
    let selectedOptions = {};
    
    profileOptions.forEach(option => {
      option.onclick = () => {
        const field = option.dataset.field;
        const value = option.dataset.value;
        
        // Deseleccionar otros de la misma categoría
        profileOptions.forEach(opt => {
          if (opt.dataset.field === field) {
            opt.classList.remove('selected');
          }
        });
        
        // Seleccionar actual
        option.classList.add('selected');
        selectedOptions[field] = value;
        
        // Verificar si todos están seleccionados
        const requiredFields = ['skin_color', 'age_range', 'gender'];
        const allSelected = requiredFields.every(field => selectedOptions[field]);
        
        if (createProfileBtn) {
          if (allSelected) {
            createProfileBtn.disabled = false;
            createProfileBtn.style.opacity = '1';
            createProfileBtn.innerHTML = '<i class="fas fa-user-plus"></i> Crear Perfil';
          } else {
            createProfileBtn.disabled = true;
            createProfileBtn.style.opacity = '0.6';
            createProfileBtn.innerHTML = '<i class="fas fa-user-plus"></i> Selecciona todas las opciones';
          }
        }
      };
    });
    
    if (createProfileBtn) {
      createProfileBtn.onclick = () => {
        console.log('👤 Creando perfil:', selectedOptions);
        
        // Guardar perfil
        if (window.currentUser) {
          window.currentUser.profile = selectedOptions;
        }
        
        // Continuar con el flujo
        const profileForm = document.getElementById('profileForm');
        const closetQuestion = document.getElementById('closetQuestion');
        
        if (profileForm) profileForm.style.display = 'none';
        if (closetQuestion) closetQuestion.style.display = 'block';
      };
    }
  }
  
  // ===================================================================
  // 9. FUNCIÓN DE LOGOUT
  // ===================================================================
  function logout() {
    console.log('🚪 Cerrando sesión...');
    
    // Limpiar variables globales
    window.isLoggedIn = false;
    window.currentUser = null;
    
    // Limpiar Google Sign-In si está disponible
    if (googleInitialized && google.accounts) {
      google.accounts.id.disableAutoSelect();
    }
    
    // Recargar página para resetear estado
    window.location.reload();
  }
  
  // ===================================================================
  // 10. MANEJO DE RESPUESTA DE GOOGLE
  // ===================================================================
  function handleGoogleCredentialResponse(response) {
    console.log('📨 Respuesta de Google recibida');
    
    try {
      // Decodificar token JWT
      const payload = JSON.parse(atob(response.credential.split('.')[1]));
      
      const user = {
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        google: true
      };
      
      console.log('✅ Usuario de Google autenticado:', user.name);
      activateUserSession(user);
      
    } catch (error) {
      console.error('❌ Error procesando respuesta de Google:', error);
      showGoogleAccountSelector();
    }
  }
  
  // ===================================================================
  // 11. INICIALIZACIÓN AUTOMÁTICA
  // ===================================================================
  function initialize() {
    console.log('🚀 Iniciando sistema de autenticación...');
    
    // Esperar a que la página esté lista
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initialize);
      return;
    }
    
    // Esperar a que Google API esté disponible
    const checkGoogleAPI = () => {
      if (typeof google !== 'undefined' && google.accounts) {
        initializeGoogleAuth();
      } else if (authSystemReady) {
        // Si ya pasó suficiente tiempo, configurar login manual
        setupManualLoginButton();
      } else {
        setTimeout(checkGoogleAPI, 500);
      }
    };
    
    // Dar tiempo para que Google API se cargue
    setTimeout(() => {
      authSystemReady = true;
      checkGoogleAPI();
    }, 2000);
    
    // Empezar a verificar inmediatamente también
    checkGoogleAPI();
  }
  
  // Exponer funciones globales necesarias
  window.handleGoogleCredentialResponse = handleGoogleCredentialResponse;
  window.logout = logout;
  
  // Inicializar automáticamente
  initialize();
  
  console.log('✅ Sistema de autenticación configurado');
  
})();
