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
const ipAddress = await tryFallback([
  ['serverA', domainServerA.lookup(name)],
  ['serverB', domainServerB.lookup(name)],
  ['serverC', domainServerC.lookup(name)],
]);
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
// Here's an example "implementation" of a recommendation operation which
// suggests the next video in a series.
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

const recommendation = await tryFallback([
  ['nextEpisode', nextEpisodeImplementation()],
  ['fromSimilarSeries', similarSeriesImplementation()],
  ['fromWatchlist', watchlistImplementation()],
])
```
