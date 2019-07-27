export async function* fetchMail(
  { user, account, from },
  { strategy = 'api', batch = false } = {}
) {
  const start = Date.now();
  try {
    const { unsubscriptions, ignoredSenderList } = user;
    const [totalEstimate, client, accessToken] = await Promise.all([
      getEstimateForTimeframe(user.id, account, {
        from,
        includeTrash: true
      }),
      getMailClient(user.id, account, strategy),
      getGmailAccessToken(user.id, account)
    ]);
    logger.info(
      `gmail-fetcher: checking for new mail after ${new Date(from)} (${
        user.id
      }) [estimated ${totalEstimate} mail]`
    );
    let totalEmailsCount = 0;
    let totalUnsubCount = 0;
    let totalPrevUnsubbedCount = 0;
    let progress = 0;
    let dupeCache = {};
    let dupeSenders = [];

    const iterators = [
      fetchMailApi(client, { accessToken, from, batch })
      // fetchMailApi(client, {
      //   accessToken,
      //   from,
      //   batch,
      //   withContent: true,
      //   query: 'unsubscribe'
      // })
    ];
    for (let iter of iterators) {
      let next = await iter.next();
      while (!next.done) {
        const mail = next.value;
        totalEmailsCount = totalEmailsCount + mail.length;
        progress = progress + mail.length;
        const unsubscribableMail = parseMailList(mail, {
          ignoredSenderList,
          unsubscriptions
        });
        const previouslyUnsubbedCount = unsubscribableMail.filter(
          sm => !sm.subscribed
        ).length;
        totalPrevUnsubbedCount =
          totalPrevUnsubbedCount + previouslyUnsubbedCount;

        if (unsubscribableMail.length) {
          const {
            dupes: newDupeCache,
            deduped,
            dupeSenders: newDupeSenders
          } = dedupeMailList(dupeCache, unsubscribableMail, dupeSenders);
          totalUnsubCount = totalUnsubCount + deduped.length;
          dupeCache = newDupeCache;
          dupeSenders = newDupeSenders;
          yield { type: 'mail', data: deduped };
        }
        yield { type: 'progress', data: { progress, total: totalEstimate } };
        next = await iter.next();
      }
    }

    logger.info(
      `gmail-fetcher: finished scan (${user.id}) [took ${(Date.now() - start) /
        1000}s, ${totalEmailsCount} results]`
    );
    return {
      totalMail: totalEmailsCount,
      totalUnsubscribableMail: totalUnsubCount,
      totalPreviouslyUnsubscribedMail: totalPrevUnsubbedCount,
      occurrences: dupeCache,
      dupeSenders
    };
  } catch (err) {
    throw new MailError('failed to fetch mail', {
      provider: 'gmail',
      cause: err
    });
  }
}
export async function* fetchMailImap(client, { from }) {
  try {
    client.onerror = err => console.error(err);
    console.log('authenticating with imap');
    await client.connect();
    const key = 'body[header.fields (from to subject list-unsubscribe)]';
    const query = [
      'uid',
      'BODY.PEEK[HEADER.FIELDS (From To Subject List-Unsubscribe)]'
    ];
    const resultUUIDs = await client.search('INBOX', {
      since: from
    });
    let results = await client.listMessages(
      'INBOX',
      `${resultUUIDs[0]}:${resultUUIDs[resultUUIDs.length - 1]}`,
      query,
      {
        byUid: true,
        valueAsString: true
      }
    );
    results = results.map(r => {
      const headers = r[key].split('\r\n').filter(s => s);
      return {
        payload: { headers, snippet: '' },
        id: r.uid,
        labelIds: [],
        internalDate: Date.now()
      };
    });
    yield results;
  } catch (err) {
    console.error(err);
  }
}
