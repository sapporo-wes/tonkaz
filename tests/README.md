# Tests

This directory contains tests for `Tonkaz`.

These test data are generated using [`sapporo-wes/sapporo-service`](https://github.com/sapporo-wes/sapporo-service), [`sapporo-wes/yevis-cli`](https://github.com/sapporo-wes/yevis-cli) and Tonkaz.

The procedure of generating each data is as follows:

```
workflow -- (Sapporo-service/Yevis) --> execution_results + ro_crate -- (Tonkaz) --> comparison_results
```

## Run tests

Several combinations of crates are available as follows:

```bash
# GATK (Linux, 1st) <-> GATK (Linux, 2nd)
# Use case: Same environment
# Result: ./comparison_results/gatk_same_env.log
$ deno test -A ./tests/gatk_test.ts

# GATK (Linux) <-> GATK (Mac)
# Use case: Different environment
# Result: ./comparison_results/gatk_diff_env.log
$ deno test -A ./tests/gatk_mac_test.ts

# JGA (Linux, 1st) <-> JGA (Linux, 2nd)
# Use case: Same environment
# Result: ./comparison_results/jga_same_env.log
$ deno test -A ./tests/jga_test.ts

# JGA (Linux) <-> JGA (Mac)
# Use case: Different environment
# Result: ./comparison_results/jga_diff_env.log
$ deno test -A ./tests/jga_mac_test.ts

# RNA-seq (Linux, 1st) <-> RNA-seq (Linux, 2nd)
# Use case: Same environment
# Result: ./comparison_results/rnaseq_same_env.log
$ deno test -A ./tests/rnaseq_test.ts

# RNA-seq (Linux) <-> RNA-seq (Mac)
# Use case: Different environment
# Result: ./comparison_results/rnaseq_diff_env.log
$ deno test -A ./tests/rnaseq_mac_test.ts

# RNA-seq (Linux, 1st) <-> RNA-seq (Linux, v3.6)
# Use case: Different version
# Result: ./comparison_results/rnaseq_diff_ver.log
$ deno test -A ./tests/rnaseq_v3.6_test.ts

# RNA-seq (Linux, 1st) <-> RNA-seq (Linux, small)
# Use case: Missing dataset
# Result: ./comparison_results/rnaseq_missing_data.log
$ deno test -A ./tests/rnaseq_small_test.ts

# RNA-seq (Linux, 1st) <-> RNA-seq (Linux, small)
# Use case: All files
# Result: ./comparison_results/rnaseq_all_files.log
$ deno test -A ./tests/rnaseq_all_files_test.ts

# RNA-seq (Linux, with yevis) <-> RNA-seq (Linux, only sapporo)
$ deno test -A ./tests/rnaseq_only_sapporo_test.ts

# Trimming (Linux) <-> Trimming (Mac)
$ deno test -A ./tests/trimming_mac_test.ts
```

## About test data

The raw data of workflow execution results are stored in [![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.7098337.svg)](https://doi.org/10.5281/zenodo.7098337).

The crate files contained in [`example_crate`](./example_crate):

```
example_crate/
├── gatk_1st.json
├── gatk_2nd.json
├── gatk_mac.json
├── jga_1st.json
├── jga_2nd.json
├── jga_mac.json
├── rnaseq_1st.json
├── rnaseq_2nd.json
├── rnaseq_mac.json
├── rnaseq_only_sapporo.json
├── rnaseq_small.json
├── rnaseq_v3.6.json
├── trimming.json
└── trimming_mac.json
```

### Executed environment

About the environment in which these crates were generated.

| Field                   | Linux env                                  | Mac Apple silicon env |
| ----------------------- | ------------------------------------------ | --------------------- |
| OS                      | `Ubuntu 20.04.5 LTS`                       | `macOS 12.5.1`        |
| CPU                     | `Intel(R) Xeon(R) CPU E5-2640 0 @ 2.50GHz` | `Apple M1 Max`        |
| CPU cores               | `4`                                        | `10`                  |
| CPU Architecture        | `x86_64`                                   | `arm64`               |
| Memory                  | `24.0 GiB`                                 | `64.0 GiB`            |
| Docker version          | `20.10.8`                                  | `20.10.16`            |
| Sapporo-service version | `1.4.8`                                    | `1.4.8`               |
| Yevis-cli version       | `0.5.4`                                    | `0.5.4`               |

### GATK

- Crate:
  - [`gatk_1st.json`](./example_crate/gatk_1st.json)
    - Crate generated on `Linux` environment. (1st execution)
  - [`gatk_2nd.json`](./example_crate/gatk_2nd.json)
    - Crate generated on `Linux` environment. (2nd execution (same settings))
  - [`gatk_mac.json`](./example_crate/gatk_mac.json)
    - Crate generated on `Mac Apple silicon` environment.

See https://github.com/sapporo-wes/test-workflow#broadinstitutegatkmitochondriapipeline for more details about the executed workflow.

Executed as follows:

```bash
$ yevis test --fetch-ro-crate https://raw.githubusercontent.com/sapporo-wes/test-workflow/main/yevis-metadata_gatk-workflows_mitochondria-pipeline.yml
```

### JGA

- Crate:
  - [`jga_1st.json`](./example_crate/jga_1st.json)
    - Crate generated on `Linux` environment. (1st execution)
  - [`jga_2nd.json`](./example_crate/jga_2nd.json)
    - Crate generated on `Linux` environment. (2nd execution (same settings))
  - [`jga_mac.json`](./example_crate/jga_mac.json)
    - Crate generated on `Mac Apple silicon` environment.

See https://github.com/sapporo-wes/test-workflow#biosciencedbcjga-analysis---per-sample-workflow for more details about the executed workflow.

Executed as follows:

```bash
$ yevis test --fetch-ro-crate https://raw.githubusercontent.com/sapporo-wes/test-workflow/main/yevis-metadata_jga-workflow_per-sample.yml
```

### RNA-seq

- Crate:
  - [`rnaseq_1st.json`](./example_crate/rnaseq_1st.json)
    - Crate generated on `Linux` environment. (1st execution)
  - [`rnaseq_2nd.json`](./example_crate/rnaseq_2nd.json)
    - Crate generated on `Linux` environment. (2nd execution (same settings))
  - [`rnaseq_mac.json`](./example_crate/rnaseq_mac.json)
    - Crate generated on `Mac Apple silicon` environment.
  - [`rnaseq_small.json`](./example_crate/rnaseq_small.json)
    - Crate generated on `Linux` environment. (small dataset)
  - [`rnaseq_v3.6.json`](./example_crate/rnaseq_v3.6.json)
    - Crate generated on `Linux` environment.
    - Using `nf-core/rnaseq` version is `3.6`. (Normal one is `3.7`)
  - [`rnaseq_only_sapporo.json`](./example_crate/rnaseq_only_sapporo.json)
    - Crate generated on `Linux` environment.
    - Using `nf-core/rnaseq` version is `3.7`.
    - Using `Sapporo` only. (Not using `Yevis`)

See https://github.com/sapporo-wes/test-workflow#nf-corernaseq for more details about the executed workflow.

Executed as follows:

```bash
# Normal one (v3.7)
$ yevis test --fetch-ro-crate https://raw.githubusercontent.com/sapporo-wes/test-workflow/main/yevis-metadata_nf-core_rnaseq.yml

# Small dataset
$ yevis test --fetch-ro-crate https://raw.githubusercontent.com/sapporo-wes/test-workflow/main/yevis-metadata_nf-core_rnaseq_small_test.yml

# v3.6
$ yevis test --fetch-ro-crate https://raw.githubusercontent.com/sapporo-wes/test-workflow/main/yevis-metadata_nf-core_rnaseq_v3.6.yml
```

### Trimming

- Crate:
  - [`trimming.json`](./example_crate/trimming.json)
    - Crate generated on `Linux` environment.
  - [`trimming_mac.json`](./example_crate/trimming_mac.json)
    - Crate generated on `Mac Apple silicon` environment.

Workflow is https://github.com/sapporo-wes/yevis-cli/blob/main/tests/test-metadata-CWL.yml

Executed as follows:

```bash
$ yevis test --fetch-ro-crate https://raw.githubusercontent.com/sapporo-wes/yevis-cli/main/tests/test-metadata-CWL.yml
```
