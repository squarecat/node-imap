const pm2 = require('pm2');

const today = new Date();

if (today.getHours() !== 0 && !today.getDate() !== 1) {
  console.log(
    `Started at wrong time (day: ${today.getDate()}, hour: ${today.getHours()}), stopping.`
  );
  process.exit(0);
}

pm2.connect(function() {
  console.log('running monthly cron');
  pm2.sendDataToProcessId(
    {
      type: 'cron',
      id: 0,
      data: {
        timeframe: 'monthly'
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
