const grpc = require('@grpc/grpc-js');
const { Server } = require('grpc-server-js');

import { SeasonService } from './season_grpc_pb';
import service from './service';

async function start() {
  const server = new Server();
  server.addService(SeasonService, {
    updateTeamSeason: function (
      { metadata, request }: any,
      callback: Function,
    ) {
      console.log(request);
      console.log(metadata);
      service
        .updateTeamSeason(request)
        .then((result) => {
          callback(null, result);
        })
        .catch((err) => {
          callback(err);
        });
    },
  });
  await server.bind('0.0.0.0:50051', grpc.ServerCredentials.createInsecure());
  server.start();
}

start()
  .then(() => {
    console.log('Started');
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
