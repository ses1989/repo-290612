/**
 * (MVC) ACCORDIONS
 */
document.addEventListener('click', function (e) {
  var $el = e.target.closest('.accordion-item');
  if ($el === null) {
    return;
  }
  var isActive = 'is-active';
  if ($el.classList.contains(isActive)) {
    $el.classList.remove(isActive);
  } else {
    $el.classList.add(isActive);
  }
}, false);
