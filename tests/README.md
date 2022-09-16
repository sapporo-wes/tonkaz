# Tests

This directory contains tests for `Tonkaz`.

These test data are generated using [`sapporo-wes/sapporo-service`](https://github.com/sapporo-wes/sapporo-service) and [`sapporo-wes/yevis-cli`](https://github.com/sapporo-wes/yevis-cli).

Also, please check [sapporo-wes/test-workflow](https://github.com/sapporo-wes/test-workflow).

## Run tests

Several combinations of crates are available as follows:

```bash
# GATK (Linux, 1st) <-> GATK (Linux, 2nd)
$ deno test -A ./tests/gatk_test.ts

# GATK (Linux) <-> GATK (Mac)
$ deno test -A ./tests/gatk_mac_test.ts

# JGA (Linux, 1st) <-> JGA (Linux, 2nd)
$ deno test -A ./tests/jga_test.ts

# JGA (Linux) <-> JGA (Mac)
$ deno test -A ./tests/jga_mac_test.ts

# RNA-seq (Linux, 1st) <-> RNA-seq (Linux, 2nd)
$ deno test -A ./tests/rnaseq_test.ts

# RNA-seq (Linux) <-> RNA-seq (Mac)
$ deno test -A ./tests/rnaseq_mac_test.ts

# RNA-seq (Linux, 1st) <-> RNA-seq (Linux, v3.6)
$ deno test -A ./tests/rnaseq_v3.6_test.ts

# RNA-seq (Linux, 1st) <-> RNA-seq (Linux, small)
$ deno test -A ./tests/rnaseq_small_test.ts

# Trimming (Linux) <-> Trimming (Mac)
$ deno test -A ./tests/trimming_mac_test.ts
```

## About test data

The json files contained in [`example_crate`](./example_crate) are generated using [`sapporo-wes/sapporo-service`](https://github.com/sapporo-wes/sapporo-service) and [`sapporo-wes/yevis-cli`](https://github.com/sapporo-wes/yevis-cli).

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
├── rnaseq_small.json
├── rnaseq_v3.6.json
├── trimming.json
└── trimming_mac.json
```

### Executed environment

About the environment in which the crate was generated.

| Field                   | Linux env                                  | Mac Apple silicon env |
| ----------------------- | ------------------------------------------ | --------------------- |
| OS                      | `Ubuntu 20.04.5 LTS`                       | `macOS 12.5.1`        |
| CPU                     | `Intel(R) Xeon(R) CPU E5-2640 0 @ 2.50GHz` | `Apple M1 Max`        |
| CPU cores               | `4`                                        | `10`                  |
| CPU Architecture        | `x86_64`                                   | `arm64`               |
| Memory                  | `24.0 GiB`                                 | `64.0 GiB`            |
| Docker version          | `20.10.8`                                  | `20.10.16`            |
| Sapporo-service version | `1.4.6`                                    | `1.4.6`               |
| Yevis-cli version       | `0.5.3`                                    | `0.5.3`               |

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
