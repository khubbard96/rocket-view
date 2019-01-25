function bindEvents() {

  var partNav = $("#stage_navigator");

  partNav.find(".stage-title").off().on("click", function(e) {
    partNav.find(".stage-title").removeClass("selected");
    $(e.target).addClass("selected");
  });
}

$(document).ready(function() {
  bindEvents();
});
