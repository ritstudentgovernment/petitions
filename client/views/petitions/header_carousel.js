Template.headerCarousel.rendered = function onHeaderCarouselRendered() {
  var stock_images = _.get(Meteor, 'settings.public.ui.carousel_images', ['/carousel_1.png', '/carousel_2.png', '/carousel_3.png']);
  var random = stock_images[Math.floor(Math.random() * stock_images.length)];
  $('.campus-carousel').css('background-image', 'url(' + random + ')');
  console.log("background selected");
  return;
}
