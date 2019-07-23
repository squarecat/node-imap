// this file will be run in the context of the
// browser

export default () => {
  function patchTimeouts(window) {
    const active = {};
    var _setTimeout = window.setTimeout;
    var _clearTimeout = window.clearTimeout;

    window.setTimeout = function(fn, delay) {
      const id = _setTimeout(function() {
        var deleteT = function() {
          delete active[id];
        };
        // setTimeout can eval on strings
        // so we have to write it like this
        if (typeof fn === 'string') {
          _setTimeout(fn, 0);
        } else if (fn.then) {
          fn.then(deleteT, deleteT);
        } else {
          fn();
        }
        deleteT();
      }, delay);

      active[id] = {
        active: true,
        functionString: fn.toString()
      };
      return id;
    };

    window.clearTimeout = function(id) {
      delete active[id];
      _clearTimeout(id);
    };

    window.activeTimers = function() {
      return Object.keys(active).map(k => active[k]);
    };
  }

  if (typeof window !== 'undefined') {
    patchTimeouts(window);
  }
};
