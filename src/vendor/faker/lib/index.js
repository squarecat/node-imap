/*

   this index.js file is used for including the faker library as a CommonJS module, instead of a bundle

   you can include the faker library into your existing node.js application by requiring the entire /faker directory

    var faker = require(./faker);
    var randomName = faker.name.findName();

   you can also simply include the "faker.js" file which is the auto-generated bundled version of the faker library

    var faker = require(./customAppPath/faker);
    var randomName = faker.name.findName();


  if you plan on modifying the faker library you should be performing your changes in the /lib/ directory

*/

/**
 *
 * @namespace faker
 */
function Faker(opts) {
  var self = this;

  opts = opts || {};

  // assign options
  var locales = self.locales || opts.locales || {};
  var locale = self.locale || opts.locale || 'en';
  var localeFallback = self.localeFallback || opts.localeFallback || 'en';

  self.locales = locales;
  self.locale = locale;
  self.localeFallback = localeFallback;

  self.definitions = {};

  var Fake = require('./fake');
  self.fake = new Fake(self).fake;

  var Name = require('./name');
  self.name = new Name(self);

  var Company = require('./company');
  self.company = new Company(self);

  var Internet = require('./internet');
  self.internet = new Internet(self);

  var _definitions = {
    name: [
      'first_name',
      'last_name',
      'prefix',
      'suffix',
      'gender',
      'title',
      'male_prefix',
      'female_prefix',
      'male_first_name',
      'female_first_name',
      'male_middle_name',
      'female_middle_name',
      'male_last_name',
      'female_last_name'
    ],
    address: [
      'city_prefix',
      'city_suffix',
      'street_suffix',
      'county',
      'country',
      'country_code',
      'state',
      'state_abbr',
      'street_prefix',
      'postcode',
      'postcode_by_state',
      'direction',
      'direction_abbr'
    ],
    company: [
      'adjective',
      'noun',
      'descriptor',
      'bs_adjective',
      'bs_noun',
      'bs_verb',
      'suffix'
    ],
    lorem: ['words'],
    hacker: ['abbreviation', 'adjective', 'noun', 'verb', 'ingverb', 'phrase'],
    phone_number: ['formats'],
    finance: [
      'account_type',
      'transaction_type',
      'currency',
      'iban',
      'credit_card'
    ],
    internet: ['domain_suffix', 'free_email', 'example_email', 'password'],
    commerce: ['color', 'department', 'product_name', 'price', 'categories'],
    database: ['collation', 'column', 'engine', 'type'],
    system: ['mimeTypes', 'directoryPaths'],
    date: ['month', 'weekday'],
    vehicle: [
      'vehicle',
      'manufacturer',
      'model',
      'type',
      'fuel',
      'vin',
      'color'
    ],
    title: '',
    separator: ''
  };

  // Create a Getter for all definitions.foo.bar properties
  Object.keys(_definitions).forEach(function(d) {
    if (typeof self.definitions[d] === 'undefined') {
      self.definitions[d] = {};
    }

    if (typeof _definitions[d] === 'string') {
      self.definitions[d] = _definitions[d];
      return;
    }

    _definitions[d].forEach(function(p) {
      Object.defineProperty(self.definitions[d], p, {
        get: function() {
          if (
            typeof self.locales[self.locale][d] === 'undefined' ||
            typeof self.locales[self.locale][d][p] === 'undefined'
          ) {
            // certain localization sets contain less data then others.
            // in the case of a missing definition, use the default localeFallback to substitute the missing set data
            // throw new Error('unknown property ' + d + p)
            return self.locales[localeFallback][d][p];
          } else {
            // return localized data
            return self.locales[self.locale][d][p];
          }
        }
      });
    });
  });
}

Faker.prototype.setLocale = function(locale) {
  this.locale = locale;
};

Faker.prototype.seed = function(value) {
  var Random = require('./random');
  this.seedValue = value;
  this.random = new Random(this, this.seedValue);
};
module['exports'] = Faker;
