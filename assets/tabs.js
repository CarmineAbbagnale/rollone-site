document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.install-tabs').forEach(function (group) {
    var btns = group.querySelectorAll('.tabbtn');
    var panels = group.querySelectorAll('.panel');
    btns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        btns.forEach(function (b) { b.setAttribute('aria-selected', 'false'); });
        panels.forEach(function (p) { p.classList.remove('active'); });
        btn.setAttribute('aria-selected', 'true');
        var target = group.querySelector('#' + btn.dataset.tab);
        if (target) target.classList.add('active');
      });
    });
  });
});
