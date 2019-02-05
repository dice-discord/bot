const tap = require("tap");
const truncateText = require("../../src/util/truncateText");

tap.equal(truncateText("short string", 20), "short string", "doesn't truncate already short text");
