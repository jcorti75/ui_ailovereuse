// Google OAuth Configuration
const GOOGLE_CLIENT_ID = '326940877598-ko13n1qcqkkugkoo6gu2n1avs46al09p.apps.googleusercontent.com';

// Estado global de la aplicación
let isLoggedIn = false;
let currentUser = null;
let uploadedFiles = {
    top: [],
    bottom: [],
    shoes: []
};

// Configuración de límites por categoría
const FILE_LIMITS = {
    top: 3,
    bottom: 3,
    shoes: 5
};

// Smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// Update active nav pill
function updateActiveNav() {
    const sections = ['inicio', 'Impacto Ambiental', 'funcionamiento', 'equipo'];
    const navPills = document.querySelectorAll('.nav-pill');
    
    sections.forEach((section, index) => {
        const element = document.getElementById(section);
        if (element) {
            const rect = element.getBoundingClientRect();
            if (rect.top <= 100 && rect.bottom >= 100) {
                navPills.forEach(pill => pill.classList.remove('active'));
                if (navPills[index]) {
                    navPills[index].classList.add('active');
                }
            }
        }
    });
}

window.addEventListener('scroll', updateActiveNav);

// Scroll animations
function animateOnScroll() {
    const elements = document.querySelectorAll('.animate-on-scroll');
    elements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;
        
        if (elementTop < window.innerHeight - elementVisible) {
            element.classList.add('animated');
        }
    });
}

window.addEventListener('scroll', animateOnScroll);
window.addEventListener('load', animateOnScroll);

// Header scroll effect
window.addEventListener('scroll', () => {
    const header = document.querySelector('header');
    if (window.scrollY > 100) {
        header.style.background = 'rgba(102, 126, 234, 0.3)';
    } else {
        header.style.background = 'rgba(102, 126, 234, 0.1)';
    }
});

// Initialize Google OAuth mejorado
function initializeGoogleAuth() {
    if (typeof google === 'undefined' || typeof google.accounts === 'undefined') {
        console.error('Google Identity Services no está disponible');
        showNotification('Error: Servicios de Google no disponibles', 'error');
        return;
    }

    try {
        google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleGoogleSignIn,
            auto_select: false,
            cancel_on_tap_outside: true,
            use_fedcm_for_prompt: false
        });

        console.log('Google OAuth inicializado correctamente');
    } catch (error) {
        console.error('Error inicializando Google OAuth:', error);
        showNotification('Error inicializando autenticación: ' + error.message, 'error');
    }
}

// Handle Google Sign-In response mejorado
function handleGoogleSignIn(response) {
    try {
        console.log('Respuesta de Google recibida:', response);
        
        if (!response.credential) {
            throw new Error('No se recibió credential de Google');
        }

        const token = response.credential;
        const payload = JSON.parse(atob(token.split('.')[1]));
        
        console.log('Payload decodificado:', payload);
        
        currentUser = {
            name: payload.name,
            email: payload.email,
            picture: payload.picture,
            given_name: payload.given_name,
            family_name: payload.family_name,
            token: token
        };
        
        isLoggedIn = true;
        updateAuthUI();
        showUploadSection();
        
        showNotification(`Bienvenido ${currentUser.given_name || currentUser.name}`, 'success');
        
        // Cerrar el pop-up de login si estaba abierto
        closeLoginPopup();
        
    } catch (error) {
        console.error('Error procesando login de Google:', error);
        showNotification('Error procesando login: ' + error.message, 'error');
    }
}

// Main login function mejorado
async function loginWithGoogle() {
    const button = document.getElementById('loginBtn');
    if (!button) return;
    
    const originalText = button.innerHTML;
    button.innerHTML = '<span class="loading"></span> Conectando...';
    button.disabled = true;
    
    try {
        if (typeof google === 'undefined' || typeof google.accounts === 'undefined') {
            throw new Error('Servicios de Google no disponibles. Verifica la configuración.');
        }

        google.accounts.id.prompt((notification) => {
            console.log('Notificación de prompt:', notification);
            
            if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
                console.log('Prompt no mostrado. Razón:', notification.getNotDisplayedReason());
                showNotification('No se pudo mostrar el login de Google. Verifica la configuración.', 'error');
            }
        });

    } catch (error) {
        console.error('Error en loginWithGoogle:', error);
        showNotification('Error: ' + error.message, 'error');
    } finally {
        setTimeout(() => {
            if (!isLoggedIn) {
                button.innerHTML = originalText;
                button.disabled = false;
            }
        }, 5000);
    }
}

// Logout mejorado
function logout() {
    try {
        if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
            google.accounts.id.disableAutoSelect();
        }
    } catch (error) {
        console.error('Error en logout de Google:', error);
    }
    
    isLoggedIn = false;
    currentUser = null;
    uploadedFiles = { top: [], bottom: [], shoes: [] };
    
    ['top', 'bottom', 'shoes'].forEach(type => {
        const preview = document.getElementById(`${type}-preview`);
        if (preview) preview.innerHTML = '';
        const status = document.getElementById(`${type}-status`);
        if (status) status.style.display = 'none';
        updateUploadLabel(type);
    });
    
    updateAuthUI();
    hideUploadSection();
    showNotification('Sesión cerrada correctamente', 'info');
}

function updateAuthUI() {
    const loginBtn = document.getElementById('loginBtn');
    const userInfo = document.getElementById('userInfo');
    
    if (isLoggedIn && currentUser) {
        loginBtn.style.display = 'none';
        userInfo.style.display = 'flex';
        document.getElementById('userName').textContent = currentUser.name;
        document.getElementById('userAvatar').src = currentUser.picture;
    } else {
        loginBtn.style.display = 'flex';
        userInfo.style.display = 'none';
    }
}

function showUploadSection() {
    document.getElementById('loginRequired').style.display = 'none';
    document.getElementById('uploadArea').style.display = 'block';
    document.querySelector('.upload-section').classList.add('active');
}

function hideUploadSection() {
    document.getElementById('loginRequired').style.display = 'block';
    document.getElementById('uploadArea').style.display = 'none';
    document.querySelector('.upload-section').classList.remove('active');
    
    const resultDiv = document.getElementById('result');
    if (resultDiv) {
        resultDiv.innerHTML = '';
        resultDiv.style.display = 'none';
    }
}

// NUEVA FUNCIÓN MEJORADA: File upload handling con pop-ups
async function handleFileUpload(type, input) {
    const files = Array.from(input.files);
    
    // 1. VERIFICAR LOGIN PRIMERO - Mostrar pop-up si no está loggeado
    if (!isLoggedIn) {
        showLoginPopup();
        input.value = ''; // Limpiar el input
        return;
    }

    const preview = document.getElementById(`${type}-preview`);
    const currentCount = uploadedFiles[type].length;
    const maxFiles = FILE_LIMITS[type];
    
    const availableSlots = maxFiles - currentCount;
    if (files.length > availableSlots) {
        showNotification(`Solo puedes subir ${availableSlots} foto${availableSlots > 1 ? 's' : ''} más de ${type}. Máximo: ${maxFiles}`, 'error');
        input.value = '';
        return;
    }
    
    for (let file of files) {
        try {
            // 2. VALIDACIONES BÁSICAS
            if (!file.type.startsWith('image/')) {
                showNotification('Solo se permiten archivos de imagen', 'error');
                continue;
            }
            
            if (file.size > 10 * 1024 * 1024) {
                showNotification('La imagen es muy grande. Máximo 10MB', 'error');
                continue;
            }

            // 3. VALIDACIÓN CON IA - NUEVA FUNCIONALIDAD
            showStatus(type, 'Validando imagen con IA...', 'validating');
            showValidationLoading();

            const validationResult = await validateClothingWithBackend(file);
            
            hideValidationLoading();

            if (validationResult.isValid) {
                // Imagen válida - procesar y mostrar
                await processValidImage(file, type);
                showStatus(type, '✅ Imagen válida - Prenda detectada correctamente', 'success');
            } else {
                // Imagen no válida - mostrar pop-up de error
                showValidationPopup(validationResult);
                showStatus(type, '❌ Imagen rechazada - No es una prenda válida', 'error');
            }
            
        } catch (error) {
            hideValidationLoading();
            console.error('Error procesando archivo:', error);
            showStatus(type, `Error procesando imagen: ${error.message}`, 'error');
        }
    }
    
    input.value = '';
}

// NUEVA FUNCIÓN: Validación con backend
async function validateClothingWithBackend(file) {
    try {
        // Simular llamada al backend (aquí pondrías tu endpoint real)
        
        // Para desarrollo, simulamos la respuesta
        const mockValidation = await simulateBackendValidation(file);
        return mockValidation;

        /* 
        // Código real para tu backend:
        const formData = new FormData();
        formData.append('image', file);
        formData.append('user_email', currentUser.email);
        
        const response = await fetch('/api/validate-clothing', {
            method: 'POST',
            body: formData,
            headers: {
                'Authorization': `Bearer ${currentUser.token}`
            }
        });

        if (response.status === 422) {
            // Error de validación (no es ropa)
            const errorData = await response.json();
            return {
                isValid: false,
                message: errorData.detail,
                detected: extractDetectedFromMessage(errorData.detail),
                confidence: extractConfidenceFromMessage(errorData.detail)
            };
        }

        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        return {
            isValid: true,
            ...data
        };
        */

    } catch (error) {
        console.error('Error validating clothing:', error);
        throw error;
    }
}

// Simulación del backend para desarrollo
async function simulateBackendValidation(file) {
    // Simular delay de la API
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulación: algunas imágenes pasan, otras no (60% de probabilidad de ser válida)
    const isValid = Math.random() > 0.4;
    
    if (isValid) {
        return {
            isValid: true,
            confidence: 0.85 + Math.random() * 0.15,
            category: 'clothing',
            subcategory: 'shirt'
        };
    } else {
        // Simular respuesta de error del backend
        const mockDetections = [
            { detected: 'person', score: 0.92 },
            { detected: 'furniture', score: 0.78 },
            { detected: 'food', score: 0.71 },
            { detected: 'landscape', score: 0.65 },
            { detected: 'animal', score: 0.58 }
        ];
        
        const randomDetection = mockDetections[Math.floor(Math.random() * mockDetections.length)];
        
        return {
            isValid: false,
            detected: randomDetection.detected,
            confidence: randomDetection.score,
            message: `La foto no parece ser una prenda ni un outfit (detectado: '${randomDetection.detected}', score ${randomDetection.score.toFixed(2)}). Sube una prenda (parte superior, inferior o calzado).`
        };
    }
}

// NUEVA FUNCIÓN: Procesar imagen válida
async function processValidImage(file, type) {
    const reader = new FileReader();
    return new Promise((resolve) => {
        reader.onload = function(e) {
            const preview = document.getElementById(`${type}-preview`);
            
            const imageContainer = document.createElement('div');
            imageContainer.style.position = 'relative';
            imageContainer.style.display = 'inline-block';
            imageContainer.style.margin = '0.25rem';
            
            const img = document.createElement('img');
            img.src = e.target.result;
            img.className = 'preview-image';
            img.title = `${type} - ${file.name}`;
            
            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-image';
            removeBtn.innerHTML = '×';
            removeBtn.title = 'Eliminar imagen';
            removeBtn.onclick = () => {
                imageContainer.remove();
                const fileIndex = uploadedFiles[type].indexOf(file);
                if (fileIndex > -1) {
                    uploadedFiles[type].splice(fileIndex, 1);
                }
                updateUploadLabel(type);
            };
            
            imageContainer.appendChild(img);
            imageContainer.appendChild(removeBtn);
            preview.appendChild(imageContainer);
            
            uploadedFiles[type].push(file);
            updateUploadLabel(type);
            resolve();
        };
        reader.readAsDataURL(file);
    });
}

// Funciones auxiliares para extraer datos del mensaje de error del backend
function extractDetectedFromMessage(message) {
    const match = message.match(/detectado: '([^']+)'/);
    return match ? match[1] : 'desconocido';
}

function extractConfidenceFromMessage(message) {
    const match = message.match(/score ([\d.]+)/);
    return match ? parseFloat(match[1]) : 0;
}

// NUEVAS FUNCIONES PARA POP-UPS
function showLoginPopup() {
    document.getElementById('loginPopup').style.display = 'block';
}

function closeLoginPopup() {
    document.getElementById('loginPopup').style.display = 'none';
}

function showValidationPopup(validationResult) {
    const popup = document.getElementById('validationPopup');
    const message = document.getElementById('validationMessage');
    const details = document.getElementById('validationDetails');
    
    message.textContent = validationResult.message;
    
    if (validationResult.detected && validationResult.confidence) {
        details.innerHTML = `
            <p><strong>Detectado:</strong> ${validationResult.detected}</p>
            <p><strong>Confianza:</strong> ${(validationResult.confidence * 100).toFixed(1)}%</p>
            <p><strong>Requerido:</strong> Prenda de ropa (superior, inferior o calzado)</p>
        `;
        details.style.display = 'block';
    } else {
        details.style.display = 'none';
    }
    
    popup.style.display = 'block';
}

function closeValidationPopup() {
    document.getElementById('validationPopup').style.display = 'none';
}

function showValidationLoading() {
    document.getElementById('validationLoading').style.display = 'block';
}

function hideValidationLoading() {
    document.getElementById('validationLoading').style.display = 'none';
}

// NUEVA FUNCIÓN: Mostrar estados en las secciones de upload
function showStatus(type, message, status) {
    const statusDiv = document.getElementById(`${type}-status`);
    statusDiv.textContent = message;
    statusDiv.className = `status-indicator status-${status}`;
    statusDiv.style.display = 'block';
    
    // Auto-ocultar después de unos segundos si es éxito
    if (status === 'success') {
        setTimeout(() => {
            statusDiv.style.display = 'none';
        }, 5000);
    }
}

function updateUploadLabel(type) {
    const label = document.querySelector(`label[for="${type}-upload"]`);
    const count = uploadedFiles[type].length;
    const maxFiles = FILE_LIMITS[type];
    
    if (count > 0) {
        const remaining = maxFiles - count;
        label.innerHTML = `✅ ${count}/${maxFiles} foto${count > 1 ? 's' : ''} cargada${count > 1 ? 's' : ''}`;
        
        if (remaining === 0) {
            label.innerHTML = `🎯 ${count}/${maxFiles} - ¡Completo!`;
        }
    } else {
        const typeText = type === 'top' ? 'Superiores' : 
                        type === 'bottom' ? 'Inferiores' : 'Zapatos';
        label.innerHTML = `📤 Subir ${typeText} (máx ${maxFiles})`;
    }
}

// Get AI recommendation
async function getRecommendation() {
    if (!isLoggedIn) {
        showNotification('Necesitas iniciar sesión primero', 'error');
        return;
    }

    if (uploadedFiles.top.length === 0 || uploadedFiles.bottom.length === 0 || uploadedFiles.shoes.length === 0) {
        showNotification('Necesitas subir al menos una foto de cada categoría', 'error');
        return;
    }

    const button = document.getElementById('generateBtn');
    const originalText = button.innerHTML;
    
    button.innerHTML = '<span class="loading"></span> La IA está analizando...';
    button.disabled = true;

    try {
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        const generateCombination = () => ({
            topIndex: Math.floor(Math.random() * uploadedFiles.top.length),
            bottomIndex: Math.floor(Math.random() * uploadedFiles.bottom.length),
            shoesIndex: Math.floor(Math.random() * uploadedFiles.shoes.length)
        });
        
        const mockResponse = {
            results: [
                { 
                    index: 1, 
                    combination: "A1", 
                    score: 0.92, 
                    formality: "casual",
                    selection: generateCombination()
                },
                { 
                    index: 2, 
                    combination: "B1", 
                    score: 0.87, 
                    formality: "formal",
                    selection: generateCombination()
                },
                { 
                    index: 3, 
                    combination: "C1", 
                    score: 0.84, 
                    formality: "casual",
                    selection: generateCombination()
                }
            ],
            best_index: 1
        };
        
        displayRecommendations(mockResponse);
        showNotification('Recomendaciones generadas exitosamente', 'success');
        
    } catch (error) {
        console.error('Error:', error);
        showNotification(`Error generando recomendaciones: ${error.message}`, 'error');
    } finally {
        button.innerHTML = originalText;
        button.disabled = false;
    }
}

function displayRecommendations(data) {
    const resultDiv = document.getElementById('result');
    const bestIndex = data.best_index;
    
    const sortedResults = [...data.results].sort((a, b) => b.score - a.score);
    
    let html = '';
    
    sortedResults.forEach((result, index) => {
        const isBest = result.index === bestIndex;
        const percentage = (result.score * 100).toFixed(1);
        
        const topFile = uploadedFiles.top[result.selection.topIndex];
        const bottomFile = uploadedFiles.bottom[result.selection.bottomIndex];
        const shoesFile = uploadedFiles.shoes[result.selection.shoesIndex];
        
        const topImageUrl = topFile ? URL.createObjectURL(topFile) : '';
        const bottomImageUrl = bottomFile ? URL.createObjectURL(bottomFile) : '';
        const shoesImageUrl = shoesFile ? URL.createObjectURL(shoesFile) : '';
        
        html += `
            <div style="background: rgba(255, 255, 255, 0.1); border: 2px solid ${isBest ? '#ffc107' : 'var(--accent)'}; border-radius: 20px; padding: 2.5rem; margin-bottom: 2rem; backdrop-filter: blur(10px); transition: all 0.3s ease; position: relative;">
                ${isBest ? '<div style="position: absolute; top: -10px; left: 20px; background: #ffc107; color: #333; padding: 0.5rem 1rem; border-radius: 20px; font-size: 1rem; font-weight: bold;">⭐ Mejor opción</div>' : ''}
                
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                    <h3 style="color: var(--accent); font-size: 1.5rem; font-weight: 700;">
                        ${isBest ? '⭐ ' : ''}Combinación ${result.combination}
                    </h3>
                    <div style="background: var(--accent); color: white; padding: 0.5rem 1rem; border-radius: 20px; font-weight: bold; font-size: 1.1rem;">${percentage}%</div>
                </div>

                <div style="display: flex; justify-content: center; align-items: center; margin: 2rem 0; gap: 1rem; flex-wrap: wrap;">
                    <div style="text-align: center;">
                        <img src="${topImageUrl}" style="width: 120px; height: 120px; object-fit: cover; border-radius: 15px; border: 3px solid var(--accent); box-shadow: 0 4px 15px rgba(0, 188, 212, 0.3);" alt="Prenda Superior">
                        <p style="margin-top: 0.5rem; font-size: 0.9rem; color: var(--accent); font-weight: 600;">Superior</p>
                    </div>
                    
                    <div style="font-size: 2rem; color: var(--accent); margin: 0 1rem;">+</div>
                    
                    <div style="text-align: center;">
                        <img src="${bottomImageUrl}" style="width: 120px; height: 120px; object-fit: cover; border-radius: 15px; border: 3px solid var(--accent); box-shadow: 0 4px 15px rgba(0, 188, 212, 0.3);" alt="Prenda Inferior">
                        <p style="margin-top: 0.5rem; font-size: 0.9rem; color: var(--accent); font-weight: 600;">Inferior</p>
                    </div>
                    
                    <div style="font-size: 2rem; color: var(--accent); margin: 0 1rem;">+</div>
                    
                    <div style="text-align: center;">
                        <img src="${shoesImageUrl}" style="width: 120px; height: 120px; object-fit: cover; border-radius: 15px; border: 3px solid var(--accent); box-shadow: 0 4px 15px rgba(0, 188, 212, 0.3);" alt="Calzado">
                        <p style="margin-top: 0.5rem; font-size: 0.9rem; color: var(--accent); font-weight: 600;">Calzado</p>
                    </div>
                </div>

                <div style="background: rgba(255, 255, 255, 0.1); padding: 2rem; border-radius: 15px; text-align: left; line-height: 1.8;">
                    <p><strong>🎯 Puntuación:</strong> ${percentage}% de compatibilidad</p>
                    <p><strong>💡 Estilo:</strong> ${result.formality === 'formal' ? 'Formal' : 'Casual'}</p>
                    <p><strong>💬 Recomendación:</strong> ${isBest ? 'Esta es tu mejor combinación. Perfecta para destacar con estilo.' : 'Una excelente opción alternativa para diferentes ocasiones.'}</p>
                    ${isBest ? '<p><strong>✨ Tip especial:</strong> Esta combinación ha sido seleccionada como la óptima por nuestra IA.</p>' : ''}
                </div>
                
                <div style="display: flex; justify-content: center; gap: 1rem; margin-top: 1.5rem; flex-wrap: wrap;">
                    <button onclick="acceptCombination('${result.combination}')" style="background: var(--green); color: white; border: none; padding: 0.8rem 1.5rem; border-radius: 25px; font-weight: 600; cursor: pointer; transition: all 0.3s ease;">
                        ❤️ Me gusta
                    </button>
                    <button onclick="rejectCombination('${result.combination}')" style="background: #ff5252; color: white; border: none; padding: 0.8rem 1.5rem; border-radius: 25px; font-weight: 600; cursor: pointer; transition: all 0.3s ease;">
                        👎 No me convence
                    </button>
                </div>
            </div>
        `;
    });
    
    resultDiv.innerHTML = html;
    resultDiv.style.display = 'block';
    
    setTimeout(() => {
        resultDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
}

// Funciones para manejar feedback de combinaciones
function acceptCombination(combinationId) {
    sendFeedbackToBackend(combinationId, 'si', null);
    showNotification(`Te gustó la Combinación ${combinationId}`, 'success');
}

function rejectCombination(combinationId) {
    const reasons = [
        "Los colores no combinan bien",
        "El estilo es muy formal para mi gusto",
        "El estilo es muy casual para mi gusto", 
        "Esta combinación no refleja mi personalidad",
        "No me siento cómodo/a con este outfit"
    ];

    let optionsHtml = reasons.map((reason, index) => 
        `<option value="${index}">${reason}</option>`
    ).join('');

    const rejectHtml = `
        <div style="background: rgba(255, 193, 7, 0.15); border: 2px solid #ffc107; border-radius: 15px; padding: 2rem; margin-top: 1rem;">
            <h4 style="color: #ffc107; margin-bottom: 1rem;">¿Por qué no te gusta esta combinación?</h4>
            <select id="reject-reason-${combinationId}" style="width: 100%; padding: 0.8rem; border-radius: 10px; border: 1px solid #ffc107; background: white; color: #333; font-size: 1rem;">
                <option value="">Selecciona una razón...</option>
                ${optionsHtml}
            </select>
            <div style="display: flex; gap: 1rem; margin-top: 1rem; justify-content: center;">
                <button onclick="submitRejection('${combinationId}')" style="background: #ffc107; color: #333; border: none; padding: 0.8rem 1.5rem; border-radius: 25px; font-weight: 600; cursor: pointer;">
                    Enviar feedback
                </button>
                <button onclick="cancelRejection('${combinationId}')" style="background: transparent; color: #ffc107; border: 2px solid #ffc107; padding: 0.8rem 1.5rem; border-radius: 25px; font-weight: 600; cursor: pointer;">
                    Cancelar
                </button>
            </div>
        </div>
    `;

    const buttons = document.querySelectorAll(`button[onclick="rejectCombination('${combinationId}')"]`);
    if (buttons.length > 0) {
        const button = buttons[0];
        const parentDiv = button.closest('div[style*="background: rgba(255, 255, 255, 0.1)"]');
        if (parentDiv && !parentDiv.querySelector('.rejection-form')) {
            const rejectDiv = document.createElement('div');
            rejectDiv.className = 'rejection-form';
            rejectDiv.innerHTML = rejectHtml;
            parentDiv.appendChild(rejectDiv);
            
            setTimeout(() => {
                rejectDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
        }
    }
}

function submitRejection(combinationId) {
    const selectElement = document.getElementById(`reject-reason-${combinationId}`);
    if (!selectElement || selectElement.value === '') {
        showNotification('Por favor selecciona una razón', 'error');
        return;
    }

    const reasons = [
        "Los colores no combinan bien",
        "El estilo es muy formal para mi gusto",
        "El estilo es muy casual para mi gusto", 
        "Esta combinación no refleja mi personalidad",
        "No me siento cómodo/a con este outfit"
    ];

    const selectedReason = reasons[selectElement.value];
    
    sendFeedbackToBackend(combinationId, 'no', selectedReason);
    
    showNotification('Gracias por tu feedback. La IA aprenderá de tus preferencias', 'success');
    
    const rejectForm = document.querySelector('.rejection-form');
    if (rejectForm) {
        rejectForm.remove();
    }
}

function cancelRejection(combinationId) {
    const rejectForm = document.querySelector('.rejection-form');
    if (rejectForm) {
        rejectForm.remove();
    }
}

// Función para enviar feedback al backend
async function sendFeedbackToBackend(combinationId, accepted, rejectionReason = null) {
    if (!currentUser || !currentUser.email) {
        console.error('Usuario no loggeado');
        return;
    }

    try {
        const formData = new FormData();
        formData.append('user_email', currentUser.email);
        formData.append('combination_id', combinationId);
        formData.append('accepted', accepted);
        if (rejectionReason) {
            formData.append('rejection_reason', rejectionReason);
        }

        const response = await fetch('/api/feedback', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        console.log('Feedback enviado exitosamente');
    } catch (error) {
        console.error('Error enviando feedback:', error);
    }
}

// Show notification mejorado
function showNotification(message, type = 'info') {
    console.log(`[${type.toUpperCase()}] ${message}`);
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (document.body.contains(notification)) {
            document.body.removeChild(notification);
        }
    }, 4000);
}

// Cerrar pop-ups al hacer clic fuera de ellos
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('loginPopup').addEventListener('click', function(e) {
        if (e.target === this) {
            closeLoginPopup();
        }
    });

    document.getElementById('validationPopup').addEventListener('click', function(e) {
        if (e.target === this) {
            closeValidationPopup();
        }
    });
});

// Initialize mejorado
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM cargado, inicializando aplicación...');
    
    updateAuthUI();
    
    Object.keys(FILE_LIMITS).forEach(type => {
        updateUploadLabel(type);
    });
    
    const checkGoogleLoaded = () => {
        if (typeof google !== 'undefined' && google.accounts) {
            initializeGoogleAuth();
        } else {
            console.log('Esperando que Google se cargue...');
            setTimeout(checkGoogleLoaded, 500);
        }
    };
    
    setTimeout(checkGoogleLoaded, 1000);
    
    setTimeout(() => {
        const impactBars = document.querySelectorAll('.impact-fill');
        impactBars.forEach(bar => {
            const width = bar.getAttribute('data-width');
            bar.style.width = width + '%';
        });
    }, 2000);
    
    setTimeout(() => {
        showNotification('Bienvenido a AI love reuse', 'success');
    }, 2000);
});