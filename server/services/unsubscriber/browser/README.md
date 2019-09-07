## How to do an unsubscribe

1. Load URL
2. Wait for network requests to finish
   - Take screen shot
   - If 20 seconds elapses then GOTO 4
3. If the page has meta redirect header then set URL and GOTO 1.
4. If the page has a JavaScript timeout that will set the href then wait
   - If 5 seconds elapses then GOTO 5
5. Check if the page needs a bespoke action
   - If YES do the bespoke action then <RETURN output of bespoke action function>
   - If NO then GOTO 6
6. Check the page content
   - Take screen shot
   - If contains success text then SUCCESS
   - If not then GOTO 7
7. Check page content for action
   - Take screen shot
   - If has no action then FAIL
   - If has action then GOTO 8
8. Perform action and GOTO 2

## Writing a bespoke unsubscribe action

Some providers have stupid bespoke actions that we need to account for, so we have some bespoke actions for specific domains.

To create a new bespoke action;

1. Add the domain to `keywords.json` in the `bespokeDomains` array.
2. Add a new `if` statement to the `doBespokeUnsubscribe` function in `actions.js`.
3. Add a new `function` to `actions.js` that performs your bespoke unsubscribe, use the format `unsubscribeFrom<Domain>(Page) => Boolean`.
4. When your function is called the page should be loaded and stable and waiting, so you don't need to wait for any load events, just do your bespoke actions.