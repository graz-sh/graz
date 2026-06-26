# @project/example-playground

## 0.1.4

### Patch Changes

- Updated dependencies [0f61458]
- Updated dependencies [e005f5a]
- Updated dependencies [f28a44c]
- Updated dependencies [7694b17]
- Updated dependencies [71ca316]
- Updated dependencies [24b217e]
- Updated dependencies [d817b27]
- Updated dependencies [4e13ffe]
- Updated dependencies [3538f40]
- Updated dependencies [d3eead8]
  - graz@0.5.0

## 0.1.3

### Patch Changes

- Updated dependencies [1e7078a]
- Updated dependencies [d417391]
  - graz@0.4.3

## 0.1.2

### Patch Changes

- Updated dependencies [d7717cd]
- Updated dependencies [02324c2]
  - graz@0.4.2

## 0.1.1

### Patch Changes

- Updated dependencies [b37bcb2]
  - graz@0.4.1

## 0.1.0

### Minor Changes

- f2cb59e: Major refactor and improvements for Graz v0.4.0

  ### Core Improvements
  - **Unified Multi-Chain API**: Refactored multi-chain functionality for better consistency and type safety across all hooks and utilities
  - **Enhanced Wallet Integration**: Added comprehensive wallet metadata (name, website, logo) to all wallet adapters for better UI integration
  - **Para Wallet Integration**:
    - Internalized Para types (`ParaGrazConfig`, `ParaWeb`, `ParaWallet`, `ParaModalProps`, `ParaGrazConnector`) directly in graz package
    - Fixed bundler compatibility issues with dynamic imports using Function constructor approach
    - Made `@getpara/graz-integration` an optional peer dependency
    - Users can now import Para types directly: `import { type ParaGrazConfig } from "graz"`

  ### Developer Experience
  - **Enhanced Documentation**: Comprehensive updates to all hook documentation with better examples and multi-chain usage patterns
  - **New Playground Example**: Added advanced Next.js playground example with responsive design and comprehensive wallet connection features
  - **Improved Testing**: Added Vitest testing framework with comprehensive test coverage for utilities and CLI
  - **Better Type Safety**: Enhanced TypeScript types and improved error handling throughout the codebase

  ### Build & Development
  - **CLI Improvements**: Enhanced chain fetching with better error handling and graceful failure recovery
  - **Build Optimization**: Improved build process with better tree-shaking and bundle optimization
  - **Dependency Updates**: Updated to latest compatible versions of all dependencies
  - **ESLint & Prettier**: Added comprehensive linting and formatting configuration

  ### Breaking Changes
  - **Multi-Chain API**: Some multi-chain hook signatures have been updated for better consistency
  - **Para Dependencies**: Para-related packages are now optional peer dependencies instead of direct dependencies
  - **TypeScript**: Minimum TypeScript version requirements updated for better compatibility

  ### Migration
  - See the migration guide in documentation for detailed upgrade instructions
  - Para integration now requires importing types from graz package instead of separate packages
  - Multi-chain hooks have improved type safety and consistency

### Patch Changes

- Updated dependencies [f2cb59e]
  - graz@0.4.0

## 0.0.2-alpha.2

### Patch Changes

- Updated dependencies
  - graz@0.4.0-alpha.4

## 0.0.2-alpha.1

### Patch Changes

- Updated dependencies
  - graz@0.4.0-alpha.1

## 0.0.2-alpha.0

### Patch Changes

- Updated dependencies [2d93c6d]
  - graz@0.4.0-alpha.0

## 0.0.1

### Patch Changes

- Initial release of playground example with Next.js App Router
