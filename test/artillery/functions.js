const Faker = require('faker');

var exports = module.exports = {};

exports.getVars = function(userContext, events, done) {
  // generate data with Faker:
  const username = Faker.name.firstName() + " " + Faker.name.lastName();
  const room = 'sola';
  const svgViewHeight = getRandomArbitrary(75, 500);
  const svgViewWidth = getRandomArbitrary(75, 500);
  const svgCR = Math.min(svgViewWidth, svgViewHeight) / 2;
  const svgCX = svgViewWidth / 2;
  const svgCY = svgViewHeight / 2;
  const svgData = '<svg width = "' + svgViewWidth + '" height = "' + svgViewHeight + '" viewBox="0 0 ' + svgViewWidth + ' ' + svgViewHeight + '" xmlns="http://www.w3.org/2000/svg"><circle cx="' + svgCX + ' " cy="' + svgCY + ' " r="' + svgCR +'"/> </svg>';
  const svgData2 = '<svg width = "' + svgViewWidth + '" height = "' + svgViewHeight + '" viewBox="0 0 ' + svgViewWidth + ' ' + svgViewHeight + '" xmlns="http://www.w3.org/2000/svg"><circle cx="' + svgCX + ' " cy="' + svgCY + ' " r="' + svgCR +'" style="fill:white"/> </svg>';
  // add variables to virtual user's context:
  userContext.vars.username = username;
  userContext.vars.room = room;
  userContext.vars.svgData = svgData;
  userContext.vars.svgData2 = svgData2;
  // continue with executing the scenario:
  return done();
};

function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}