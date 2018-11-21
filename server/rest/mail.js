import { scanMail } from '../services/mail';
import socketio from 'socket.io';

export default function(app, server) {
  const io = socketio(server);

  io.on('connection', function(socket){
    socket.auth = false;
    socket.on('authenticate', function(data){
      //check the auth data sent by the client
      checkAuthToken(data.token, function(err, success){
        if (!err && success){
          console.log("Authenticated socket ", socket.id);
          socket.auth = true;
        }
      });
    });

    setTimeout(function(){
      // if the socket didn't authenticate, disconnect it
      if (!socket.auth) {
        console.log("Disconnecting socket ", socket.id);
        socket.disconnect('unauthorized');
      }
    }, 1000);
  }
}

// app.get('/mail/scan', async (req, res) => {
//   const { user } = req;
//   const mail = await scanMail({ userId: user.id });
//   res.send();
// });
