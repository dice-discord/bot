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
const simpleFormat = require("../../src/util/simpleFormat");

tap.equal(simpleFormat(5), 5, "doesn't do anything when number is short enough");

tap.equal(simpleFormat(7.6423), 7.64, "rounds to 2 digits");
tap.equal(simpleFormat(-53.2492), -53.25, "rounds to 2 digits");
