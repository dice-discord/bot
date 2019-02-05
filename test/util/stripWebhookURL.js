const tap = require("tap");
const stripWebhookURL = require("../../src/util/stripWebhookURL");

const id = "508381714758893593";
const token = "T4hknGBDwM_tmPu0C2Iggr1r02CC7QSoYhEGH4cU7qN2yflmzAZ8i8klLIJiIET-h1u0";

const stripped = stripWebhookURL(`https://discordapp.com/api/webhooks/${id}/${token}`);
tap.same(stripped, { id, token }, "extracts id and token from webhook URL");
