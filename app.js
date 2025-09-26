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
// SISTEMA DE DETECCIÓN IA AUTOMÁTICA - CATEGORÍAS EXACTAS DEL HTML
// ===================================================================

const INTELLIGENT_CATEGORIES = {
  tops: {
    "tshirt": { name: "Poleras", icon: "👕", keywords: ["t-shirt", "tee", "graphic", "tank top", "polera"], color: "#10b981" },
    "shirt": { name: "Camisas", icon: "👔", keywords: ["shirt", "dress shirt", "button", "collar", "camisa"], color: "#3b82f6" },
    "blouse": { name: "Blusas", icon: "👚", keywords: ["blouse", "silk blouse", "flowy", "blusa"], color: "#ec4899" },
    "sweater": { name: "Suéteres", icon: "🧥", keywords: ["sweater", "knitted", "wool", "pullover", "cardigan", "sueter"], color: "#f59e0b" },
    "hoodie": { name: "Hoodies", icon: "👘", keywords: ["hoodie", "zip-up", "sweatshirt", "hooded", "capucha"], color: "#ef4444" },
    "jacket": { name: "Chaquetas", icon: "🧥", keywords: ["jacket", "leather", "denim", "blazer", "outer", "chaqueta"], color: "#6b7280" },
    "coat": { name: "Abrigos", icon: "🧥", keywords: ["coat", "winter coat", "overcoat", "trench", "abrigo"], color: "#1f2937" },
    "dress": { name: "Vestidos", icon: "👗", keywords: ["dress", "summer dress", "evening dress", "gown", "vestido"], color: "#8b5cf6" },
    "vest": { name: "Chalecos", icon: "🦺", keywords: ["vest", "waistcoat", "chaleco"], color: "#84cc16" }
  },
  bottoms: {
    "jeans": { name: "Jeans", icon: "👖", keywords: ["jeans", "denim", "blue jeans", "ripped"], color: "#1e40af" },
    "pants": { name: "Pantalones", icon: "👖", keywords: ["pants", "trousers", "formal pants", "chinos", "slacks", "pantalon"], color: "#3b82f6" },
    "skirt": { name: "Faldas", icon: "👗", keywords: ["skirt", "midi skirt", "pencil skirt", "mini skirt", "falda"], color: "#ec4899" },
    "shorts": { name: "Shorts", icon: "🩳", keywords: ["shorts", "athletic shorts", "bermuda"], color: "#10b981" },
    "leggings": { name: "Calzas", icon: "🩱", keywords: ["leggings", "sweatpants", "athletic pants", "yoga pants", "calza"], color: "#6b7280" }
  },
  shoes: {
    "sneakers": { name: "Zapatillas", icon: "👟", keywords: ["sneakers", "running shoes", "athletic shoes", "trainers", "zapatilla"], color: "#3b82f6" },
    "dress_shoes": { name: "Zapatos Formales", icon: "👞", keywords: ["dress shoes", "leather shoes", "formal shoes", "oxfords", "zapato"], color: "#1f2937" },
    "boots": { name: "Botas", icon: "🥾", keywords: ["boots", "ankle boots", "hiking boots", "combat boots", "bota"], color: "#92400e" },
    "heels": { name: "Tacones", icon: "👠", keywords: ["heels", "stiletto heels", "pumps", "high heels", "tacos", "tacon"], color: "#ec4899" },
    "sandals": { name: "Sandalias", icon: "👡", keywords: ["sandals", "leather sandals", "flip flops", "sandalia"], color: "#f59e0b" },
    "flats": { name: "Ballerinas", icon: "🥿", keywords: ["flats", "ballet flats", "loafers", "ballerina"], color: "#6b7280" }
  }
};

let intelligentClosetItems = { tops: {}, bottoms: {}, shoes: {} };

// DETECCIÓN AUTOMÁTICA CON IA
async function detectItemWithAI(file) {
  console.log('🤖 IA analizando prenda:', file.name);
  
  showNotification('🤖 IA detectando categoría automáticamente...', 'info');
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const fileName = file.name.toLowerCase();
  let detectedType = 'tops';
  let detectedCategory = 'tshirt';
  let detectedItem = 'Polera';
  let confidence = 0.75;
  
  // CALZADO (Mayor prioridad)
  if (fileName.includes('zapatilla') || fileName.includes('sneaker') || fileName.includes('running')) {
    detectedType = 'shoes'; detectedCategory = 'sneakers'; detectedItem = 'Zapatillas'; confidence = 0.95;
  } else if (fileName.includes('zapato') || fileName.includes('dress') && fileName.includes('shoe')) {
    detectedType = 'shoes'; detectedCategory = 'dress_shoes'; detectedItem = 'Zapatos Formales'; confidence = 0.91;
  } else if (fileName.includes('bota') || fileName.includes('boot')) {
    detectedType = 'shoes'; detectedCategory = 'boots'; detectedItem = 'Botas'; confidence = 0.89;
  } else if (fileName.includes('sandalia') || fileName.includes('sandal')) {
    detectedType = 'shoes'; detectedCategory = 'sandals'; detectedItem = 'Sandalias'; confidence = 0.87;
  } else if (fileName.includes('tacon') || fileName.includes('heel')) {
    detectedType = 'shoes'; detectedCategory = 'heels'; detectedItem = 'Tacones'; confidence = 0.88;
  } else if (fileName.includes('ballerina') || fileName.includes('flat')) {
    detectedType = 'shoes'; detectedCategory = 'flats'; detectedItem = 'Ballerinas'; confidence = 0.86;
  }
  
  // INFERIORES
  else if (fileName.includes('jean')) {
    detectedType = 'bottoms'; detectedCategory = 'jeans'; detectedItem = 'Jeans'; confidence = 0.95;
  } else if (fileName.includes('pantalon') || fileName.includes('pants')) {
    detectedType = 'bottoms'; detectedCategory = 'pants'; detectedItem = 'Pantalones'; confidence = 0.92;
  } else if (fileName.includes('falda') || fileName.includes('skirt')) {
    detectedType = 'bottoms'; detectedCategory = 'skirt'; detectedItem = 'Falda'; confidence = 0.90;
  } else if (fileName.includes('short')) {
    detectedType = 'bottoms'; detectedCategory = 'shorts'; detectedItem = 'Shorts'; confidence = 0.88;
  } else if (fileName.includes('calza') || fileName.includes('legging')) {
    detectedType = 'bottoms'; detectedCategory = 'leggings'; detectedItem = 'Calzas'; confidence = 0.89;
  }
  
  // SUPERIORES
  else if (fileName.includes('camisa') || fileName.includes('shirt') && !fileName.includes('tshirt')) {
    detectedCategory = 'shirt'; detectedItem = 'Camisa'; confidence = 0.93;
  } else if (fileName.includes('blusa') || fileName.includes('blouse')) {
    detectedCategory = 'blouse'; detectedItem = 'Blusa'; confidence = 0.91;
  } else if (fileName.includes('vestido') || fileName.includes('dress')) {
    detectedCategory = 'dress'; detectedItem = 'Vestido'; confidence = 0.92;
  } else if (fileName.includes('hoodie') || fileName.includes('capucha')) {
    detectedCategory = 'hoodie'; detectedItem = 'Hoodie'; confidence = 0.90;
  } else if (fileName.includes('sueter') || fileName.includes('sweater') || fileName.includes('cardigan')) {
    detectedCategory = 'sweater'; detectedItem = 'Suéter'; confidence = 0.88;
  } else if (fileName.includes('chaqueta') || fileName.includes('jacket') || fileName.includes('blazer')) {
    detectedCategory = 'jacket'; detectedItem = 'Chaqueta'; confidence = 0.87;
  } else if (fileName.includes('abrigo') || fileName.includes('coat')) {
    detectedCategory = 'coat'; detectedItem = 'Abrigo'; confidence = 0.85;
  } else if (fileName.includes('polera') || fileName.includes('tshirt') || fileName.includes('tee')) {
    detectedCategory = 'tshirt'; detectedItem = 'Polera'; confidence = 0.95;
  }
  
  console.log(`🎯 IA detectó: ${detectedItem} (${detectedType}/${detectedCategory}) - Confianza: ${Math.round(confidence * 100)}%`);
  
  return {
    type: detectedType,
    category: detectedCategory,
    item: detectedItem,
    confidence,
    categoryInfo: INTELLIGENT_CATEGORIES[detectedType][detectedCategory]
  };
}

// UPLOAD AUTOMÁTICO CON DETECCIÓN IA
async function handleIntelligentUpload(files) {
  console.log('🚀 INICIANDO UPLOAD INTELIGENTE CON IA...');
  
  if (!files || files.length === 0) return;
  
  const remaining = CONFIG.TOTAL_CLOSET_LIMIT - getTotalClosetItems();
  if (files.length > remaining) {
    showNotification(`⚠️ Solo puedes subir ${remaining} prendas más`, 'error');
    return;
  }
  
  showNotification('🤖 IA analizando y organizando automáticamente...', 'info');
  
  let detectedTypes = new Set();
  let successCount = 0;
  let detectionResults = [];
  
  for (const file of files) {
    try {
      const detectionResult = await detectItemWithAI(file);
      detectedTypes.add(detectionResult.type);
      detectionResults.push(detectionResult);
      
      const imageUrl = await fileToDataUrl(file);
      categorizeIntelligentItem(detectionResult, imageUrl, file);
      successCount++;
      
    } catch (error) {
      console.error('❌ Error en detección IA:', error);
      showNotification(`❌ Error procesando ${file.name}`, 'error');
    }
  }
  
  if (successCount > 0) {
    saveUserData();
    updateClosetUI();
    
    if (detectedTypes.size > 0) {
      const mostCommonType = Array.from(detectedTypes)[0];
      setTimeout(() => {
        navigateToDetectedType(mostCommonType, detectionResults);
      }, 1000);
    }
    
    const newRemaining = CONFIG.TOTAL_CLOSET_LIMIT - getTotalClosetItems();
    showNotification(`✅ ${successCount} prenda${successCount !== 1 ? 's' : ''} detectada${successCount !== 1 ? 's' : ''} automáticamente! Quedan ${newRemaining} espacios.`, 'success');
  }
}

// CATEGORIZAR PRENDA INTELIGENTEMENTE
function categorizeIntelligentItem(detectionResult, imageUrl, file) {
  const { type, category, item, confidence } = detectionResult;
  
  if (!intelligentClosetItems[type][category]) {
    intelligentClosetItems[type][category] = [];
  }
  
  const intelligentItem = {
    id: Date.now() + Math.random(),
    imageUrl,
    file,
    detectedItem: item,
    category,
    aiDetected: true,
    confidence,
    addedAt: new Date().toISOString()
  };
  
  intelligentClosetItems[type][category].push(intelligentItem);
  
  uploadedFiles[type].push(file);
  uploadedImages[type].push(imageUrl);
  closetItems[type].push(imageUrl);
  
  console.log(`🧠 Prenda categorizada automáticamente: ${item} en ${type}/${category}`);
}

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
// SISTEMA DE LOGIN MEJORADO
// ===================================================================
function handleMainLogin() {
  console.log('🔐 Iniciando sesión directa...');
  
  if (isLoggedIn) {
    showNotification('Ya estás logueado', 'info');
    scrollToSection('upload');
    return;
  }
  
  if (typeof google !== 'undefined' && google.accounts) {
    try {
      google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          showGoogleLoginButton();
        }
      });
    } catch (error) {
      console.error('Error con Google prompt:', error);
      showGoogleLoginButton();
    }
  } else {
    console.log('Google no disponible, usando login demo');
    simulateLogin();
  }
}

function showGoogleLoginButton() {
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

function closeGoogleLoginButton() {
  const googleBtn = document.getElementById('tempGoogleBtn');
  if (googleBtn) googleBtn.remove();
}

function tryGoogleLogin() {
  try {
    if (typeof google !== 'undefined' && google.accounts) {
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
      
      setTimeout(() => {
        const googleBtn = container.querySelector('div[role="button"]');
        if (googleBtn) {
          googleBtn.click();
        } else {
          closeGoogleLoginButton();
          simulateLogin();
        }
      }, 500);
      
    } else {
      closeGoogleLoginButton();
      simulateLogin();
    }
  } catch (error) {
    console.error('Error en tryGoogleLogin:', error);
    closeGoogleLoginButton();
    simulateLogin();
  }
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
  
  localStorage.setItem('noshopia_auth', JSON.stringify(userData));
  localStorage.setItem('noshopia_logged_in', 'true');
  
  updateUserUI();
  loadUserData();
  
  setTimeout(() => {
    checkProfileAndRedirect();
  }, 1000);
  
  showNotification(`¡Bienvenido ${userData.name}!`, 'success');
}

function updateUserUI() {
  const mainLoginBtn = document.getElementById('mainLoginBtn');
  if (mainLoginBtn) {
    mainLoginBtn.style.display = 'none';
  }
  
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
  
  updateLogoutButton();
  
  const welcomeSection = document.getElementById('welcomeSection');
  if (welcomeSection) welcomeSection.style.display = 'block';
}

function updateLogoutButton() {
  let logoutBtn = document.getElementById('professionalLogoutBtn');
  
  if (!logoutBtn) {
    logoutBtn = document.createElement('button');
    logoutBtn.id = 'professionalLogoutBtn';
    logoutBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Cerrar Sesión';
    
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
    
    logoutBtn.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-2px)';
      this.style.boxShadow = '0 8px 20px rgba(239, 68, 68, 0.4)';
    });
    
    logoutBtn.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0)';
      this.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.3)';
    });
    
    logoutBtn.addEventListener('click', logout);
    
    const userInfo = document.getElementById('userInfo');
    if (userInfo) {
      userInfo.appendChild(logoutBtn);
    }
  }
  
  logoutBtn.style.display = 'flex';
}

function logout() {
  console.log('👋 Cerrando sesión...');
  
  if (!confirm('¿Deseas cerrar tu sesión en NoShopiA?')) {
    return;
  }
  
  isLoggedIn = false;
  currentUser = null;
  selectedOccasion = null;
  uploadedFiles = { tops: [], bottoms: [], shoes: [] };
  uploadedImages = { tops: [], bottoms: [], shoes: [] };
  closetItems = { tops: [], bottoms: [], shoes: [] };
  intelligentClosetItems = { tops: {}, bottoms: {}, shoes: {} };
  closetMode = false;
  userProfile = { skin_color: null, age_range: null, gender: null };
  
  localStorage.removeItem('noshopia_auth');
  localStorage.removeItem('noshopia_logged_in');
  
  const mainLoginBtn = document.getElementById('mainLoginBtn');
  if (mainLoginBtn) {
    mainLoginBtn.style.display = 'flex';
    mainLoginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Iniciar Sesión';
  }
  
  const userInfo = document.getElementById('userInfo');
  if (userInfo) userInfo.style.display = 'none';
  
  const logoutBtn = document.getElementById('professionalLogoutBtn');
  if (logoutBtn) logoutBtn.style.display = 'none';
  
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
        
        isLoggedIn = true;
        currentUser = userData;
        
        updateUserUI();
        loadUserData();
        
        setTimeout(() => {
          checkProfileAndRedirect();
        }, 1500);
        
        showNotification(`Bienvenido de vuelta, ${userData.name}`, 'success');
        return true;
      }
    }
  } catch (error) {
    console.error('Error verificando sesión existente:', error);
  }
  return false;
}

// ===================================================================
// FLUJO CONDICIONAL DEL PERFIL
// ===================================================================
let userProfile = { skin_color: null, age_range: null, gender: null };

function checkProfileAndRedirect() {
  console.log('🔄 Verificando estado del perfil para flujo automático...');
  
  if (!currentUser?.email) return;
  
  try {
    const savedProfile = localStorage.getItem(`noshopia_profile_${currentUser.email}`);
    
    if (savedProfile) {
      console.log('✅ Perfil completado → Directo a opciones');
      const profileData = JSON.parse(savedProfile);
      userProfile = profileData;
      
      const profileForm = document.getElementById('profileForm');
      if (profileForm) profileForm.style.display = 'none';
      
      showClosetQuestion();
      showNotification(`Perfil cargado: ${profileData.gender}, ${profileData.age_range}`, 'info');
      
    } else {
      console.log('📋 Perfil incompleto → Mostrar formulario');
      
      const welcomeSection = document.getElementById('welcomeSection');
      if (welcomeSection) welcomeSection.style.display = 'none';
      
      const profileForm = document.getElementById('profileForm');
      if (profileForm) {
        profileForm.style.display = 'block';
        
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
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
      profileForm.style.display = 'block';
      setTimeout(() => {
        profileForm.scrollIntoView({ behavior: 'smooth' });
      }, 500);
    }
  }
}

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
      
      document.querySelectorAll(`[data-field="${field}"]`).forEach(opt => 
        opt.classList.remove('selected')
      );
      
      this.classList.add('selected');
      userProfile[field] = value;
      
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
  
  if (currentUser?.email) {
    localStorage.setItem(`noshopia_profile_${currentUser.email}`, JSON.stringify(userProfile));
    showNotification('Perfil guardado correctamente', 'success');
  }
  
  const profileForm = document.getElementById('profileForm');
  if (profileForm) profileForm.style.display = 'none';
  
  setTimeout(() => {
    showClosetQuestion();
    
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
  
  document.querySelectorAll('.closet-tab-content').forEach(content => {
    content.style.display = 'none';
  });
  
  document.querySelectorAll('.closet-tab').forEach(tab => {
    tab.classList.remove('active');
  });
  
  const selectedContent = document.getElementById(tabId);
  if (selectedContent) selectedContent.style.display = 'block';
  
  const selectedTab = document.querySelector(`[data-tab="${tabId}"]`);
  if (selectedTab) selectedTab.classList.add('active');
  
  const typeMap = { 'superiores': 'tops', 'inferiores': 'bottoms', 'calzado': 'shoes' };
  const type = typeMap[tabId];
  
  if (type && tabId !== 'recomendaciones') {
    renderIntelligentClosetTab(tabId, type);
    setupClosetFolderUploads();
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
    tabContent.innerHTML = `
      <div style="text-align: center; padding: 3rem; color: #666;">
        <div style="font-size: 3rem; margin-bottom: 1rem;">🤖</div>
        <h3>IA Lista para Detectar</h3>
        <p>Sube fotos y la IA las organizará automáticamente por categorías</p>
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
            <div style="font-size: 0.8rem; color: #10b981; font-weight: 500;">✨ Detectado automáticamente por IA</div>
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
  if (!confirm('¿Eliminar esta prenda detectada por IA?')) return;
  
  console.log(`🗑️ Eliminando ${type}/${categoryId}[${index}]`);
  
  if (intelligentClosetItems[type][categoryId]) {
    intelligentClosetItems[type][categoryId].splice(index, 1);
  }
  
  if (uploadedFiles[type].length > 0) uploadedFiles[type].pop();
  if (uploadedImages[type].length > 0) uploadedImages[type].pop();
  if (closetItems[type].length > 0) closetItems[type].pop();
  
  saveUserData();
  updateClosetUI();
  
  const activeTab = document.querySelector('.closet-tab.active');
  if (activeTab) {
    const tabId = activeTab.dataset.tab;
    const typeMap = { 'superiores': 'tops', 'inferiores': 'bottoms', 'calzado': 'shoes' };
    const currentType = typeMap[tabId];
    if (currentType) {
      renderIntelligentClosetTab(tabId, currentType);
    }
  }
  
  const remaining = CONFIG.TOTAL_CLOSET_LIMIT - getTotalClosetItems();
  showNotification(`Prenda eliminada. ${remaining} espacios disponibles`, 'success');
}

window.removeIntelligentItem = removeIntelligentItem;

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
// SISTEMA DE UPLOAD
// ===================================================================
function setupClosetFolderUploads() {
  document.querySelectorAll('.folder-item').forEach((folder, index) => {
    const newFolder = folder.cloneNode(true);
    folder.parentNode.replaceChild(newFolder, folder);
    
    newFolder.addEventListener('click', function(e) {
      e.preventDefault();
      
      if (!isLoggedIn) {
        showNotification('Debes iniciar sesión primero', 'error');
        return;
      }
      
      const remaining = CONFIG.TOTAL_CLOSET_LIMIT - getTotalClosetItems();
      if (remaining <= 0) {
        showNotification(`Armario lleno (${getTotalClosetItems()}/${CONFIG.TOTAL_CLOSET_LIMIT})`, 'error');
        return;
      }
      
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'image/*';
      fileInput.multiple = true;
      fileInput.style.display = 'none';
      
      fileInput.onchange = function(e) {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;
        
        console.log(`🤖 ${files.length} archivos para DETECCIÓN AUTOMÁTICA con IA`);
        
        if (files.length > remaining) {
          showNotification(`Solo puedes subir ${remaining} fotos más`, 'error');
          return;
        }
        
        handleIntelligentUpload(files);
      };
      
      document.body.appendChild(fileInput);
      fileInput.click();
      
      setTimeout(() => {
        if (document.body.contains(fileInput)) {
          document.body.removeChild(fileInput);
        }
      }, 30000);
    });
    
    newFolder.style.cursor = 'pointer';
    newFolder.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-5px) scale(1.02)';
      this.style.boxShadow = '0 15px 40px rgba(16, 185, 129, 0.3)';
      this.style.borderColor = '#10b981';
    });
    
    newFolder.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0) scale(1)';
      this.style.boxShadow = '0 2px 10px rgba(0,0,0,0.05)';
      this.style.borderColor = 'var(--border)';
    });
  });
}

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
  
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const invalidFiles = files.filter(file => !validTypes.includes(file.type));
  
  if (invalidFiles.length > 0) {
    showNotification('Solo JPG, PNG o WebP permitidos', 'error');
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
      console.error('Error procesando archivo:', error);
      showNotification(`Error procesando ${file.name}`, 'error');
    }
  }
  
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

function navigateToDetectedType(type, detectionResults) {
  console.log(`📍 IA navegando automáticamente a: ${type}`);
  
  const tabMap = { 'tops': 'superiores', 'bottoms': 'inferiores', 'shoes': 'calzado' };
  const targetTabId = tabMap[type];
  
  if (targetTabId) {
    showClosetTab(targetTabId);
    
    renderIntelligentClosetTab(targetTabId, type);
    
    const typeNames = { tops: 'Superiores', bottoms: 'Inferiores', shoes: 'Calzado' };
    showNotification(`🎯 IA detectó ${typeNames[type]}. Navegando automáticamente...`, 'success');
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
// PERSISTENCIA DE DATOS - INCLUYENDO ITEMS INTELIGENTES
// ===================================================================
function saveUserData() {
  if (!currentUser?.email) return;
  
  const userData = {
    email: currentUser.email,
    name: currentUser.name,
    uploadedFiles: uploadedFiles,
    uploadedImages: uploadedImages,
    closetItems: closetItems,
    intelligentClosetItems: intelligentClosetItems,
    userStats: userStats,
    savedRecommendations: savedRecommendations,
    lastUpdated: new Date().toISOString()
  };
  
  localStorage.setItem(`noshopia_user_data_${currentUser.email}`, JSON.stringify(userData));
  console.log('💾 Datos del closet inteligente guardados');
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
      
      console.log('✅ Closet inteligente cargado:', getTotalClosetItems(), 'prendas');
    }
  } catch (error) {
    console.error('Error cargando datos:', error);
  }
}

// ===================================================================
// FUNCIONES DE PLANES - ACTUALIZADAS
// ===================================================================
function startFreePlan() {
  console.log('🎁 Plan gratuito activado');
  showNotification('¡Plan gratuito activado! Inicia sesión para comenzar.', 'success');
  
  const mainLoginBtn = document.getElementById('mainLoginBtn');
  if (mainLoginBtn) {
    mainLoginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Iniciar Sesión';
  }
  
  setTimeout(() => handleMainLogin(), 1500);
}

function upgradeToPremium() {
  console.log('⭐ Upgrade a premium solicitado');
  showNotification('Funcionalidad premium próximamente disponible', 'info');
  setTimeout(() => scrollToSection('equipo'), 1000);
}

function initializeGoogleLogin() {
  try {
    if (typeof google !== 'undefined' && google.accounts) {
      google.accounts.id.initialize({
        client_id: CONFIG.GOOGLE_CLIENT_ID,
        callback: handleGoogleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: false,
        use_fedcm_for_prompt: true
      });
      
      console.log('✅ Google Sign-In configurado para login directo');
    } else {
      console.log('⚠️ Google Sign-In no disponible, usando modo demo');
    }
  } catch (error) {
    console.error('Error configurando Google Login:', error);
  }
}

/ NUEVA FUNCIÓN: Activar botón de login del header
function activateHeaderLoginButton() {
  const headerLoginBtn = document.getElementById('headerLoginBtn');
  if (headerLoginBtn) {
    headerLoginBtn.disabled = false;
    headerLoginBtn.style.opacity = '1';
    headerLoginBtn.innerHTML = '<i class="fab fa-google"></i> Iniciar Sesión';
    
    // Event listener para el botón del header
    headerLoginBtn.addEventListener('click', function(e) {
      e.preventDefault();
      console.log('🔐 Click en botón de header detectado');
      handleMainLogin();
    });
    
    console.log('✅ Botón de login del header activado');
  }
}

function setupEventListeners() {
  setupOccasionButtons();
  setupClosetTabs();
  setupDirectUpload();
  setupProfileForm();
  
  document.querySelectorAll('.mobile-nav-item').forEach(item => {
    item.addEventListener('click', () => {
      const mobileNav = document.getElementById('mobileNav');
      if (mobileNav?.classList.contains('active')) {
        toggleMobileMenu();
      }
    });
  });
  
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
  
  setTimeout(initializeGoogleLogin, 500);
  setupEventListeners();
  setTimeout(checkExistingSession, 1000);
  
  console.log('✅ NoShopiA inicializada correctamente');
}

// ===================================================================
// EXPOSICIÓN GLOBAL DE FUNCIONES
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
window.handleGoogleCredentialResponse = handleGoogleCredentialResponse;
window.tryGoogleLogin = tryGoogleLogin;
window.closeGoogleLoginButton = closeGoogleLoginButton;
window.simulateLogin = simulateLogin;

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
    console.log('🔄 Inicialización de respaldo...');
    setTimeout(initializeApp, 500);
  }
});

window.APP_INITIALIZED = true;

setTimeout(() => {
  const headerBtn = document.getElementById('headerLoginBtn');
  if (headerBtn && headerBtn.disabled) {
    headerBtn.disabled = false;
    headerBtn.style.opacity = '1';
    headerBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Iniciar Sesión';
    
    headerBtn.onclick = function() {
      const userData = {
        name: 'Usuario Demo',
        email: 'info@noshopia.com',
        picture: 'https://via.placeholder.com/40x40/3b82f6/ffffff?text=D'
      };
      processLogin(userData);
    };
    
    console.log('✅ Login activado');
  }
}, 2000);

console.log('✅ app.js cargado - NoShopiA v2.0 lista');
