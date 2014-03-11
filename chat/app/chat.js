

$( function() {
  var liveoak = new LiveOak( {
      host: "localhost",
      port: 8080,
      auth: {
        clientId: 'chat',
        realm: 'chat',
        onload: 'login-required'
      }
    }
  );

  liveoak.auth.init(authCallback, function(data) {
    alert( "authentication failed: " + data.error );
  });

  function add_message(data) {
    $( '#messages' ).append( 
      $( '<div class="message">' ).append( 
        $('<div class="name">').append( data.name ) ).append( 
        $('<div class="text">').append( data.text ) ) );
    $( '#messages' ).scrollTop( $('#messages')[0].scrollHeight );
  }

  function authCallback() {
    $( '#user-info' ).html( "Logged in as: " + liveoak.auth.idToken.preferred_username );
    liveoak.connect( "Bearer", window.oauth.token, function() {
      liveoak.create( '/chat/storage', { id: 'chat' }, {
        success: function(data) {

          liveoak.onStompError( function(frame) {
            alert("Stomp error received. Details: " + frame);
          });

          liveoak.subscribe( '/chat/storage/chat/*', function(data) {
            add_message( data );
          } );
          liveoak.read( '/chat/storage/chat?expand=members', {
            success: function(data) {
              $(data._members).each( function(i, e) {
                add_message( e );
              } );
            }
          } );
        },
        error: function(data) {
          alert( "chat Collection NOT created. Error: " + data.status );
        }
      } );
    } );
  };

  $('#logout').click(function() {
    liveoak.auth.logout();
  });

  $('#input form').submit( function() {
    var name = liveoak.auth.idToken.preferred_username;
    var text = $( '#text-field' ).val();

    $('#text-field').val( '' );

    liveoak.create( '/chat/storage/chat', 
                    { name: name, text: text },
                    { success: function(data) { 
                        console.log( "sent" ); 
                      },
                      error: function(error) {
                        alert( error.status + ": " + error.statusText );
                      }
                  } );
    return false;
  } );

} )
