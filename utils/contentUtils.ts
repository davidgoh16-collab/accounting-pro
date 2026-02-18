
import { GCSE_SPEC_TOPICS, ALEVEL_SPEC_TOPICS, IGCSE_SPEC_TOPICS } from '../constants';
import { UserLevel } from '../types';

export const getSpecContext = (level: UserLevel): string => {
    let topics = GCSE_SPEC_TOPICS;
    if (level === 'A-Level') topics = ALEVEL_SPEC_TOPICS;
    if (level === 'IGCSE') topics = IGCSE_SPEC_TOPICS;

    const specName = level === 'IGCSE' ? 'Edexcel IGCSE Geography' : `${level} Geography (AQA)`;
    let context = `The user is studying ${specName}. The valid topics and sub-topics are:\n`;

    Object.entries(topics).forEach(([unit, subTopics]) => {
        context += `- Unit: ${unit}\n`;
        subTopics.forEach(sub => {
            context += `  * ${sub}\n`;
        });
    });

    return context;
};
