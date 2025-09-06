import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const cardsDir = path.join(__dirname, '../data/cards');
const outputFile = path.join(__dirname, '../data/_all_cards.json');

function mergeCards() {
  try {
    // Read all files in the cards directory
    const files = fs.readdirSync(cardsDir);

    // Filter for JSON files only
    const jsonFiles = files.filter((file) => file.endsWith('.json'));

    console.log(`Found ${jsonFiles.length} card files to merge`);

    // Read and parse each card file
    const allCards = [];

    for (const file of jsonFiles) {
      const filePath = path.join(cardsDir, file);
      const content = fs.readFileSync(filePath, 'utf8');

      try {
        const card = JSON.parse(content);
        // Add CardSet Alpha to all cards
        card.CardSet = 'Alpha';
        allCards.push(card);
        console.log(`✓ Loaded: ${card.name || card.id} (${file})`);
      } catch (parseError) {
        console.error(
          `✗ Failed to parse ${file}:`,
          parseError instanceof Error ? parseError.message : String(parseError)
        );
      }
    }

    // Sort cards by name for consistent output
    allCards.sort((a, b) => (a.name || a.id).localeCompare(b.name || b.id));

    // Write the merged array to the output file
    const outputContent = JSON.stringify(allCards, null, 2);
    fs.writeFileSync(outputFile, outputContent, 'utf8');

    console.log(`\n✅ Successfully merged ${allCards.length} cards into ${outputFile}`);
    console.log(`📁 Output file: ${outputFile}`);
  } catch (error) {
    console.error(
      '❌ Error merging cards:',
      error instanceof Error ? error.message : String(error)
    );
    process.exit(1);
  }
}

// Always run the merge when this file is executed
mergeCards();

export { mergeCards };
