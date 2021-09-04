// It handles the delete action in an unobstrusive way and with API Gatewway compatibility.

(function() {
  // link
  function handleLink(e) {
    var target = $(e.target);
    if (target.is('a') && target.data("method") == "delete") {
      stopAll(e);
      return handleDelete(e);
    } else {
      return true;
    }
  }

  function handleDelete(e) {
    var link = $(e.target);
    var message = link.data("confirm");
    if (message) {
      var sure = confirm(message);
      if (sure) {
        deleteItem(link);
      }
    }
  }

  function deleteItem(link) {
    var resource = link.attr("href");
    var token = $('meta[name=csrf-token]').attr('content');
    var data = { authenticity_token: token };
    var request = $.ajax({
      url: resource,
      method: "DELETE",
      data: data,
      dataType: "json"
    });

    request.done(function(data) {
      redirect_to(data.location);
    });
  }

  function redirect_to(url) {
    var location = add_stage(url);
    window.location = location;
  }

  function add_stage(url) {
    var host = window.location.host;
    // only add stage if on lambda, not on cloud9, and url starts with /
    if (host.match(/\.amazonaws\.com/) && !host.match(/\.cloud9\./) && url[0] == '/') {
      var stage = window.location.pathname.split('/')[1];
      return "/" + stage + url;
    } else {
      return url;
    }
  }

  function stopAll(e) {
    e.preventDefault();
    e.stopPropagation();
    return false;
  }

  // submit
  function handleSubmit(e) {
    var button = $(this);
    var form = $(this).closest('form');
    var url = form.attr('action');
    var data = form.serialize();

    $.ajax({
      url: url,
      type: 'delete',
      data: data,
      success: function(data) {
        redirect_to(data.location);
      }
    });

    stopAll(e);
  }

  var Jets = {};

  Jets.start = function() {
    $(function() {
      // links
      var linkClickSelector = 'a[data-confirm], a[data-method], a[data-remote]:not([disabled]), a[data-disable-with], a[data-disable]';
      $(linkClickSelector).click(handleLink);

      // buttons
      var formInputClickSelector = 'form:not([data-turbo=true]) input[type=submit], form:not([data-turbo=true]) input[type=image], form:not([data-turbo=true]) button[type=submit], form:not([data-turbo=true]) button:not([type]), input[type=submit][form], input[type=image][form], button[type=submit][form], button[form]:not([type])';
      $(formInputClickSelector).click(handleSubmit);
    });
  }

  module.exports = Jets;
}).call(this);

