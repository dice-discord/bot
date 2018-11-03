/* global test expect */
const stripWebhookURL = require('../../src/util/stripWebhookURL');

test('extracts id and token from webhook URL', () => {
  // eslint-disable-next-line max-len
  const stripped = stripWebhookURL('https://discordapp.com/api/webhooks/508381714758893593/T4hknGBDwM_tmPu0C2Iggr1r02CC7QSoYhEGH4cU7qN2yflmzAZ8i8klLIJiIET-h1u0');

  expect(stripped).toEqual({
    id: '508381714758893593',
    token: 'T4hknGBDwM_tmPu0C2Iggr1r02CC7QSoYhEGH4cU7qN2yflmzAZ8i8klLIJiIET-h1u0'
  });
});
