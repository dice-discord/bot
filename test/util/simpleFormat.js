const tap = require("tap");
const simpleFormat = require("../../src/util/simpleFormat");

tap.equal(
  simpleFormat(5),
  5,
  "doesn't do anything when number is short enough"
);

tap.equal(simpleFormat(7.6423), 7.64, "rounds to 2 digits");
tap.equal(simpleFormat(-53.2492), -53.25, "rounds to 2 digits");
