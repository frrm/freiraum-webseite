document.querySelectorAll('[data-seminar-filter]').forEach(filters => {
  const archive = filters.nextElementSibling;
  const year = filters.querySelector('[name="year"]');
  const media = filters.querySelector('[name="media"]');
  const apply = () => {
    archive.querySelectorAll('li[data-year]').forEach(item => {
      item.hidden = (year.value !== 'all' && item.dataset.year !== year.value)
        || (media.value !== 'all' && !item.dataset.media.split(' ').includes(media.value));
    });
    archive.querySelectorAll('[data-year-group]').forEach(group => {
      group.hidden = !group.querySelector('li:not([hidden])');
    });
  };
  filters.addEventListener('change', apply);
});
