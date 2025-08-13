<script lang="ts">
  export let jsonOutput: string;
  export let downloadJSON: () => void;
</script>

<div class="form-section">
  <h3>Generated JSON</h3>
  <pre class="json-output">{jsonOutput}</pre>
  <button type="button" onclick={downloadJSON} class="download-btn"> Download </button>
</div>

<style>
  .form-section {
    margin-bottom: 30px;
    padding: 20px;
    border: 1px solid #ddd;
    border-radius: 8px;
    background-color: #f9f9f9;
    flex: 0 0 auto;
    box-sizing: border-box;
  }

  .form-section h3 {
    margin-top: 0;
    color: #333;
    border-bottom: 2px solid #007bff;
    padding-bottom: 10px;
  }

  .json-output {
    background-color: #f8f9fa;
    border: 1px solid #dee2e6;
    border-radius: 4px;
    padding: 15px;
    font-family: 'Courier New', monospace;
    font-size: 12px;
    white-space: pre-wrap;
    word-wrap: break-word;
    max-height: 400px;
    overflow-y: auto;
    margin-bottom: 15px;
  }

  .download-btn {
    background-color: #28a745;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 12px 24px;
    cursor: pointer;
    font-size: 14px;
    font-weight: bold;
    width: 100%;
  }

  .download-btn:hover {
    background-color: #218838;
  }

  .download-btn:disabled {
    background-color: #6c757d;
    cursor: not-allowed;
  }
</style>
