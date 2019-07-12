const pm2 = require('pm2');

pm2.connect(function() {
  console.log('running daily cron');
  pm2.sendDataToProcessId(
    {
      type: 'cron',
      id: 0,
      data: {
        timeframe: 'daily'
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
