var map;
var markers = [];
var dataset = [];
var users = [];
var collection = {};
var users_in_parking = {};
var flag = false;
var flag2 = false;
var api_key;

function load_parkings(){
  $.getJSON("datos.json", function( data ) {
    dataset = data['@graph'];
    var i;
    var list_principal = '<ul class="fa-ul">';
    var list_collection = '<ul>';
    for(i = 0; i < dataset.length; i++){
      var title = dataset[i].title;
      var locality = dataset[i]['address']['locality'];
      var postal_code = dataset[i]['address']['postal-code'];
      var street = dataset[i]['address']['street-address'];

      list_principal += '<li class="elem-list-principal" no="' + i + '"><i class="fa-li fa fa-caret-right"></i>' + title;
      list_principal += '<ul class="fa-ul"><li><i class="fa-li fa fa-angle-double-right"></i>';
      list_principal += street + ', ' + locality + ' (' + postal_code + ')</li></ul></li><hr>' ;

      list_collection += '<li class="elem-list-collection draggable" no="' + i + '">' + title + '</li>';
    }
    list_principal += '</ul>';
    list_collection += '</ul>';


    $('#instal-principal').append(list_principal);

    $('#instal-collection').append(list_collection);

    $('#instal-collection .elem-list-collection').draggable({
      cancel: "a.ui-icon", // clicking an icon won't initiate dragging
      revert: "invalid", // when not dropped, the item will revert back to its initial position
      containment: "document",
      helper: "clone",
      cursor: "grabbing",
      appendTo: "body"
    });

    $("#info-collection").droppable({
      accept: "#instal-collection .elem-list-collection",
      drop: function( event, ui ) {
        if(flag){
          var droppable = $(this);
          var position = droppable[0].firstChild.attributes.pos.value;
          var name_collection = droppable[0].firstChild.innerText;
          var draggable = ui.draggable;

          var index = draggable.attr('no')
          var clone = draggable.clone();
          var repeated = false;
          if(check_repeat(name_collection, index) == -1){
            $(this).append(clone);
            add_to_collection(index, name_collection);
            show_collection(name_collection, position);
            show_collection_principal(name_collection, position);
          };
        }
      }
    });

    $("#instal-principal .elem-list-principal").click(function(){
      $("#info-parking").fadeIn("slow");
      var index = $(this).attr("no");
      var latitude = dataset[index].location.latitude;
      var longitude = dataset[index].location.longitude;
      show_parking_info(index);
      show_marker_map(latitude, longitude, index);
    });
  });
}

function show_parking_info(index){
  var imgs = [];
  var current_parking = dataset[index];
  var latitude = dataset[index].location.latitude;
  var longitude = dataset[index].location.longitude;
  var url = "https://commons.wikimedia.org/w/api.php?format=json&action=query&generator=geosearch&ggsprimary=all&ggsnamespace=6&ggsradius=500&ggscoord=";
  url += latitude + "|" + longitude;
  url += "&ggslimit=10&prop=imageinfo&iilimit=1&iiprop=url&iiurlwidth=200&iiurlheight=200&callback=?";
  $.ajax({
        url: url,
        dataType: 'jsonp'
    }).done(function(data){
      var imgs_url = data.query.pages;
      var i = 0;
      $.each( imgs_url, function( key, value ) {
        i++;
        var img = value.imageinfo[0].url;
        imgs.push(img)
        return (i !== 3);
      });
      var carousel1 = create_carousel(imgs);
      var carousel2 = create_carousel2(imgs);
      create_parking_info(current_parking, carousel1, carousel2, index);

    });
}

function create_carousel(images){
  var html = `<div id="myCarousel" class="carousel slide" data-ride="carousel" style="width:450px;heigth:250px;" align="left">
                <!-- Indicators -->
                <ol class="carousel-indicators">
                  <li data-target="#myCarousel" data-slide-to="0" class="active"></li>
                  <li data-target="#myCarousel" data-slide-to="1"></li>
                  <li data-target="#myCarousel" data-slide-to="2"></li>
                </ol>

                <!-- Wrapper for slides -->
                <div class="carousel-inner">
                  <div class="item active">
                    <img src="` + images[0] + `" style="width:100%;height:250px">
                  </div>

                  <div class="item">
                    <img src="` + images[1] + `" style="width:100%;height:250px">
                  </div>

                  <div class="item">
                    <img src="` + images[2] + `" style="width:100%;height:250px">
                  </div>
                </div>

                <!-- Left and right controls -->
                <a class="left carousel-control" href="#myCarousel" data-slide="prev">
                  <span class="glyphicon glyphicon-chevron-left"></span>
                  <span class="sr-only">Previous</span>
                </a>

                <a class="right carousel-control" href="#myCarousel" data-slide="next">
                  <span class="glyphicon glyphicon-chevron-right"></span>
                  <span class="sr-only">Next</span>
                </a>
              </div>`
  return html;
  }

  function create_carousel2(images){
    var html = `<div id="myCarousel2" class="carousel slide" data-ride="carousel" style="width:450px;heigth:250px;" align="left">
                  <!-- Indicators -->
                  <ol class="carousel-indicators">
                    <li data-target="#myCarousel2" data-slide-to="0" class="active"></li>
                    <li data-target="#myCarousel2" data-slide-to="1"></li>
                    <li data-target="#myCarousel2" data-slide-to="2"></li>
                  </ol>

                  <!-- Wrapper for slides -->
                  <div class="carousel-inner">
                    <div class="item active">
                      <img src="` + images[0] + `" style="width:100%;height:250px">
                    </div>

                    <div class="item">
                      <img src="` + images[1] + `" style="width:100%;height:250px">
                    </div>

                    <div class="item">
                      <img src="` + images[2] + `" style="width:100%;height:250px">
                    </div>
                  </div>

                  <!-- Left and right controls -->
                  <a class="left carousel-control" href="#myCarousel2" data-slide="prev">
                    <span class="glyphicon glyphicon-chevron-left"></span>
                    <span class="sr-only">Previous</span>
                  </a>

                  <a class="right carousel-control" href="#myCarousel2" data-slide="next">
                    <span class="glyphicon glyphicon-chevron-right"></span>
                    <span class="sr-only">Next</span>
                  </a>
                </div>`
    return html;
}

function create_parking_info(info, carousel1, carousel2, index){
  flag2 = true;
  var title = info.title;
  var locality = info['address']['locality'];
  var postal_code = info['address']['postal-code'];
  var street = info['address']['street-address'];
  var description = info['organization']['organization-desc'];
  var html1 = `<i class="fa fa-times-circle fa-lg" aria-hidden="true"></i><div>
                <h3>`+ title + `</h3><hr>
                <p>` + description + `</p>
                <p>` + street + ', ' + locality + ' (' + postal_code + ')' + `</p>
              </div>`

  var html2 = `<div>
                <h3>`+ title + `</h3><hr>
                <p>` + description + `</p>
                <p>` + street + ', ' + locality + ' (' + postal_code + ')' + `</p>
              </div>`
  $("#info-parking #description").html(html1)
  $("#info-parking #div-carousel").html(carousel1)

  $("#info-parking2 #description2").html(html2)
  $("#info-parking2 #div-carousel2").html(carousel2)

  update_instal_users(index);

  $("#info-parking .fa-times-circle").click(function(){
    $("#info-parking").fadeOut("slow");
  });

}

function update_instal_users(no_parking){
  var title = dataset[no_parking].title;
  var name;
  $("#instal-users").html('<ul id="list-users-parking"></ul>');
  var html = "<h3 no='" + no_parking + "'>" + title + "</h3>";
  $("#instal-users").prepend(html);
  var html_list = "";
  if($.inArray(no_parking, Object.keys(users_in_parking)) != -1){
    var users_parking = users_in_parking[no_parking];
    for(var i = 0; i < users_parking.length; i++){
      html_list = "<li>" + users_parking[i] + "</li>"
      $("#list-users-parking").append(html_list);
    }
  }
}

function load_map(){
  map = L.map('mapid').setView([40.4167, -3.70325], 11);
  L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  map.on('popupopen', onPopupOpen);
}

function show_marker_map(lat, long, index){
  var marker = L.marker([lat, long]).addTo(map);
  var btn = "<button type='button' class='btn btn-warning'no='" + markers.length + "'>Eliminar</button>"
  markers.push(marker);
  marker.bindPopup(btn).openPopup();
  map.setView([lat,long],15);
  marker.on('click', function(){
    show_parking_info(index);
  })

}

function onPopupOpen(){
  $('button').click(function(){
    var index = $(this).attr("no");
    var marker = markers[index];
    map.removeLayer(marker);
    delete markers[index];
  })
}

function update_collection(name, position){
  flag = true;
  var html = "<h1 pos='" + position + "'>" + name + "</h1>"
  $("#info-collection").html(html);
}

function add_to_collection(index, name){
  collection[name].push(index);
}

function show_collection(name, position){
  var title;
  var html = "<h1 pos='" + position + "'>" + name + "</h1>"
  var indexs = collection[name];
  for(var i = 0; i < indexs.length; i++){
    title = dataset[indexs[i]].title;
    html += "<li>" + title + "</li>"
  }
  $("#info-collection").html(html);
}

function show_collection_principal(name, position){
  var title;
  var locality;
  var postal_code;
  var street;
  var html = "<h1 pos='" + position + "'>" + name + "</h1>"
  html += '<ul class="fa-ul">';
  var indexs = collection[name];
  for(var i = 0; i < indexs.length; i++){
    title = dataset[indexs[i]].title;
    locality = dataset[indexs[i]]['address']['locality'];
    postal_code = dataset[indexs[i]]['address']['postal-code'];
    street = dataset[indexs[i]]['address']['street-address'];
    html += '<li class="elem-list-principal" no="' + indexs[i] + '"><i class="fa-li fa fa-caret-right"></i>' + title;
    html += '<ul class="fa-ul"><li><i class="fa-li fa fa-angle-double-right"></i>';
    html += street + ', ' + locality + ' (' + postal_code + ')</li></ul></li><hr>' ;
  }
  html += "</ul>"
  $("#select-collection").html(html);
  $("#select-collection .elem-list-principal").click(function(){
    $("#info-parking").fadeIn("slow");
    var index = $(this).attr("no");
    var latitude = dataset[index].location.latitude;
    var longitude = dataset[index].location.longitude;
    show_parking_info(index);
    show_marker_map(latitude, longitude, index);
  });
}

function remove_collection(name){
  delete collection[name];
}

function check_list_collection(name){
  var name_aux = $("#info-collection")[0].textContent;
  if(name == name_aux){
    $("#info-collection").html('');
    $("#select-collection").html('');
  }
}

function check_repeat(name, index){
  var list_collection = collection[name];
  return ($.inArray(index,list_collection));
}

function load_users(){
  try {

    var host = "ws://localhost:12345/";
    var user_name;
    var no;
    var s = new WebSocket(host);

    $(".fa-ban").click(function(){
      $(".fa-refresh").removeClass('fa-spin');
      s.close();
    })

    s.onopen = function (e) {
      console.log("Socket opened.");
    };

    s.onclose = function (e) {
      console.log("Socket closed.");
    };

    s.onmessage = function (e) {
      console.log("Socket message:", e.data);
      var id = e.data;
      get_user_name(id);
    };

    s.onerror = function (e) {
      console.log("Socket error:", e);
    };

  } catch (ex) {
    console.log("Socket exception:", ex);
  }


}

function get_user_name(id){
  var apiKey = api_key;
// Use a button to handle authentication the first time.
  gapi.client.setApiKey(apiKey);
  makeApiCall(id);
}
  // Load the API and make an API call.  Display the results on the screen.
  function makeApiCall(id) {
    var user_name;
    gapi.client.load('plus', 'v1', function() {
      var request = gapi.client.plus.people.get({
        'userId': id
        // For instance:
        // 'userId': '+GregorioRobles'
      });
      request.execute(function(resp) {
        user_name = resp.displayName;
        if($.inArray(user_name, users) == -1){
          users.push(user_name);
          show_new_user(user_name);
        }
      });
    });
  }

function show_new_user(name){
  var html = "<li class='elem-list-users'no='" + (users.length - 1) + "'>" + name + "</li>"
  $("#list-users").append(html);

  $('#list-users .elem-list-users').draggable({
    cancel: "a.ui-icon", // clicking an icon won't initiate dragging
    revert: "invalid", // when not dropped, the item will revert back to its initial position
    containment: "document",
    helper: "clone",
    cursor: "grabbing",
    appendTo: "body"
  });

  $("#instal-users").droppable({
    accept: "#list-users .elem-list-users",
    drop: function( event, ui ) {
      if(flag2){
        var droppable = $(this);
        var no_parking = droppable[0].firstChild.attributes.no.value;
        var draggable = ui.draggable;
        var name = draggable[0].innerText;
        if($.inArray(no_parking, Object.keys(users_in_parking)) == -1){
          users_in_parking[no_parking] = [];
        }
        if($.inArray(name, users_in_parking[no_parking]) == -1){
          users_in_parking[no_parking].push(name);
          var clone = draggable.clone();
          $("#list-users-parking").append(clone);
        }
      }
    }
  });
}


$(document).ready(function() {
    load_map();
    $("#load-parkings").click(function(){
      $("#tabs").css({"opacity":'1',"pointer-events":'all'});
      $("#load-parkings").remove();
      load_parkings();
    });
    var position;
    $("#create-collection").submit(function(e){
      e.preventDefault();
      var name_collection = $("#collection-name").val();
      if(name_collection == ""){
        alert("Introduce un nombre de colección");
        return false;
      }

      var names_collections = Object.keys(collection);
      if ($.inArray(name_collection, names_collections) != -1){
        alert("El nombre de la collección ya está usado");
        return false;
      }

      position = Object.keys(collection).length
      var html = "<li pos='" + position + "'>";
      html += "<span class='name-collection'  pos='" + position + "'>" + name_collection + "</span>";
      html += "<span class='remove-collection' pos='" + position + "'><i class='fa fa-trash-o remove-collection'></i></span>"
      html += "</li>" ;

      collection[name_collection] = [];

      $("#list-collections ol").append(html);
      update_collection(name_collection, position);
      show_collection_principal(name_collection, position);

      $("#list-collections li span.remove-collection[pos=" + position + "]").click(function(){
        var position = $(this).attr('pos');
        remove_collection(name_collection);
        $("#list-collections li[pos=" + position + "]").remove();
        check_list_collection(name_collection);
      });

      $("#list-collections li span.name-collection[pos=" + position + "]").click(function(){
        var name_collection = $(this)[0].textContent;
        var position = $(this).attr('pos');
        show_collection(name_collection, position);
        show_collection_principal(name_collection, position);
      });

      $(this)[0].reset();

    });

    $("#dialog-apikey").dialog({
      autoOpen: false,
      show: {
        effect: "blind",
        duration: 1000
      },
      hide: {
        effect: "blind",
        duration: 1000
      },
      buttons: {
        "Confirmar": save_apikey,
        Cancel: function() {
          $(this).dialog("close");
        }
      }
    });

    $("#dialog-save").dialog({
      autoOpen: false,
      show: {
        effect: "blind",
        duration: 1000
      },
      hide: {
        effect: "blind",
        duration: 1000
      },
      buttons: {
        "Guardar datos": save_data,
        Cancel: function() {
          $(this).dialog("close");
        }
      }
    });

    $("#dialog-load").dialog({
      autoOpen: false,
      show: {
        effect: "blind",
        duration: 1000
      },
      hide: {
        effect: "blind",
        duration: 1000
      },
      buttons: {
        "Cargar datos": load_data,
        Cancel: function() {
          $(this).dialog("close");
        }
      }
    });

    $("#load-users").on("click", function() {
      $("#dialog-apikey").dialog("open");
    });

    $("#save-all").on("click", function() {
      $("#dialog-save").dialog("open");
    });

    $("#load-all").on("click", function() {
      $("#dialog-load").dialog("open");
    });

    function save_apikey(){

      api_key = $("#save-apikey").val();
      if(api_key == ''){
        alert("Introduzca una Api key")
        return false;
      }
      $("#dialog-apikey").dialog("close");
      $("#instal-users,#all-users").show();
      load_users();
    }

    function save_data(){
      var token = $("#save-token").val();
      var user = $("#save-user").val();
      var repo = $("#save-repo").val();
      var file = $("#save-file").val();
      $("#dialog-save").dialog("close");
      github = new Github({
        token: token,
        auth: "oauth"
      });
      var data = {
    		collections: collection,
    		users: users_in_parking
    	}
      content = JSON.stringify(data);
      myrepo = github.getRepo(user, repo);
      myrepo.write('master', file, content, "Updating data",
        function(err) {
          console.log(err);
      });
    }

    function load_data(){
      var token = $("#load-token").val();
      var user = $("#load-user").val();
      var repo = $("#load-repo").val();
      var file = $("#load-file").val();
      $("#dialog-load").dialog("close");
      github = new Github({
        token: token,
        auth: "oauth"
      });
      myrepo = github.getRepo(user, repo);
      myrepo.read('master', file,
        function(err, data) {
          data = JSON.parse(data);
          add_new_data(data);
      });
    }

    function add_new_data(data){
      $.each(data.collections, function(key,value) {
        collection[key] = value;
      });
      update_list_collection();
      $.each(data.users, function(key, value){
        users_in_parking[key] = value;
      });
    }

    function update_list_collection(){
      var html = '';
      var i = 0;
      $.each(collection, function(key,value) {
        html = "<li pos='" + i + "'>";
        html += "<span class='name-collection'  pos='" + i+ "'>" + key + "</span>";
        html += "<span class='remove-collection' pos='" + i + "'><i class='fa fa-trash-o remove-collection'></i></span>"
        html += "</li>" ;
        $("#list-collections ol").append(html)

        $("#list-collections li span.remove-collection[pos=" + i + "]").click(function(){
          var position = $(this).attr('pos');
          remove_collection(key);
          $("#list-collections li[pos=" + position + "]").remove();
          check_list_collection(key);
        });

        $("#list-collections li span.name-collection[pos=" + i + "]").click(function(){
          var name_collection = $(this)[0].textContent;
          var position = $(this).attr('pos');
          show_collection(name_collection, position);
          show_collection_principal(name_collection, position);
        });
        i++;
      });
    }
});
