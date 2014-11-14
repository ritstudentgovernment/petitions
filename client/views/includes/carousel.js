Template.carousel.events = {
  'click .carousel-search' : function () {
    $('#modal-search').modal();
    setTimeout( function() {
      $('#search').focus();
    }, 500);
  },
  'click .carousel-new-petition' : function () {
    window.location.href="/petitions/create";
  }
}

Template.carousel.rendered = function onCarouselRendered() {
  var stock_images = ['carousel_1.png', 'carousel_2.png', 'carousel_3.png', 'carousel_4.png', 'carousel_5.png', 'carousel_6.png'];
  var random = stock_images[Math.floor(Math.random() * stock_images.length)];
  $('.carousel').css('background-image', 'url(' + random + ')');
  return;
}
