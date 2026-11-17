/**
 * CONTACTO.JS — Lógica específica de la página de Contacto
 * Manejo del formulario de contacto y simulación de envío
 */

document.addEventListener('DOMContentLoaded', () => {
  const formContacto = document.getElementById('formContacto');
  const mensajeEnviado = document.getElementById('mensajeEnviado');
  const btnEnviar = document.getElementById('btnEnviarContacto');

  if (!formContacto) return;

  formContacto.addEventListener('submit', e => {
    e.preventDefault();

    const nombre = document.getElementById('contactoNombre').value.trim();
    const correo = document.getElementById('contactoCorreo').value.trim();
    const asunto = document.getElementById('contactoAsunto').value;
    const mensaje = document.getElementById('contactoMensaje').value.trim();

    if (!nombre || !correo || !asunto || !mensaje) {
      mostrarToast('Por favor completa todos los campos requeridos.', '⚠️');
      return;
    }

    if (btnEnviar) {
      btnEnviar.disabled = true;
      btnEnviar.textContent = 'Enviando mensaje…';
    }

    setTimeout(() => {
      formContacto.style.display = 'none';
      if (mensajeEnviado) mensajeEnviado.style.display = 'block';
      mostrarToast('¡Mensaje enviado con éxito! Te contactaremos pronto.', '✉️');
    }, 1200);
  });

  const textarea = document.getElementById('contactoMensaje');
  const contador = document.getElementById('contadorMensaje');
  if (textarea && contador) {
    textarea.addEventListener('input', () => {
      contador.textContent = `${textarea.value.length} / 500`;
    });
  }

  const btnNuevo = document.getElementById('btnNuevoMensaje');
  if (btnNuevo) {
    btnNuevo.addEventListener('click', () => {
      formContacto.reset();
      formContacto.style.display = 'block';
      if (mensajeEnviado) mensajeEnviado.style.display = 'none';
      if (btnEnviar) {
        btnEnviar.disabled = false;
        btnEnviar.textContent = 'Enviar Mensaje ✉️';
      }
    });
  }
});
