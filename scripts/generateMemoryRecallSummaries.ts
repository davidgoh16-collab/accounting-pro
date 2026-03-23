import * as fs from 'fs';
import * as path from 'path';

// Redefining the type locally so ts-node works cleanly without jumping through module resolution issues
type UserLevel = 'GCSE' | 'A-Level' | 'IGCSE';
interface MemoryRecallSummarySection {
    heading: string;
    text: string;
    imageUrl?: string;
}
interface MemoryRecallSummary {
    topicId: string;
    subTopicId: string;
    sections: MemoryRecallSummarySection[];
    level: UserLevel;
}

// NOTE: This is a standalone Node.js script intended to be run locally to pre-generate content.
// It mocks a simplified fetch to the gemini endpoints or uses the Gemini API directly if configured.

import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outputPath = path.join(__dirname, '../data/memory-recall-summaries.json');

async function main() {
    console.log('This script is a placeholder/template for pre-generating memory recall summaries.');
    console.log('In a real environment, this would call the Gemini API directly to generate text and images for all topics.');
    console.log('For the sake of this feature implementation, we will create a small subset of sample data directly.');

    const sampleData: MemoryRecallSummary[] = [
        {
            topicId: 'The Challenge of Natural Hazards',
            subTopicId: 'Plate Tectonics Theory (Distribution, Margins)',
            level: 'GCSE',
            sections: [
                {
                    heading: 'Structure of the Earth',
                    text: 'The Earth is made up of four main layers: the inner core, outer core, mantle, and crust. The crust and upper mantle form the lithosphere, which is broken into tectonic plates.',
                    imageUrl: 'https://images.unsplash.com/photo-1598275997637-29d33296886e?auto=format&fit=crop&q=80&w=800'
                },
                {
                    heading: 'Plate Margins',
                    text: 'There are different types of plate margins: constructive (plates move apart), destructive (plates move together and one is subducted), and conservative (plates slide past each other). Each type causes different natural hazards like volcanoes or earthquakes.',
                    imageUrl: 'https://images.unsplash.com/photo-1620025990267-27e10df3a13d?auto=format&fit=crop&q=80&w=800'
                }
            ]
        },
        {
            topicId: 'The Living World',
            subTopicId: 'Tropical Rainforests: Characteristics and adaptations',
            level: 'GCSE',
            sections: [
                {
                    heading: 'Climate and Soil',
                    text: 'Tropical rainforests have a hot and wet climate all year round. The soil, known as latosol, is surprisingly infertile because heavy rain washes nutrients away (leaching).',
                    imageUrl: 'https://images.unsplash.com/photo-1518182170546-0766de6cdac9?auto=format&fit=crop&q=80&w=800'
                },
                {
                    heading: 'Plant Adaptations',
                    text: 'Plants adapt to the extreme conditions. Trees have buttress roots for stability in shallow soil. Leaves have drip tips to shed heavy rain quickly, preventing leaf decay.',
                    imageUrl: 'https://images.unsplash.com/photo-1542385151-efd9000785a0?auto=format&fit=crop&q=80&w=800'
                }
            ]
        }
    ];

    fs.writeFileSync(outputPath, JSON.stringify(sampleData, null, 2));
    console.log(`Successfully generated sample data to ${outputPath}`);
}

main().catch(console.error);
