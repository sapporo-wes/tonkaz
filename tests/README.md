# Test data

This directory contains test data for `tonkaz`.
These test data are generated using [`sapporo-service`](https://github.com/sapporo-wes/sapporo-service) and [`yevis-cli`](https://github.com/sapporo-wes/yevis-cli).

Also see [sapporo-wes/test-workflow](https://github.com/sapporo-wes/test-workflow).

## How to generate

- `crate_example_gatk1.json`
- `crate_example_gatk2.json`

```bash
$ yevis test -f https://raw.githubusercontent.com/sapporo-wes/test-workflow/main/yevis-metadata_gatk-workflows_mitochondria-pipeline.yml
```

---

- `crate_example_jga1.json`
- `crate_example_jga2.json`

```bash
$ yevis test -f https://raw.githubusercontent.com/sapporo-wes/test-workflow/main/yevis-metadata_jga-workflow_per-sample.yml
```

---

- `crate_example_rnaseq1.json`
- `crate_example_rnaseq2.json`

```bash
$ yevis test -f https://raw.githubusercontent.com/sapporo-wes/test-workflow/main/yevis-metadata_nf-core_rnaseq.yml
```

---

- `crate_example_trimming.json`

```bash
$ yevis test -f https://raw.githubusercontent.com/sapporo-wes/yevis-cli/main/tests/test-metadata-CWL.yml
```
