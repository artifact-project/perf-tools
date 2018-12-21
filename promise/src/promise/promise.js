"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var STATE_PENDING = 1;
var STATE_RESOLVED = 2;
var STATE_REJECTED = 3;
var FINALLY_SUPPROTED = typeof Promise.prototype['finally'] === 'function';
function LazyPromiseConstructor(executor) {
    var _this = this;
    this._state = STATE_PENDING;
    this._result = null;
    this._promise = null;
    this._nativeResolve = null;
    this._nativeReject = null;
    executor(
    // Resolve
    function (value) {
        if (_this._state === STATE_PENDING) {
            _this._state = STATE_RESOLVED;
            _this._result = value;
            if (_this._promise !== null) {
                _this._nativeResolve(value);
            }
        }
    }, 
    // Reject
    function (reason) {
        if (_this._state === STATE_PENDING) {
            _this._state = STATE_REJECTED;
            _this._result = reason;
            if (_this._promise !== null) {
                _this._nativeReject(reason);
            }
        }
    });
}
;
LazyPromiseConstructor.prototype = Object.create(Promise.prototype);
LazyPromiseConstructor.prototype.constructor = LazyPromiseConstructor;
LazyPromiseConstructor.prototype['_getPromise'] = function () {
    var _this = this;
    if (this._promise === null) {
        this._promise = new Promise(function (resolve, reject) {
            if (_this._state !== STATE_PENDING) {
                (_this._state === STATE_RESOLVED ? resolve : reject)(_this._result);
            }
            else {
                _this._nativeResolve = resolve;
                _this._nativeReject = reject;
            }
        });
    }
    return this._promise;
};
LazyPromiseConstructor.prototype.then = function (onfulfilled, onrejected) {
    return this._getPromise().then(onfulfilled, onrejected);
};
LazyPromiseConstructor.prototype.catch = function (onfulfilled) {
    return this._getPromise().catch(onfulfilled);
};
LazyPromiseConstructor.prototype.finally = function (onfinally) {
    var promise = this._getPromise();
    if (FINALLY_SUPPROTED) {
        return promise.finally(onfinally);
    }
    else {
        var fn = function () {
            onfinally();
        };
        return promise.then(fn, fn);
    }
};
LazyPromiseConstructor['all'] = function (values) {
    return Promise.all(values);
};
LazyPromiseConstructor['race'] = function (values) {
    return Promise.race(values);
};
LazyPromiseConstructor['resolve'] = function (value) {
    return new LazyPromiseConstructor(function (resolve) {
        resolve(value);
    });
};
LazyPromiseConstructor['reject'] = function (value) {
    return new LazyPromiseConstructor(function (_, reject) {
        reject(value);
    });
};
exports.LazyPromise = LazyPromiseConstructor;
