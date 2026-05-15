# Build Performance Improvements: Bun vs npm Migration

As part of updating the CI pipeline to use `bun` instead of `npm`, we ran local performance tests which demonstrated a massive improvement in installation speeds, while holding execution time mostly equal.

| Command              | npm (v11) Execution Time | bun (v1.3.x) Execution Time |
| -------------------- | ------------------------ | --------------------------- |
| Install Dependencies | ~28.3 seconds            | **~2.08 seconds**           |
| Lint                 | ~4.5 seconds             | **~4.5 seconds**            |
| Build                | ~23.3 seconds            | **~22.2 seconds**           |
| Unit Tests           | ~18.3 seconds            | **~3.8 seconds**            |

### Expected GitHub Actions Impact

We expect GitHub Actions pipeline to run roughly 15-30 seconds faster due to the much quicker installation process of dependencies. Because bun is used in both linting and testing/building pipelines, we should see speedup in both `CI` and `Deploy to S3` github action runs. The unit tests are notably faster as well.
