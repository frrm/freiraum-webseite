const search = document.getElementById('search');
const error = search.dataset.language === 'en'
  ? 'Search could not be loaded. Please try again later.'
  : 'Die Suche konnte nicht geladen werden. Bitte versuche es später erneut.';

search.setAttribute('role', 'status');
search.textContent = search.dataset.language === 'en' ? 'Loading search…' : 'Suche wird geladen…';

fetch(search.dataset.index).then(response => {
  if (!response.ok || typeof PagefindUI === 'undefined') throw new Error('Search index unavailable');
  search.textContent = '';
  search.removeAttribute('role');
  new PagefindUI({ element: '#search', showSubResults: true });
}).catch(() => {
  search.textContent = error;
  search.setAttribute('role', 'status');
});
