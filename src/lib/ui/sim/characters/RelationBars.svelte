<script lang="ts">
  import { config } from '@/lib/_config';
  import { getRelationColor } from '../../_helpers/colors';

  interface RelationValues {
    friendship: number;
    respect: number;
    love: number;
  }

  let {
    values,
    labelMinWidthPx = 72,
    barWidthPx = null as number | null,
    fontSizePx = 12,
    title = '',
  }: {
    values: RelationValues;
    labelMinWidthPx?: number;
    barWidthPx?: number | null;
    fontSizePx?: number;
    title?: string;
  } = $props();

  function percent(val: number): number {
    return Math.max(0, ((val + config.opinionMaxValue) / (2 * config.opinionMaxValue)) * 100);
  }
</script>

<div class="relation-values" style="font-size: {fontSizePx}px;">
  {#if title}
    <div class="relation-title">{title}</div>
  {/if}
  <div class="relation-bar">
    <span class="relation-label" style="min-width: {labelMinWidthPx}px;">Friendship</span>
    <div class="bar-container" style={barWidthPx !== null ? `width: ${barWidthPx}px` : ''}>
      <div
        class="bar-fill"
        style="width: {percent(values.friendship)}%; background: {getRelationColor(
          values.friendship
        )}"
      ></div>
    </div>
    <span class="relation-value">{values.friendship}</span>
  </div>

  <div class="relation-bar">
    <span class="relation-label" style="min-width: {labelMinWidthPx}px;">Respect</span>
    <div class="bar-container" style={barWidthPx !== null ? `width: ${barWidthPx}px` : ''}>
      <div
        class="bar-fill"
        style="width: {percent(values.respect)}%; background: {getRelationColor(values.respect)}"
      ></div>
    </div>
    <span class="relation-value">{values.respect}</span>
  </div>

  <div class="relation-bar">
    <span class="relation-label" style="min-width: {labelMinWidthPx}px;">Love</span>
    <div class="bar-container" style={barWidthPx !== null ? `width: ${barWidthPx}px` : ''}>
      <div
        class="bar-fill"
        style="width: {percent(values.love)}%; background: {getRelationColor(values.love)}"
      ></div>
    </div>
    <span class="relation-value">{values.love}</span>
  </div>
</div>

<style>
  .relation-values {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .relation-title {
    color: rgba(255, 255, 255, 0.9);
    font-weight: 600;
    margin-bottom: 2px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-size: 0.9em;
  }

  .relation-bar {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .relation-label {
    color: rgba(255, 255, 255, 0.8);
    text-align: left;
  }

  .bar-container {
    flex: 1 1 auto;
    height: 6px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
    overflow: hidden;
  }

  .bar-fill {
    height: 100%;
    border-radius: 3px;
    transition: width 0.3s ease;
  }

  .relation-value {
    color: rgba(255, 255, 255, 0.9);
    min-width: 24px;
    text-align: right;
    font-weight: 600;
  }
</style>
