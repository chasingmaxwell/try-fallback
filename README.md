# try-fallback

Try a set of functions in order, one at a time, resolving with the result of the
first successful implementation.

## Why?

Utilizing this pattern can help you keep your business logic nice and tidy while
solving problems like [resilience](#for-resilience) and [complex multi-strategy
operations](#for-managing-complex-business-logic)

## Installation

With yarn:

```
yarn add try-fallback
```

or with npm:

```
npm install try-fallback
```

## Usage

Here's a useless example just to show you how it works:

```JavaScript
import { tryFallback } from 'try-fallback';

const [implementation, result] = await tryFallback([
  ['thisOneFails', () => {
    throw new Error('failed!');
  }],
  ['addOne', i => i + 1],
])(1);

console.log(implementation);
// addOne

console.log(result);
// 2
```

Now for some more interesting examples:

### For Resilience

The simplest and most obvious use for `tryFallback` is to provide resilience to
an operation that is possibly error-prone by retrying the operation with
varying strategies.

In this contrived example we're doing a DNS lookup against three
different DNS servers. In the case that the first fails, `tryFallback` will
invoke the second. If the second fails it will invoke the third. Since we only
have three implementations, if the third fails, `tryFallback` will throw an
error indicating that all available implementations have failed.

```JavaScript
import { tryFallback } from 'try-fallback';

const dnsLookup = tryFallback([
  ['serverA', domainServerA.lookup],
  ['serverB', domainServerB.lookup],
  ['serverC', domainServerC.lookup],
]);

const [implementation, ipAddress] = await dnsLookup(name);
```

### For managing complex business logic

Another use for `tryFallback` is to encapsulate complicated business logic into
self-contained implementations which throw under certain conditions to
purposefully pass the operation to the next implementation in the set. The
implementations are ordered by priority (the first implementation is
preferable to the second and so on).

In this example we want to provide a recommendation to a user about what to
watch next on a streaming platform.

```JavaScript
import { tryFallback } from 'try-fallback';

// Here's an example "implementation" of a recommendation operation which
// suggests the next episode in a series.
async function nextEpisodeImplementation() {
  const nextEpisode = await getNextEpisode();

  if (!nextEpisode) {
    throw Error("We do not have a next episode. The current video must be the last one!");
  }

  if (nextEpisode.isWatched()) {
    throw new Error("The user has already watched the next video. Let's recommend something else.");
  }

  return nextEpisode;
}

// I'll keep this brief and not pseudo-code the other two implementations. Hopefully you get the gist.

const getRecommendation = tryFallback([
  ['nextEpisode', nextEpisodeImplementation],
  ['fromSimilarSeries', similarSeriesImplementation],
  ['fromWatchlist', watchlistImplementation],
])

const [implementation, recommendation] = await getRecommendation();
```

### Error handling

If you need to respond to errors thrown within the implementation functions, you
can pass an error handler to `tryFallback` as the second argument:

```JavaScript
import { tryFallback } from 'try-fallback';

const doAThing = tryFallback(
  [
    ['thisOneFails', () => {
      throw new Error('Whoopsie!');
    }],
    ['addOne', i => i + 1],
  ],
  // Error handler:
  ([imp, error]) => {
    console.log(`failed implementation: ${imp}`);
    console.log(`error message: ${error.message}`);
  }
);

const [implementation, result] = await doAThing(1);
// failed implementation: thisOneFails
// error message: Whoopsie!

console.log(implementation);
// addOne

console.log(result);
// 2
```

## API

### tryFallback(implementations, errorHandler?)

Returns a unary function which, when invoked, will invoke each
implementation function in order, passing its own single argument to each and
returning a promise which resolves with the result of the first successful
implementation. If all implementations throw, the promise will be rejected with
an error.

**`implementations`**: An array of tuples containing the implementation name in
the first position and the implementation function in the second.

For example:

```JavaScript
[
  ['addOne', i => i + 1],
  ['addTwo', i => i + 2]
]
```

**`errorHandler?`**: An optional error handling function which is invoked each
time an implementation throws an error, triggering a fallback. The error handler
accepts two arguments. The first is the implementation name. The second is the
error that was thrown.

For example:

```JavaScript
(implementation, error) => {
  console.error(`Implementation ${implementation} failed: ${error.message}`);
}
```
