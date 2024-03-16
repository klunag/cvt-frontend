/**
 * @author zhixin wen <wenzhixin2010@gmail.com>
 */

$.extend($.fn.bootstrapTable.defaults, {
    fixedColumns: false,
    fixedNumber: 1
});

$.BootstrapTable =
    /*#__PURE__*/
    function (_$$BootstrapTable) {
        _inherits(_class, _$$BootstrapTable);

        function _class() {
            _classCallCheck(this, _class);

            return _possibleConstructorReturn(this, _getPrototypeOf(_class).apply(this, arguments));
        }

        _createClass(_class, [{
            key: "fitHeader",
            value: function fitHeader() {
                var _get2;

                for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
                    args[_key] = arguments[_key];
                }

                (_get2 = _get(_getPrototypeOf(_class.prototype), "fitHeader", this)).call.apply(_get2, [this].concat(args));

                if (!this.options.fixedColumns) {
                    return;
                }

                if (this.$el.is(':hidden')) {
                    return;
                }

                this.$container.find('.fixed-table-header-columns').remove();
                this.$fixedHeader = $('<div class="fixed-table-header-columns"></div>');
                this.$fixedHeader.append(this.$tableHeader.find('>table').clone(true));
                this.$tableHeader.after(this.$fixedHeader);
                var width = this.getFixedColumnsWidth();
                this.$fixedHeader.css({
                    top: 0,
                    width: width,
                    height: this.$tableHeader.outerHeight(true)
                });
                this.initFixedColumnsBody();
                this.$fixedBody.css({
                    top: this.$tableHeader.outerHeight(true),
                    width: width,
                    height: this.$tableBody.outerHeight(true) - 1
                });
                this.initFixedColumnsEvents();
            }
        }, {
            key: "initBody",
            value: function initBody() {
                var _get3;

                for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                    args[_key2] = arguments[_key2];
                }

                (_get3 = _get(_getPrototypeOf(_class.prototype), "initBody", this)).call.apply(_get3, [this].concat(args));

                if (!this.options.fixedColumns) {
                    return;
                }

                if (this.options.showHeader && this.options.height) {
                    return;
                }

                this.initFixedColumnsBody();
                this.$fixedBody.css({
                    top: 0,
                    width: this.getFixedColumnsWidth(),
                    height: this.$tableHeader.outerHeight(true) + this.$tableBody.outerHeight(true)
                });
                this.initFixedColumnsEvents();
            }
        }, {
            key: "initFixedColumnsBody",
            value: function initFixedColumnsBody() {
                this.$container.find('.fixed-table-body-columns').remove();
                this.$fixedBody = $('<div class="fixed-table-body-columns"></div>');
                this.$fixedBody.append(this.$tableBody.find('>table').clone(true));
                this.$tableBody.after(this.$fixedBody);
            }
        }, {
            key: "getFixedColumnsWidth",
            value: function getFixedColumnsWidth() {
                var visibleFields = this.getVisibleFields();
                var width = 0;

                for (var i = 0; i < this.options.fixedNumber; i++) {
                    width += this.$header.find("th[data-field=\"".concat(visibleFields[i], "\"]")).outerWidth(true);
                }

                return width + 1;
            }
        }, {
            key: "initFixedColumnsEvents",
            value: function initFixedColumnsEvents() {
                var _this = this;

                // events
                this.$tableBody.off('scroll.fixed-columns').on('scroll.fixed-columns', function (e) {
                    _this.$fixedBody.find('table').css('top', -$(e.currentTarget).scrollTop());
                });
                this.$body.find('> tr[data-index]').off('hover').hover(function (e) {
                    var index = $(e.currentTarget).data('index');

                    _this.$fixedBody.find("tr[data-index=\"".concat(index, "\"]")).css('background-color', $(e.currentTarget).css('background-color'));
                }, function (e) {
                    var index = $(e.currentTarget).data('index');

                    var $tr = _this.$fixedBody.find("tr[data-index=\"".concat(index, "\"]"));

                    $tr.attr('style', $tr.attr('style').replace(/background-color:.*;/, ''));
                });
                this.$fixedBody.find('tr[data-index]').off('hover').hover(function (e) {
                    var index = $(e.currentTarget).data('index');

                    _this.$body.find("tr[data-index=\"".concat(index, "\"]")).css('background-color', $(e.currentTarget).css('background-color'));
                }, function (e) {
                    var index = $(e.currentTarget).data('index');

                    var $tr = _this.$body.find("> tr[data-index=\"".concat(index, "\"]"));

                    $tr.attr('style', $tr.attr('style').replace(/background-color:.*;/, ''));
                });
            }
        }]);

        return _class;
    }($.BootstrapTable);