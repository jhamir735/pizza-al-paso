/**
 * CONTACTO.JS — Lógica de la página de Ubicación y Reservas
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
      mostrarToast('Por favor completa todos los campos requeridos.');
      return;
    }

    if (btnEnviar) {
      btnEnviar.disabled = true;
      btnEnviar.textContent = 'Procesando solicitud...';
    }

    setTimeout(() => {
      formContacto.style.display = 'none';
      if (mensajeEnviado) mensajeEnviado.style.display = 'block';
      mostrarToast('Solicitud registrada correctamente.');
    }, 900);
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
        btnEnviar.textContent = 'Enviar Solicitud';
      }
    });
  }
});
