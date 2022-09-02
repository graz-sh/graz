# Contributing to graz

Thanks for showing interest to contribute to `graz` <3

The following is a set of guidelines for contributing to graz, which are hosted in the [Strangelove Ventures Organization](https://github.com/strangelove-ventures) on GitHub. These are mostly guidelines, not rules. Use your best judgment, and feel free to propose changes to this document in a pull request.

## Code of Conduct

This project and everyone participating in it is governed by the [`graz` Code of Conduct](./code-of-conduct.md). By participating, you are expected to uphold this code.

## Brief of graz

### What is graz?

`graz` is a collection of React hooks containing everything you need to start working with the Cosmos ecosystem.

### Why this library exist?

Currently there is no stable library for cosmos wallets. We were inspired by the patterns in [`wagmi`](https://wagmi.sh) in the Etherium ecosystem.

## What should I know before I get started?

It greatly helps if you already have a basic understanding of:

- [Cosmos ecosystem](https://cosmos.network/)
- [`react-query`](https://react-query.tanstack.com/)
- [`zustand`](https://github.com/pmndrs/zustand)
- [Keplr Wallet](https://docs.keplr.app)

## Setup the Project

The following steps will get you up and running to contribute to `graz`:

1. Fork the repo (click the <kbd>Fork</kbd> button at the top right of [this page](https://github.com/strangelove-ventures/graz))

2. Clone your fork locally

   ```sh
   git clone https://github.com/<your_github_username>/graz.git
   cd graz
   ```

3. Setup all the dependencies and packages by running `pnpm`. This command will install dependencies and bootstrap the repo.
   > We are using `pnpm` as the default package manager, we suggest to you to do the same.

## Directory structure

### Repository

```sh
├── packages/             # local packages
│   ├── eslint-config/    # project eslint configuration
│   ├── prettier-config/  # project prettier configuration
│   └── graz/             # graz
├── docs/                 # documentation website
└── example/              # example website (nextjs + chakra ui)
```

### graz

```sh
├── src/                  # main project entry point
│   ├── actions/          # core functions
│   ├── chains/           # collections of chains
│   └── hooks/            # collection of hooks
│   └── provider/         # application state providers
│   └── store/            # application state stores
│   └── types/            # shared types
├── dist/                 # output
```

## Development

- `pnpm install`: bootstrap the entire project
- `pnpm dev`: compiles `graz` and start the development server of the example app
- `pnpm docs dev`: start the documentation website
- `pnpm example dev`: start the example app

## Pull Request

Pull requests only need one collaborator 👍 to be merged.

### Commit Convention

Before you create a Pull Request, please check whether your commits comply with the commit conventions used in this repository.

When you create a commit we kindly ask you to follow the convention of category (scope or module): title in your commit message, using one of the following categories:

- `feat / feature`: all changes that introduce completely new code or new features
- `fix`: changes that fix a bug (reference the relevant issue(s) if possible)
- `refactor`: any code-related change that is not a fix nor a feature
- `docs`: changing existing or creating new documentation (i.e. README, docs for usage of a lib or cli usage)
- `build`: all changes regarding the build of the software, updates to dependencies, or the addition of new dependencies
- `test`: all changes regarding tests (adding new tests or changing existing ones)
- `ci`: all changes regarding the configuration of continuous integration (i.e. github actions, ci system)
- `chore`: all changes to the repository that do not fit into any of the above categories

If you are interested in the detailed specification you can visit https://www.conventionalcommits.org/ or check out the Angular Commit Message Guidelines.

## License

By contributing your code to the graz GitHub repository, you agree to license your contribution under the [MIT license](./license.md).
