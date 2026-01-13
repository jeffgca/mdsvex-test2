# Simple MDSVEX Site ( SMDS )

> Current status: builds are working how I want. Considering how to package a binary for this that takes the content folder as an argument and creates builds.

## Testing

This project now includes **Vitest** for comprehensive testing:

```bash
pnpm test          # Run tests in watch mode
pnpm test:ui       # Interactive test UI
pnpm test:run      # Single run (CI mode)
pnpm coverage      # Generate coverage report
```

📚 **Documentation:**

- [TESTING.md](TESTING.md) - Complete testing guide
- [VITEST_REFERENCE.md](VITEST_REFERENCE.md) - Quick reference
- [VITEST_SUMMARY.md](VITEST_SUMMARY.md) - Implementation summary

**Test Status:** ✅ 34 tests passing across 4 test files

## TODO:

- build-time embeds
- syntax highlighting
- bun or deno binary distribution?

## DONE

- builds
- relative and static image packaging
- ✅ Vitest testing framework integration
