#!/usr/bin/env bash
set -euo pipefail

HERE=$(
  cd $(dirname $0)
  pwd
)
cd $HERE/..

declare -A tests=(
  "gatk_same_env" "gatk_test.ts"
  "gatk_diff_env" "gatk_mac_test.ts"
  "jga_same_env" "jga_test.ts"
  "jga_diff_env" "jga_mac_test.ts"
  "rnaseq_same_env" "rnaseq_test.ts"
  "rnaseq_diff_env" "rnaseq_mac_test.ts"
  "rnaseq_diff_ver" "rnaseq_v3.6_test.ts"
  "rnaseq_missing_data" "rnaseq_small_test.ts"
  "rnaseq_all_files" "rnaseq_all_files_test.ts"
)

for test in "${!tests[@]}"; do
  echo "Running test: $test"
  deno test -A ./tests/${tests[$test]} > >(tee ./tests/comparison_results/$test.log)
done
