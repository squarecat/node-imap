## How to do an unsubscribe

1. Load URL
2. Wait for network requests to finish
   - Take screen shot
   - If 20 seconds elapses then GOTO 4
3. If the page has meta redirect header then set URL and GOTO 1.
4. If the page has a JavaScript timeout that will set the href then wait
   - If 5 seconds elapses then GOTO 5
5. Check the page content
   - Take screen shot
   - If contains success text then SUCCESS
   - If not then GOTO 6
6. Check page content for action
   - Take screen shot
   - If has no action then FAIL
   - If has action then GOTO 7
7. Perform action and GOTO 2
