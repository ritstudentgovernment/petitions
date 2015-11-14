infiniteScroll = function() {
  var didScroll = false,
      windowDom = $(window),
      documentDom = $(document)
      bufferBottom = 125;

  if (windowDom.width() <= 400) {
    bufferBottom = windowDom.height() * 0.75;
  }

  $(window).scroll(function() {
      didScroll = true;
  });

  setInterval(function() {
    if ( didScroll ) {
      didScroll = false;
      var atBottom = (windowDom.scrollTop() >= documentDom.height() - windowDom.height() - bufferBottom);
      if (atBottom) {
        Session.set('petitionsLimit', Session.get('petitionsLimit') + 12);
      }
    }
  }, 500);
};
