// app.js - NoShopiA v2.3 - SINCRONIZADO CON HTML
console.log('🚀 NoShopiA v2.3 - SINCRONIZADO CON HTML');

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
let intelligentClosetItems = { tops: {}, bottoms: {}, shoes: {} };

// ===================================================================
// SISTEMA DE DETECCIÓN IA
// ===================================================================
const INTELLIGENT_CATEGORIES = {
  tops: {
    "tshirt": { name: "Poleras", icon: "👕", keywords: ["t-shirt", "tee", "graphic", "tank top", "polera"], color: "#10b981" },
    "shirt": { name: "Camisas", icon: "👔", keywords: ["shirt", "dress shirt", "button", "collar", "camisa"], color: "#3b82f6" },
    "blouse": { name: "Blusas", icon: "👚", keywords: ["blouse", "silk blouse", "flowy", "blusa"], color: "#ec4899" },
    "sweater": { name: "Suéteres", icon: "🧥", keywords: ["sweater", "knitted", "wool", "pullover", "cardigan", "sueter"], color: "#f59e0b" },
    "hoodie": { name: "Hoodies", icon: "👘", keywords: ["hoodie", "zip-up", "sweatshirt", "hooded", "capucha"], color: "#ef4444" },
    "jacket": { name: "Chaquetas", icon: "🧥", keywords: ["jacket", "leather", "denim", "blazer", "outer", "chaqueta"], color: "#6b7280" }
  },
  bottoms: {
    "jeans": { name: "Jeans", icon: "👖", keywords: ["jeans", "denim", "blue jeans", "ripped"], color: "#1e40af" },
    "pants": { name: "Pantalones", icon: "👖", keywords: ["pants", "trousers", "formal pants", "chinos", "slacks", "pantalon"], color: "#3b82f6" },
    "skirt": { name: "Faldas", icon: "👗", keywords: ["skirt", "midi skirt", "pencil skirt", "mini skirt", "falda"], color: "#ec4899" },
    "shorts": { name: "Shorts", icon: "🩳", keywords: ["shorts", "athletic shorts", "bermuda"], color: "#10b981" }
  },
  shoes: {
    "sneakers": { name: "Zapatillas", icon: "👟", keywords: ["sneakers", "running shoes", "athletic shoes", "trainers", "zapatilla"], color: "#3b82f6" },
    "dress_shoes": { name: "Zapatos Formales", icon: "👞", keywords: ["dress shoes", "leather shoes", "formal shoes", "oxfords", "zapato"], color: "#1f2937" },
    "boots": { name: "Botas", icon: "🥾", keywords: ["boots", "ankle boots", "hiking boots", "combat boots", "bota"], color: "#92400e" }
  }
};

// ===================================================================
// FUNCIONES API BACKEND
// ===================================================================
async function checkUserExists(email) {
  try {
    const response = await fetch(`${CONFIG.API_BASE}/api/users/check/${encodeURIComponent(email)}`);
    if (response.ok) {
      const data = await response.json();
      console.log('🔍 Verificación backend:', data);
      return data;
    }
    return { exists: false, has_profile: false };
  } catch (error) {
    console.error('❌ Error verificando usuario:', error);
    return { exists: false, has_profile: false };
  }
}

async function createUserProfile(userData, profileData) {
  try {
    const response = await fetch(`${CONFIG.API_BASE}/api/users/profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user: userData, profile: profileData })
    });
    
    if (response.ok) {
      return await response.json();
    }
    throw new Error(`Error ${response.status}: ${await response.text()}`);
  } catch (error) {
    console.error('Error creando perfil:', error);
    throw error;
  }
}

async function syncWithBackend(email) {
  try {
    console.log('🔄 Sincronización crítica con backend:', email);
    const backendData = await checkUserExists(email);
    
    if (backendData.exists && backendData.has_profile) {
      console.log('✅ PERFIL VERIFICADO EN BD - NO más formularios');
      return backendData;
    }
    
    console.log('⚠️ Perfil incompleto en BD');
    return null;
  } catch (error) {
    console.error('❌ Error crítico sincronización:', error);
    return null;
  }
}

// ===================================================================
// DETECCIÓN IA AUTOMÁTICA
// ===================================================================

// ===================================================================
// DETECCIÓN IA REAL - Usando endpoint correcto /api/recommend
// ===================================================================
async function detectItemWithAI(file) {
  console.log('🤖 IA REAL analizando imagen:', file.name);
  
  try {
    showNotification('🤖 IA analizando imagen...', 'info');
    
    // Crear FormData para enviar al endpoint real
    const formData = new FormData();
    formData.append('user_email', currentUser?.email || 'temp@demo.com');
    formData.append('occasion', 'casual'); // Ocasión temporal para análisis
    formData.append('tops', file); // Enviar archivo para análisis
    
    // Llamada al endpoint REAL que existe
    const response = await fetch(`${CONFIG.API_BASE}/api/recommend`, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${await response.text()}`);
    }
    
    const data = await response.json();
    console.log('✅ Respuesta backend real:', data);
    
    // Extraer detected_item del resultado real
    const detectedItem = data.results?.[0]?.top?.detected_item;
    const confidence = data.results?.[0]?.top?.confidence;
    
    if (!detectedItem) {
      throw new Error('Backend no devolvió detected_item');
    }
    
    // Usar traductor para: "shirt" → "Camisa" 
    const translation = translateBackendItem(detectedItem);
    
    console.log(`🎯 IA REAL: "${detectedItem}" → "${translation.name}" (${Math.round(confidence * 100)}%)`);
    
    return {
      type: translation.type,
      category: translation.category,
      item: translation.name,
      confidence: confidence,
      originalBackendItem: detectedItem
    };
    
  } catch (error) {
    console.error('❌ Error en detección IA real:', error);
    
    return {
      type: 'tops',
      category: 'unknown',
      item: 'Prenda Desconocida',
      confidence: 0,
      originalBackendItem: 'unknown',
      error: error.message
    };
  }
}

async function handleIntelligentUpload(files) {
  console.log('🚀 CLOSET INTELIGENTE: Upload automático');
  
  if (!files || files.length === 0) return;
  
  showNotification('🤖 IA categorizando automáticamente...', 'info');
  
  let successCount = 0;
  
  for (const file of files) {
    try {
      const detection = await detectItemWithAI(file);
      const imageUrl = await fileToDataUrl(file);
      
      categorizeIntelligentItem(detection, imageUrl, file);
      successCount++;
      
    } catch (error) {
      console.error('❌ Error:', error);
      showNotification(`❌ Error procesando ${file.name}`, 'error');
    }
  }
  
  if (successCount > 0) {
    saveUserData();
    updateClosetUI();
    showNotification(`✅ ${successCount} prenda${successCount !== 1 ? 's' : ''} categorizadas automáticamente`, 'success');
  }
}

function categorizeIntelligentItem(detection, imageUrl, file) {
  const { type, category, item, confidence } = detection;
  
  if (!intelligentClosetItems[type][category]) {
    intelligentClosetItems[type][category] = [];
  }
  
  const intelligentItem = {
    id: Date.now() + Math.random(),
    imageUrl, file, detectedItem: item, category,
    aiDetected: true, confidence, addedAt: new Date().toISOString()
  };
  
  intelligentClosetItems[type][category].push(intelligentItem);
  
  // Agregar a arrays principales
  uploadedFiles[type].push(file);
  uploadedImages[type].push(imageUrl);
  closetItems[type].push(imageUrl);
  
  console.log(`🧠 Categorizado: ${item} → ${type}/${category}`);
}

// ===================================================================
// UTILIDADES
// ===================================================================
function showNotification(message, type = 'info') {
  console.log(`📢 ${type.toUpperCase()}: ${message}`);
  
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  setTimeout(() => notification.remove(), 4000);
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ===================================================================
// SISTEMA DE LOGIN SINCRONIZADO CON HTML
// ===================================================================
function handleMainLogin() {
  console.log('🔐 Login iniciado...');
  
  if (isLoggedIn) {
    showNotification('Ya estás logueado', 'info');
    return;
  }
  
  // Usar Google o demo
  if (typeof google !== 'undefined' && google.accounts) {
    try {
      google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          simulateLogin();
        }
      });
    } catch (error) {
      simulateLogin();
    }
  } else {
    simulateLogin();
  }
}

function simulateLogin() {
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
    const userData = { name: payload.name, email: payload.email, picture: payload.picture };
    processLogin(userData);
  } catch (error) {
    console.error('Error Google login:', error);
    showNotification('Error en login', 'error');
  }
}

// CRÍTICO: Login sincronizado con elementos HTML reales
async function processLogin(userData) {
  console.log('🔄 PROCESANDO LOGIN SINCRONIZADO CON HTML...');
  
  isLoggedIn = true;
  currentUser = userData;
  
  localStorage.setItem('noshopia_auth', JSON.stringify(userData));
  localStorage.setItem('noshopia_logged_in', 'true');
  
  // CRÍTICO: Verificar perfil desde BD
  try {
    showNotification('Verificando perfil...', 'info');
    const backendData = await syncWithBackend(userData.email);
    
    if (backendData && backendData.has_profile) {
      console.log('✅ PERFIL COMPLETO - SALTAR FORMULARIO');
      
      updateUserUI();
      loadUserData();
      
      setTimeout(() => {
        showClosetQuestion();
      }, 1000);
      
      showNotification(`Bienvenido ${userData.name}! Perfil cargado.`, 'success');
      return;
    }
  } catch (error) {
    console.error('Error BD:', error);
  }
  
  updateUserUI();
  loadUserData();
  
  setTimeout(() => {
    checkProfileAndRedirect();
  }, 1000);
  
  showNotification(`¡Bienvenido ${userData.name}!`, 'success');
}

// CRÍTICO: UI sincronizada con elementos HTML existentes
function updateUserUI() {
  console.log('🔄 ACTUALIZANDO UI SINCRONIZADA...');
  
  // OCULTAR botón header login (ID real del HTML)
  const headerLoginBtn = document.getElementById('headerLoginBtn');
  if (headerLoginBtn) {
    headerLoginBtn.style.display = 'none';
  }
  
  // MOSTRAR info usuario (ID real del HTML)
  const userInfo = document.getElementById('userInfo');
  const userName = document.getElementById('userName');
  const userAvatar = document.getElementById('userAvatar');
  
  if (userInfo) userInfo.style.display = 'flex';
  if (userName) userName.textContent = currentUser.name;
  if (userAvatar) {
    userAvatar.src = currentUser.picture;
    userAvatar.alt = currentUser.name;
  }
  
  // CONFIGURAR botón logout (ID real del HTML)
  setupLogoutButton();
  
  // MOSTRAR sección welcome
  const welcomeSection = document.getElementById('welcomeSection');
  if (welcomeSection) {
    welcomeSection.style.display = 'block';
    
    // Actualizar nombre en welcome
    const welcomeUserName = document.getElementById('welcomeUserName');
    if (welcomeUserName) {
      welcomeUserName.textContent = currentUser.name;
    }
  }
  
  console.log('✅ UI actualizada con elementos HTML reales');
}

// CRÍTICO: Usar botón logout real del HTML
function setupLogoutButton() {
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    // Cambiar texto a "Cerrar Sesión" (no "Salir")
    logoutBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Cerrar Sesión';
    logoutBtn.onclick = logout;
    console.log('✅ Botón logout HTML configurado: "Cerrar Sesión"');
  }
}

// CRÍTICO: Logout limpio sin F5
function logout() {
  console.log('👋 LOGOUT LIMPIO...');
  
  if (!confirm('¿Deseas cerrar sesión?')) return;
  
  // Limpiar estado
  isLoggedIn = false;
  currentUser = null;
  selectedOccasion = null;
  uploadedFiles = { tops: [], bottoms: [], shoes: [] };
  uploadedImages = { tops: [], bottoms: [], shoes: [] };
  closetItems = { tops: [], bottoms: [], shoes: [] };
  intelligentClosetItems = { tops: {}, bottoms: {}, shoes: {} };
  closetMode = false;
  
  localStorage.removeItem('noshopia_auth');
  localStorage.removeItem('noshopia_logged_in');
  
  // RESTAURAR botón header login
  const headerLoginBtn = document.getElementById('headerLoginBtn');
  if (headerLoginBtn) {
    headerLoginBtn.style.display = 'inline-flex';
    headerLoginBtn.innerHTML = '<i class="fab fa-google"></i> Iniciar con Google';
    headerLoginBtn.disabled = false;
    headerLoginBtn.onclick = handleMainLogin;
  }
  
  // OCULTAR info usuario
  const userInfo = document.getElementById('userInfo');
  if (userInfo) userInfo.style.display = 'none';
  
  // OCULTAR secciones
  ['welcomeSection', 'profileForm', 'closetQuestion', 'closetContainer', 'occasionSelector', 'uploadArea'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
  
  showNotification('Sesión cerrada - SIN F5', 'success');
  setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 500);
  
  console.log('✅ LOGOUT COMPLETO sin F5');
}

async function checkExistingSession() {
  try {
    const savedAuth = localStorage.getItem('noshopia_auth');
    const loggedIn = localStorage.getItem('noshopia_logged_in') === 'true';
    
    if (savedAuth && loggedIn) {
      const userData = JSON.parse(savedAuth);
      if (userData.name && userData.email) {
        console.log('🔄 Restaurando sesión:', userData.name);
        
        isLoggedIn = true;
        currentUser = userData;
        
        // Verificar BD
        try {
          const backendData = await syncWithBackend(userData.email);
          if (backendData && backendData.has_profile) {
            console.log('✅ Perfil confirmado BD');
            userProfile = backendData.profile || { completed: true };
          }
        } catch (error) {
          console.log('⚠️ BD no disponible');
        }
        
        updateUserUI();
        loadUserData();
        
        setTimeout(checkProfileAndRedirect, 1500);
        showNotification(`Bienvenido ${userData.name}`, 'success');
        return true;
      }
    }
  } catch (error) {
    console.error('Error verificando sesión:', error);
  }
  return false;
}

// ===================================================================
// FLUJO DE PERFIL
// ===================================================================
let userProfile = { skin_color: null, age_range: null, gender: null };

async function checkProfileAndRedirect() {
  console.log('🔄 VERIFICACIÓN PERFIL BD...');
  
  if (!currentUser?.email) return;
  
  try {
    const backendData = await syncWithBackend(currentUser.email);
    
    if (backendData && backendData.has_profile) {
      console.log('✅ PERFIL BD → OPCIONES');
      userProfile = backendData.profile || { completed: true };
      
      const profileForm = document.getElementById('profileForm');
      if (profileForm) profileForm.style.display = 'none';
      
      showClosetQuestion();
      showNotification('Perfil desde BD', 'success');
      return;
    }
    
    // Fallback localStorage
    const savedProfile = localStorage.getItem(`noshopia_profile_${currentUser.email}`);
    
    if (savedProfile) {
      console.log('⚠️ Solo localStorage → Sincronizar BD');
      const profileData = JSON.parse(savedProfile);
      userProfile = profileData;
      
      try {
        await createUserProfile(currentUser, profileData);
        console.log('✅ Sincronizado BD');
        
        const profileForm = document.getElementById('profileForm');
        if (profileForm) profileForm.style.display = 'none';
        
        showClosetQuestion();
        showNotification('Perfil sincronizado', 'success');
        return;
      } catch (error) {
        console.log('⚠️ Error sincronizando');
      }
    }
    
    // Mostrar formulario solo si no hay perfil
    console.log('📋 MOSTRAR FORMULARIO UNA VEZ');
    
    const welcomeSection = document.getElementById('welcomeSection');
    if (welcomeSection) welcomeSection.style.display = 'none';
    
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
      profileForm.style.display = 'block';
      setTimeout(() => {
        profileForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
        showNotification('Completa tu perfil UNA vez', 'info');
      }, 800);
    }
    
  } catch (error) {
    console.error('Error verificación:', error);
  }
}

function showClosetQuestion() {
  const closetQuestion = document.getElementById('closetQuestion');
  if (closetQuestion) {
    closetQuestion.style.display = 'block';
    
    setTimeout(() => {
      enableClosetOptions();
      closetQuestion.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 500);
  }
}

// CRÍTICO: Habilitar opciones usando IDs reales del HTML
function enableClosetOptions() {
  console.log('✅ HABILITANDO OPCIONES - IDs HTML reales...');
  
  // Botón "Mi Closet Inteligente" (ID real del HTML)
  const enableClosetBtn = document.getElementById('enableClosetBtn');
  if (enableClosetBtn) {
    enableClosetBtn.style.pointerEvents = 'auto';
    enableClosetBtn.style.opacity = '1';
    enableClosetBtn.style.cursor = 'pointer';
    enableClosetBtn.onclick = enableCloset;
    console.log('✅ "Mi Closet Inteligente" habilitado');
  }
  
  // Botón "Recomendaciones Rápidas" (ID real del HTML)
  const useDirectModeBtn = document.getElementById('useDirectModeBtn');
  if (useDirectModeBtn) {
    useDirectModeBtn.style.pointerEvents = 'auto';
    useDirectModeBtn.style.opacity = '1';
    useDirectModeBtn.style.cursor = 'pointer';
    useDirectModeBtn.onclick = useDirectMode;
    console.log('✅ "Recomendaciones Rápidas" habilitado');
  }
  
  console.log('✅ AMBAS opciones habilitadas con IDs HTML');
}

// CRÍTICO: Configurar formulario de perfil con ID real
function setupProfileForm() {
  document.querySelectorAll('.profile-option').forEach(option => {
    option.addEventListener('click', function() {
      const field = this.dataset.field;
      const value = this.dataset.value;
      
      document.querySelectorAll(`[data-field="${field}"]`).forEach(opt => 
        opt.classList.remove('selected')
      );
      
      this.classList.add('selected');
      userProfile[field] = value;
      
      const isComplete = userProfile.skin_color && userProfile.age_range && userProfile.gender;
      const createBtn = document.getElementById('createProfileBtn'); // ID real HTML
      
      if (createBtn) {
        if (isComplete) {
          createBtn.disabled = false;
          createBtn.innerHTML = '<i class="fas fa-user-plus"></i> Crear Mi Perfil';
          createBtn.style.opacity = '1';
          createBtn.onclick = submitUserProfile;
        } else {
          createBtn.disabled = true;
          createBtn.innerHTML = '<i class="fas fa-user-plus"></i> Selecciona todas las opciones';
          createBtn.style.opacity = '0.6';
        }
      }
    });
  });
}

async function submitUserProfile() {
  if (!userProfile.skin_color || !userProfile.age_range || !userProfile.gender) {
    showNotification('Completa todos los campos', 'error');
    return;
  }
  
  console.log('👤 ENVIANDO PERFIL BD...', userProfile);
  
  try {
    showNotification('Guardando en servidor...', 'info');
    await createUserProfile(currentUser, userProfile);
    console.log('✅ PERFIL CREADO BD');
    
    if (currentUser?.email) {
      localStorage.setItem(`noshopia_profile_${currentUser.email}`, JSON.stringify(userProfile));
    }
    
    showNotification('Perfil guardado - No más formularios', 'success');
    
  } catch (error) {
    console.error('Error BD:', error);
    
    if (currentUser?.email) {
      localStorage.setItem(`noshopia_profile_${currentUser.email}`, JSON.stringify(userProfile));
      showNotification('Guardado localmente', 'info');
    }
  }
  
  const profileForm = document.getElementById('profileForm');
  if (profileForm) profileForm.style.display = 'none';
  
  setTimeout(() => {
    showClosetQuestion();
    setTimeout(() => {
      const closetQuestion = document.getElementById('closetQuestion');
      if (closetQuestion) {
        closetQuestion.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 500);
  }, 1000);
  
  showNotification('¡Perfil completo!', 'success');
}

// ===================================================================
// SISTEMA DE OCASIONES
// ===================================================================
function selectOccasion(occasion) {
  console.log('📅 Ocasión:', occasion);
  selectedOccasion = occasion;
  
  document.querySelectorAll('.occasion-btn').forEach(btn => btn.classList.remove('selected'));
  const selectedBtn = document.querySelector(`[data-occasion="${occasion}"]`);
  if (selectedBtn) selectedBtn.classList.add('selected');
  
  updateGenerateButton();
  
  const names = {
    'oficina': 'Oficina/Trabajo', 'deportivo': 'Deportes/Gym',
    'casual': 'Casual', 'formal': 'Formal', 'matrimonio': 'Matrimonio'
  };
  
  showNotification(`Ocasión: ${names[occasion] || occasion}`, 'success');
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
  console.log('✨ CLOSET INTELIGENTE ACTIVADO...');
  
  if (!isLoggedIn) {
    showNotification('Debes iniciar sesión', 'error');
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
      
      // CRÍTICO: Configurar zona de upload automático
      setupAutomaticUploadZone();
      
      // Mostrar tab actual
      showClosetTab('superiores');
      
      // CRÍTICO: Configurar tabs
      setupClosetTabs();
      
    }, 500);
  }
  
  const userEmail = document.getElementById('userEmail');
  if (userEmail && currentUser) {
    userEmail.textContent = `Bienvenido ${currentUser.name}`;
  }
  
  showNotification('Closet Inteligente - IA detecta automáticamente', 'success');
  updateClosetUI();
}

function useDirectMode() {
  console.log('⚡ RECOMENDACIONES RÁPIDAS ACTIVADAS...');
  
  closetMode = false;
  
  const closetQuestion = document.getElementById('closetQuestion');
  if (closetQuestion) closetQuestion.style.display = 'none';
  
  const occasionSelector = document.getElementById('occasionSelector');
  const uploadArea = document.getElementById('uploadArea');
  
  if (occasionSelector) occasionSelector.style.display = 'block';
  if (uploadArea) uploadArea.style.display = 'block';
  
  // CRÍTICO: Configurar upload directo
  setupDirectUpload();
  
  showNotification('Recomendaciones Rápidas - Upload habilitado', 'success');
}

// CRÍTICO: Configurar zona de upload automático (ID real del HTML)
function setupAutomaticUploadZone() {
  console.log('🔧 CONFIGURANDO ZONA UPLOAD AUTOMÁTICO...');
  
  const automaticUploadZone = document.getElementById('automaticUploadZone'); // ID real HTML
  if (automaticUploadZone) {
    automaticUploadZone.style.cursor = 'pointer';
    
    automaticUploadZone.onclick = function(e) {
      e.preventDefault();
      
      if (!isLoggedIn) {
        showNotification('Debes iniciar sesión', 'error');
        return;
      }
      
      console.log('🤖 CLOSET INTELIGENTE: Upload universal iniciado');
      
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'image/*';
      fileInput.multiple = true;
      fileInput.style.display = 'none';
      
      fileInput.onchange = function(e) {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;
        
        console.log(`🤖 ${files.length} archivos para detección automática`);
        handleIntelligentUpload(files);
      };
      
      document.body.appendChild(fileInput);
      fileInput.click();
      
      setTimeout(() => {
        if (document.body.contains(fileInput)) {
          document.body.removeChild(fileInput);
        }
      }, 30000);
    };
    
    console.log('✅ Zona upload automático configurada');
  } else {
    console.error('❌ No se encontró automaticUploadZone');
  }
}

// CRÍTICO: Configurar tabs usando IDs reales del HTML
function setupClosetTabs() {
  document.querySelectorAll('.closet-tab').forEach(tab => {
    tab.addEventListener('click', function() {
      const tabId = this.dataset.tab;
      if (tabId) showClosetTab(tabId);
    });
  });
  console.log('✅ Tabs configurados');
}

function showClosetTab(tabId) {
  console.log('📂 Mostrando tab:', tabId);
  
  // Ocultar todos los contenidos
  document.querySelectorAll('.closet-tab-content').forEach(content => {
    content.classList.remove('active');
  });
  
  // Remover clase active de tabs
  document.querySelectorAll('.closet-tab').forEach(tab => {
    tab.classList.remove('active');
  });
  
  // Mostrar contenido seleccionado
  const selectedContent = document.getElementById(tabId);
  if (selectedContent) selectedContent.classList.add('active');
  
  // Activar tab seleccionado
  const selectedTab = document.querySelector(`[data-tab="${tabId}"]`);
  if (selectedTab) selectedTab.classList.add('active');
  
  // Renderizar contenido según tipo
  const typeMap = { 'superiores': 'tops', 'inferiores': 'bottoms', 'calzado': 'shoes' };
  const type = typeMap[tabId];
  
  if (type && tabId !== 'recomendaciones') {
    renderIntelligentClosetTab(tabId, type);
  } else if (tabId === 'recomendaciones') {
    renderSavedRecommendations();
  }
}

function renderIntelligentClosetTab(tabId, type) {
  const tabContent = document.getElementById(tabId);
  if (!tabContent) return;
  
  const typeItems = intelligentClosetItems[type] || {};
  const hasItems = Object.keys(typeItems).some(cat => typeItems[cat]?.length > 0);
  
  if (!hasItems) {
    const typeNames = { tops: 'superiores', bottoms: 'inferiores', shoes: 'calzado' };
    const icons = { tops: 'tshirt', bottoms: 'user-tie', shoes: 'shoe-prints' };
    
    tabContent.innerHTML = `
      <div style="text-align: center; padding: 3rem; color: #666;">
        <i class="fas fa-${icons[type]}" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
        <p>No hay ${typeNames[type]} aún</p>
        <p style="font-size: 0.9rem; opacity: 0.7;">Las prendas aparecerán aquí cuando subas fotos y la IA las detecte como ${typeNames[type]}</p>
      </div>
    `;
    return;
  }
  
  let html = '<div style="display: grid; gap: 2rem;">';
  
  Object.keys(typeItems).forEach(categoryId => {
    const categoryItems = typeItems[categoryId];
    if (!categoryItems || categoryItems.length === 0) return;
    
    const categoryInfo = INTELLIGENT_CATEGORIES[type][categoryId];
    if (!categoryInfo) return;
    
    html += `
      <div style="background: rgba(59, 130, 246, 0.05); border-radius: 15px; padding: 1.5rem; border-left: 4px solid ${categoryInfo.color};">
        <h3 style="margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
          <span style="font-size: 1.8rem;">${categoryInfo.icon}</span>
          <span style="color: ${categoryInfo.color}; font-weight: 700;">${categoryInfo.name}</span>
          <span style="background: ${categoryInfo.color}; color: white; padding: 0.3rem 0.8rem; border-radius: 15px; font-size: 0.8rem; margin-left: auto;">
            🤖 ${categoryItems.length} detectada${categoryItems.length !== 1 ? 's' : ''}
          </span>
        </h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem;">
    `;
    
    categoryItems.forEach((item, index) => {
      const confidencePercent = Math.round((item.confidence || 0.75) * 100);
      
      html += `
        <div style="position: relative; background: white; border-radius: 15px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); transition: all 0.3s ease;" onmouseover="this.style.transform='translateY(-5px)'" onmouseout="this.style.transform='translateY(0)'">
          
          <img src="${item.imageUrl}" style="width: 100%; height: 200px; object-fit: cover;" alt="${item.detectedItem}">
          
          <div style="position: absolute; top: 10px; left: 10px; background: #10b981; color: white; padding: 0.3rem 0.6rem; border-radius: 10px; font-size: 0.7rem; font-weight: 600;">
            🤖 ${confidencePercent}%
          </div>
          
          <div style="position: absolute; top: 10px; right: 10px; background: #ef4444; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; cursor: pointer;" onclick="removeIntelligentItem('${type}', '${categoryId}', ${index})">×</div>
          
          <div style="padding: 1rem;">
            <div style="font-weight: 600; color: #000; margin-bottom: 0.5rem;">${item.detectedItem}</div>
            <div style="font-size: 0.8rem; color: #10b981; font-weight: 500;">✨ Detectado por IA</div>
          </div>
        </div>
      `;
    });
    
    html += '</div></div>';
  });
  
  html += '</div>';
  tabContent.innerHTML = html;
}

function removeIntelligentItem(type, categoryId, index) {
  if (!confirm('¿Eliminar esta prenda?')) return;
  
  console.log(`🗑️ Eliminando ${type}/${categoryId}[${index}]`);
  
  if (intelligentClosetItems[type][categoryId]) {
    intelligentClosetItems[type][categoryId].splice(index, 1);
  }
  
  if (uploadedFiles[type].length > 0) uploadedFiles[type].pop();
  if (uploadedImages[type].length > 0) uploadedImages[type].pop();
  if (closetItems[type].length > 0) closetItems[type].pop();
  
  saveUserData();
  updateClosetUI();
  
  // Re-renderizar
  const activeTab = document.querySelector('.closet-tab.active');
  if (activeTab) {
    const tabId = activeTab.dataset.tab;
    const typeMap = { 'superiores': 'tops', 'inferiores': 'bottoms', 'calzado': 'shoes' };
    const currentType = typeMap[tabId];
    if (currentType) {
      renderIntelligentClosetTab(tabId, currentType);
    }
  }
  
  showNotification('Prenda eliminada', 'success');
}

// Exponer función globalmente
window.removeIntelligentItem = removeIntelligentItem;

function renderSavedRecommendations() {
  const tabContent = document.getElementById('recomendaciones');
  if (!tabContent) return;
  
  const list = document.getElementById('savedRecommendationsList');
  if (!list || savedRecommendations.length === 0) {
    if (list) {
      list.innerHTML = '<p style="text-align: center; color: #666; padding: 2rem;">Aquí aparecerán tus combinaciones favoritas</p>';
    }
    return;
  }
  
  const occasionNames = {
    'oficina': 'Oficina/Trabajo', 'deportivo': 'Deportes/Gym',
    'casual': 'Casual', 'formal': 'Formal', 'matrimonio': 'Matrimonio'
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
  list.innerHTML = html;
}

function updateClosetUI() {
  const total = getTotalClosetItems();
  const closetHeader = document.querySelector('.closet-header h2');
  if (closetHeader) {
    closetHeader.innerHTML = `Mi Closet Inteligente <span style="font-size: 0.8rem; opacity: 0.8;">(${total}/15 prendas)</span>`;
  }
  
  const stats = ['closetVisits', 'closetRecommendations', 'closetOutfits'];
  const values = [userStats.visits, userStats.recommendations, userStats.savedOutfits];
  
  stats.forEach((id, index) => {
    const el = document.getElementById(id);
    if (el) el.textContent = values[index];
  });
}

function getTotalClosetItems() {
  let total = 0;
  
  total += Object.values(closetItems).reduce((sum, items) => sum + items.length, 0);
  
  Object.values(intelligentClosetItems).forEach(typeItems => {
    Object.values(typeItems).forEach(categoryItems => {
      if (Array.isArray(categoryItems)) {
        total += categoryItems.length;
      }
    });
  });
  
  return total;
}

// ===================================================================
// SISTEMA DE UPLOAD DIRECTO SINCRONIZADO
// ===================================================================
function setupDirectUpload() {
  console.log('🔧 CONFIGURANDO UPLOAD DIRECTO...');
  
  ['tops', 'bottoms', 'shoes'].forEach(type => {
    const input = document.getElementById(`${type}-upload`); // IDs reales HTML
    if (input) {
      input.addEventListener('change', function(e) {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
          handleFileUpload(type, files);
        }
      });
      console.log(`✅ Upload directo configurado: ${type}`);
    }
  });
}

async function handleFileUpload(type, files) {
  console.log(`📤 Upload directo: ${files.length} → ${type}`);
  
  const maxFiles = { tops: 3, bottoms: 3, shoes: 5 }[type] || 3;
  const currentFiles = uploadedFiles[type].length;
  
  if (currentFiles + files.length > maxFiles) {
    showNotification(`Máximo ${maxFiles} archivos para ${type}`, 'error');
    return;
  }
  
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const invalidFiles = files.filter(file => !validTypes.includes(file.type));
  
  if (invalidFiles.length > 0) {
    showNotification('Solo JPG, PNG o WebP', 'error');
    return;
  }
  
  showNotification(`Procesando ${files.length} imagen(es)...`, 'info');
  
  for (const file of files) {
    try {
      const imageUrl = await fileToDataUrl(file);
      
      uploadedFiles[type].push(file);
      uploadedImages[type].push(imageUrl);
      closetItems[type].push(imageUrl);
      
      console.log(`✅ Procesado: ${file.name}`);
    } catch (error) {
      console.error('Error:', error);
      showNotification(`Error procesando ${file.name}`, 'error');
    }
  }
  
  updateUploadUI(type);
  updateGenerateButton();
  saveUserData();
  
  showNotification(`${files.length} imagen(es) procesadas`, 'success');
}

function updateUploadUI(type) {
  const files = uploadedFiles[type];
  const label = document.querySelector(`label[for="${type}-upload"]`);
  const preview = document.getElementById(`${type}-preview`);
  
  if (label) {
    const typeNames = { tops: 'Superiores', bottoms: 'Inferiores', shoes: 'Calzado' };
    const maxFiles = { tops: 3, bottoms: 3, shoes: 5 }[type] || 3;
    
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
        <img src="${imageUrl}" class="preview-image">
        <button onclick="removeImage('${type}', ${index})" class="remove-image">×</button>
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
  
  showNotification('Imagen eliminada', 'success');
}

// CRÍTICO: Botón generar usando ID real del HTML
function updateGenerateButton() {
  const generateBtn = document.getElementById('generateBtn'); // ID real HTML
  if (!generateBtn) return;
  
  const hasTops = uploadedFiles.tops.length > 0;
  const hasBottoms = uploadedFiles.bottoms.length > 0;
  const hasShoes = uploadedFiles.shoes.length > 0;
  const hasOccasion = selectedOccasion !== null;
  
  if (hasTops && hasBottoms && hasShoes && hasOccasion) {
    generateBtn.disabled = false;
    generateBtn.innerHTML = '<i class="fas fa-magic"></i> Generar Recomendaciones';
    generateBtn.style.opacity = '1';
    generateBtn.style.cursor = 'pointer';
    generateBtn.onclick = getRecommendation;
    console.log('✅ Botón "Generar" HABILITADO');
  } else {
    generateBtn.disabled = true;
    generateBtn.innerHTML = '<i class="fas fa-upload"></i> Completa todos los campos';
    generateBtn.style.opacity = '0.6';
    generateBtn.style.cursor = 'not-allowed';
  }
}

// ===================================================================
// API Y RECOMENDACIONES
// ===================================================================
async function getRecommendation() {
  if (!selectedOccasion) {
    showNotification('Selecciona ocasión', 'error');
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
    console.log('🚀 Enviando solicitud...');
    
    const formData = new FormData();
    formData.append('user_email', currentUser.email);
    formData.append('occasion', selectedOccasion);
    
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
      throw new Error(data.message || 'Error');
    }
    
  } catch (error) {
    clearInterval(timerInterval);
    console.error('Error:', error);
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
    'oficina': 'Oficina/Trabajo', 'deportivo': 'Deportes/Gym', 
    'casual': 'Casual', 'formal': 'Formal', 'matrimonio': 'Matrimonio'
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
          <span style="font-size: 0.9rem; opacity: 0.8;">${item.harmony_description || 'Combinación armónica'}</span>
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
    email: currentUser.email, name: currentUser.name,
    uploadedFiles, uploadedImages, closetItems, intelligentClosetItems,
    userStats, savedRecommendations, lastUpdated: new Date().toISOString()
  };
  
  localStorage.setItem(`noshopia_user_data_${currentUser.email}`, JSON.stringify(userData));
  console.log('💾 Datos guardados');
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
      intelligentClosetItems = data.intelligentClosetItems || { tops: {}, bottoms: {}, shoes: {} };
      userStats = data.userStats || { visits: 1, recommendations: 0, savedOutfits: 0 };
      savedRecommendations = data.savedRecommendations || [];
      
      console.log('✅ Datos cargados:', getTotalClosetItems(), 'prendas');
    }
  } catch (error) {
    console.error('Error cargando datos:', error);
  }
}

// ===================================================================
// PLANES
// ===================================================================
function startFreePlan() {
  console.log('🎁 Plan gratuito activado');
  showNotification('Plan gratuito activado', 'success');
  setTimeout(handleMainLogin, 1500);
}

function upgradeToPremium() {
  console.log('⭐ Upgrade premium');
  showNotification('Funcionalidad premium próximamente', 'info');
}

// ===================================================================
// INICIALIZACIÓN GOOGLE
// ===================================================================
function initializeGoogleLogin() {
  if (typeof google === 'undefined') {
    setTimeout(initializeGoogleLogin, 1000);
    return;
  }
  
  google.accounts.id.initialize({
    client_id: CONFIG.GOOGLE_CLIENT_ID,
    callback: handleGoogleCredentialResponse,
    auto_select: false,
    cancel_on_tap_outside: true
  });
  
  // Activar botón header
  const headerBtn = document.getElementById('headerLoginBtn');
  if (headerBtn) {
    headerBtn.disabled = false;
    headerBtn.style.opacity = '1';
    headerBtn.innerHTML = '<i class="fab fa-google"></i> Iniciar con Google';
    headerBtn.onclick = handleMainLogin;
  }
}

// ===================================================================
// CONFIGURACIÓN DE EVENTOS SINCRONIZADA CON HTML
// ===================================================================
function setupEventListeners() {
  console.log('🔧 CONFIGURANDO EVENT LISTENERS CON IDs HTML...');
  
  // Botones de planes (IDs reales HTML)
  const startFreePlanBtn = document.getElementById('startFreePlan');
  const upgradeToPremiumBtn = document.getElementById('upgradeToPremium');
  
  if (startFreePlanBtn) startFreePlanBtn.onclick = startFreePlan;
  if (upgradeToPremiumBtn) upgradeToPremiumBtn.onclick = upgradeToPremium;
  
  // Ocasiones
  setupOccasionButtons();
  
  // Formulario de perfil
  setupProfileForm();
  
  // Observer para barras de impacto
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
  
  console.log('✅ Event listeners configurados con IDs HTML');
}

function initializeApp() {
  console.log('🔧 INICIALIZANDO NoShopiA v2.3 SINCRONIZADO...');
  
  setTimeout(initializeGoogleLogin, 500);
  setupEventListeners();
  setTimeout(checkExistingSession, 1000);
  
  console.log('✅ NoShopiA v2.3 inicializada SINCRONIZADA con HTML');
}

// ===================================================================
// EXPOSICIÓN GLOBAL
// ===================================================================
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
window.handleGoogleCredentialResponse = handleGoogleCredentialResponse;

// ===================================================================
// AUTO-INICIALIZACIÓN
// ===================================================================
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  setTimeout(initializeApp, 100);
}

window.addEventListener('load', () => {
  if (!window.APP_INITIALIZED) {
    setTimeout(initializeApp, 500);
  }
});

window.APP_INITIALIZED = true;

console.log('✅ app.js v2.3 - COMPLETAMENTE SINCRONIZADO CON HTML');
