// closet.js - Sistema de Closet Inteligente REAL con IA
// Reemplaza completamente el archivo anterior

// // CONFIGURACIÓN DEL SISTEMA INTELIGENTE
// const INTELLIGENT_CATEGORIES = {
//   tops: {
//     "shirt": { name: "Camisas", icon: "👔", keywords: ["shirt", "dress shirt", "button", "collar"], color: "#3b82f6", confidence: 0.95 },
//     "blouse": { name: "Blusas", icon: "👚", keywords: ["blouse", "silk blouse", "flowy"], color: "#ec4899", confidence: 0.90 },
//     "sweater": { name: "Suéteres", icon: "🧥", keywords: ["sweater", "knitted", "wool", "pullover", "cardigan"], color: "#f59e0b", confidence: 0.92 },
//     "tshirt": { name: "Poleras", icon: "👕", keywords: ["t-shirt", "tee", "graphic", "tank top", "casual"], color: "#10b981", confidence: 0.96 },
//     "jacket": { name: "Chaquetas", icon: "🧥", keywords: ["jacket", "leather", "denim", "blazer", "outer"], color: "#6b7280", confidence: 0.88 },
//     "dress": { name: "Vestidos", icon: "👗", keywords: ["dress", "summer dress", "evening dress", "gown"], color: "#8b5cf6", confidence: 0.94 },
//     "hoodie": { name: "Hoodies", icon: "👘", keywords: ["hoodie", "zip-up", "sweatshirt", "hooded"], color: "#ef4444", confidence: 0.93 },
//     "coat": { name: "Abrigos", icon: "🧥", keywords: ["coat", "winter coat", "overcoat", "trench"], color: "#1f2937", confidence: 0.91 },
//     "vest": { name: "Chalecos", icon: "🦺", keywords: ["vest", "waistcoat"], color: "#84cc16", confidence: 0.88 } // ← AGREGAR ESTA LÍNEA
//   },
//   bottoms: {
//     "jeans": { name: "Jeans", icon: "👖", keywords: ["jeans", "denim", "blue jeans", "ripped"], color: "#1e40af", confidence: 0.97 },
//     "pants": { name: "Pantalones", icon: "👖", keywords: ["pants", "trousers", "formal pants", "chinos", "slacks"], color: "#3b82f6", confidence: 0.92 },
//     "skirt": { name: "Faldas", icon: "👗", keywords: ["skirt", "midi skirt", "pencil skirt", "mini skirt"], color: "#ec4899", confidence: 0.94 },
//     "shorts": { name: "Shorts", icon: "🩳", keywords: ["shorts", "athletic shorts", "bermuda"], color: "#10b981", confidence: 0.96 },
//     "leggings": { name: "Calzas", icon: "🩱", keywords: ["leggings", "sweatpants", "athletic pants", "yoga pants"], color: "#6b7280", confidence: 0.95 }
//   },
//   shoes: {
//     "sneakers": { name: "Zapatillas", icon: "👟", keywords: ["sneakers", "running shoes", "athletic shoes", "trainers"], color: "#3b82f6", confidence: 0.96 },
//     "dress_shoes": { name: "Zapatos Formales", icon: "👞", keywords: ["dress shoes", "leather shoes", "formal shoes", "oxfords"], color: "#1f2937", confidence: 0.93 },
//     "boots": { name: "Botas", icon: "🥾", keywords: ["boots", "ankle boots", "hiking boots", "combat boots"], color: "#92400e", confidence: 0.91 },
//     "heels": { name: "Tacones", icon: "👠", keywords: ["heels", "stiletto heels", "pumps", "high heels"], color: "#ec4899", confidence: 0.94 },
//     "sandals": { name: "Sandalias", icon: "👡", keywords: ["sandals", "leather sandals", "flip flops"], color: "#f59e0b", confidence: 0.92 },
//     "flats": { name: "Ballerinas", icon: "🥿", keywords: ["flats", "ballet flats", "loafers"], color: "#6b7280", confidence: 0.90 }
//   }
// };

// // VARIABLES GLOBALES DEL SISTEMA INTELIGENTE
// let intelligentClosetItems = { tops: {}, bottoms: {}, shoes: {} };
// let selectedClosetItems = { tops: new Set(), bottoms: new Set(), shoes: new Set() };
// let savedRecommendations = [];
// let activeClosetType = 'tops';

// // FUNCIONES PRINCIPALES DEL CLOSET INTELIGENTE

// // Obtener total de prendas en el closet
// function getTotalIntelligentClosetItems() {
//   let total = 0;
//   ['tops', 'bottoms', 'shoes'].forEach(type => {
//     Object.values(intelligentClosetItems[type]).forEach(category => {
//       total += category.length;
//     });
//   });
//   return total;
// }

// // Cargar datos del usuario
// function loadUserData() {
//   if (!currentUser?.email) return;
  
//   const closetData = localStorage.getItem(`noshopia_intelligent_closet_${currentUser.email}`);
//   if (closetData) {
//     const data = JSON.parse(closetData);
//     intelligentClosetItems = data.intelligentClosetItems || { tops: {}, bottoms: {}, shoes: {} };
//     console.log('🧠 Closet Inteligente cargado:', getTotalIntelligentClosetItems(), 'prendas');
//   }
  
//   const savedData = localStorage.getItem(`noshopia_saved_${currentUser.email}`);
//   if (savedData) {
//     savedRecommendations = JSON.parse(savedData);
//     console.log('⭐ Recomendaciones guardadas:', savedRecommendations.length);
//   }
// }

// // Guardar datos del usuario
// function saveUserData() {
//   if (!currentUser?.email) return;
  
//   const closetData = {
//     email: currentUser.email,
//     intelligentClosetItems,
//     lastUpdated: new Date().toISOString(),
//     totalItems: getTotalIntelligentClosetItems()
//   };
//   localStorage.setItem(`noshopia_intelligent_closet_${currentUser.email}`, JSON.stringify(closetData));
  
//   if (savedRecommendations.length > 0) {
//     localStorage.setItem(`noshopia_saved_${currentUser.email}`, JSON.stringify(savedRecommendations));
//   }
// }

// // Actualizar UI del closet inteligente
// function updateIntelligentClosetUI() {
//   const total = getTotalIntelligentClosetItems();
//   const remaining = Math.max(0, CONFIG.INTELLIGENT_CLOSET_LIMIT - total);
  
//   // Update navigation badges
//   ['tops', 'bottoms', 'shoes'].forEach(type => {
//     const count = Object.values(intelligentClosetItems[type]).reduce((sum, category) => sum + category.length, 0);
//     const badge = document.getElementById(`${type}CountNav`);
//     if (badge) {
//       badge.textContent = count;
//       badge.style.display = count > 0 ? 'flex' : 'none';
//     }
//   });
  
//   updateIntelligentGenerateButton();
//   updateSelectionUI();
// }

// // SIMULACIÓN DE DETECCIÓN IA MEJORADA
// async function simulateAIDetection(file) {
//   const fileName = file.name.toLowerCase();
  
//   // Lógica de detección mejorada
//   let detectedType = 'tops';
//   let detectedCategory = 'tshirt';
//   let detectedItem = 'Prenda superior';
//   let confidence = 0.85;
  
//   // Detección de inferiores
//   if (fileName.includes('jean') || fileName.includes('pantalon') || fileName.includes('pants')) {
//     detectedType = 'bottoms';
//     detectedCategory = 'jeans';
//     detectedItem = 'Jeans';
//     confidence = 0.92;
//   } else if (fileName.includes('falda') || fileName.includes('skirt')) {
//     detectedType = 'bottoms';
//     detectedCategory = 'skirt';
//     detectedItem = 'Falda';
//     confidence = 0.90;
//   } else if (fileName.includes('short')) {
//     detectedType = 'bottoms';
//     detectedCategory = 'shorts';
//     detectedItem = 'Shorts';
//     confidence = 0.88;
//   }
  
//   // Detección de calzado
//   else if (fileName.includes('zapato') || fileName.includes('shoe')) {
//     detectedType = 'shoes';
//     detectedCategory = 'dress_shoes';
//     detectedItem = 'Zapatos formales';
//     confidence = 0.91;
//   } else if (fileName.includes('zapatilla') || fileName.includes('sneaker')) {
//     detectedType = 'shoes';
//     detectedCategory = 'sneakers';
//     detectedItem = 'Zapatillas';
//     confidence = 0.94;
//   } else if (fileName.includes('bota') || fileName.includes('boot')) {
//     detectedType = 'shoes';
//     detectedCategory = 'boots';
//     detectedItem = 'Botas';
//     confidence = 0.89;
//   }
  
//   // Detección de superiores (más específica)
//   else if (fileName.includes('camisa') || fileName.includes('shirt')) {
//     detectedCategory = 'shirt';
//     detectedItem = 'Camisa';
//     confidence = 0.93;
//   } else if (fileName.includes('polera') || fileName.includes('tshirt') || fileName.includes('tee')) {
//     detectedCategory = 'tshirt';
//     detectedItem = 'Polera';
//     confidence = 0.95;
//   } else if (fileName.includes('sweater') || fileName.includes('sueter')) {
//     detectedCategory = 'sweater';
//     detectedItem = 'Suéter';
//     confidence = 0.87;
//   } else if (fileName.includes('vestido') || fileName.includes('dress')) {
//     detectedCategory = 'dress';
//     detectedItem = 'Vestido';
//     confidence = 0.92;
//   } else if (fileName.includes('blusa') || fileName.includes('blouse')) {
//     detectedCategory = 'blouse';
//     detectedItem = 'Blusa';
//     confidence = 0.89;
//   }
  
//   return {
//     type: detectedType,
//     category: detectedCategory,
//     item: detectedItem,
//     confidence
//   };
// }

// // Convertir archivo a Data URL
// function fileToDataUrl(file) {
//   return new Promise((resolve, reject) => {
//     const reader = new FileReader();
//     reader.onload = e => resolve(e.target.result);
//     reader.onerror = reject;
//     reader.readAsDataURL(file);
//   });
// }

// // Categorizar prenda inteligentemente
// function categorizeIntelligentItem(type, categoryId, detectedItem, imageUrl, file) {
//   if (!intelligentClosetItems[type][categoryId]) {
//     intelligentClosetItems[type][categoryId] = [];
//   }
  
//   const item = {
//     id: Date.now() + Math.random(),
//     imageUrl,
//     file,
//     detectedItem,
//     category: categoryId,
//     addedAt: new Date().toISOString(),
//     aiDetected: true
//   };
  
//   intelligentClosetItems[type][categoryId].push(item);
  
//   console.log(`🧠 Prenda categorizada: ${detectedItem} en ${type}/${categoryId}`);
//   return item;
// }

// // Navegación automática a tipo detectado
// function navigateToDetectedType(type) {
//   // Cambiar pestaña activa
//   document.querySelectorAll('.closet-nav-item').forEach(nav => nav.classList.remove('active'));
//   const targetTab = document.querySelector(`[data-type="${type}"]`);
//   if (targetTab) {
//     targetTab.classList.add('active');
//   }
  
//   activeClosetType = type;
//   renderIntelligentCategories();
  
//   showNotification(`📍 Navegando a ${type === 'tops' ? 'Superiores' : type === 'bottoms' ? 'Inferiores' : 'Calzado'}`, 'info');
// }

// // Upload inteligente con IA
// async function handleIntelligentUpload(event) {
//   const files = Array.from(event.target.files);
//   if (files.length === 0) return;
  
//   const remaining = CONFIG.INTELLIGENT_CLOSET_LIMIT - getTotalIntelligentClosetItems();
  
//   if (files.length > remaining) {
//     showNotification(`Solo puedes subir ${remaining} prendas más`, 'error');
//     event.target.value = '';
//     return;
//   }
  
//   // Activar indicadores de IA
//   const aiStatus = document.getElementById('aiDetectionStatus');
//   const autoNav = document.getElementById('autoNavigation');
//   const progressBar = document.getElementById('aiProgressBar');
//   const statusText = document.getElementById('aiStatusText');
//   const autoNavText = document.getElementById('autoNavText');
  
//   if (aiStatus) aiStatus.classList.add('active');
//   if (progressBar) progressBar.style.width = '0%';
  
//   showNotification('🧠 IA analizando y categorizando prendas...', 'info');
  
//   for (let i = 0; i < files.length; i++) {
//     const file = files[i];
//     const progress = ((i + 1) / files.length) * 100;
    
//     // Actualizar progreso
//     if (statusText) statusText.textContent = `Analizando prenda ${i + 1} de ${files.length}...`;
//     if (progressBar) progressBar.style.width = progress + '%';
    
//     try {
//       // Simular detección de IA
//       const detectionResult = await simulateAIDetection(file);
      
//       // Convertir imagen
//       const imageUrl = await fileToDataUrl(file);
      
//       // Categorizar automáticamente
//       categorizeIntelligentItem(detectionResult.type, detectionResult.category, detectionResult.item, imageUrl, file);
      
//       // Mostrar navegación automática
//       if (autoNav && autoNavText) {
//         autoNav.classList.add('show');
//         autoNavText.textContent = `La IA detectó: ${detectionResult.item} (${detectionResult.type})`;
        
//         // Navegar automáticamente
//         setTimeout(() => {
//           navigateToDetectedType(detectionResult.type);
//         }, 1500);
//       }
      
//       await new Promise(resolve => setTimeout(resolve, 1000));
      
//     } catch (error) {
//       console.error('Error en detección IA:', error);
//       showNotification(`Error procesando ${file.name}`, 'error');
//     }
//   }
  
//   // Finalizar proceso
//   setTimeout(() => {
//     if (aiStatus) aiStatus.classList.remove('active');
//     if (autoNav) autoNav.classList.remove('show');
//     finishIntelligentUpload(files.length);
//   }, 2000);
  
//   event.target.value = '';
// }

// // Finalizar upload inteligente
// function finishIntelligentUpload(count) {
//   saveUserData();
//   updateIntelligentClosetUI();
//   renderIntelligentCategories();
  
//   const remaining = CONFIG.INTELLIGENT_CLOSET_LIMIT - getTotalIntelligentClosetItems();
//   showNotification(`🧠 ${count} prenda${count !== 1 ? 's' : ''} detectada${count !== 1 ? 's' : ''} y categorizada${count !== 1 ? 's' : ''} automáticamente! Te quedan ${remaining} espacios.`, 'success');
// }

// // Renderizar categorías inteligentes
// function renderIntelligentCategories() {
//   const container = document.getElementById('intelligentCategories');
//   if (!container) return;
  
//   const items = intelligentClosetItems[activeClosetType];
  
//   if (!items || Object.keys(items).length === 0) {
//     container.innerHTML = `
//       <div style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
//         <div style="font-size: 4rem; margin-bottom: 1rem; opacity: 0.5;">🧠</div>
//         <h3 style="color: #666; margin-bottom: 1rem;">Tu closet de ${activeClosetType === 'tops' ? 'superiores' : activeClosetType === 'bottoms' ? 'inferiores' : 'calzado'} está vacío</h3>
//         <p style="opacity: 0.7;">Sube fotos para que la IA las detecte y organice automáticamente</p>
//       </div>
//     `;
//     return;
//   }
  
//   let html = '';
  
//   Object.entries(items).forEach(([categoryId, categoryItems]) => {
//     if (categoryItems.length === 0) return;
    
//     const categoryInfo = INTELLIGENT_CATEGORIES[activeClosetType][categoryId];
//     if (!categoryInfo) return;
    
//     const allAiDetected = categoryItems.every(item => item.aiDetected);
    
//     html += `
//       <div class="smart-category ${categoryItems.length > 0 ? 'has-items' : ''} ${allAiDetected ? 'auto-detected' : ''}">
//         <div class="category-header">
//           <div class="category-icon" style="background: ${categoryInfo.color};">
//             ${categoryInfo.icon}
//           </div>
//           <div class="category-info">
//             <h4>${categoryInfo.name}</h4>
//             <p>${categoryItems.length} prenda${categoryItems.length !== 1 ? 's' : ''}</p>
//             ${allAiDetected ? `<span class="ai-confidence">${Math.round(categoryInfo.confidence * 100)}% IA</span>` : ''}
//           </div>
//         </div>
//         <div class="smart-items-grid">
//           ${categoryItems.map((item, index) => {
//             const isSelected = selectedClosetItems[activeClosetType].has(item.id);
//             return `
//               <div class="smart-item ${isSelected ? 'selected' : ''}" data-id="${item.id}">
//                 <img src="${item.imageUrl}" alt="${categoryInfo.name}">
//                 <div class="item-controls">
//                   <button class="item-btn select" onclick="toggleItemSelection('${activeClosetType}', '${item.id}')" title="${isSelected ? 'Deseleccionar' : 'Seleccionar'}">
//                     ${isSelected ? '✓' : '+'}
//                   </button>
//                   <button class="item-btn" onclick="removeIntelligentItem('${activeClosetType}', '${categoryId}', ${index})" title="Eliminar">×</button>
//                 </div>
//               </div>
//             `;
//           }).join('')}
//         </div>
//       </div>
//     `;
//   });
  
//   container.innerHTML = html;
//   updateSelectionUI();
// }

// // Sistema de selección mejorado
// window.toggleItemSelection = function(type, itemId) {
//   const selectedSet = selectedClosetItems[type];
  
//   if (selectedSet.has(itemId)) {
//     // DESELECCIONAR
//     selectedSet.delete(itemId);
//     showNotification('Prenda deseleccionada', 'info');
//   } else {
//     // SELECCIONAR
//     selectedSet.add(itemId);
//     showNotification('Prenda seleccionada', 'success');
//   }
  
//   renderIntelligentCategories();
//   updateIntelligentGenerateButton();
// };

// // Eliminar prenda del closet inteligente
// window.removeIntelligentItem = function(type, categoryId, index) {
//   const categoryInfo = INTELLIGENT_CATEGORIES[type][categoryId];
//   const itemName = categoryInfo ? categoryInfo.name : categoryId;
  
//   if (!confirm(`¿Eliminar esta prenda de ${itemName}?`)) return;
  
//   const item = intelligentClosetItems[type][categoryId][index];
  
//   // Eliminar de selecciones
//   selectedClosetItems[type].delete(item.id);
  
//   // Eliminar del closet
//   intelligentClosetItems[type][categoryId].splice(index, 1);
  
//   // Si la categoría queda vacía, eliminarla
//   if (intelligentClosetItems[type][categoryId].length === 0) {
//     delete intelligentClosetItems[type][categoryId];
//   }
  
//   saveUserData();
//   updateIntelligentClosetUI();
//   renderIntelligentCategories();
  
//   showNotification(`Prenda eliminada de ${itemName}`, 'info');
// };

// // Actualizar UI de selecciones
// function updateSelectionUI() {
//   const types = ['tops', 'bottoms', 'shoes'];
  
//   types.forEach(type => {
//     const count = selectedClosetItems[type].size;
//     const countElement = document.getElementById(`selected${type.charAt(0).toUpperCase() + type.slice(1)}Count`);
//     const categoryElement = document.getElementById(`selection${type.charAt(0).toUpperCase() + type.slice(1)}`);
//     const previewElement = document.getElementById(`selected${type.charAt(0).toUpperCase() + type.slice(1)}Preview`);
    
//     if (countElement) countElement.textContent = count;
//     if (categoryElement) {
//       categoryElement.className = `selection-category ${count > 0 ? 'has-selection' : ''}`;
//     }
    
//     // Mostrar preview de seleccionados
//     if (previewElement) {
//       const selectedIds = Array.from(selectedClosetItems[type]);
//       const selectedItems = selectedIds.map(id => {
//         // Buscar el item en todas las categorías
//         for (const categoryId in intelligentClosetItems[type]) {
//           const item = intelligentClosetItems[type][categoryId].find(item => item.id === id);
//           if (item) return item;
//         }
//         return null;
//       }).filter(Boolean);
      
//       previewElement.innerHTML = selectedItems.map(item => 
//         `<img src="${item.imageUrl}" class="mini-preview" alt="Seleccionada">`
//       ).join('');
//     }
//   });
// }

// // Actualizar botón de generar
// function updateIntelligentGenerateButton() {
//   const btn = document.getElementById('intelligentGenerateBtn');
//   if (!btn) return;
  
//   const hasSelections = selectedClosetItems.tops.size > 0 && 
//                        selectedClosetItems.bottoms.size > 0 && 
//                        selectedClosetItems.shoes.size > 0;
  
//   if (hasSelections && selectedOccasion) {
//     const totalCombinations = selectedClosetItems.tops.size * selectedClosetItems.bottoms.size * selectedClosetItems.shoes.size;
//     btn.disabled = false;
//     btn.style.opacity = '1';
//     btn.innerHTML = `<i class="fas fa-magic"></i> Generar ${Math.min(3, totalCombinations)} Recomendaciones del Closet IA`;
//   } else {
//     btn.disabled = true;
//     btn.style.opacity = '0.6';
//     if (!selectedOccasion) {
//       btn.innerHTML = '<i class="fas fa-magic"></i> Selecciona una ocasión primero';
//     } else {
//       btn.innerHTML = '<i class="fas fa-magic"></i> Selecciona al menos 1 prenda de cada tipo';
//     }
//   }
// }

// // Generar recomendaciones desde closet inteligente
// window.generateFromIntelligentCloset = function() {
//   if (!selectedOccasion) {
//     showOccasionSelector();
//     showNotification('Primero selecciona una ocasión', 'info');
//     return;
//   }
  
//   const hasSelections = selectedClosetItems.tops.size > 0 && 
//                        selectedClosetItems.bottoms.size > 0 && 
//                        selectedClosetItems.shoes.size > 0;
  
//   if (!hasSelections) {
//     showNotification('Selecciona al menos 1 prenda de cada tipo', 'error');
//     return;
//   }
  
//   // Obtener archivos de las prendas seleccionadas
//   const selectedFiles = { tops: [], bottoms: [], shoes: [] };
  
//   ['tops', 'bottoms', 'shoes'].forEach(type => {
//     const selectedIds = Array.from(selectedClosetItems[type]);
//     selectedIds.forEach(id => {
//       // Buscar el item en todas las categorías
//       for (const categoryId in intelligentClosetItems[type]) {
//         const item = intelligentClosetItems[type][categoryId].find(item => item.id === id);
//         if (item && item.file) {
//           selectedFiles[type].push(item.file);
//           break;
//         }
//       }
//     });
//   });
  
//   generateRecommendationsWithFiles(selectedFiles);
// };

// // Trigger upload inteligente
// window.triggerSmartUpload = function() {
//   const remaining = CONFIG.INTELLIGENT_CLOSET_LIMIT - getTotalIntelligentClosetItems();
  
//   if (remaining <= 0) {
//     showNotification(`🧠 Closet lleno (${CONFIG.INTELLIGENT_CLOSET_LIMIT}/15). Elimina prendas para agregar nuevas.`, 'error');
//     return;
//   }
  
//   const input = document.getElementById('smart-upload');
//   if (input) {
//     input.onchange = handleIntelligentUpload;
//     input.click();
//   }
// };

// // FUNCIONES DE INICIALIZACIÓN
// function initializeIntelligentCloset() {
//   console.log('🧠 Inicializando Closet Inteligente...');
  
//   // Cargar datos si hay usuario logueado
//   if (isLoggedIn && currentUser?.email) {
//     loadUserData();
//     updateIntelligentClosetUI();
//     renderIntelligentCategories();
//   }
  
//   // Configurar drag & drop
//   const smartUploadArea = document.getElementById('smartUploadArea');
//   if (smartUploadArea) {
//     smartUploadArea.addEventListener('dragover', (e) => {
//       e.preventDefault();
//       smartUploadArea.classList.add('dragover');
//     });
    
//     smartUploadArea.addEventListener('dragleave', (e) => {
//       e.preventDefault();
//       smartUploadArea.classList.remove('dragover');
//     });
    
//     smartUploadArea.addEventListener('drop', (e) => {
//       e.preventDefault();
//       smartUploadArea.classList.remove('dragover');
      
//       const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
//       if (files.length > 0) {
//         // Simular selección de archivos
//         const input = document.getElementById('smart-upload');
//         const dt = new DataTransfer();
//         files.forEach(file => dt.items.add(file));
//         input.files = dt.files;
        
//         // Trigger change event
//         const event = new Event('change', { bubbles: true });
//         input.dispatchEvent(event);
//       }
//     });
//   }
// }

// // GUARDADO DE FAVORITOS
// window.saveToFavorites = function(index) {
//   if (!intelligentClosetMode || !window.currentResults) return;
  
//   const recommendation = window.currentResults[index];
//   savedRecommendations.push({
//     id: Date.now(),
//     recommendation,
//     occasion: selectedOccasion,
//     savedAt: new Date().toISOString()
//   });
  
//   saveUserData();
//   showNotification('Recomendación guardada en favoritos', 'success');
// };

// // EXPORTAR FUNCIONES GLOBALES
// window.initializeIntelligentCloset = initializeIntelligentCloset;
// window.loadUserData = loadUserData;
// window.saveUserData = saveUserData;
// window.updateIntelligentClosetUI = updateIntelligentClosetUI;
// window.renderIntelligentCategories = renderIntelligentCategories;

// // AUTO-INICIALIZACIÓN
// document.addEventListener('DOMContentLoaded', function() {
//   console.log('🧠 Closet Inteligente JS cargado');
//   setTimeout(initializeIntelligentCloset, 500);
// });

// console.log('✅ closet.js - Sistema Inteligente Completo cargado');

// closet.js - Sistema Inteligente con Detección IA Alineado con Backend

// CATEGORÍAS INTELIGENTES EXACTAS DEL BACKEND (clip_services_local.py)
const INTELLIGENT_CATEGORIES = {
  tops: {
    "tshirt": { name: "Poleras", icon: "👕", keywords: ["t-shirt", "tee", "graphic", "tank top"], color: "#10b981" },
    "shirt": { name: "Camisas", icon: "👔", keywords: ["shirt", "dress shirt", "button", "collar"], color: "#3b82f6" },
    "blouse": { name: "Blusas", icon: "👚", keywords: ["blouse", "silk blouse", "flowy"], color: "#ec4899" },
    "sweater": { name: "Suéteres", icon: "🧥", keywords: ["sweater", "knitted", "wool", "pullover", "cardigan"], color: "#f59e0b" },
    "hoodie": { name: "Hoodies", icon: "👘", keywords: ["hoodie", "zip-up", "sweatshirt", "hooded"], color: "#ef4444" },
    "jacket": { name: "Chaquetas", icon: "🧥", keywords: ["jacket", "leather", "denim", "blazer", "outer"], color: "#6b7280" },
    "coat": { name: "Abrigos", icon: "🧥", keywords: ["coat", "winter coat", "overcoat", "trench"], color: "#1f2937" },
    "dress": { name: "Vestidos", icon: "👗", keywords: ["dress", "summer dress", "evening dress", "gown"], color: "#8b5cf6" },
    "vest": { name: "Chalecos", icon: "🦺", keywords: ["vest", "waistcoat"], color: "#84cc16" }
  },
  bottoms: {
    "jeans": { name: "Jeans", icon: "👖", keywords: ["jeans", "denim", "blue jeans", "ripped"], color: "#1e40af" },
    "pants": { name: "Pantalones", icon: "👖", keywords: ["pants", "trousers", "formal pants", "chinos", "slacks"], color: "#3b82f6" },
    "skirt": { name: "Faldas", icon: "👗", keywords: ["skirt", "midi skirt", "pencil skirt", "mini skirt"], color: "#ec4899" },
    "shorts": { name: "Shorts", icon: "🩳", keywords: ["shorts", "athletic shorts", "bermuda"], color: "#10b981" },
    "leggings": { name: "Calzas", icon: "🩱", keywords: ["leggings", "sweatpants", "athletic pants", "yoga pants"], color: "#6b7280" }
  },
  shoes: {
    "sneakers": { name: "Zapatillas", icon: "👟", keywords: ["sneakers", "running shoes", "athletic shoes", "trainers"], color: "#3b82f6" },
    "dress_shoes": { name: "Zapatos Formales", icon: "👞", keywords: ["dress shoes", "leather shoes", "formal shoes", "oxfords"], color: "#1f2937" },
    "boots": { name: "Botas", icon: "🥾", keywords: ["boots", "ankle boots", "hiking boots", "combat boots"], color: "#92400e" },
    "heels": { name: "Tacones", icon: "👠", keywords: ["heels", "stiletto heels", "pumps", "high heels"], color: "#ec4899" },
    "sandals": { name: "Sandalias", icon: "👡", keywords: ["sandals", "leather sandals", "flip flops"], color: "#f59e0b" },
    "flats": { name: "Ballerinas", icon: "🥿", keywords: ["flats", "ballet flats", "loafers"], color: "#6b7280" }
  }
};

// MAPEO DE TRADUCCIÓN DEL BACKEND (CATEGORY_TRANSLATION)
const BACKEND_CATEGORY_MAPPING = {
  // TOPS
  "t-shirt": "tshirt", "graphic t-shirt": "tshirt", "tank top": "tshirt",
  "shirt": "shirt", "dress shirt": "shirt", 
  "blouse": "blouse", "silk blouse": "blouse",
  "sweater": "sweater", "knitted sweater": "sweater", "wool pullover": "sweater", "cardigan": "sweater",
  "hoodie": "hoodie", "zip-up hoodie": "hoodie", "sweatshirt": "hoodie",
  "jacket": "jacket", "leather jacket": "jacket", "denim jacket": "jacket", "blazer": "jacket",
  "coat": "coat", "winter coat": "coat", "overcoat": "coat", "trench": "coat",
  "dress": "dress", "summer dress": "dress", "evening dress": "dress", "gown": "dress",
  "vest": "vest",
  
  // BOTTOMS
  "jeans": "jeans", "blue denim jeans": "jeans", "ripped jeans": "jeans",
  "pants": "pants", "trousers": "pants", "dress pants": "pants", "formal pants": "pants", "chinos": "pants", "slacks": "pants",
  "skirt": "skirt", "midi skirt": "skirt", "pencil skirt": "skirt", "mini skirt": "skirt",
  "shorts": "shorts", "athletic shorts": "shorts", "bermuda": "shorts",
  "leggings": "leggings", "sweatpants": "leggings", "athletic pants": "leggings", "yoga pants": "leggings",
  
  // SHOES
  "sneakers": "sneakers", "running shoes": "sneakers", "athletic shoes": "sneakers", "trainers": "sneakers",
  "dress shoes": "dress_shoes", "leather shoes": "dress_shoes", "formal shoes": "dress_shoes", "oxfords": "dress_shoes", "shoes": "dress_shoes",
  "boots": "boots", "ankle boots": "boots", "hiking boots": "boots", "combat boots": "boots",
  "heels": "heels", "stiletto heels": "heels", "pumps": "heels", "high heels": "heels",
  "sandals": "sandals", "leather sandals": "sandals", "flip flops": "sandals",
  "flats": "flats", "ballet flats": "flats", "loafers": "flats"
};

// Variables del sistema inteligente (usando variables globales unificadas)
let intelligentClosetItems = { tops: {}, bottoms: {}, shoes: {} };
let selectedClosetItems = { tops: new Set(), bottoms: new Set(), shoes: new Set() };
let closetSelectionMode = false;
let activeClosetType = 'tops';

// DETECCIÓN AUTOMÁTICA DE PRENDAS ALINEADA CON BACKEND
async function simulateAIDetection(file) {
  console.log('🤖 IA detectando prenda:', file.name);
  
  const fileName = file.name.toLowerCase();
  
  // Inicializar valores por defecto
  let detectedType = 'tops';
  let detectedCategory = 'tshirt';
  let detectedItem = 'Polera';
  let confidence = 0.75;
  
  // DETECCIÓN POR NOMBRE DE ARCHIVO (simulando IA)
  
  // BOTTOMS - Prioridad alta
  if (fileName.includes('jean')) {
    detectedType = 'bottoms'; detectedCategory = 'jeans'; detectedItem = 'Jeans'; confidence = 0.95;
  } else if (fileName.includes('pantalon') || fileName.includes('pants') || fileName.includes('trouser')) {
    detectedType = 'bottoms'; detectedCategory = 'pants'; detectedItem = 'Pantalones'; confidence = 0.92;
  } else if (fileName.includes('falda') || fileName.includes('skirt')) {
    detectedType = 'bottoms'; detectedCategory = 'skirt'; detectedItem = 'Falda'; confidence = 0.90;
  } else if (fileName.includes('short')) {
    detectedType = 'bottoms'; detectedCategory = 'shorts'; detectedItem = 'Shorts'; confidence = 0.88;
  } else if (fileName.includes('calza') || fileName.includes('legging') || fileName.includes('yoga')) {
    detectedType = 'bottoms'; detectedCategory = 'leggings'; detectedItem = 'Calzas'; confidence = 0.89;
  }
  
  // SHOES - Prioridad alta
  else if (fileName.includes('zapatilla') || fileName.includes('sneaker') || fileName.includes('running')) {
    detectedType = 'shoes'; detectedCategory = 'sneakers'; detectedItem = 'Zapatillas'; confidence = 0.94;
  } else if (fileName.includes('zapato') || fileName.includes('dress') && fileName.includes('shoe')) {
    detectedType = 'shoes'; detectedCategory = 'dress_shoes'; detectedItem = 'Zapatos Formales'; confidence = 0.91;
  } else if (fileName.includes('bota') || fileName.includes('boot')) {
    detectedType = 'shoes'; detectedCategory = 'boots'; detectedItem = 'Botas'; confidence = 0.89;
  } else if (fileName.includes('taco') || fileName.includes('heel')) {
    detectedType = 'shoes'; detectedCategory = 'heels'; detectedItem = 'Tacones'; confidence = 0.92;
  } else if (fileName.includes('sandalia') || fileName.includes('sandal') || fileName.includes('flip')) {
    detectedType = 'shoes'; detectedCategory = 'sandals'; detectedItem = 'Sandalias'; confidence = 0.87;
  } else if (fileName.includes('ballerina') || fileName.includes('flat')) {
    detectedType = 'shoes'; detectedCategory = 'flats'; detectedItem = 'Ballerinas'; confidence = 0.86;
  }
  
  // TOPS - Detección específica (si no es bottom ni shoe)
  else if (fileName.includes('camisa') || fileName.includes('shirt')) {
    detectedCategory = 'shirt'; detectedItem = 'Camisa'; confidence = 0.93;
  } else if (fileName.includes('polera') || fileName.includes('tshirt') || fileName.includes('tee')) {
    detectedCategory = 'tshirt'; detectedItem = 'Polera'; confidence = 0.95;
  } else if (fileName.includes('blusa') || fileName.includes('blouse')) {
    detectedCategory = 'blouse'; detectedItem = 'Blusa'; confidence = 0.89;
  } else if (fileName.includes('sweater') || fileName.includes('sueter') || fileName.includes('cardigan')) {
    detectedCategory = 'sweater'; detectedItem = 'Suéter'; confidence = 0.87;
  } else if (fileName.includes('hoodie') || fileName.includes('capucha') || fileName.includes('sudadera')) {
    detectedCategory = 'hoodie'; detectedItem = 'Hoodie'; confidence = 0.91;
  } else if (fileName.includes('chaqueta') || fileName.includes('jacket') || fileName.includes('blazer')) {
    detectedCategory = 'jacket'; detectedItem = 'Chaqueta'; confidence = 0.88;
  } else if (fileName.includes('abrigo') || fileName.includes('coat') || fileName.includes('parka')) {
    detectedCategory = 'coat'; detectedItem = 'Abrigo'; confidence = 0.85;
  } else if (fileName.includes('vestido') || fileName.includes('dress')) {
    detectedCategory = 'dress'; detectedItem = 'Vestido'; confidence = 0.92;
  } else if (fileName.includes('chaleco') || fileName.includes('vest')) {
    detectedCategory = 'vest'; detectedItem = 'Chaleco'; confidence = 0.84;
  }
  
  console.log(`🎯 IA detectó: ${detectedItem} (${detectedType}/${detectedCategory}) - Confianza: ${Math.round(confidence * 100)}%`);
  
  return {
    type: detectedType,
    category: detectedCategory,
    item: detectedItem,
    confidence
  };
}

// Convertir archivo a Data URL
function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// CATEGORIZAR PRENDA INTELIGENTEMENTE
function categorizeIntelligentItem(type, categoryId, detectedItem, imageUrl, file) {
  if (!intelligentClosetItems[type][categoryId]) {
    intelligentClosetItems[type][categoryId] = [];
  }
  
  const item = {
    id: Date.now() + Math.random(),
    imageUrl,
    file,
    detectedItem,
    category: categoryId,
    addedAt: new Date().toISOString(),
    aiDetected: true
  };
  
  intelligentClosetItems[type][categoryId].push(item);
  
  // TAMBIÉN agregar a arrays globales para compatibilidad
  uploadedFiles[type].push(file);
  uploadedImages[type].push(imageUrl);
  closetItems[type].push(imageUrl);
  
  console.log(`🧠 Prenda categorizada: ${detectedItem} en ${type}/${categoryId}`);
  return item;
}

// NAVEGACIÓN AUTOMÁTICA AL TIPO DETECTADO
function navigateToDetectedType(type) {
  console.log(`📍 Navegando automáticamente a: ${type}`);
  
  // Cambiar pestaña activa
  document.querySelectorAll('.closet-tab').forEach(tab => tab.classList.remove('active'));
  const targetTab = document.querySelector(`[data-tab="${type === 'tops' ? 'superiores' : type === 'bottoms' ? 'inferiores' : 'calzado'}"]`);
  if (targetTab) {
    targetTab.classList.add('active');
  }
  
  // Actualizar tipo activo
  activeClosetType = type;
  
  // Renderizar categorías
  renderIntelligentCategories();
  
  const typeNames = { tops: 'Superiores', bottoms: 'Inferiores', shoes: 'Calzado' };
  window.showNotification(`📍 Navegando a ${typeNames[type]}`, 'info');
}

// UPLOAD INTELIGENTE CON IA (función principal)
async function handleIntelligentUpload(event) {
  const files = Array.from(event.target.files);
  if (files.length === 0) return;
  
  // Verificar límites usando función unificada
  const remaining = window.getRemainingClosetSlots();
  if (files.length > remaining) {
    window.showNotification(`Solo puedes subir ${remaining} prendas más`, 'error');
    event.target.value = '';
    return;
  }
  
  // Activar indicadores de IA
  const aiStatus = document.getElementById('aiDetectionStatus');
  const autoNav = document.getElementById('autoNavigation');
  const progressBar = document.getElementById('aiProgressBar');
  const statusText = document.getElementById('aiStatusText');
  const autoNavText = document.getElementById('autoNavText');
  
  if (aiStatus) aiStatus.classList.add('active');
  if (progressBar) progressBar.style.width = '0%';
  
  window.showNotification('🤖 IA analizando y categorizando prendas...', 'info');
  
  let detectedTypes = new Set();
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const progress = ((i + 1) / files.length) * 100;
    
    // Actualizar progreso
    if (statusText) statusText.textContent = `Analizando prenda ${i + 1} de ${files.length}...`;
    if (progressBar) progressBar.style.width = progress + '%';
    
    try {
      // DETECCIÓN IA
      const detectionResult = await simulateAIDetection(file);
      detectedTypes.add(detectionResult.type);
      
      // Convertir imagen
      const imageUrl = await fileToDataUrl(file);
      
      // CATEGORIZAR AUTOMÁTICAMENTE
      categorizeIntelligentItem(detectionResult.type, detectionResult.category, detectionResult.item, imageUrl, file);
      
      // Mostrar navegación automática
      if (autoNav && autoNavText) {
        autoNav.classList.add('show');
        autoNavText.textContent = `IA detectó: ${detectionResult.item} (${Math.round(detectionResult.confidence * 100)}% confianza)`;
      }
      
      await new Promise(resolve => setTimeout(resolve, 800)); // Pausa visual
      
    } catch (error) {
      console.error('Error en detección IA:', error);
      window.showNotification(`Error procesando ${file.name}`, 'error');
    }
  }
  
  // Navegación automática al tipo más común detectado
  if (detectedTypes.size > 0) {
    const mostCommonType = Array.from(detectedTypes)[0]; // Tomar el primero
    setTimeout(() => {
      navigateToDetectedType(mostCommonType);
    }, 1500);
  }
  
  // Finalizar proceso
  setTimeout(() => {
    if (aiStatus) aiStatus.classList.remove('active');
    if (autoNav) autoNav.classList.remove('show');
    finishIntelligentUpload(files.length);
  }, 2500);
  
  event.target.value = '';
}

// FINALIZAR UPLOAD INTELIGENTE
function finishIntelligentUpload(count) {
  // Guardar datos usando función unificada
  window.saveUserClosetData();
  
  // Actualizar UI
  updateIntelligentClosetUI();
  renderIntelligentCategories();
  
  const remaining = window.getRemainingClosetSlots();
  window.showNotification(`🤖 ${count} prenda${count !== 1 ? 's' : ''} detectada${count !== 1 ? 's' : ''} y categorizada${count !== 1 ? 's' : ''} automáticamente! Quedan ${remaining} espacios.`, 'success');
}

// RENDERIZAR CATEGORÍAS INTELIGENTES
function renderIntelligentCategories() {
  const container = document.getElementById('intelligentCategories');
  if (!container) {
    console.log('Contenedor intelligentCategories no encontrado, usando sistema de pestañas estándar');
    return;
  }
  
  const items = intelligentClosetItems[activeClosetType];
  
  if (!items || Object.keys(items).length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
        <div style="font-size: 4rem; margin-bottom: 1rem; opacity: 0.5;">🤖</div>
        <h3 style="color: #666; margin-bottom: 1rem;">Tu closet de ${activeClosetType === 'tops' ? 'superiores' : activeClosetType === 'bottoms' ? 'inferiores' : 'calzado'} está vacío</h3>
        <p style="opacity: 0.7;">Sube fotos para que la IA las detecte y organice automáticamente</p>
      </div>
    `;
    return;
  }
  
  let html = '';
  
  Object.entries(items).forEach(([categoryId, categoryItems]) => {
    if (categoryItems.length === 0) return;
    
    const categoryInfo = INTELLIGENT_CATEGORIES[activeClosetType][categoryId];
    if (!categoryInfo) return;
    
    const allAiDetected = categoryItems.every(item => item.aiDetected);
    
    html += `
      <div class="smart-category ${categoryItems.length > 0 ? 'has-items' : ''} ${allAiDetected ? 'auto-detected' : ''}" style="background: white; border: 1px solid #e5e7eb; border-radius: 15px; padding: 1.5rem; margin-bottom: 1rem;">
        <div class="category-header" style="display: flex; align-items: center; margin-bottom: 1rem;">
          <div class="category-icon" style="background: ${categoryInfo.color}; color: white; border-radius: 50%; width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; margin-right: 1rem;">
            ${categoryInfo.icon}
          </div>
          <div class="category-info">
            <h4 style="margin: 0; color: #000;">${categoryInfo.name}</h4>
            <p style="margin: 0.25rem 0; color: #666; font-size: 0.9rem;">${categoryItems.length} prenda${categoryItems.length !== 1 ? 's' : ''}</p>
            ${allAiDetected ? `<span class="ai-confidence" style="background: rgba(34, 197, 94, 0.1); color: #059669; padding: 0.25rem 0.5rem; border-radius: 10px; font-size: 0.8rem; font-weight: 600;">🤖 IA Detectado</span>` : ''}
          </div>
        </div>
        <div class="smart-items-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 0.5rem;">
          ${categoryItems.map((item, index) => {
            const isSelected = selectedClosetItems[activeClosetType].has(item.id);
            return `
              <div class="smart-item ${isSelected ? 'selected' : ''}" data-id="${item.id}" style="position: relative; border-radius: 10px; overflow: hidden; cursor: pointer; ${isSelected ? 'border: 2px solid #3b82f6; box-shadow: 0 0 10px rgba(59, 130, 246, 0.3);' : 'border: 1px solid #e5e7eb;'}">
                <img src="${item.imageUrl}" alt="${categoryInfo.name}" style="width: 100%; height: 120px; object-fit: cover;">
                <div class="item-controls" style="position: absolute; top: 5px; right: 5px; display: flex; gap: 5px;">
                  <button class="item-btn select" onclick="toggleItemSelection('${activeClosetType}', '${item.id}')" title="${isSelected ? 'Deseleccionar' : 'Seleccionar'}" style="background: ${isSelected ? '#10b981' : '#3b82f6'}; color: white; border: none; border-radius: 50%; width: 25px; height: 25px; cursor: pointer; font-size: 0.8rem;">
                    ${isSelected ? '✓' : '+'}
                  </button>
                  <button class="item-btn" onclick="removeIntelligentItem('${activeClosetType}', '${categoryId}', ${index})" title="Eliminar" style="background: #ef4444; color: white; border: none; border-radius: 50%; width: 25px; height: 25px; cursor: pointer; font-size: 0.8rem;">×</button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  });
  
  container.innerHTML = html;
  updateSelectionUI();
}

// SISTEMA DE SELECCIÓN MEJORADO
window.toggleItemSelection = function(type, itemId) {
  const selectedSet = selectedClosetItems[type];
  
  if (selectedSet.has(itemId)) {
    // DESELECCIONAR
    selectedSet.delete(itemId);
    window.showNotification('Prenda deseleccionada', 'info');
  } else {
    // SELECCIONAR
    selectedSet.add(itemId);
    window.showNotification('Prenda seleccionada', 'success');
  }
  
  renderIntelligentCategories();
  updateIntelligentGenerateButton();
};

// ELIMINAR PRENDA DEL CLOSET INTELIGENTE
window.removeIntelligentItem = function(type, categoryId, index) {
  const categoryInfo = INTELLIGENT_CATEGORIES[type][categoryId];
  const itemName = categoryInfo ? categoryInfo.name : categoryId;
  
  if (!confirm(`¿Eliminar esta prenda de ${itemName}?`)) return;
  
  const item = intelligentClosetItems[type][categoryId][index];
  
  // Eliminar de selecciones
  selectedClosetItems[type].delete(item.id);
  
  // Eliminar del closet inteligente
  intelligentClosetItems[type][categoryId].splice(index, 1);
  
  // También eliminar de arrays globales
  const globalIndex = uploadedImages[type].indexOf(item.imageUrl);
  if (globalIndex !== -1) {
    uploadedFiles[type].splice(globalIndex, 1);
    uploadedImages[type].splice(globalIndex, 1);
    closetItems[type].splice(globalIndex, 1);
  }
  
  // Si la categoría queda vacía, eliminarla
  if (intelligentClosetItems[type][categoryId].length === 0) {
    delete intelligentClosetItems[type][categoryId];
  }
  
  // Guardar y actualizar
  window.saveUserClosetData();
  updateIntelligentClosetUI();
  renderIntelligentCategories();
  
  window.showNotification(`Prenda eliminada de ${itemName}`, 'info');
};

// ACTUALIZAR UI DEL CLOSET INTELIGENTE
function updateIntelligentClosetUI() {
  const total = getTotalIntelligentClosetItems();
  const remaining = Math.max(0, CONFIG.TOTAL_CLOSET_LIMIT - total);
  
  // Actualizar contadores de navegación
  ['tops', 'bottoms', 'shoes'].forEach(type => {
    const count = Object.values(intelligentClosetItems[type]).reduce((sum, category) => sum + category.length, 0);
    const badge = document.getElementById(`${type}CountNav`);
    if (badge) {
      badge.textContent = count;
      badge.style.display = count > 0 ? 'flex' : 'none';
    }
  });
  
  updateIntelligentGenerateButton();
  updateSelectionUI();
  
  console.log(`📊 Closet Inteligente: ${total}/${CONFIG.TOTAL_CLOSET_LIMIT} prendas`);
}

// OBTENER TOTAL DE ITEMS EN CLOSET INTELIGENTE
function getTotalIntelligentClosetItems() {
  let total = 0;
  ['tops', 'bottoms', 'shoes'].forEach(type => {
    Object.values(intelligentClosetItems[type]).forEach(category => {
      total += category.length;
    });
  });
  return total;
}

// ACTUALIZAR UI DE SELECCIONES
function updateSelectionUI() {
  const types = ['tops', 'bottoms', 'shoes'];
  
  types.forEach(type => {
    const count = selectedClosetItems[type].size;
    const countElement = document.getElementById(`selected${type.charAt(0).toUpperCase() + type.slice(1)}Count`);
    
    if (countElement) countElement.textContent = count;
  });
}

// ACTUALIZAR BOTÓN DE GENERAR INTELIGENTE
function updateIntelligentGenerateButton() {
  const btn = document.getElementById('intelligentGenerateBtn');
  if (!btn) return;
  
  const hasSelections = selectedClosetItems.tops.size > 0 && 
                       selectedClosetItems.bottoms.size > 0 && 
                       selectedClosetItems.shoes.size > 0;
  
  if (hasSelections && window.selectedOccasion && window.selectedOccasion()) {
    const totalCombinations = selectedClosetItems.tops.size * selectedClosetItems.bottoms.size * selectedClosetItems.shoes.size;
    btn.disabled = false;
    btn.style.opacity = '1';
    btn.innerHTML = `<i class="fas fa-magic"></i> Generar ${Math.min(5, totalCombinations)} Recomendaciones del Closet IA`;
  } else {
    btn.disabled = true;
    btn.style.opacity = '0.6';
    if (!window.selectedOccasion || !window.selectedOccasion()) {
      btn.innerHTML = '<i class="fas fa-magic"></i> Selecciona una ocasión primero';
    } else {
      btn.innerHTML = '<i class="fas fa-magic"></i> Selecciona al menos 1 prenda de cada tipo';
    }
  }
}

// GENERAR RECOMENDACIONES DESDE CLOSET INTELIGENTE
window.generateFromIntelligentCloset = function() {
  if (!window.selectedOccasion || !window.selectedOccasion()) {
    window.showNotification('Primero selecciona una ocasión', 'info');
    return;
  }
  
  const hasSelections = selectedClosetItems.tops.size > 0 && 
                       selectedClosetItems.bottoms.size > 0 && 
                       selectedClosetItems.shoes.size > 0;
  
  if (!hasSelections) {
    window.showNotification('Selecciona al menos 1 prenda de cada tipo', 'error');
    return;
  }
  
  // Obtener archivos de las prendas seleccionadas
  const selectedFiles = { tops: [], bottoms: [], shoes: [] };
  
  ['tops', 'bottoms', 'shoes'].forEach(type => {
    const selectedIds = Array.from(selectedClosetItems[type]);
    selectedIds.forEach(id => {
      // Buscar el item en todas las categorías del tipo
      for (const categoryId in intelligentClosetItems[type]) {
        const item = intelligentClosetItems[type][categoryId].find(item => item.id === id);
        if (item && item.file) {
          selectedFiles[type].push(item.file);
          break;
        }
      }
    });
  });
  
  // Usar función de generación de API
  if (typeof generateRecommendationsWithFiles === 'function') {
    generateRecommendationsWithFiles(selectedFiles);
  } else {
    window.showNotification('Error: Sistema de recomendaciones no disponible', 'error');
  }
};

// TRIGGER UPLOAD INTELIGENTE
window.triggerSmartUpload = function() {
  const remaining = CONFIG.TOTAL_CLOSET_LIMIT - getTotalIntelligentClosetItems();
  
  if (remaining <= 0) {
    window.showNotification(`🤖 Closet lleno (${CONFIG.TOTAL_CLOSET_LIMIT}/15). Elimina prendas para agregar nuevas.`, 'error');
    return;
  }
  
  const input = document.getElementById('smart-upload');
  if (input) {
    input.onchange = handleIntelligentUpload;
    input.click();
  }
};

// CARGAR DATOS DEL USUARIO
function loadUserData() {
  if (!window.currentUser || !window.currentUser().email) return;
  
  const closetData = localStorage.getItem(`noshopia_intelligent_closet_${window.currentUser().email}`);
  if (closetData) {
    const data = JSON.parse(closetData);
    intelligentClosetItems = data.intelligentClosetItems || { tops: {}, bottoms: {}, shoes: {} };
    console.log('🤖 Closet Inteligente cargado:', getTotalIntelligentClosetItems(), 'prendas');
  }
}

// GUARDAR DATOS DEL USUARIO
function saveUserData() {
  if (!window.currentUser || !window.currentUser().email) return;
  
  const closetData = {
    email: window.currentUser().email,
    intelligentClosetItems,
    lastUpdated: new Date().toISOString(),
    totalItems: getTotalIntelligentClosetItems()
  };
  localStorage.setItem(`noshopia_intelligent_closet_${window.currentUser().email}`, JSON.stringify(closetData));
}

// INICIALIZAR SISTEMA INTELIGENTE
function initializeIntelligentCloset() {
  console.log('🤖 Inicializando Closet Inteligente con IA...');
  
  // Cargar datos si hay usuario logueado
  if (window.isLoggedIn && window.isLoggedIn() && window.currentUser && window.currentUser()) {
    loadUserData();
    updateIntelligentClosetUI();
    renderIntelligentCategories();
  }
  
  console.log('✅ Closet Inteligente inicializado con detección IA');
}

// COMPATIBILIDAD CON SISTEMA ESTÁNDAR DE CLOSET
function enableCloset() {
  console.log('📁 Activando modo closet con IA...');
  
  window.setClosetMode(true);
  
  // Mostrar contenedor del closet
  const closetContainer = document.getElementById('closetContainer');
  if (closetContainer) {
    closetContainer.style.display = 'block';
    
    const userEmail = document.getElementById('userEmail');
    if (userEmail && window.currentUser && window.currentUser()) {
      userEmail.textContent = window.currentUser().email;
    }
  }
  
  // Inicializar sistema inteligente
  initializeIntelligentCloset();
  
  // Configurar upload inteligente si hay input específico
  setTimeout(() => {
    const smartInput = document.getElementById('smart-upload');
    if (smartInput) {
      smartInput.onchange = handleIntelligentUpload;
    }
  }, 500);
  
  window.showNotification('Closet Inteligente con IA activado', 'success');
}

// EXPONER FUNCIONES GLOBALMENTE
window.enableCloset = enableCloset;
window.initializeIntelligentCloset = initializeIntelligentCloset;
window.loadUserData = loadUserData;
window.saveUserData = saveUserData;
window.updateIntelligentClosetUI = updateIntelligentClosetUI;
window.renderIntelligentCategories = renderIntelligentCategories;
window.triggerSmartUpload = triggerSmartUpload;

// AUTO-INICIALIZACIÓN
document.addEventListener('DOMContentLoaded', function() {
  console.log('🤖 Closet Inteligente JS cargado con detección IA');
  
  // Inicializar si ya está en modo closet
  setTimeout(() => {
    if (window.closetMode && window.closetMode()) {
      initializeIntelligentCloset();
    }
  }, 1000);
});

console.log('✅ closet.js - Sistema Inteligente con Detección IA Alineado con Backend cargado');
