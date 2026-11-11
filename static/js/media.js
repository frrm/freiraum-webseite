(() => {
  let pannellumPromise;
  const loadPannellum = () => {
    if (!pannellumPromise) {
      const css = document.createElement('link');
      css.rel = 'stylesheet';
      css.href = '/modules/pannellum.css';
      document.head.append(css);
      pannellumPromise = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = '/modules/pannellum.js';
        script.onload = resolve;
        script.onerror = reject;
        document.head.append(script);
      });
    }
    return pannellumPromise;
  };
  window.FreiraumMedia = {
    panorama(id, config) {
      const container = document.getElementById(id);
      const trigger = container?.querySelector('[data-panorama-start]');
      if (!trigger) return;
      trigger.addEventListener('click', event => {
        event.preventDefault();
        trigger.querySelector('span').textContent = trigger.dataset.loading;
        loadPannellum().then(() => {
          container.replaceChildren();
          pannellum.viewer(id, config);
        }).catch(() => {
          container.replaceChildren(trigger);
          trigger.querySelector('span').textContent = trigger.dataset.error;
        });
      }, { once: true });
    }
  };

  const dialog = document.querySelector('.media-lightbox');
  if (dialog) {
    const links = [...document.querySelectorAll('a[href*="/images/"] img')].map(img => img.closest('a')).filter(a => a && /\.(avif|gif|jpe?g|png|webp)(?:[?#]|$)/i.test(a.href));
    const image = dialog.querySelector('img');
    const caption = dialog.querySelector('figcaption');
    let index = 0, opener;
    const show = i => {
      index = (i + links.length) % links.length;
      const link = links[index], thumb = link.querySelector('img');
      image.src = link.href;
      image.alt = thumb.alt;
      caption.textContent = link.title || thumb.alt;
      dialog.querySelector('[data-previous]').disabled = links.length < 2;
      dialog.querySelector('[data-next]').disabled = links.length < 2;
    };
    const close = () => dialog.close();
    document.addEventListener('click', event => {
      const link = event.target.closest('a');
      const i = links.indexOf(link);
      if (i < 0) return;
      event.preventDefault();
      opener = link;
      show(i);
      dialog.showModal();
      dialog.querySelector('[data-close]').focus();
    });
    dialog.querySelector('[data-close]').addEventListener('click', close);
    dialog.querySelector('[data-previous]').addEventListener('click', () => show(index - 1));
    dialog.querySelector('[data-next]').addEventListener('click', () => show(index + 1));
    dialog.addEventListener('click', event => { if (event.target === dialog) close(); });
    dialog.addEventListener('close', () => { image.removeAttribute('src'); opener?.focus(); });
    dialog.addEventListener('keydown', event => {
      if (event.key === 'ArrowLeft') { event.preventDefault(); show(index - 1); }
      if (event.key === 'ArrowRight') { event.preventDefault(); show(index + 1); }
    });
  }

  document.addEventListener('click', event => {
    const button = event.target.closest('[data-load-youtube]');
    if (!button) return;
    const embed = button.closest('[data-youtube]');
    const frame = document.createElement('iframe');
    frame.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(embed.dataset.youtube)}?autoplay=1`;
    frame.title = embed.dataset.youtubeTitle;
    frame.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    frame.allowFullscreen = true;
    embed.replaceChildren(frame);
  });
})();
