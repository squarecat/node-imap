const pm2 = require('pm2');

if (new Date().getHours() !== 0) {
  console.log(`Started at wrong time (${new Date().getHours()}), stopping.`);
  process.exit(0);
}

pm2.connect(function() {
  console.log('running weekly cron');
  pm2.sendDataToProcessId(
    {
      type: 'cron',
      id: 0,
      data: {
        timeframe: 'weekly'
      },
      topic: 'cron'
    },
    function(err) {
      if (err) {
        console.error(err);
        process.exit(1);
      }
      console.log('done');
      process.exit(0);
    }
  );
});
