document.addEventListener('DOMContentLoaded', function () {
  const header = document.querySelector('header.site-header');
  if (!header) return;

  
  if (window.innerWidth <= 768) {
    header.classList.add('visible');
    return;
  }

  
  if (document.body.classList.contains('home')) {
    return;
  }

  let lastScrollY = window.pageYOffset;

  
  if (window.pageYOffset === 0) {
    header.classList.add('visible');
  }

  window.addEventListener('scroll', function () {
    const currentScrollY = window.pageYOffset;

    if (currentScrollY === 0 || currentScrollY < lastScrollY) {
      header.classList.add('visible');
    } else {
      header.classList.remove('visible');
    }

    lastScrollY = currentScrollY;
  });
});
