/**
 * Simple dropdown class
 */
window.Dropdown = (function (window) {
    /**
     * Simple debounce
     *
     * @private
     * @param {Function} fn
     * @param {Number} time
     * @returns {Function}
     */
    function debounce(fn, time) {
        var timeout;

        return function() {
            var ctx, args;

            ctx  = this;
            args = arguments;

            clearTimeout(timeout);

            timeout = setTimeout(function () {
                timeout = null;

                fn.apply(ctx, args);
            }, time);
        };
    }
    
    /**
     * @param {Object}      options
     * @param {HTMLElement} options.el       Dropdown element
     * @param {String}      options.openBy   Opening method
     * @param {Number}      options.wait     Wait before opening/closing menu
     * @param {Function}    options.onOpen   Open callback
     * @param {Function}    options.onClose  Close callback
     * @param {Function}    options.onSelect Select callback
     * @constructor
     */
    function Dropdown(options) {
        var element;

        element = options.el;

        this.el       = element;
        this.openBy   = options.openBy;
        this.trigger  = element.querySelector('div');
        this.menu     = element.querySelector('ul');
        this.onOpen   = options.onOpen || function () {};
        this.onClose  = options.onClose || function () {};
        this.onSelect = options.onSelect || function () {};

        if (options.wait) {
            this.timeout = options.wait;
        }

        this.initialize();
    }

    /**
     * Class name for toggling menu
     * @type {string}
     */
    Dropdown.prototype.openClass = 'expanded';

    /**
     * Flag for opened menu
     *
     * @type {boolean}
     */
    Dropdown.prototype.isOpened = false;

    /**
     * Flag for browsing menu items
     *
     * @type {boolean}
     */
    Dropdown.prototype.isBrowsing = false;

    /**
     * Menu open/close timeout
     *
     * @type {Number}
     */
    Dropdown.prototype.timeout = 400;

    /**
     * Toggle {@link isBrowsing} flag on
     */
    Dropdown.prototype.onBrowse = function () {
        this.isBrowsing = true;
    };

    /**
     * Toggle {@link isBrowsing} flag off
     */
    Dropdown.prototype.onEndBrowse = function () {
        this.isBrowsing = false;
    };

    /**
     * Open dropdown
     */
    Dropdown.prototype._open = function() {
        if (this.isOpened) {
            return;
        }

        this.el.classList.add(this.openClass);

        this.isOpened = true;

        this.onOpen(this);
    };

    /**
     * Close dropdown
     */
    Dropdown.prototype._close = function() {
        if ((this.isBrowsing && this.isOpened) || !this.isOpened) {
            return;
        }

        this.el.classList.remove(this.openClass);
        this.isOpened = false;

        this.onClose(this);
    };

    /**
     * Do something with selected element
     *
     * @param {HTMLElement} element
     */
    Dropdown.prototype.select = function(element) {
        var isDisabled;

        isDisabled = element.getAttribute('disabled');

        if (isDisabled) {
            return;
        }

        this.onSelect(this, element);
    };

    /**
     * Toggle dropdown
     */
    Dropdown.prototype.toggle = function() {
        if (this.isOpened) {
            this._close();
        } else {
            this._open();
        }
    };

    /**
     * Initialize class
     */
    Dropdown.prototype.initialize = function() {
        this.isOpened = this.el.classList.contains(this.openClass);

        this.setDebouncedMethods();
        this.registerEventsHandlers();
    };

    Dropdown.prototype.setDebouncedMethods = function() {
        var timeout;

        timeout = this.timeout;

        this.open  = debounce(this._open.bind(this), timeout);
        this.close = debounce(this._close.bind(this), timeout);
    };

    /**
     * Events registering
     */
    Dropdown.prototype.registerEventsHandlers = function() {
        this.registerToggleHandlers();
    };

    /**
     * Registering open/close handlers
     */
    Dropdown.prototype.registerToggleHandlers = function() {
        var openMethod, trigger, menu, timeout;

        openMethod = this.openBy;
        menu       = this.menu;

        switch (openMethod) {
            case 'hover':
                trigger = this.trigger;
                timeout = this.timeout;

                trigger.addEventListener('mouseover', this);
                trigger.addEventListener('mouseout',  this);

                menu.addEventListener('mouseover', this);
                menu.addEventListener('mouseout', this);
                break;

            default:
                this.trigger.addEventListener('click', this);
        }

        menu.addEventListener('click', this);
        window.addEventListener('click', this);
    };

    /**
     * Events handler
     *
     * @param {Event} event
     */
    Dropdown.prototype.handleEvent = function(event) {
        var eventType, eventElement, timeout, isTrigger, isMenu;

        eventType    = event.type;
        eventElement = event.target;
        timeout   = this.timeout;

        isTrigger = (eventElement === this.trigger);
        isMenu = (this.menu.contains(eventElement) || eventElement === this.menu);

        switch (eventType) {
            case 'mouseover':
                if (isTrigger) {
                    debounce(this.open.bind(this), timeout)();
                }

                if (isMenu) {
                    this.onBrowse();
                }

                break;

            case 'mouseout':
                if (isTrigger) {
                    this.close();
                }

                if (isMenu) {
                    this.onEndBrowse();
                    this.close();
                }

                break;

            case 'click':
                if (isTrigger) {
                    event.stopPropagation();
                    this.toggle();
                } else if (isMenu) {
                    event.stopPropagation();
                    this.select(eventElement);
                } else if (!isMenu) {
                    this._close();
                }
        }
    };

    /**
     * Clears class handlers and etc.
     */
    Dropdown.prototype.destroy = function() {
        var openMethod, trigger, menu;

        openMethod = this.openBy;

        trigger = this.trigger;
        menu    = this.menu;

        switch (openMethod) {
            case 'hover':
                trigger.removeEventListener('mouseover', this);
                trigger.removeEventListener('mouseout', this);

                menu.removeEventListener('mouseover', this);
                menu.removeEventListener('mouseout', this);
                break;

            default:
                trigger.removeEventListener('click', this);
        }

        window.removeEventListener('click', this);
        menu.removeEventListener('click', this);
    };
    
    return Dropdown;
}(
    window
));
