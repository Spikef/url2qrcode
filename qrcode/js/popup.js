$(function () {
    const $pad = $('.qrcode');
    const $url = $('.url');

    (async function bind() {
        const configs = await $.store.get($.store.KEYS.CONFIG);
        $('.button[data-action=generate]').on('click', function () {
            const url = $url.val();
            if (url) {
                createQR($pad, url, configs);
            }
        });
    })();

    (async function init() {
        const ip = await $.store.get($.store.KEYS.IP);
        const configs = await $.store.get($.store.KEYS.CONFIG);

        let url;
        try {
            const [ tab ] = await chrome.tabs.query({ active: true, currentWindow: true });
            url = tab.url;
        } catch (e) {
            url = window.location.href;
        }

        if (configs.switch === '1') {
            if (configs.autoIp === '1') {
                const now = new Date().getTime();
                if (!ip || !ip.value || ip.expire < now) {
                    const localIp = await $.getLocalIP();
                    url = replaceUrl(url, configs.match, localIp);

                    // cache ip for ten minutes
                    await $.store.set($.store.KEYS.IP, { value: localIp, expire: now + 600000 });
                } else {
                    url = replaceUrl(url, configs.match, ip.value);
                }
            } else if (configs.target) {
                url = replaceUrl(url, configs.match, configs.target);
            }
        }

        createQR($pad, url, configs);
    })();

    function replaceUrl(url, match, ip) {
        match.forEach(function (item) {
            url = url.replace(item, ip);
        });

        $url.val(url);

        return url;
    }

    function createQR($el, url, configs) {
        const options = {
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
        const _options = $.extend({}, options, {
            quiet: '2',
            render: 'canvas'
        });

        const $el = $('.qrcode-image');
        $el.html('').qrcode(_options);

        const link = $('.button[data-action=save]')[0];
        link.download = 'qrcode_image.png';     // set a filename or a default
        link.href = $('.qrcode-image > canvas')[0].toDataURL();
    }
});
