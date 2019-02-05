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

const { ArgumentType } = require("discord.js-commando");

class RomanNumeralsType extends ArgumentType {
  constructor(client) {
    super(client, "romannumerals");
  }

  _parse(value) {
    return value.toUpperCase();
  }

  validate(value) {
    value = this._parse(value);

    return /^M{0,4}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$/.test(value);
  }

  parse(value) {
    return this._parse(value);
  }
}

module.exports = RomanNumeralsType;
