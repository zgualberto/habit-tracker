<script setup lang="ts">
import { computed } from 'vue';
import type { ChartData, ChartOptions } from 'chart.js';
import { Line } from 'vue-chartjs';

import '../utilities/chart.utility';
import { CHART_COLORS } from '../constants/presentation.constants';

export type ChartSeries = {
  label: string;
  color: string;
  values: readonly number[];
};

const properties = withDefaults(
  defineProps<{
    labels: readonly string[];
    series: readonly ChartSeries[];
    yAxisTitle?: string;
    heightInPixels?: number;
  }>(),
  { yAxisTitle: '', heightInPixels: 260 },
);

const chartData = computed<ChartData<'line'>>(() => ({
  labels: [...properties.labels],
  datasets: properties.series.map((series) => ({
    label: series.label,
    data: [...series.values],
    borderColor: series.color,
    backgroundColor: series.color,
    pointBackgroundColor: series.color,
    tension: 0.3,
    pointRadius: 2,
    pointHoverRadius: 4,
    borderWidth: 2,
    fill: false,
  })),
}));

const chartOptions = computed<ChartOptions<'line'>>(() => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: 'index', intersect: false },
  plugins: {
    legend: {
      display: properties.series.length > 1,
      position: 'bottom',
      labels: {
        color: CHART_COLORS.TEXT,
        usePointStyle: true,
        boxWidth: 8,
      },
    },
    tooltip: {
      backgroundColor: CHART_COLORS.TEXT,
    },
  },
  scales: {
    x: {
      grid: { color: CHART_COLORS.GRID },
      ticks: { color: CHART_COLORS.TEXT, maxRotation: 0, autoSkip: true },
    },
    y: {
      beginAtZero: true,
      grid: { color: CHART_COLORS.GRID },
      ticks: { color: CHART_COLORS.TEXT, precision: 0 },
      title: {
        display: properties.yAxisTitle.length > 0,
        text: properties.yAxisTitle,
        color: CHART_COLORS.TEXT,
      },
    },
  },
}));
</script>

<template>
  <div :style="{ height: `${heightInPixels}px` }">
    <Line :data="chartData" :options="chartOptions" />
  </div>
</template>
