/**
 * INICIO.JS — Lógica específica de la página de Inicio
 * Animaciones, efectos visuales e interactividad del Hero
 */

document.addEventListener('DOMContentLoaded', () => {
  // Animación suave de entrada de elementos del Hero
  const elementos = document.querySelectorAll(
    '.hero-etiqueta, .hero-contenido h1, .hero-contenido p, .hero-insignias, .hero-botones-grupo, .tarjetas-beneficios'
  );

  elementos.forEach((elem, index) => {
    elem.style.opacity = '0';
    elem.style.transform = 'translateY(18px)';
    elem.style.transition = `opacity 0.6s ease ${index * 0.12}s, transform 0.6s ease ${index * 0.12}s`;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        elem.style.opacity = '1';
        elem.style.transform = 'translateY(0)';
      });
    });
  });

  // Efecto visual suave en la imagen gastronómica
  const imgHero = document.querySelector('.hero-imagen img');
  if (imgHero) {
    imgHero.style.transform = 'scale(1.05)';
    imgHero.style.transition = 'transform 7s ease-out';
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        imgHero.style.transform = 'scale(1)';
      });
    });
  }
});
