const progressTweets = [
  {
    val: -1,
    text: `Start unsubscribing to take back control of your inbox from spammers! 💌`,
    tweet: `I’m using @LeaveMeAloneApp to take back control of my inbox and unsubscribe from email lists with one click! 💌 leavemealone.xyz/r/REFERRAL`
  },
  {
    val: 5,
    text: `Congrats! You’ve unsubscribed from NUM spam email, keep going for a cleaner inbox! 🤩`,
    tweet: `I’ve been cleaning up my inbox and have unsubscribed from NUM spam email so far using @LeaveMeAloneApp 🤩 leavemealone.xyz/r/REFERRAL`
  },
  {
    val: 10,
    text: `Congrats! You’ve unsubscribed from NUM spam emails, keep going for a cleaner inbox! 🤩`,
    tweet: `I’ve been cleaning up my inbox and have unsubscribed from NUM spam emails so far using @LeaveMeAloneApp 🤩 leavemealone.xyz/r/REFERRAL`
  },
  {
    val: 20,
    text: `Wow! You’ve saved yourself from NUM spam emails so far, great job! 🙌`,
    tweet: `I’ve saved myself from NUM spam emails so far using @LeaveMeAloneApp 🙌 leavemealone.xyz/r/REFERRAL`
  },
  {
    val: 50,
    text: `Bam! You’re on a roll, you’ve unsubscribed from NUM email lists so far 🎉`,
    tweet: `I’m on a roll, I’ve unsubscribed from NUM spam email lists so far using @LeaveMeAloneApp 🎉 leavemealone.xyz/r/REFERRAL`
  },
  {
    val: 100,
    text: `Super user alert! Can you believe you’ve opted out of NUM spam email lists? 🔥`,
    tweet: `I’m a Leave Me Alone super user! Can you believe I’ve opted out of NUM spam email lists using @LeaveMeAloneApp 🔥 leavemealone.xyz/r/REFERRAL`
  },
  {
    val: 500,
    text: `Incredible! You’ve hit NUM unsubscribes. We name you an unsubscribing master 👩‍🎓`,
    tweet: `I’ve hit NUM unsubscribes and been named an email un-subscribing master using @LeaveMeAloneApp 👩‍🎓 leavemealone.xyz/r/REFERRAL`
  }
];

export function getSocialContent(unsubCount = 0, referralCode) {
  return progressTweets.reduce(
    (out, progress) => {
      if (unsubCount >= progress.val) {
        return {
          text: progress.text.replace('NUM', unsubCount),
          tweet: encodeURIComponent(
            progress.tweet
              .replace('NUM', unsubCount)
              .replace('REFERRAL', referralCode)
          )
        };
      }
      return out;
    },
    { text: null, tweet: null }
  );
}
