function EventBus() {
    this.handlers = {};
}

EventBus.prototype.on = function(name, callback) {
    if (!this.handlers[name]) {
        this.handlers[name] = [];
    }

    this.handlers[name].push(callback);
};

EventBus.prototype.trigger = function(name, ...args) {
    if (this.handlers[name]) {
        this.handlers[name].forEach(function(callback) {
            callback.apply(this, args);
        }, this);
    }
};

export default new EventBus();
