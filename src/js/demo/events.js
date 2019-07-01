function EventBus() {
    this.handlers = {};
}

EventBus.prototype.on = function(name, callback) {
    if (!this.handlers[name]) {
        this.handlers[name] = [];
    }

    this.handlers[name].push(callback);
};

EventBus.prototype.trigger = function(name) {
    if (this.handlers[name]) {
        var args = Array.prototype.slice.call(arguments, 1);

        this.handlers[name].forEach(function(callback) {
            callback.apply(this, args);
        }, this);
    }
};

export default new EventBus();
