# @totto2727/result

## 0.6.0

### Minor Changes

- 12a421f: # v0.6.0

  Destructive Change

  - Define utility functions with lazy evaluation and eager evaluation.
  - Added deprecation flag to existing utility functions.
    - Will be removed in v0.7.0 ~ v0.8.0.
  - Changed the value returned by unwrap function from the entire Failure type to only the cause property.
  - Fixed some extra type naming.
    - Incorrect variable name types will be removed in v0.7.0 ~ v0.8.0.
  - Script optimization for builds.
    - Bundles for browsers are no longer generated.
    - Bundler changed from bun + vite to bun + esbuild.
    - Splitting option disabled (cause: https://github.com/oven-sh/bun/issues/4524).

  Nondestructive changes

  - Added configuration file for IDEA.
  - Added documentation for developers (in Japanese).
  - Added documentation for advanced types and advanced functions (in Japanese).

## 0.5.2

### Patch Changes

- - add japanese document(README.md)
  - add test for AnyhowResult type

## 0.5.1

### Patch Changes

- refactor: simplify TypedResult type

## 0.5.0

### Minor Changes

- v0.5.0
