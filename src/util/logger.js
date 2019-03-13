/*
Copyright 2018 Jonah Snider

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

const { Signale } = require("signale");
const { sensitiveTerms } = require("./sensitivePattern");

// This is the base logger that all other logger instances are built on
const options = {
  stream: process.stdout,
  scope: "logger",
  logLevel: "info",
  types: {
    command: {
      badge: ">",
      color: "gray",
      label: "command",
      level: "info"
    },
    critical: {
      badge: "!!",
      color: "red",
      label: "critical",
      level: "info"
    }
  }
};

const logger = new Signale(options);
logger.addSecrets(sensitiveTerms);

logger.start("Custom Signale logger started");

module.exports = logger;
