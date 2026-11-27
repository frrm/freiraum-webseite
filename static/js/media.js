(() => {
  let pannellumPromise;
  const loadAsset = (tag, props) => new Promise((resolve, reject) => {
    const el = Object.assign(document.createElement(tag), props, { onload: resolve, onerror: reject });
    document.head.append(el);
  });
  const loadPannellum = () => {
    pannellumPromise ||= Promise.all([
      loadAsset('link', { rel: 'stylesheet', href: '/modules/pannellum.css' }),
      loadAsset('script', { src: '/modules/pannellum.js' })
    ]);
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
        let viewer;
        const fail = () => {
          try { viewer?.destroy(); } catch {}
          container.replaceChildren(trigger);
          trigger.querySelector('span').textContent = trigger.dataset.error;
        };
        loadPannellum().then(() => {
          container.replaceChildren();
          viewer = pannellum.viewer(id, config);
          viewer.on('error', fail);
          // Errors raised while constructing fire before the listener exists.
          if (container.querySelector('.pnlm-error-msg')?.style.display === 'table') fail();
        }).catch(fail);
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
      if (i < 0 || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
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
    button.replaceWith(frame);
  });
})();
