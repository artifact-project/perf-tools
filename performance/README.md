@perf-tools/performance
-----------------------
User Timing polyfill

```
npm i --save @perf-tools/performance
```

### Supported

- Browser, Worker and NodeJS
- API:
  - [now](https://developer.mozilla.org/docs/Web/API/Performance/now) - Returns a `DOMHighResTimeStamp` representing the number of milliseconds elapsed since a reference instant.
  - [mark](https://developer.mozilla.org/docs/Web/API/Performance/mark) - Creates a `timestamp` in the browser's performance entry buffer with the given name.
  - [measure](https://developer.mozilla.org/docs/Web/API/Performance/measure) - Creates a named `timestamp` in the browser's performance entry buffer between two specified marks (known as the start mark and end mark, respectively).
  - [getEntries](https://developer.mozilla.org/docs/Web/API/Performance/getEntries) - Returns a list of `PerformanceEntry` objects based on the given filter.
  - [getEntriesByType](https://developer.mozilla.org/docs/Web/API/Performance/getEntriesByType) - Returns a list of `PerformanceEntry` objects of the given entry type.
  - [getEntriesByName](https://developer.mozilla.org/docs/Web/API/Performance/getEntriesByName) - Returns a list of `PerformanceEntry` objects based on the given name and entry type.
  - [clearMarks](https://developer.mozilla.org/docs/Web/API/Performance/clearMarks) - Removes the given `mark` from the browser's performance entry buffer.
  - [clearMeasures](https://developer.mozilla.org/docs/Web/API/Performance/clearMarks) - Removes the given `measure` from the browser's performance entry buffer.

---

#### Not Supported

  - [clearResourceTimings](https://developer.mozilla.org/docs/Web/API/Performance/clearResourceTimings) - no




### Development

 - `npm i`
 - `npm test`, [code coverage](./coverage/lcov-report/index.html)
