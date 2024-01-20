# @totto2727/result

## 0.6.8

### Patch Changes

- optimize-dependencies

  - fix/move-from-dependencies-to-devDependencie

## 0.6.4

### Patch Changes

- update packages

  - ci: add circleci config
  - ci: refactor biome config
  - feat: update packages
  - style: apply format

## 0.6.3

### Patch Changes

- fix: make default property last

## 0.6.2

### Patch Changes

- pass attw test except node10
- removed support for node10

## 0.6.1

### Patch Changes

- docs/fix-typo

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
