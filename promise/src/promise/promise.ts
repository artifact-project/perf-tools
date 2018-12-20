const STATE_PENDING = 1;
const STATE_RESOLVED = 2;
const STATE_REJECTED = 3;

const FINALLY_SUPPROTED = typeof Promise.prototype.finally === 'function';

function LazyPromiseConstructor<T>(
	executor: (
		resolve: (value?: T | PromiseLike<T>) => void,
		reject: (reason?: any) => void,
	) => void
) {
	this._state = STATE_PENDING;
	this._result = null;
	this._promise = null as PromiseLike<T>;
	this._nativeResolve = null as Function;
	this._nativeReject = null as Function;

	executor(
		// Resolve
		(value) => {
			if (this._state === STATE_PENDING) {
				this._state = STATE_RESOLVED;
				this._result = value;

				if (this._promise !== null) {
					this._nativeResolve(value);
				}
			}
		},

		// Reject
		(reason) => {
			if (this._state === STATE_PENDING) {
				this._state = STATE_REJECTED;
				this._result = reason;

				if (this._promise !== null) {
					this._nativeReject(reason);
				}
			}
		},
	);
};

LazyPromiseConstructor.prototype = Object.create(Promise.prototype);
LazyPromiseConstructor.prototype.constructor = LazyPromiseConstructor;

LazyPromiseConstructor.prototype['_getPromise'] = function () {
	if (this._promise === null) {
		this._promise = new Promise((resolve, reject) => {
			if (this._state !== STATE_PENDING) {
				(this._state === STATE_RESOLVED ? resolve : reject)(this._result);
			} else {
				this._nativeResolve = resolve;
				this._nativeReject = reject;
			}
		});
	}

	return this._promise;
};

LazyPromiseConstructor.prototype.then = function (onfulfilled, onrejected) {
	return this._getPromise().then(onfulfilled, onrejected);
};

LazyPromiseConstructor.prototype.catch = function (onfulfilled) {
	return this.getPromise().catch(onfulfilled);
};

LazyPromiseConstructor.prototype.finally = function (onfinally) {
	const promise = this.getPromise();
	if (FINALLY_SUPPROTED) {
		return promise.finally(onfinally);
	} else {
		const fn = () => {
			onfinally();
		};
		return promise.then(fn, fn);
	}
};

LazyPromiseConstructor.all = function (values) {
	return Promise.all(values);
};

LazyPromiseConstructor.race = function (values) {
	return Promise.race(values);
};

LazyPromiseConstructor.resolve = function (value) {
	return new LazyPromiseConstructor(resolve => {
		resolve(value);
	});
};

LazyPromiseConstructor.reject = function (value) {
	return new LazyPromiseConstructor((_, reject) => {
		reject(value);
	});
};

export const LazyPromise: PromiseConstructor = LazyPromiseConstructor as any;