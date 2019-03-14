$(function () {
    var $el = $('.qrcode');
    var $url = $('.url');
    var defaultConfigs = {
        match: ['localhost', '0.0.0.0', '127.0.0.1'],   // match replace list
        switch: '1',                    // auto convert matched ip
        autoip: '1',                    // auto get ip
        target: '',
        color: '#000000',
        bgColor: '#ffffff',
        imageSize: 300
    };

    try {
        chrome.storage.local.get(['configs', 'ip'], function(result) {
            var configs = $.extend({}, defaultConfigs, result.configs);

            chrome.tabs.getSelected(null, function(tab) {
                var url = tab.url;

                if (configs.switch == '1') {
                    if (configs.autoip == '1') {
                        var now = new Date().getTime();
                        if (!result.ip || !result.ip.value || result.ip.expire < now) {
                            window.getLocalIP(function (ip) {
                                configs.target = configs.target || ip;
                                result.ip = {
                                    value: ip,
                                    expire: now + 600000    // cache ip for ten minutes
                                };

                                chrome.storage.local.set({
                                    ip: result.ip,
                                    configs: result.configs
                                });

                                url = replaceUrl(url, configs.match, ip);
                                createQR($el, url, configs);
                            });
                        } else {
                            url = replaceUrl(url, configs.match, result.ip.value);
                            createQR($el, url, configs);
                        }
                    } else {
                        url = replaceUrl(url, configs.match, configs.target);
                        createQR($el, url, configs);
                    }
                } else {
                    createQR($el, url, configs);
                }
            });

            // events
            $('.button[data-action=generate]').on('click', function () {
                var url = $url.val();
                if (url) {
                    createQR($el, url, configs);
                }
            });
        });
    } catch (e) {
        var url = window.location.href;
        $url.val(url);
        createQR($el, url, defaultConfigs);

        // events
        $('.button[data-action=generate]').on('click', function () {
            var url = $url.val();
            if (url) {
                createQR($el, url, defaultConfigs);
            }
        });
    }

    function replaceUrl(url, match, ip) {
        match.forEach(function (item) {
            url = url.replace(item, ip);
        });

        $url.val(url);

        return url;
    }

    function createQR($el, url, configs) {
        var options = {
            text: url,
            fill: configs.color,
            size: configs.imageSize,
            background: configs.bgColor === 'transparent' ? null : configs.bgColor,
            quiet: configs.bgColor === '#ffffff' ? '0' : '1',
            render: 'div'
        };

        $el.html('').qrcode(options);

        createDownload(options);
    }

    function createDownload(options) {
        // shadow image for download!
        var _options = $.extend({}, options, {
            quiet: '2',
            render: 'canvas'
        });

        var $el = $('.qrcode-image');
        $el.html('').qrcode(_options);

        var link = $('.button[data-action=save]')[0];
        link.download = 'qrcode_image.png';     // set a filename or a default
        link.href = $('.qrcode-image > canvas')[0].toDataURL();
    }
});