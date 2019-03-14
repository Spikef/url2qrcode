$(function () {
    var defaultConfigs = {
        match: ['localhost', '0.0.0.0', '127.0.0.1'],   // match replace list
        switch: '1',                    // auto convert matched ip
        autoip: '1',                    // auto get ip
        target: '',
        color: '#000000',
        bgColor: '#ffffff',
        imageSize: 300
    };

    // events
    $('#transparent').on('click', function () {
        $('#backColor').val('transparent');
    });

    $('#switch').on('change', function () {
        var checked = $(this).is(':checked');
        toggleSwitch(checked);
    });

    $('#reset').on('click', function () {
        readConfigs(defaultConfigs);
    });

    $('#save').on('click', function () {
        saveConfigs();
    });

    $('#back').on('click', function () {
        window.history.back();
    });

    // init
    var search = window.location.search;
    if (~search.indexOf('from=qrcode')) {
        $('#back').show();
    }

    try {
        chrome.storage.local.get(['configs', 'ip'], function(result) {
            var configs = $.extend({}, defaultConfigs, result.configs);

            if (!configs.target) {
                window.getLocalIP(function (ip) {
                    configs.target = ip;

                    readConfigs(configs)
                });
            } else {
                readConfigs(configs);
            }
        });
    } catch (e) {
        readConfigs(defaultConfigs);
    }

    function readConfigs(configs) {
        $('#color').val(configs.color);
        $('#backColor').val(configs.bgColor);
        $('#switch').attr('checked', configs.switch == '1').trigger('change');
        $('[name=autoip][value=' + configs.autoip + ']').attr('checked', true);
        $('#target').val(configs.target);
        $('#match').val(configs.match.join('\n'));

        var $foreBtn = $('.select-color.fore');
        var $backBtn = $('.select-color.back');

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
                var color = '#' + hex;
                var parent = $(el).parent();
                parent.find('input').val('#' + hex);
                parent.find('i').css('background-color', color);
                $(el).ColorPickerHide();
            }
        });
    }

    function saveConfigs() {
        var configs = {
            color: $('#color').val(),
            bgColor: $('#backColor').val(),
            switch: $('#switch').is(':checked') ? '1' : '0',
            autoip: $('[name=autoip]:checked').val(),
            target: $('#target').val(),
            match: $('#match').val().split(/\r?\n/)
        };

        try {
            chrome.storage.local.set({configs: configs}, function () {
                showSuccess();
            });
        } catch (e) {
            console.log(configs);
            showSuccess();
        }
    }

    function toggleSwitch(checked) {
        if (checked) {
            $('#switch-options').slideDown();
        } else {
            $('#switch-options').slideUp();
        }
    }

    function showSuccess() {
        $('.save-success').fadeIn();
        setTimeout(function () {
            $('.save-success').fadeOut();
        }, 2000);
    }
});