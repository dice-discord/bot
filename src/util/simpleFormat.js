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

/**
 * @name simpleFormat
 * @param {number|string} value Value to format
 * @returns {number} A number in fixed-point notation up to 2 decimal points
 */
module.exports = value => {
  const result = parseFloat(parseFloat(value).toFixed(2));
  return result;
};
