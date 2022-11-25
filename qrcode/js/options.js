$(function () {
    (function bind() {
        $('#transparent').on('click', function () {
            $('#backColor').val('transparent');
        });

        $('#switch').on('change', function () {
            const checked = $(this).is(':checked');
            console.log('change', checked);
            toggleSwitch(checked);
        });

        $('#reset').on('click', async function () {
            await $.store.del($.store.KEYS.CONFIG);
            const configs = await $.store.get($.store.KEYS.CONFIG);
            console.log(configs);
            updateConfigs(configs);
        });

        $('#save').on('click', function () {
            submitConfigs();
        });

        $('#back').on('click', function () {
            window.history.back();
        });
    })();

    (async function init() {
        const search = window.location.search;
        if (~search.indexOf('from=qrcode')) {
            $('#back').show();
        }

        const configs = await $.store.get($.store.KEYS.CONFIG);
        updateConfigs(configs);
    })();

    function updateConfigs(configs) {
        $('#color').val(configs.color);
        $('#backColor').val(configs.bgColor);
        $('#switch').attr('checked', configs.switch === '1').trigger('change');
        $('[name=autoIp][value=' + configs.autoIp + ']').attr('checked', true);
        $('#target').val(configs.target);
        $('#match').val(configs.match.join('\n'));

        const $foreBtn = $('.select-color.fore');
        const $backBtn = $('.select-color.back');

        $foreBtn.find('i').css('background-color', configs.color);
        $backBtn.find('i').css('background-color', configs.bgColor);

        $foreBtn.ColorPicker({
            color: configs.color,
            onBeforeShow: function () {
                $(this).ColorPickerSetColor($('#color').val());
            },
            onSubmit: function(hsb, hex, rgb, el) {
                var color = '#' + hex;
                var parent = $(el).parent();
                parent.find('input').val('#' + hex);
                parent.find('i').css('background-color', color);
                $(el).ColorPickerHide();
            }
        });

        $backBtn.ColorPicker({
            color: configs.bgColor,
            onBeforeShow: function () {
                $(this).ColorPickerSetColor($('#backColor').val());
            },
            onSubmit: function(hsb, hex, rgb, el) {
                const color = '#' + hex;
                const parent = $(el).parent();
                parent.find('input').val('#' + hex);
                parent.find('i').css('background-color', color);
                $(el).ColorPickerHide();
            }
        });
    }

    function submitConfigs() {
        const configs = {
            color: $('#color').val(),
            bgColor: $('#backColor').val(),
            switch: $('#switch').is(':checked') ? '1' : '0',
            autoIp: $('[name=autoIp]:checked').val(),
            target: $('#target').val(),
            match: $('#match').val().split(/\r?\n/)
        };

        $.store.set($.store.KEYS.CONFIG, configs)
            .then(() => {
                showResult('保存成功!');
            })
            .catch((err) => {
                showResult('保存失败: ' + err.message);
            });
    }

    function toggleSwitch(checked) {
        if (checked) {
            $('#switch-options').slideDown();
        } else {
            $('#switch-options').slideUp();
        }
    }

    function showResult(message) {
        $('#save-result').text(message).fadeIn();
        setTimeout(function () {
            $('#save-result').fadeOut();
        }, 1000);
    }
});
