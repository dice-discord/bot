/*
Copyright 2019 Jonah Snider

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

const tap = require("tap");
const stripWebhookURL = require("../../src/util/stripWebhookURL");

const id = "508381714758893593";
const token = "T4hknGBDwM_tmPu0C2Iggr1r02CC7QSoYhEGH4cU7qN2yflmzAZ8i8klLIJiIET-h1u0";

const stripped = stripWebhookURL(`https://discordapp.com/api/webhooks/${id}/${token}`);
tap.same(stripped, { id, token }, "extracts id and token from webhook URL");
