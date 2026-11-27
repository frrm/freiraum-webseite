const search = document.getElementById('search');
const english = search.dataset.language === 'en';
const error = english
  ? 'Search could not be loaded. Please try again later.'
  : 'Die Suche konnte nicht geladen werden. Bitte versuche es später erneut.';
const bundle = new URL('.', new URL(search.dataset.index, location.href)).href;
const status = document.createElement('p');
status.setAttribute('role', 'status');
status.textContent = english ? 'Loading search…' : 'Suche wird geladen…';
search.after(status);
const fail = () => { status.textContent = error; };

// Pagefind only logs failed module and index requests (and then reports "no
// results"), so initialise it without its worker and watch its own requests.
const nativeFetch = window.fetch.bind(window);
window.fetch = (input, init) => {
  const fromBundle = new URL(input.url || input, location.href).href.startsWith(bundle);
  return nativeFetch(input, init).then(response => {
    if (fromBundle && !response.ok) fail();
    return response;
  }, reason => {
    if (fromBundle) fail();
    throw reason;
  });
};
fetch(search.dataset.index).then(response => {
  if (!response.ok || typeof PagefindUI === 'undefined') throw new Error('Search index unavailable');
  return import(bundle + 'pagefind.js');
}).then(async pagefind => {
  await pagefind.options({ noWorker: true });
  await pagefind.init();
  status.textContent = '';
  search.addEventListener('input', () => { status.textContent = ''; });
  new PagefindUI({ element: '#search', bundlePath: bundle, showSubResults: true });
}).catch(fail);
