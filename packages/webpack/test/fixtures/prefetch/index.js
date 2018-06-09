(function() {
  [].slice.call(document.querySelectorAll('a')).forEach(n => {
    n.addEventListener('click', e => {
      const link = n.innerText;
      history.pushState({}, link, link);
      if (link === '/home') {
        import('./home.js');
      }
      if (link === '/about') {
        import('./about.js');
      }
      if (link === '/contact') {
        import('./contact.js');
      }
      e.preventDefault();
    });
  });
})();
