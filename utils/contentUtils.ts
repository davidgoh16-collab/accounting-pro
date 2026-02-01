
import { GCSE_SPEC_TOPICS, ALEVEL_SPEC_TOPICS } from '../constants';
import { UserLevel } from '../types';

export const getSpecContext = (level: UserLevel): string => {
    const topics = level === 'GCSE' ? GCSE_SPEC_TOPICS : ALEVEL_SPEC_TOPICS;
    let context = `The user is studying ${level} Geography (AQA). The valid topics and sub-topics are:\n`;

    Object.entries(topics).forEach(([unit, subTopics]) => {
        context += `- Unit: ${unit}\n`;
        subTopics.forEach(sub => {
            context += `  * ${sub}\n`;
        });
    });

    return context;
};
