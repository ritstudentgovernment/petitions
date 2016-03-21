Template.carousel.events = {
  'click .carousel-search' : function () {
    $('#modal-search').modal();
    setTimeout( function() {
      $('#search').focus();
    }, 500);
  }
}

Template.carousel.rendered = function onCarouselRendered() {
  var stock_images = _.get(Meteor, 'settings.public.ui.carousel_images', ['/carousel_1.png', '/carousel_2.png', '/carousel_3.png']);
  var random = stock_images[Math.floor(Math.random() * stock_images.length)];
  $('.carousel').css('background-image', 'url(' + random + ')');
  return;
}
