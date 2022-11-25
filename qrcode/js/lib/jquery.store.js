;(function ($) {
  const KEYS = {
    IP: 'ip',
    CONFIG: 'config',
  }
  const VALID_KEYS = Object.values(KEYS);

  const defaultConfigs = {
    match: ['localhost', '0.0.0.0', '127.0.0.1'],   // match replace list
    switch: '1',                    // auto convert matched ip
    autoIp: '1',                    // auto get ip
    target: '',
    color: '#000000',
    bgColor: '#ffffff',
    imageSize: 300
  };

  async function set(key, value) {
    if (!VALID_KEYS.includes(key)) {
      throw new Error(`Invalid key: ${key}`);
    }
    await chrome.storage.local.set({ [key]: value });
  }

  async function get(key) {
    if (!VALID_KEYS.includes(key)) {
      throw new Error(`Invalid key: ${key}`);
    }
    let result = await chrome.storage.local.get(key);
    result = result && result[key];
    if (key === KEYS.CONFIG) {
      const configs = JSON.parse(JSON.stringify(defaultConfigs));
      result = $.extend({}, configs, result);
    }
    return result;
  }

  async function del(key) {
    if (!VALID_KEYS.includes(key)) {
      throw new Error(`Invalid key: ${key}`);
    }
    await chrome.storage.local.remove(key);
  }

  $.extend({ store: { get, set, del, KEYS } });
}(window.jQuery));
