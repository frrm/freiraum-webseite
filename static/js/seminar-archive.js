document.querySelectorAll('[data-seminar-filter]').forEach(filters => {
  const list = filters.nextElementSibling;
  const apply = () => list.querySelectorAll('[data-year]').forEach(item => {
    item.hidden = (filters.querySelector('[name="year"]').value !== 'all' && item.dataset.year !== filters.querySelector('[name="year"]').value)
      || (filters.querySelector('[name="media"]').value !== 'all' && !item.dataset.media.split(' ').includes(filters.querySelector('[name="media"]').value));
  });
  filters.addEventListener('change', apply);
});
