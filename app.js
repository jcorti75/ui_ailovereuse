// app.js - NoShopiA UNIFICADO v3.1 CORREGIDO FINAL
console.log('NoShopiA v3.1 - CORREGIDO iniciando...');

// ========================================
// VARIABLES GLOBALES
// ========================================
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
let userProfile = { skin_color: null, age_range: null, gender: null };

const OCCASION_NAMES = {
  'oficina': 'Oficina/Trabajo',
  'deportivo': 'Deportes/Gym',
  'casual': 'Casual',
  'formal': 'Formal',
  'matrimonio': 'Matrimonio'
};

// ========================================
// UTILIDADES
// ========================================
function showNotification(message, type = 'info') {
  console.log(`${type.toUpperCase()}: ${message}`);
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

// ========================================
// DETECCIÓN IA
// ========================================
async function detectGarmentType(file) {
  try {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await fetch(`${CONFIG.API_BASE}/api/detect`, {
      method: 'POST',
      body: formData
    });
    
    const result = await response.json();
    if (!response.ok) throw new Error(result.detail || 'Error en detección');
    
    return {
      success: result.success,
      item_detected: result.item_detected,
      category: result.category
    };
  } catch (error) {
    console.error('Error detectando prenda:', error);
    return { success: false, error: error.message, item_detected: 'unknown', category: 'unknown' };
  }
}
// ========================================
// CLOSET INTELIGENTE
// ========================================
async function handleIntelligentUpload(files) {
  console.log('🧠 CLOSET INTELIGENTE: Upload automático');
  
  if (!files || files.length === 0) {
    showNotification('No se seleccionaron archivos', 'error');
    return;
  }
  
  const fileArray = Array.from(files);
  const currentTotal = getTotalClosetItems();
  const remaining = CONFIG.TOTAL_CLOSET_LIMIT - currentTotal;
  
  if (fileArray.length > remaining) {
    showNotification(`Solo puedes subir ${remaining} prendas más. Closet: ${currentTotal}/${CONFIG.TOTAL_CLOSET_LIMIT}`, 'error');
    return;
  }
  
  let successCount = 0;
  
  for (const file of fileArray) {
    try {
      const detection = await detectGarmentType(file);
      
      if (!detection.success || detection.category === 'unknown') {
        continue;
      }
      
      const imageUrl = await fileToDataUrl(file);
      const { category, item_detected } = detection;
      
      uploadedFiles[category].push(file);
      uploadedImages[category].push(imageUrl);
      closetItems[category].push({
        imageUrl: imageUrl,
        item_detected: item_detected,
        category: category,
        timestamp: Date.now(),
        file: file
      });
      
      successCount++;
      
    } catch (error) {
      console.error('Error:', error);
    }
  }
  
  if (successCount > 0) {
    saveUserData();
    updateClosetUI();
    updateTabCounters();
    showNotification(`${successCount} prenda(s) categorizadas automáticamente`, 'success');
  }
}

// ========================================
// UPLOAD DIRECTO (MODO RÁPIDO) - VERSIÓN CORREGIDA
// ========================================
async function handleFileUpload(type, inputOrFileList) {
  // Detectar si es FileList o Input Element
  const type = categoryType;
  let files = [];
  
  if (inputOrFileList instanceof FileList) {
    // Es FileList directo
    files = Array.from(inputOrFileList);
  } else if (inputOrFileList?.files) {
    // Es Input Element
    files = Array.from(inputOrFileList.files);
  } else {
    showNotification('Error: parámetro inválido', 'error');
    return;
  }
  
  if (files.length === 0) {
    showNotification('No se seleccionaron archivos', 'error');
    return;
  }
  
  const maxFiles = CONFIG.DIRECT_UPLOAD_LIMITS[type] || 3;
  const currentCount = uploadedFiles[type].length;
  
  if (currentCount + files.length > maxFiles) {
    showNotification(`Máximo ${maxFiles} prendas permitidas`, 'error');
    return;
  }
  
  for (const file of files) {
    try {
      const detection = await detectGarmentType(file);
      
      if (!detection.success || detection.category === 'unknown') {
        showNotification('Esta imagen no es una prenda válida', 'error');
        return;
      }
      
      if (detection.category !== type) {
        showNotification('Prenda incorrecta. Súbela en la sección correcta', 'error');
        return;
      }
      
      uploadedFiles[type].push(file);
      const imageUrl = await fileToDataUrl(file);
      uploadedImages[type].push(imageUrl);
      closetItems[type].push({
        imageUrl: imageUrl,
        item_detected: detection.item_detected,
        category: type,
        timestamp: Date.now(),
        file: file
      });
      
    } catch (error) {
      showNotification('Error al procesar la imagen', 'error');
      return;
    }
  }
  
  updateUploadUI(type);
  saveUserData();
  updateGenerateButton();
  
  const count = files.length;
  showNotification(`${count} prenda${count > 1 ? 's' : ''} subida${count > 1 ? 's' : ''} satisfactoriamente`, 'success');
}
// ========================================
// BACKEND SYNC
// ========================================
async function syncWithBackend(email) {
  try {
    const profileResponse = await fetch(`${CONFIG.API_BASE}/api/profile/check/${encodeURIComponent(email)}`);
    if (profileResponse.ok) {
      const profileData = await profileResponse.json();
      if (profileData.exists) {
        const analyticsResponse = await fetch(`${CONFIG.API_BASE}/api/user/history/${encodeURIComponent(email)}`);
        if (analyticsResponse.ok) {
          const analyticsData = await analyticsResponse.json();
          return {
            exists: profileData.exists,
            has_profile: profileData.has_profile,
            profile: profileData.profile,
            userStats: analyticsData.user,
            statistics: analyticsData.statistics,
            recent_outfits: analyticsData.recent_outfits,
            recent_feedback: analyticsData.recent_feedback
          };
        }
      }
      return profileData;
    }
    return { exists: false, has_profile: false };
  } catch (error) {
    console.error('Error verificando usuario:', error);
    return { exists: false, has_profile: false };
  }
}

async function createUserProfile(userData, profileData) {
  try {
    const formData = new URLSearchParams({
      email: userData.email,
      skin_color: profileData.skin_color,
      age_range: profileData.age_range,
      gender: profileData.gender
    });
    
    const response = await fetch(`${CONFIG.API_BASE}/api/profile/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString()
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('Perfil creado en servidor:', result);
      return result;
    }
    throw new Error(`Error ${response.status}: ${await response.text()}`);
  } catch (error) {
    console.error('Error creando perfil:', error);
    throw error;
  }
}

function updateUploadUI(type) {
  const label = document.querySelector(`label[for="${type}-upload"]`);
  const preview = document.getElementById(`${type}-preview`);
  
  if (label) {
    const typeNames = { tops: 'Superiores', bottoms: 'Inferiores', shoes: 'Calzado' };
    const maxFiles = CONFIG.DIRECT_UPLOAD_LIMITS[type] || 3;
    const files = uploadedFiles[type];
    
    if (files.length === 0) {
      label.textContent = `📤 Subir ${typeNames[type]} (máx ${maxFiles})`;
    } else {
      label.textContent = `${typeNames[type]}: ${files.length}/${maxFiles} subidos`;
    }
  }
  
  if (preview) {
    preview.innerHTML = '';
    uploadedImages[type].forEach((imageUrl, index) => {
      const div = document.createElement('div');
      div.style.position = 'relative';
      div.style.display = 'inline-block';
      div.innerHTML = `
        <img src="${imageUrl}" class="preview-image">
        <button onclick="removeImage('${type}',${index})" style="position:absolute;top:-8px;right:-8px;background:#ef4444;color:white;border:none;border-radius:50%;width:24px;height:24px;cursor:pointer;font-size:14px">×</button>
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
  saveUserData();
  showNotification('Imagen eliminada', 'success');
  updateGenerateButton();
}

// ========================================
// AUTENTICACIÓN
// ========================================
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
    processLogin(userData);
  } catch (error) {
    console.error('Error Google login:', error);
    showNotification('Error en login de Google', 'error');
  }
}

async function processLogin(userData) {
  console.log('PROCESANDO LOGIN:', userData.name);
  isLoggedIn = true;
  currentUser = userData;
  
  localStorage.setItem('noshopia_auth', JSON.stringify(userData));
  localStorage.setItem('noshopia_logged_in', 'true');
  
  updateUserUI();
  loadUserData();
  
  try {
    showNotification('Verificando perfil...', 'info');
    const backendData = await syncWithBackend(userData.email);
    
    if (backendData && backendData.has_profile) {
      console.log('USUARIO CON PERFIL COMPLETO');
      if (backendData.statistics) {
        userStats = {
          visits: 1,
          recommendations: backendData.statistics.total_recommendations,
          savedOutfits: backendData.statistics.accepted_outfits,
          feedbackGiven: backendData.statistics.total_feedback
        };
      }
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
  
  console.log('USUARIO SIN PERFIL');
  setTimeout(() => showProfileForm(), 1000);
  showNotification(`Bienvenido ${userData.name}! Completa tu perfil.`, 'success');
}

function updateUserUI() {
  const loginBtn = document.getElementById('headerLoginBtn');
  if (loginBtn) loginBtn.style.display = 'none';
  
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
    if (welcomeUserName) welcomeUserName.textContent = currentUser.name;
  }
}

function logout() {
  console.log('LOGOUT...');
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

// ========================================
// PERFIL
// ========================================
function showProfileForm() {
  const profileForm = document.getElementById('profileForm');
  if (profileForm) {
    profileForm.style.display = 'block';
    setTimeout(() => profileForm.scrollIntoView({ behavior: 'smooth', block: 'center' }), 500);
  }
}

function handleProfileSelection(field, value) {
  userProfile[field] = value;
  const isComplete = userProfile.skin_color && userProfile.age_range && userProfile.gender;
  const createBtn = document.getElementById('createProfileBtn');
  
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
}

async function submitUserProfile() {
  if (!userProfile.skin_color || !userProfile.age_range || !userProfile.gender) {
    showNotification('Completa todos los campos', 'error');
    return;
  }
  
  console.log('ENVIANDO PERFIL...', userProfile);
  
  try {
    showNotification('Guardando en servidor...', 'info');
    await createUserProfile(currentUser, userProfile);
    console.log('PERFIL CREADO BD');
    if (currentUser?.email) {
      localStorage.setItem(`noshopia_profile_${currentUser.email}`, JSON.stringify(userProfile));
    }
    showNotification('Perfil guardado', 'success');
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
      document.getElementById('closetQuestion')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 500);
  }, 1000);
  
  showNotification('Perfil completo!', 'success');
}

// ========================================
// MODALIDADES
// ========================================
function showClosetQuestion() {
  const closetQuestion = document.getElementById('closetQuestion');
  if (closetQuestion) closetQuestion.style.display = 'block';
}

function enableCloset() {
  console.log('CLOSET INTELIGENTE ACTIVADO');
  uploadedFiles = { tops: [], bottoms: [], shoes: [] };
  uploadedImages = { tops: [], bottoms: [], shoes: [] };
  selectedOccasion = null;
  
  if (!isLoggedIn) {
    showNotification('Debes iniciar sesión', 'error');
    return;
  }
  
  closetMode = true;
  
  const closetQuestion = document.getElementById('closetQuestion');
  if (closetQuestion) closetQuestion.style.display = 'none';
  
  const closetContainer = document.getElementById('closetContainer');
  const occasionSelector = document.getElementById('occasionSelector');
  const uploadArea = document.getElementById('uploadArea');
  
  if (uploadArea) uploadArea.style.display = 'none';
  if (closetContainer) closetContainer.style.display = 'block';
  if (occasionSelector) occasionSelector.style.display = 'block';
  
  setTimeout(() => {
    if (closetContainer) closetContainer.scrollIntoView({ behavior: 'smooth' });
    showClosetTab('superiores');
    updateClosetUI();
    updateTabCounters();
  }, 500);
  
  const userEmail = document.getElementById('userEmail');
  if (userEmail && currentUser) {
    userEmail.textContent = `Bienvenido ${currentUser.name}`;
    userEmail.style.fontSize = '1.9rem';
    userEmail.style.textAlign = 'left';
    userEmail.style.fontWeight = '600';
  }
  
  showNotification('Closet Inteligente activado', 'success');
}

function useDirectMode() {
  console.log('RECOMENDACIONES RÁPIDAS ACTIVADAS');
  uploadedFiles = { tops: [], bottoms: [], shoes: [] };
  uploadedImages = { tops: [], bottoms: [], shoes: [] };
  selectedOccasion = null;
  closetMode = false;
  
  const closetQuestion = document.getElementById('closetQuestion');
  if (closetQuestion) closetQuestion.style.display = 'none';
  
  const closetContainer = document.getElementById('closetContainer');
  if (closetContainer) closetContainer.style.display = 'none';
  
  const occasionSelector = document.getElementById('occasionSelector');
  const uploadArea = document.getElementById('uploadArea');
  
  if (occasionSelector) occasionSelector.style.display = 'block';
  if (uploadArea) uploadArea.style.display = 'block';
  
  showNotification('Recomendaciones Rápidas activadas', 'success');
}

// ========================================
// CLOSET UI
// ========================================
function showClosetTab(tabId) {
  document.querySelectorAll('.closet-tab-content').forEach(content => content.style.display = 'none');
  document.querySelectorAll('.closet-tab').forEach(tab => tab.classList.remove('active'));
  
  const selectedContent = document.getElementById(tabId);
  if (selectedContent) selectedContent.style.display = 'block';
  
  const selectedTab = document.querySelector(`[data-tab="${tabId}"]`);
  if (selectedTab) selectedTab.classList.add('active');
  
  const typeMap = { 'superiores': 'tops', 'inferiores': 'bottoms', 'calzado': 'shoes' };
  const type = typeMap[tabId];
  
  if (type && tabId !== 'recomendaciones') renderClosetTab(tabId, type);
}

function renderClosetTab(tabId, type) {
  const tabContent = document.getElementById(tabId);
  if (!tabContent) return;
  
  const items = closetItems[type] || [];
  
  if (items.length === 0) {
    const typeNames = { tops: 'superiores', bottoms: 'inferiores', shoes: 'calzado' };
    const icons = { tops: 'tshirt', bottoms: 'user-tie', shoes: 'shoe-prints' };
    
    tabContent.innerHTML = `
      <div style="text-align:center;padding:3rem;color:#666">
        <i class="fas fa-${icons[type]}" style="font-size:3rem;margin-bottom:1rem;opacity:.5"></i>
        <p>No hay ${typeNames[type]} aún</p>
        <p style="font-size:.9rem;opacity:.7">Sube fotos y la IA las detectará automáticamente</p>
      </div>
    `;
    return;
  }
  
  const subcategories = getSubcategoriesList(items);
  const subcategoriesText = subcategories.length > 0 ? ` (${subcategories.join(', ')})` : '';
  const typeNames = { tops: 'Superiores', bottoms: 'Inferiores', shoes: 'Calzado' };
  
  let html = `
    <div style="margin-bottom:2rem">
      <h3 style="margin:0;color:#000">${items.length} ${typeNames[type]}${subcategoriesText}</h3>
      <p style="margin:.5rem 0 0 0;color:#666;font-size:.9rem">Gestiona tus prendas subidas</p>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:1rem">
  `;
  
  items.forEach((itemObj, index) => {
    const imageUrl = itemObj.imageUrl || itemObj;
    const detectedItem = itemObj.item_detected || `${typeNames[type]} ${index + 1}`;
    
    html += `
      <div style="position:relative;background:white;border-radius:15px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,.1);transition:all .3s">
        <img src="${imageUrl}" style="width:100%;height:200px;object-fit:cover" alt="${detectedItem}">
        <div style="position:absolute;top:10px;right:10px;background:#ef4444;color:white;border-radius:50%;width:30px;height:30px;display:flex;align-items:center;justify-content:center;font-size:.8rem;cursor:pointer" onclick="removeClosetItem('${type}',${index})">×</div>
        <div style="padding:1rem">
          <div style="font-weight:600;color:#000;margin-bottom:.5rem">${detectedItem}</div>
          <div style="font-size:.8rem;color:#666">${itemObj.timestamp ? new Date(itemObj.timestamp).toLocaleDateString() : ''}</div>
        </div>
      </div>
    `;
  });
  
  html += '</div>';
  tabContent.innerHTML = html;
}

function getSubcategoriesList(items) {
  const subcategories = [...new Set(items.map(item => item.item_detected).filter(item => item && item !== 'unknown' && item !== 'Unknown'))];
  return subcategories.slice(0, 3);
}

function removeClosetItem(type, index) {
  console.log(`Eliminando ${type}[${index}]`);
  closetItems[type].splice(index, 1);
  uploadedFiles[type].splice(index, 1);
  uploadedImages[type].splice(index, 1);
  
  saveUserData();
  updateClosetUI();
  updateTabCounters();
  
  const activeTab = document.querySelector('.closet-tab.active');
  if (activeTab) {
    const tabId = activeTab.dataset.tab;
    const typeMap = { 'superiores': 'tops', 'inferiores': 'bottoms', 'calzado': 'shoes' };
    const currentType = typeMap[tabId];
    if (currentType) renderClosetTab(tabId, currentType);
  }
  
  showNotification('Prenda eliminada', 'success');
}

function updateClosetUI() {
  const total = getTotalClosetItems();
  const remaining = CONFIG.TOTAL_CLOSET_LIMIT - total;
  
  const closetHeader = document.querySelector('.closet-header h2');
  if (closetHeader) {
    closetHeader.innerHTML = `Mi Closet Inteligente <span style="font-size:.8rem;opacity:.8">(${total}/${CONFIG.TOTAL_CLOSET_LIMIT} prendas, ${remaining} restantes)</span>`;
  }
  
  const stats = ['closetVisits', 'closetRecommendations', 'closetOutfits'];
  const values = [userStats.visits, userStats.recommendations, userStats.savedOutfits];
  
  stats.forEach((id, index) => {
    const el = document.getElementById(id);
    if (el) el.textContent = values[index];
  });
}

function updateTabCounters() {
  const tabMap = { 'superiores': 'tops', 'inferiores': 'bottoms', 'calzado': 'shoes' };
  
  Object.entries(tabMap).forEach(([tabId, type]) => {
    const tab = document.querySelector(`[data-tab="${tabId}"]`);
    if (!tab) return;
    
    const count = closetItems[type]?.length || 0;
    const badge = tab.querySelector('.tab-subcategory-count');
    
    if (badge) {
      if (count > 0) {
        badge.textContent = count;
        badge.style.display = 'block';
      } else {
        badge.style.display = 'none';
      }
    }
  });
}

function getTotalClosetItems() {
  return Object.values(closetItems).reduce((sum, items) => sum + items.length, 0);
}

// ========================================
// OCASIONES
// ========================================
function selectOccasion(occasion) {
  console.log('Ocasión seleccionada:', occasion);
  selectedOccasion = occasion;
  showNotification(`Ocasión: ${OCCASION_NAMES[occasion] || occasion}`, 'success');
  updateGenerateButton();
}

function updateGenerateButton() {
  const generateBtn = document.getElementById('generateBtn');
  if (!generateBtn) return;
  
  const hasOccasion = selectedOccasion !== null;
  const hasFiles = uploadedFiles.tops.length > 0 && uploadedFiles.bottoms.length > 0 && uploadedFiles.shoes.length > 0;
  
  if (hasOccasion && hasFiles) {
    generateBtn.disabled = false;
    generateBtn.innerHTML = '<i class="fas fa-magic"></i> Generar Recomendaciones';
    generateBtn.style.opacity = '1';
    generateBtn.style.cursor = 'pointer';
  } else if (!hasOccasion) {
    generateBtn.disabled = true;
    generateBtn.innerHTML = '<i class="fas fa-calendar"></i> Selecciona ocasión primero';
    generateBtn.style.opacity = '0.6';
    generateBtn.style.cursor = 'not-allowed';
  } else {
    generateBtn.disabled = true;
    generateBtn.innerHTML = '<i class="fas fa-upload"></i> Completa todos los campos';
    generateBtn.style.opacity = '0.6';
    generateBtn.style.cursor = 'not-allowed';
  }
}

// ========================================
// RECOMENDACIONES
// ========================================
async function getRecommendation() {
  if (!selectedOccasion) {
    showNotification('Selecciona una ocasión primero', 'error');
    return;
  }
  
  if (!isLoggedIn) {
    showNotification('Debes estar logueado', 'error');
    return;
  }
  
  console.log('=== VALIDANDO ARCHIVOS ===');
  console.log('uploadedFiles:', {
    tops: uploadedFiles.tops.length,
    bottoms: uploadedFiles.bottoms.length,
    shoes: uploadedFiles.shoes.length
  });
  
  if (uploadedFiles.tops.length === 0 || uploadedFiles.bottoms.length === 0 || uploadedFiles.shoes.length === 0) {
    showNotification('Sube al menos 1 imagen de cada categoría', 'error');
    return;
  }
  
  // Validar File objects
  const invalidTops = uploadedFiles.tops.filter(f => !(f instanceof File));
  const invalidBottoms = uploadedFiles.bottoms.filter(f => !(f instanceof File));
  const invalidShoes = uploadedFiles.shoes.filter(f => !(f instanceof File));
  
  if (invalidTops.length > 0 || invalidBottoms.length > 0 || invalidShoes.length > 0) {
    console.error('❌ Archivos inválidos');
    showNotification('Error: Archivos inválidos. Recarga la página.', 'error');
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
    const formData = new FormData();
    formData.append('user_email', currentUser.email);
    formData.append('occasion', selectedOccasion);
    
    uploadedFiles.tops.forEach((file, i) => formData.append('tops', file, file.name || `top_${i}.jpg`));
    uploadedFiles.bottoms.forEach((file, i) => formData.append('bottoms', file, file.name || `bottom_${i}.jpg`));
    uploadedFiles.shoes.forEach((file, i) => formData.append('shoes', file, file.name || `shoe_${i}.jpg`));
    
    const response = await fetch(`${CONFIG.API_BASE}/api/recommend`, {
      method: 'POST',
      body: formData
    });
    
    clearInterval(timerInterval);
    const finalTime = (Date.now() - processingStartTime) / 1000;
    if (timerDisplay) timerDisplay.textContent = finalTime.toFixed(1) + 's';
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error:', errorText);
      throw new Error(`Error ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.success) {
      userStats.recommendations++;
      updateStatsDisplay();
      renderRecommendations(data);
      showNotification(`✅ Procesado en ${finalTime.toFixed(1)}s`, 'success');
    } else {
      throw new Error(data.message || 'Error generando recomendaciones');
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
      btn.innerHTML = '<i class="fas fa-magic"></i> Generar Nuevas';
      btn.disabled = false;
    }
  }
}

function updateStatsDisplay() {
  const elements = [
    ['visitCounter', userStats.visits],
    ['recommendationCounter', userStats.recommendations],
    ['outfitCounter', userStats.savedOutfits],
    ['closetVisits', userStats.visits],
    ['closetRecommendations', userStats.recommendations],
    ['closetOutfits', userStats.savedOutfits]
  ];
  
  elements.forEach(([id, value]) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  });
}

function getImage(type, item) {
  const images = uploadedImages[type];
  if (!images?.length) return null;
  
  const idx = type === 'tops' ? item.top?.index : type === 'bottoms' ? item.bottom?.index : item.shoe?.index;
  return images[idx] || images[0];
}

function renderRecommendations(data) {
  const result = document.getElementById('result');
  if (!result) return;
  
  const results = data.results || [];
  
  if (!results.length) {
    result.innerHTML = '<div style="text-align:center;padding:3rem">No hay recomendaciones</div>';
    result.style.display = 'block';
    return;
  }
  
  const bestIdx = results.reduce((best, item, idx) => (item.final_score || 0) > (results[best].final_score || 0) ? idx : best, 0);
  const bestItem = results[bestIdx];
  const occasion = OCCASION_NAMES[selectedOccasion] || selectedOccasion;
  
  result.innerHTML = `
    <div style="text-align:center;margin-bottom:2rem">
      <h2 style="color:#000">Mejor Recomendación para ${occasion}</h2>
      <div style="background:linear-gradient(135deg,var(--gold),#f59e0b);color:#000;border-radius:15px;padding:1rem;margin:1rem 0;display:inline-block;font-weight:800">
        MEJOR OPCIÓN PARA ${occasion.toUpperCase()}
      </div>
    </div>
    <div style="display:grid;gap:2rem">
      ${renderCard(bestItem, 0, true, occasion)}
    </div>
  `;
  
  result.style.display = 'block';
  setTimeout(() => result.scrollIntoView({ behavior: 'smooth' }), 100);
}

function renderCard(item, idx, isBest, occasion) {
  const score = Math.round((item.final_score || 0) * 100);
  
  return `
    <div style="background:white;border:2px solid var(--gold);border-radius:20px;padding:2rem;box-shadow:0 0 30px rgba(251,191,36,.3)">
      <div style="position:absolute;top:-15px;left:50%;transform:translateX(-50%);background:var(--gold);color:#000;padding:.5rem 1.5rem;border-radius:20px;font-weight:800">
        MEJOR PARA ${occasion.toUpperCase()}
      </div>
      
      <div style="display:flex;justify-content:space-between;margin:1rem 0">
        <h3 style="color:#000">Combinación Perfecta</h3>
        <span style="background:var(--gold);color:#000;padding:.5rem 1rem;border-radius:15px;font-weight:700">${score}%</span>
      </div>
      
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:1rem;margin:1rem 0">
        ${renderItem('SUPERIOR', getImage('tops', item), item.top?.detected_item)}
        ${renderItem('INFERIOR', getImage('bottoms', item), item.bottom?.detected_item)}
        ${renderItem('CALZADO', getImage('shoes', item), item.shoe?.detected_item)}
      </div>
      
      <div style="background:rgba(59,130,246,.1);border-radius:10px;padding:1rem;text-align:center">
        <div style="font-weight:600;margin-bottom:.5rem">${item.harmony_type || 'Equilibrada'}</div>
        <div style="font-size:.9rem;opacity:.8">${item.harmony_description || 'Combinación balanceada'}</div>
      </div>
    </div>
  `;
}

function renderItem(title, img, name) {
  return `
    <div style="text-align:center">
      <div style="font-size:.8rem;font-weight:600;margin-bottom:.5rem">${title}</div>
      <div style="border:1px dashed rgba(59,130,246,.3);border-radius:20px;padding:1.5rem;min-height:240px;display:flex;align-items:center;justify-content:center">
        ${img ? `<img src="${img}" style="max-width:200px;max-height:200px;object-fit:contain;border-radius:15px;box-shadow:0 4px 12px rgba(0,0,0,.15)">` : `<div style="color:#666;font-size:2rem">${title[0]}</div>`}
      </div>
      <div style="font-size:.9rem;margin-top:.5rem;opacity:.8">${name || title}</div>
    </div>
  `;
}

// ========================================
// PLANES
// ========================================
function startFreePlan() {
  showNotification('Plan gratuito activado', 'success');
  setTimeout(() => scrollToSection('upload'), 1000);
}

function upgradeToPremium() {
  showNotification('Funcionalidad premium próximamente', 'info');
}

// ========================================
// NAVEGACIÓN
// ========================================
function scrollToSection(sectionId) {
  const section = document.getElementById(sectionId);
  if (section) section.scrollIntoView({ behavior: 'smooth' });
}

// ========================================
// PERSISTENCIA
// ========================================
function saveUserData() {
  if (!currentUser?.email) return;
  
  const userData = {
    email: currentUser.email,
    uploadedFiles,
    uploadedImages,
    closetItems,
    userStats,
    savedRecommendations,
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
      updateTabCounters();
    }
  } catch (error) {
    console.error('Error cargando datos:', error);
  }
}

// ========================================
// INICIALIZACIÓN
// ========================================
function initializeGoogleLogin() {
  if (typeof google === 'undefined') {
    setTimeout(initializeGoogleLogin, 1000);
    return;
  }
  
  google.accounts.id.initialize({
    client_id: CONFIG.GOOGLE_CLIENT_ID,
    callback: handleGoogleCredentialResponse,
    auto_select: false
  });
  
  const mainBtn = document.getElementById('headerLoginBtn');
  if (mainBtn) {
    mainBtn.disabled = false;
    mainBtn.style.opacity = '1';
    mainBtn.innerHTML = '<i class="fab fa-google"></i> Conectar con Google';
    mainBtn.onclick = () => google.accounts.id.prompt();
  }
}

function initializeApp() {
  console.log('INICIALIZANDO NoShopiA v3.1');
  setTimeout(initializeGoogleLogin, 2000);
}

// ========================================
// EXPOSICIÓN GLOBAL
// ========================================
window.handleIntelligentUpload = handleIntelligentUpload;
window.handleFileUpload = handleFileUpload;
window.handleGoogleCredentialResponse = handleGoogleCredentialResponse;
window.logout = logout;
window.enableCloset = enableCloset;
window.useDirectMode = useDirectMode;
window.showClosetTab = showClosetTab;
window.removeClosetItem = removeClosetItem;
window.scrollToSection = scrollToSection;
window.handleProfileSelection = handleProfileSelection;
window.submitUserProfile = submitUserProfile;
window.selectOccasion = selectOccasion;
window.getRecommendation = getRecommendation;
window.startFreePlan = startFreePlan;
window.upgradeToPremium = upgradeToPremium;
window.updateUploadUI = updateUploadUI;
window.removeImage = removeImage;
window.updateTabCounters = updateTabCounters;
window.updateGenerateButton = updateGenerateButton;

// Auto-inicialización
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  setTimeout(initializeApp, 100);
}

console.log('✅ app.js v3.1 CORREGIDO cargado');
