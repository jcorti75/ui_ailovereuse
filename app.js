// 1) Apunta tu frontend al backend en Railway
const API_BASE = "https://noshopia-production.up.railway.app";

// Asume que, tras el login de Google, guardas:
let currentUser = { email: "", name: "" }; 
// ← Rellénalo cuando hagas login: currentUser = { email: payload.email, name: payload.name }

async function submitRecommendation() {
  const top = document.getElementById("top").files[0];
  const bottom = document.getElementById("bottom").files[0];
  const shoes = document.getElementById("shoes").files;

  if (!currentUser?.email) {
    alert("Debes iniciar sesión para continuar.");
    return;
  }
  if (!top || !bottom || shoes.length === 0) {
    alert("Debes subir al menos una foto de cada categoría (superior, inferior y calzado).");
    return;
  }

  const formData = new FormData();
  formData.append("top", top);
  formData.append("bottom", bottom);
  for (let i = 0; i < shoes.length; i++) formData.append("shoes", shoes[i]);

  // 👇 MUY IMPORTANTE: estos dos campos son obligatorios en tu backend
  formData.append("user_email", currentUser.email);
  formData.append("user_name", currentUser.name || "");

  try {
    const res = await fetch(`${API_BASE}/recommend`, { method: "POST", body: formData });

    // Si el backend devolvió un error, intento leer el JSON para mostrar un mensaje útil
    if (!res.ok) {
      let msg = `HTTP ${res.status}`;
      try {
        const err = await res.json();
        // Manejo especial para el filtro NOT_CLOTHING
        if (err?.detail?.code === "NOT_CLOTHING") {
          msg = err.detail.message || "La imagen no corresponde a una prenda ni outfit.";
        } else if (err?.detail) {
          msg = typeof err.detail === "string" ? err.detail : JSON.stringify(err.detail);
        }
      } catch (_) {}
      throw new Error(msg);
    }

    const data = await res.json();

    // Render simple
    document.getElementById("results").innerHTML = `
      <h3>✅ Mejor opción: Zapato #${(data.best_index ?? 0) + 1}</h3>
      <pre>${JSON.stringify(data.results, null, 2)}</pre>
    `;
  } catch (e) {
    console.error(e);
    document.getElementById("results").innerHTML = `<h3>❌ Error: ${e.message}</h3>`;
  }
}

/* (Opcional) Si quieres enviar feedback de “Me gusta / No me convence”:
   accepted debe ser 'si' o 'no' según tu backend, y combination_id algo como 'A1', 'B1', etc. */
async function sendFeedback(combinationId, accepted, rejectionReason = "") {
  if (!currentUser?.email) {
    alert("Debes iniciar sesión para enviar feedback.");
    return;
  }
  const form = new FormData();
  form.append("user_email", currentUser.email);
  form.append("combination_id", combinationId);
  form.append("accepted", accepted);            // 'si' | 'no'
  if (accepted === "no" && rejectionReason) {
    form.append("rejection_reason", rejectionReason);
  }

  try {
    const res = await fetch(`${API_BASE}/api/feedback`, { method: "POST", body: form });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    console.log("Feedback OK:", data);
  } catch (e) {
    console.error("Error feedback:", e);
  }
}



