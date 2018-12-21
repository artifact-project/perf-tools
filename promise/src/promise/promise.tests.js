"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var promise_1 = require("./promise");
var performance_1 = require("@perf-tools/performance");
it('instanceOf Promise', function () {
    expect(new promise_1.LazyPromise(noop)).toBeInstanceOf(Promise);
});
it('instanceOf LazyPromise', function () {
    expect(new promise_1.LazyPromise(noop)).toBeInstanceOf(promise_1.LazyPromise);
});
it('catch', function () { return __awaiter(_this, void 0, void 0, function () {
    var val;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, new promise_1.LazyPromise(function (_, reject) {
                    reject('REJECTED');
                }).catch(function (val) { return val + " and RESOLVED"; })];
            case 1:
                val = _a.sent();
                expect(val).toBe('REJECTED and RESOLVED');
                return [2 /*return*/];
        }
    });
}); });
it('finally', function () { return __awaiter(_this, void 0, void 0, function () {
    var val;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                val = '';
                return [4 /*yield*/, new promise_1.LazyPromise(function (resolve) {
                        resolve('OK');
                    }).finally(function () {
                        val = "finally";
                    })];
            case 1:
                _a.sent();
                expect(val).toEqual('finally');
                return [2 /*return*/];
        }
    });
}); });
describe('sync', function () {
    it('resolve', function () { return __awaiter(_this, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = expect;
                    return [4 /*yield*/, new promise_1.LazyPromise(function (resolve) {
                            resolve('OK');
                        })];
                case 1:
                    _a.apply(void 0, [_b.sent()]).toBe('OK');
                    return [2 /*return*/];
            }
        });
    }); });
    it('reject', function () { return __awaiter(_this, void 0, void 0, function () {
        var _a, err_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    _a = expect;
                    return [4 /*yield*/, new promise_1.LazyPromise(function (_, reject) {
                            reject('REJECTED');
                        })];
                case 1:
                    _a.apply(void 0, [_b.sent()]).toBe('Failed!');
                    return [3 /*break*/, 3];
                case 2:
                    err_1 = _b.sent();
                    expect(err_1).toBe('REJECTED');
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); });
});
describe('async', function () {
    it('resolve', function () { return __awaiter(_this, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = expect;
                    return [4 /*yield*/, new promise_1.LazyPromise(function (resolve) {
                            setTimeout(function () {
                                resolve('AsyncOK');
                            }, 16);
                        })];
                case 1:
                    _a.apply(void 0, [_b.sent()]).toBe('AsyncOK');
                    return [2 /*return*/];
            }
        });
    }); });
    it('reject', function () { return __awaiter(_this, void 0, void 0, function () {
        var _a, err_2;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    _a = expect;
                    return [4 /*yield*/, new promise_1.LazyPromise(function (_, reject) {
                            setTimeout(function () {
                                reject('AsyncREJECTED');
                            }, 16);
                        })];
                case 1:
                    _a.apply(void 0, [_b.sent()]).toBe('Failed!');
                    return [3 /*break*/, 3];
                case 2:
                    err_2 = _b.sent();
                    expect(err_2).toBe('AsyncREJECTED');
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); });
});
describe('benchmark', function () {
    var MAX = 1e5;
    var values = Array.from({ length: MAX }).map(function () { return Math.random(); });
    describe('constructor', function () {
        var lazy = [];
        var native = [];
        var lazyTime = -performance_1.performance.now();
        for (var i = 0; i < MAX; i++) {
            lazy.push(new promise_1.LazyPromise(noop));
        }
        lazyTime += performance_1.performance.now();
        expect(lazy.length).toBe(MAX);
        var nativeTime = -performance_1.performance.now();
        for (var i = 0; i < MAX; i++) {
            native.push(new Promise(noop));
        }
        nativeTime += performance_1.performance.now();
        expect(native.length).toBe(MAX);
        it(lazyTime + "ms > " + nativeTime + "ms", function () {
            expect(lazyTime).toBeLessThan(nativeTime);
        });
        it("Lazy vs. Native: " + (nativeTime / lazyTime).toFixed(3) + " > 1.5x", function () {
            expect(nativeTime / lazyTime).toBeGreaterThan(1.5);
        });
    });
    describe('resolve', function () {
        var lazy = [];
        var native = [];
        var lazyTime = -performance_1.performance.now();
        var _loop_1 = function (i) {
            lazy.push(new promise_1.LazyPromise(function (resolve) {
                resolve(values[i]);
            }));
        };
        for (var i = 0; i < MAX; i++) {
            _loop_1(i);
        }
        lazyTime += performance_1.performance.now();
        expect(lazy.length).toBe(MAX);
        var nativeTime = -performance_1.performance.now();
        var _loop_2 = function (i) {
            native.push(new Promise(function (resolve) {
                resolve(values[i]);
            }));
        };
        for (var i = 0; i < MAX; i++) {
            _loop_2(i);
        }
        nativeTime += performance_1.performance.now();
        expect(native.length).toBe(MAX);
        it(lazyTime + "ms > " + nativeTime + "ms", function () {
            expect(lazyTime).toBeLessThan(nativeTime);
        });
        it("Lazy vs. Native: " + (nativeTime / lazyTime).toFixed(3) + " > 1.5x", function () {
            expect(nativeTime / lazyTime).toBeGreaterThan(1.5);
        });
    });
});
function noop() {
}
