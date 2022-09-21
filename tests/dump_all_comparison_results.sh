#!/usr/bin/env bash
set -euxo pipefail

HERE=$(
  cd $(dirname $0)
  pwd
)
cd $HERE/..

mv ./tests/comparison_results/rnaseq_same_env.json ./tests/comparison_results/rnaseq_same_env.log
mv ./tests/comparison_results/rnaseq_diff_env.json ./tests/comparison_results/rnaseq_diff_env.log
mv ./tests/comparison_results/rnaseq_diff_ver.json ./tests/comparison_results/rnaseq_diff_ver.log
mv ./tests/comparison_results/rnaseq_missing_data.json ./tests/comparison_results/rnaseq_missing_data.log
mv ./tests/comparison_results/rnaseq_all_files.json ./tests/comparison_results/rnaseq_all_files.log
mv ./tests/comparison_results/jga_same_env.json ./tests/comparison_results/jga_same_env.log
mv ./tests/comparison_results/jga_diff_env.json ./tests/comparison_results/jga_diff_env.log
mv ./tests/comparison_results/gatk_same_env.json ./tests/comparison_results/gatk_same_env.log
mv ./tests/comparison_results/gatk_diff_env.json ./tests/comparison_results/gatk_diff_env.log
