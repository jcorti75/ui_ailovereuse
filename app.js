// app.js - NoShopiA v2.4 - SISTEMA UNIFICADO CORREGIDO
console.log('🚀 NoShopiA v2.4 - SISTEMA UNIFICADO CON CATEGORY DEL BACKEND');

// ===================================================================
// VARIABLES GLOBALES
// ===================================================================
let isLoggedIn = false;
let currentUser = null;
let selectedOccasion = null;
let uploadedFiles = { tops: [], bottoms: [], shoes: [] };
let uploadedImages = { tops: [], bottoms: [], shoes: [] };
let closetItems = { tops: [], bottoms: [], shoes: [] }; // AHORA OBJETOS CON detected_item
let userStats = { visits: 1, recommendations: 0, savedOutfits: 0 };
let closetMode = false;
let processingStartTime = null;
let currentResults = [];
let savedRecommendations = [];
let userProfile = { skin_color: null, age_range: null, gender: null };

// ===================================================================
// DETECCIÓN IA REAL CON BACKEND - USANDO CATEGORY DIRECTO
// ===================================================================
async function detectGarmentType(file) {
  try {
    showNotification('🔍 Detectando tipo de prenda con IA...', 'info');
    
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await fetch(`${CONFIG.API_BASE}/api/detect`, {
      method: 'POST',
      body: formData
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.detail || 'Error en detección');
    }
    
    // CORREGIDO: USAR CATEGORY DIRECTO DEL BACKEND
    return {
      success: result.success,
      detected_item: result.detected_item,
      category: result.category  // <-- USAR DIRECTO DEL BACKEND
    };
    
  } catch (error) {
    console.error('❌ Error detectando prenda:', error);
    showNotification(`Error detectando prenda: ${error.message}`, 'error');
    return {
      success: false,
      error: error.message,
      detected_item: 'unknown',
      category: 'unknown'
    };
  }
}

// ===================================================================
// CLOSET INTELIGENTE CON ESTRUCTURA DE OBJETOS
// ===================================================================
async function handleIntelligentUpload(files) {
  console.log('🚀 CLOSET INTELIGENTE: Upload automático con IA real');
  
  if (!files || files.length === 0) return;
  
  showNotification('🤖 IA analizando imágenes con modelo real...', 'info');
  
  let successCount = 0;
  
  for (const file of files) {
    try {
      // USAR BACKEND REAL
      const detection = await detectGarmentType(file);
      
      if (!detection.success || detection.category === 'unknown') {
        console.log(`❓ No se pudo categorizar: ${file.name} - ${detection.detected_item}`);
        showNotification(`❓ No detectado: ${file.name} (${detection.detected_item})`, 'info');
        continue;
      }
      
      const imageUrl = await fileToDataUrl(file);
      categorizeIntelligentItem(detection, imageUrl, file);
      successCount++;
      
      console.log(`🎯 IA Real: ${file.name} → ${detection.detected_item} → ${detection.category}`);
      
    } catch (error) {
      console.error('❌ Error IA:', error);
      showNotification(`❌ Error procesando ${file.name}`, 'error');
    }
  }
  
  if (successCount > 0) {
    saveUserData();
    updateClosetUI();
    showNotification(`✅ ${successCount} prenda${successCount !== 1 ? 's' : ''} categorizadas con IA real`, 'success');
    
    // NAVEGAR AUTOMÁTICAMENTE A PESTAÑA CORRESPONDIENTE
    if (successCount === 1) {
      const lastDetection = getCurrentDetectedCategory();
      if (lastDetection) {
        navigateToClosetTab(lastDetection);
      }
    }
  }
}

// CORREGIDO: categorizeIntelligentItem para usar estructura de objetos
function categorizeIntelligentItem(detection, imageUrl, file) {
  const { category, detected_item } = detection;
  
  // NUEVA ESTRUCTURA: OBJETOS CON METADATA
  const itemObject = {
    imageUrl: imageUrl,
    detected_item: detected_item,
    category: category,
    timestamp: Date.now(),
    file: file
  };
  
  // Agregar directamente a la categoría detectada por la IA
  uploadedFiles[category].push(file);
  uploadedImages[category].push(imageUrl);
  closetItems[category].push(itemObject); // <-- OBJETO COMPLETO
  
  console.log(`🧠 IA categorizada: ${detected_item} → ${category}`);
}

function getCurrentDetectedCategory() {
  // Obtener última categoría detectada
  const categories = ['tops', 'bottoms', 'shoes'];
  for (const cat of categories) {
    if (closetItems[cat].length > 0) {
      return cat;
    }
  }
  return null;
}

function navigateToClosetTab(category) {
  const tabMap = {
    'tops': 'superiores',
    'bottoms': 'inferiores', 
    'shoes': 'calzado'
  };
  
  const tabId = tabMap[category];
  if (tabId) {
    setTimeout(() => {
      showClosetTab(tabId);
      const tabElement = document.querySelector(`[data-tab="${tabId}"]`);
      if (tabElement) {
        tabElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 500);
  }
}

// ===================================================================
// SISTEMA DE LOGIN UNIFICADO (SIN CONFLICTOS)
// ===================================================================
function handleGoogleCredentialResponse(response) {
  try {
    const payload = JSON.parse(atob(response.credential.split('.')[1]));
    const userData = { 
      name: payload.name, 
      email: payload.email, 
      picture: payload.picture,
      google: true,
      verified: payload.email_verified || false
    };
    
    console.log('✅ Google autenticado:', userData.name);
    processLogin(userData);
  } catch (error) {
    console.error('Error Google login:', error);
    showNotification('Error en login de Google', 'error');
  }
}

// PROCESAMIENTO DE LOGIN UNIFICADO CON HAS_PROFILE
async function processLogin(userData) {
  console.log('🔄 PROCESANDO LOGIN CON VERIFICACIÓN has_profile:', userData.name);
  
  isLoggedIn = true;
  currentUser = userData;
  
  localStorage.setItem('noshopia_auth', JSON.stringify(userData));
  localStorage.setItem('noshopia_logged_in', 'true');
  
  updateUserUI();
  loadUserData();
  
  // VERIFICAR has_profile DEL BACKEND
  try {
    showNotification('Verificando perfil en servidor...', 'info');
    const backendData = await syncWithBackend(userData.email);
    
    if (backendData && backendData.has_profile) {
      console.log('✅ USUARIO CON PERFIL COMPLETO - IR DIRECTO A MODALIDAD');
      userProfile = backendData.profile || { completed: true };
      
      setTimeout(() => {
        showClosetQuestion();
        scrollToSection('upload');
      }, 1000);
      
      showNotification(`Bienvenido ${userData.name}! Perfil cargado.`, 'success');
      return;
    }
  } catch (error) {
    console.error('Error verificando BD:', error);
  }
  
  // USUARIO SIN PERFIL - MOSTRAR FORMULARIO
  console.log('📋 USUARIO SIN PERFIL - MOSTRAR FORMULARIO');
  setTimeout(() => {
    showProfileForm();
  }, 1000);
  
  showNotification(`¡Bienvenido ${userData.name}! Completa tu perfil.`, 'success');
}

function showProfileForm() {
  const profileForm = document.getElementById('profileForm');
  if (profileForm) {
    profileForm.style.display = 'block';
    setTimeout(() => {
      profileForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 500);
  }
}

// ===================================================================
// RENDERIZADO CLOSET CON SUBCATEGORÍAS REALES
// ===================================================================
function renderClosetTab(tabId, type) {
  const tabContent = document.getElementById(tabId);
  if (!tabContent) return;
  
  const items = closetItems[type] || [];
  
  if (items.length === 0) {
    const typeNames = { tops: 'superiores', bottoms: 'inferiores', shoes: 'calzado' };
    const icons = { tops: 'tshirt', bottoms: 'user-tie', shoes: 'shoe-prints' };
    
    tabContent.innerHTML = `
      <div style="text-align: center; padding: 3rem; color: #666;">
        <i class="fas fa-${icons[type]}" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
        <p>No hay ${typeNames[type]} aún</p>
        <p style="font-size: 0.9rem; opacity: 0.7;">Sube fotos en "Sube cualquier prenda" y la IA las detectará</p>
      </div>
    `;
    return;
  }
  
  // CONTADOR CON SUBCATEGORÍAS
  const subcategories = getSubcategoriesList(items);
  const subcategoriesText = subcategories.length > 0 ? ` (${subcategories.join(', ')})` : '';
  
  let html = `
    <div style="margin-bottom: 2rem;">
      <h3 style="margin: 0; color: #000000;">${items.length} ${type === 'tops' ? 'Superiores' : type === 'bottoms' ? 'Inferiores' : 'Calzado'}${subcategoriesText}</h3>
      <p style="margin: 0.5rem 0 0 0; color: #666; font-size: 0.9rem;">Gestiona tus prendas subidas</p>
    </div>
    
    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem;">
  `;
  
  items.forEach((itemObj, index) => {
    // USAR NUEVA ESTRUCTURA DE OBJETOS
    const imageUrl = itemObj.imageUrl || itemObj; // Retrocompatibilidad
    const detectedItem = itemObj.detected_item || `${type === 'tops' ? 'Superior' : type === 'bottoms' ? 'Inferior' : 'Calzado'} ${index + 1}`;
    
    html += `
      <div style="position: relative; background: white; border-radius: 15px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); transition: all 0.3s ease;">
        
        <img src="${imageUrl}" style="width: 100%; height: 200px; object-fit: cover;" alt="${detectedItem}">
        
        <div style="position: absolute; top: 10px; right: 10px; background: #ef4444; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; cursor: pointer;" onclick="removeClosetItem('${type}', ${index})">×</div>
        
        <div style="padding: 1rem;">
          <div style="font-weight: 600; color: #000; margin-bottom: 0.5rem;">${detectedItem}</div>
          <div style="font-size: 0.8rem; color: #666;">${itemObj.timestamp ? new Date(itemObj.timestamp).toLocaleDateString() : ''}</div>
        </div>
      </div>
    `;
  });
  
  html += '</div>';
  tabContent.innerHTML = html;
}

function getSubcategoriesList(items) {
  const subcategories = [...new Set(items.map(item => item.detected_item || 'Unknown').filter(Boolean))];
  return subcategories.slice(0, 3); // Máximo 3 para no sobrecargar UI
}

// ELIMINACIÓN SIN CONFIRMACIÓN
function removeClosetItem(type, index) {
  console.log(`🗑️ Eliminando ${type}[${index}] SIN CONFIRMACIÓN`);
  
  // ELIMINAR SIN PREGUNTAR
  closetItems[type].splice(index, 1);
  uploadedFiles[type].splice(index, 1);
  uploadedImages[type].splice(index, 1);
  
  saveUserData();
  updateClosetUI();
  
  // Re-renderizar pestaña actual
  const activeTab = document.querySelector('.closet-tab.active');
  if (activeTab) {
    const tabId = activeTab.dataset.tab;
    const typeMap = { 'superiores': 'tops', 'inferiores': 'bottoms', 'calzado': 'shoes' };
    const currentType = typeMap[tabId];
    if (currentType) {
      renderClosetTab(tabId, currentType);
    }
  }
  
  showNotification('Prenda eliminada', 'success');
}

// ACTUALIZACIÓN UI CON CONTADORES DINÁMICOS
function updateClosetUI() {
  const total = getTotalClosetItems();
  const closetHeader = document.querySelector('.closet-header h2');
  if (closetHeader) {
    closetHeader.innerHTML = `Mi Closet Inteligente <span style="font-size: 0.8rem; opacity: 0.8;">(${total}/15 prendas)</span>`;
  }
  
  // ACTUALIZAR CONTADORES CON SUBCATEGORÍAS
  updateTabCountersWithSubcategories();
  
  const stats = ['closetVisits', 'closetRecommendations', 'closetOutfits'];
  const values = [userStats.visits, userStats.recommendations, userStats.savedOutfits];
  
  stats.forEach((id, index) => {
    const el = document.getElementById(id);
    if (el) el.textContent = values[index];
  });
}

function updateTabCountersWithSubcategories() {
  ['superiores', 'inferiores', 'calzado'].forEach(tabId => {
    const typeMap = { 'superiores': 'tops', 'inferiores': 'bottoms', 'calzado': 'shoes' };
    const type = typeMap[tabId];
    const items = closetItems[type] || [];
    
    if (items.length > 0) {
      const subcategories = getSubcategoriesList(items);
      const subcategoriesText = subcategories.length > 0 ? ` (${subcategories.join(', ')})` : '';
      
      const tab = document.querySelector(`[data-tab="${tabId}"]`);
      if (tab) {
        const originalText = tab.innerHTML.split('<')[0]; // Mantener icono y texto base
        tab.innerHTML = `${originalText}<span style="font-size: 0.8rem; opacity: 0.7;"> ${items.length}${subcategoriesText}</span>`;
      }
    }
  });
}

function getTotalClosetItems() {
  return Object.values(closetItems).reduce((sum, items) => sum + items.length, 0);
}

// COMPATIBILIDAD: Adaptar funciones que esperan strings
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

// ===================================================================
// INTEGRACIÓN OCASIONES EN CLOSET
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
  const occasionSelector = document.getElementById('occasionSelector');
  
  if (closetContainer) {
    closetContainer.style.display = 'block';
  }
  
  // MOSTRAR SELECTOR DE OCASIÓN TAMBIÉN EN CLOSET
  if (occasionSelector) {
    occasionSelector.style.display = 'block';
  }
  
  setTimeout(() => {
    if (closetContainer) {
      closetContainer.scrollIntoView({ behavior: 'smooth' });
    }
    showClosetTab('superiores');
    updateClosetUI();
  }, 500);
  
  const userEmail = document.getElementById('userEmail');
  if (userEmail && currentUser) {
    userEmail.textContent = `Bienvenido ${currentUser.name}`;
  }
  
  showNotification('Closet Inteligente activado', 'success');
}

// ===================================================================
// RESTO DE FUNCIONES MANTENIDAS (sin cambios críticos)
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

async function syncWithBackend(email) {
  try {
    const response = await fetch(`${CONFIG.API_BASE}/api/users/check/${encodeURIComponent(email)}`);
    if (response.ok) {
      const data = await response.json();
      console.log('🔍 Verificación backend con has_profile:', data);
      return data;
    }
    return { exists: false, has_profile: false };
  } catch (error) {
    console.error('❌ Error verificando usuario:', error);
    return { exists: false, has_profile: false };
  }
}

function updateUserUI() {
  const loginBtn = document.getElementById('headerLoginBtn');
  if (loginBtn) {
    loginBtn.style.display = 'none';
  }
  
  const userInfo = document.getElementById('userInfo');
  const userName = document.getElementById('userName');
  const userAvatar = document.getElementById('userAvatar');
  
  if (userInfo) userInfo.style.display = 'flex';
  if (userName) userName.textContent = currentUser.name;
  if (userAvatar) {
    userAvatar.src = currentUser.picture;
    userAvatar.alt = currentUser.name;
  }
  
  const welcomeSection = document.getElementById('welcomeSection');
  if (welcomeSection) {
    welcomeSection.style.display = 'block';
    
    const welcomeUserName = document.getElementById('welcomeUserName');
    if (welcomeUserName) {
      welcomeUserName.textContent = currentUser.name;
    }
  }
  
  console.log('✅ UI actualizada para:', currentUser.name);
}

function logout() {
  console.log('👋 LOGOUT LIMPIO...');
  
  isLoggedIn = false;
  currentUser = null;
  selectedOccasion = null;
  uploadedFiles = { tops: [], bottoms: [], shoes: [] };
  uploadedImages = { tops: [], bottoms: [], shoes: [] };
  closetItems = { tops: [], bottoms: [], shoes: [] };
  closetMode = false;
  
  localStorage.removeItem('noshopia_auth');
  localStorage.removeItem('noshopia_logged_in');
  
  showNotification('Sesión cerrada', 'success');
  setTimeout(() => window.location.reload(), 1000);
}

// RESTO DE FUNCIONES MANTENIDAS...
function showClosetQuestion() {
  const closetQuestion = document.getElementById('closetQuestion');
  if (closetQuestion) {
    closetQuestion.style.display = 'block';
  }
}

function showClosetTab(tabId) {
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
    renderClosetTab(tabId, type);
  }
}

function scrollToSection(sectionId) {
  const section = document.getElementById(sectionId);
  if (section) {
    section.scrollIntoView({ behavior: 'smooth' });
  }
}

function saveUserData() {
  if (!currentUser?.email) return;
  
  const userData = {
    email: currentUser.email, name: currentUser.name,
    uploadedFiles, uploadedImages, closetItems,
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
      userStats = data.userStats || { visits: 1, recommendations: 0, savedOutfits: 0 };
      savedRecommendations = data.savedRecommendations || [];
      
      console.log('✅ Datos cargados:', getTotalClosetItems(), 'prendas');
    }
  } catch (error) {
    console.error('Error cargando datos:', error);
  }
}

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
  
  const mainBtn = document.getElementById('headerLoginBtn');
  if (mainBtn) {
    mainBtn.disabled = false;
    mainBtn.style.opacity = '1';
    mainBtn.innerHTML = '<i class="fab fa-google"></i> Conectar con Google';
    mainBtn.onclick = () => {
      google.accounts.id.prompt();
    };
  }
}

function initializeApp() {
  console.log('🔧 INICIALIZANDO NoShopiA v2.4 - SISTEMA UNIFICADO...');
  
  setTimeout(initializeGoogleLogin, 500);
  
  console.log('✅ NoShopiA v2.4 inicializada - SISTEMA UNIFICADO');
}

// EXPOSICIÓN GLOBAL
window.handleIntelligentUpload = handleIntelligentUpload;
window.handleGoogleCredentialResponse = handleGoogleCredentialResponse;
window.logout = logout;
window.enableCloset = enableCloset;
window.showClosetTab = showClosetTab;
window.removeClosetItem = removeClosetItem;
window.scrollToSection = scrollToSection;

// AUTO-INICIALIZACIÓN
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  setTimeout(initializeApp, 100);
}

console.log('✅ app.js v2.4 - SISTEMA UNIFICADO COMPLETO');
