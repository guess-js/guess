# Developer's Guide

This document explains how to build, test, and publish the packages from the monorepo.

## Installation

In order to install all the dependencies run:

```bash
npm run bootstrap
```

This will download all development dependencies for the monorepo and download the dependencies for each individual package. It will also call `lerna bootstrap` which will create symlinks for the cross-package dependencies.

## Build

In order to build the packages run:

```bash
npm run build
```

The command will build all the packages, topologically sorted.

## Publish

To publish the packages, run:

```bash
npm run publish
```

The `publish` script will delegate the execution to `lerna publish` which will take care of updating the dependencies' versions and publishing them to npm.
