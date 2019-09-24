var fs = require('fs'),
  url = require('url'),
  querystring = require('querystring'),
  yaml = require('js-yaml'),
  path = require('path');
var dataFile = fs.readFileSync(path.join(__dirname, 'data', 'referers.yml'));
var REFERERS = loadReferers(yaml.load(dataFile.toString()));

function loadReferers(source) {
  var referers_dict = {};

  for (var medium in source) {
    var conf_list = source[medium];

    for (var referer_name in conf_list) {
      var config = conf_list[referer_name];
      var params = null;

      if (config.parameters) {
        params = config.parameters.map(function(p) {
          return p.toLowerCase();
        });
      }
      config.domains.forEach(function(domain) {
        referers_dict[domain] = {
          name: referer_name,
          medium: medium
        };
        if (params) {
          referers_dict[domain]['params'] = params;
        }
      });
    }
  }
  return referers_dict;
}

function getReferrer(referer_url, current_url) {
  let known = false;
  let referer = null;
  let medium = 'unknown';
  let search_parameter = null;
  let search_term = null;

  var ref_uri = url.parse(referer_url);
  var ref_host = ref_uri.hostname;
  known = Boolean(~['http:', 'https:'].indexOf(ref_uri.protocol));

  if (!known)
    return {
      known: known,
      referer: referer,
      medium: medium,
      search_parameter: search_parameter,
      search_term: search_term
    };

  if (current_url) {
    var curr_uri = url.parse(current_url);
    var curr_host = curr_uri.hostname;

    if (curr_host == ref_host) {
      medium = 'internal';
      return {
        known: known,
        referer: referer,
        medium: medium,
        search_parameter: search_parameter,
        search_term: search_term,
        uri: referer_url
      };
    }
  }

  referer = _lookup_referer(ref_host, ref_uri.pathname, true);
  if (!referer) {
    referer = _lookup_referer(ref_host, ref_uri.pathname, false);
    if (!referer) {
      medium = 'unknown';
      return {
        known: known,
        referer: referer,
        medium: medium,
        search_parameter: search_parameter,
        search_term: search_term,
        uri: referer_url
      };
    }
  }

  referer = referer['name'];
  medium = referer['medium'];

  if (referer['medium'] == 'search') {
    if (!referer['params'])
      return {
        known: known,
        referer: referer,
        medium: medium,
        search_parameter: search_parameter,
        search_term: search_term,
        uri: referer_url
      };

    var pqs = querystring.parse(ref_uri.query);

    for (var param in pqs) {
      var val = pqs[param];

      if (referer['params'].indexOf(param.toLowerCase()) !== -1) {
        search_parameter = param;
        search_term = val;
      }
    }
  }
  return {
    known: known,
    referer: referer,
    medium: medium,
    search_parameter: search_parameter,
    search_term: search_term,
    uri: referer_url
  };
}

function _lookup_referer(ref_host, ref_path, include_path) {
  // console.log(ref_host, ref_path, include_path)
  var referer = null;

  if (include_path) referer = REFERERS[ref_host + ref_path];
  else referer = REFERERS[ref_host];
  if (!referer) {
    if (include_path) {
      var path_parts = ref_path.split('/');
      if (path_parts.length > 1) {
        try {
          referer = REFERERS[ref_host + '/' + path_parts[1]];
        } catch (e) {}
      }
    }
  }

  if (!referer) {
    try {
      var idx = ref_host.indexOf('.');
      if (idx === -1) return null;

      var slicedHost = ref_host.slice(idx + 1);
      return _lookup_referer(slicedHost, ref_path, include_path);
    } catch (e) {
      console.error(e);
      return null;
    }
  } else return referer;
}

module.exports = getReferrer;

// var r = new Referer("http://www.google.com/search?q=gateway+oracle+cards+denise+linn&hl=en&client=safari")
// console.log(r.uri)
