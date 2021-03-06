'use strict';

function cleanCal (cal) {
  var clean = {
    scale: parseFloat(cal.scale) || 0
    , intercept: parseFloat(cal.intercept) || 0
    , slope: parseFloat(cal.slope) || 0
  };

  clean.valid = ! (clean.slope === 0 || clean.unfiltered === 0 || clean.scale === 0);

  return clean;
}

module.exports = function withRawGlucose (entry, cals, maxRaw) {
  maxRaw = maxRaw || 150;

  var egv = entry.glucose || entry.sgv || 0;

  entry.unfiltered = parseInt(entry.unfiltered) || 0;
  entry.filtered = parseInt(entry.filtered) || 0;

  //TODO: add time check, but how recent should it be?
  //TODO: currently assuming the first is the best (and that there is probably just 1 cal)
  var cal = cals && cals.length > 0 && cleanCal(cals[0]);

  if (cal && cal.valid) {
    if (cal.filtered === 0 || egv < 40) {
      entry.raw = Math.round(cal.scale * (entry.unfiltered - cal.intercept) / cal.slope);
    } else {
      var ratio = cal.scale * (entry.filtered - cal.intercept) / cal.slope / egv;
      entry.raw = Math.round(cal.scale * (entry.unfiltered - cal.intercept) / cal.slope / ratio);
    }

    if (entry.raw && egv < 40 && entry.raw < maxRaw) {
      entry.glucose = entry.raw;
      entry.fromRaw = true;
    }
  }

  return entry;
};