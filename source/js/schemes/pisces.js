/* global NexT, CONFIG */

window.addEventListener('DOMContentLoaded', function() {

  var sidebarOffset = CONFIG.sidebar.offset || 12;

  function getHeaderOffset() {
    return $('.header-inner').height() + sidebarOffset;
  }

  function getFooterOffset() {
    var footer = $('#footer');
    var footerInner = $('.footer-inner');
    var footerMargin = footer.outerHeight() - footerInner.outerHeight();
    var footerOffset = footer.outerHeight() + footerMargin;
    return footerOffset;
  }

  function initAffix() {
    var headerOffset = getHeaderOffset();
    var footerOffset = getFooterOffset();

    $('.sidebar-inner').affix({
      offset: {
        top   : headerOffset - sidebarOffset,
        bottom: footerOffset
      }
    });

    $('#sidebar').css({ 'margin-top': headerOffset, 'margin-left': 'auto' });
  }

  function recalculateAffixPosition() {
    $(window).off('.affix');
    $('.sidebar-inner').removeData('bs.affix').removeClass('affix affix-top affix-bottom');
    initAffix();
  }

  function resizeListener() {
    var mql = window.matchMedia('(min-width: 992px)');
    mql.addListener(function(e) {
      if (e.matches) {
        recalculateAffixPosition();
      }
    });
  }

  initAffix();
  resizeListener();
});
