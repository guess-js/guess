# Developer's Guide

This document explains how to build, test, and publish the packages from the monorepo.

## Installation

In order to install all the dependencies run:

```bash
npm i
```

This will download all development dependencies for the monorepo and download the dependencies for each individual package.

## Build

In order to build the packages run:

```bash
npm run build
```

The command will build all the packages, topologically sorted.

## Publish

To publish the packages, make sure you've updated `config.json` which contains the current project version. After that run:

```bash
npm run build -- -p
```

Once you confirm the prompt, the `scripts/build.ts` will build all the packages and publish them.
