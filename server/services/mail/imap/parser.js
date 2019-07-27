/* eslint-disable no-empty */
let user;

// Instead of:
if (user && user.account && user.account.email) {
}

// You'll be able to write:
if (user?.account?.email) {
}
