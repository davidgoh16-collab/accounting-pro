
import { Question, CaseStudyMaster } from './types';

// This file now contains a small sample of questions to be used as examples for the AI generator.
export const ALL_QUESTIONS: Question[] = [
  {
    id: 'q-2024-p1-01-1',
    examYear: 2024,
    questionNumber: '01.1',
    unit: 'Water and Carbon Cycles',
    title: 'Human Impact on Water Cycle',
    prompt: 'Outline how human factors impact upon the water cycle.',
    marks: 4,
    ao: { ao1: 4, ao2: 0, ao3: 0 },
    caseStudy: {
      title: 'Stimulus / Context',
      content: 'No specific stimulus provided. Your answer should draw on your own knowledge.'
    },
    markScheme: {
      title: 'AQA Mark Scheme: Notes for answers (AO1)',
      content: `Point marked. Allow 1 mark per valid point with extra mark(s) for developed points (d).
For example:
- Deforestation / land clearance will typically reduce transpiration (depending on how the land use changes) (1). Some may point to increased runoff due to the lack of interception (1). This may lead to increased likelihood of flooding (1) (d).
- Infiltration / percolation rates will also be reduced if natural vegetation is cleared (1). This is as a result of soil compaction (1) (d).
- Global warming may increase the amount of precipitation in the atmosphere leading to even more intense downpours (1).
- Global warming may also lead to desertification reducing precipitation even further from already low rates in those affected parts of the world (1).
- Other human activity such as dam building will have a clear role in disrupting the discharge of a river, creating flooded river valleys as human-made lakes form (1).
- Effects of urbanisation mean there is less infiltration due to impermeable surfaces (1).
Max 3 for only one factor. Max 1 for a list of factors without any development. The notes for answers are not exhaustive. Credit any valid points.`
    },
    level: 'A-Level'
  },
  {
    id: 'q-2024-p1-01-2',
    examYear: 2024,
    questionNumber: '01.2',
    unit: 'Water and Carbon Cycles',
    title: 'Analysis of Lake and River Temperatures',
    prompt: 'Analyse the data shown in Figure 1a and Figure 1b.',
    marks: 6,
    ao: { ao1: 0, ao2: 0, ao3: 6 },
    figures: [
        { name: 'Figure 1a: Change in lake and river surface water temperature by global distribution between 1970 and 2010', url: 'https://storage.googleapis.com/aqa-geography-stimulus-figures/2024-p1-fig1a.png' },
        { name: 'Figure 1b: Change in lake and surface water temperature by latitude between 1970 and 2010', url: 'https://storage.googleapis.com/aqa-geography-stimulus-figures/2024-p1-fig1b.png' }
    ],
    caseStudy: {
      title: 'Stimulus: Figures 1a and 1b',
      content: "Figure 1a shows a world map of temperature changes. Figure 1b shows a scatter plot of temperature changes by latitude."
    },
    markScheme: {
      title: 'AQA Mark Scheme: Notes for answers (AO3)',
      content: `Level 2 (4–6 marks): AO3 - Clear analysis of the quantitative evidence provided, which makes appropriate use of data in support. Clear connection(s) between different aspects of the data and evidence.
Level 1 (1–3 marks): AO3 – Basic analysis of the quantitative evidence provided, which makes limited use of data and evidence in support. Basic connection(s) between different aspects of the data and evidence.
Indicative Content:
- Between 40–60° north there appears to be a substantial increase in temperature with extremes approaching perhaps 1.25 °C increase.
- Equally there is a significant anomaly in the data at around 45º north with a 0.75 °C decrease in temperature.
- It is important to note that there are a substantial number of lakes experiencing minimal change across latitudes.
- There appears to be a concentration of lakes experiencing more extreme temperature variation in northern and eastern Europe.
- The data within the dataset is also significant at -0.75 to +1.25 ie a 2 °C variation.
- Data may be affected by number of recording stations across different parts of the globe ie more data in the northern hemisphere almost certainly due to there being more lakes and therefore recording stations.
Credit any other valid analysis.`
    },
    level: 'A-Level'
  },
  {
    id: 'q-2024-p1-01-4',
    examYear: 2024,
    questionNumber: '01.4',
    unit: 'Water and Carbon Cycles',
    title: 'Mitigating Climate Change in Tropical Rainforests',
    prompt: 'With reference to a tropical rainforest that you have studied, evaluate attempts to mitigate the impacts of climate change.',
    marks: 20,
    ao: { ao1: 10, ao2: 10, ao3: 0 },
    caseStudy: {
      title: 'Stimulus / Context',
      content: 'No specific stimulus provided. Your answer must be based on a tropical rainforest case study you have studied (e.g., Amazonia, Borneo, Malaysia).'
    },
    markScheme: {
      title: 'AQA Mark Scheme: Notes for answers',
      content: `AO1: Knowledge and understanding of a tropical rainforest case study. Awareness of attempts to mitigate the impact of climate change.
AO2: Application of knowledge and understanding to evaluate measures to mitigate the impact of climate change.
Indicative Content:
- Expect reference to major forested areas such as Amazonia, Borneo, Malaysia or the Congo Basin.
- Most answers will focus on strategies such as reforestation, conservation measures, sustainable farming practices and sustainable development of the rainforest.
- For Amazonia, answers might refer to: Farming co-operatives (e.g., RECA), Conservation strategies (e.g., Central Amazon Conservation Complex), and Reforestation schemes (e.g., Brazil's Paris Agreement target).
- In evaluating success, expect reference to challenges posed by illegal logging and political policy. In Brazil for example, there has been a 50% increase in deforestation as a direct result of government policy.`
    },
    level: 'A-Level'
  },
  // GCSE Example
  {
    id: 'q-gcse-ex-1',
    examYear: 2024,
    questionNumber: '01.3',
    unit: 'The Challenge of Natural Hazards',
    title: 'Effects of Tropical Storms',
    prompt: 'Use a case study to assess the importance of primary and secondary effects of a tropical storm.',
    marks: 9,
    ao: { ao1: 3, ao2: 3, ao3: 3 },
    caseStudy: {
      title: 'Context',
      content: 'Use a case study of your choice (e.g., Typhoon Haiyan).'
    },
    markScheme: {
      title: 'Mark Scheme',
      content: 'Level 3 (7-9 marks): Detailed and specific knowledge of a tropical storm. Assessment of the relative importance of primary and secondary effects is sound.',
    },
    level: 'GCSE'
  }
];

export const MASTER_CASE_STUDIES: CaseStudyMaster[] = [
    { name: 'Amazon Basin/Amazonia', aqaUnitMapping: ['Water and Carbon Cycles'], geographicContext: 'Tropical Rainforest', keyConcepts: ['Stores and transfers', 'rainfall', 'evapotranspiration'], criticalDetailExample: 'Illustrates water and carbon cycles, covering stores, transfers, rainfall, and evapotranspiration.', levels: ['A-Level'] },
    { name: 'Amsterdam', aqaUnitMapping: ['Changing Places'], geographicContext: 'Urban Area (Europe)', keyConcepts: ['Rebranding', 'over-tourism'], criticalDetailExample: 'An example of successful city rebranding and the issue of over-tourism.', levels: ['A-Level'] },
    { name: 'Apple Inc.', aqaUnitMapping: ['Global Systems and Global Governance'], geographicContext: 'Transnational Corporation (TNC)', keyConcepts: ['Global supply chain', 'spatial organisation', 'outsourcing', 'tax practices'], criticalDetailExample: 'A specified TNC case study, with its design hub in Silicon Valley, European HQ in Cork, Ireland, and outsourced manufacturing to Foxconn and Pegatron in China.', levels: ['A-Level'] },
    { name: 'Australian Wildfires (2019/20)', aqaUnitMapping: ['Hazards'], geographicContext: 'Hazard Event', keyConcepts: ['Wildfires', 'hazard response'], criticalDetailExample: 'Used as a contemporary hazard event reference.', levels: ['A-Level'] },
    { name: 'Banana Industry', aqaUnitMapping: ['Global Systems and Global Governance', 'Resource Security'], geographicContext: 'Global Trade', keyConcepts: ['World trade', 'food commodity', 'trade disputes'], criticalDetailExample: 'An example of world trade in a food commodity, involving production countries like Ecuador and trade disputes.', levels: ['A-Level'] },
    { name: 'Bangladesh', aqaUnitMapping: ['Coastal Systems and Landscapes', 'Hazards'], geographicContext: 'LEDC Coastal Environment', keyConcepts: ['Sea level rise', 'coastal vulnerability'], criticalDetailExample: 'Cited in relation to extreme vulnerability to sea level rise and coastal change.', levels: ['A-Level'] },
    { name: 'Bhote Koshi River in Nepal', aqaUnitMapping: ['Hazards'], geographicContext: 'Glacial Environment', keyConcepts: ['Glacial Lake Outburst Flood (GLOF)'], criticalDetailExample: 'Referenced regarding a Glacial Lake Outburst Flood (GLOF) event in August 1995.', levels: ['A-Level'] },
    { name: 'Bosley Minn, Cheshire', aqaUnitMapping: ['Resource Security'], geographicContext: 'UK Rural Area', keyConcepts: ['Renewable energy', 'wind farm'], criticalDetailExample: 'Referenced for assessing the feasibility and impact of a proposed wind farm.', levels: ['A-Level'] },
    { name: 'Bristol', aqaUnitMapping: ['Contemporary Urban Environments', 'Urban Issues and Challenges'], geographicContext: 'Urban Area (UK)', keyConcepts: ['Waste disposal', 'incineration', 'landfill', 'sustainability'], criticalDetailExample: 'An example of an urban area managing waste disposal using contrasting approaches, including incineration and landfill at Avonmouth. (GCSE: Sustainable City)', levels: ['A-Level', 'GCSE'] },
    { name: 'Cheonggyecheon River, Seoul', aqaUnitMapping: ['Contemporary Urban Environments'], geographicContext: 'Urban Regeneration Project (Asia)', keyConcepts: ['River restoration', 'urban rebranding', 'sustainability'], criticalDetailExample: 'A case study of a major river restoration project in a dense urban catchment.', levels: ['A-Level'] },
    { name: 'China', aqaUnitMapping: ['Global Systems and Global Governance', 'Changing Places'], geographicContext: 'Global Superpower', keyConcepts: ['Urban-rural inequalities', 'government controls', 'global manufacturing'], criticalDetailExample: 'Mentioned for urban-rural inequalities and its role as a major global manufacturer with trade flows to Sub-Saharan Africa.', levels: ['A-Level'] },
    { name: 'Colorado Valley', aqaUnitMapping: ['Hazards', 'Resource Security'], geographicContext: 'Arid Environment', keyConcepts: ['Salinisation', 'irrigation'], criticalDetailExample: 'Cited in relation to salinisation caused by irrigation.', levels: ['A-Level'] },
    { name: 'Docklands regeneration, London', aqaUnitMapping: ['Changing Places', 'Contemporary Urban Environments', 'Urban Issues and Challenges'], geographicContext: 'Urban Regeneration', keyConcepts: ['Policy impacts', 'regeneration'], criticalDetailExample: 'Used as an example of policy impacts on places, particularly from the Thatcher government era.', levels: ['A-Level', 'GCSE'] },
    { name: 'Gili Trawangan, Indonesia', aqaUnitMapping: ['Hazards'], geographicContext: 'Tectonic Environment', keyConcepts: ['Seismic hazards', 'subduction'], criticalDetailExample: 'Cited for seismic hazards, situated on an island arc where the Indo-Australian Plate subducts the Eurasian Plate.', levels: ['A-Level'] },
    { name: 'Lathom Solar Farm, West Lancashire', aqaUnitMapping: ['Resource Security'], geographicContext: 'UK Rural Area', keyConcepts: ['Renewable energy', 'solar farm'], criticalDetailExample: 'Referenced for assessing the impact of its construction.', levels: ['A-Level'] },
    { name: 'Lympstone and Toxteth', aqaUnitMapping: ['Changing Places'], geographicContext: 'Contrasting UK Places', keyConcepts: ['Demographic comparison', 'socio-economic comparison'], criticalDetailExample: 'Used as a contrasting place study focused on demographic and socio-economic comparison.', levels: ['A-Level'] },
    { name: 'Manchester’s Northern Quarter', aqaUnitMapping: ['Changing Places', 'Contemporary Urban Environments'], geographicContext: 'Urban Area (UK)', keyConcepts: ['Place identity', 'social economic impacts'], criticalDetailExample: 'Cited as a specific scale for investigating place identity and social economic impacts.', levels: ['A-Level'] },
    { name: 'Medellín, Colombia', aqaUnitMapping: ['Changing Places', 'Contemporary Urban Environments'], geographicContext: 'Urban Regeneration (South America)', keyConcepts: ['Urban regeneration', 'social inequality', 'sustainable transport'], criticalDetailExample: 'A model for urban regeneration and sustainable city planning through investments in infrastructure and education.', levels: ['A-Level'] },
    { name: 'Mumbai', aqaUnitMapping: ['Contemporary Urban Environments', 'Population and the Environment', 'Urban Issues and Challenges'], geographicContext: 'Megacity (LEDC)', keyConcepts: ['Poverty', 'migrant influx', 'slums'], criticalDetailExample: 'Referenced as an urban area showing high poverty levels and a migrant influx.', levels: ['A-Level', 'GCSE'] },
    { name: 'Niger Delta, Nigeria', aqaUnitMapping: ['Resource Security', 'The Changing Economic World'], geographicContext: 'Energy Resource Location', keyConcepts: ['Oil production', 'natural gas', 'resource risk'], criticalDetailExample: 'Implicitly referenced in the context of energy resources where oil and natural gas production faces risks.', levels: ['A-Level', 'GCSE'] },
    { name: 'Pevensey Bay', aqaUnitMapping: ['Coastal Systems and Landscapes'], geographicContext: 'UK Coastal Area', keyConcepts: ['Soft management', 'sustainable coastal defence'], criticalDetailExample: 'Cited as an example of a coastal area using a soft management approach for sustainable defence.', levels: ['A-Level'] },
    { name: 'Philippines (The)', aqaUnitMapping: ['Hazards', 'The Challenge of Natural Hazards'], geographicContext: 'Multi-Hazardous Environment', keyConcepts: ['Typhoons', 'volcanic activity', 'earthquakes'], criticalDetailExample: 'Presented as a multi-hazardous environment, with events like Typhoon Haiyan (2013) and volcanic activity.', levels: ['A-Level', 'GCSE'] },
    { name: 'Port Sunlight, the Wirral', aqaUnitMapping: ['Changing Places'], geographicContext: 'Model Village (UK)', keyConcepts: ['Paternalism', 'place-making', 'heritage'], criticalDetailExample: 'A model garden village shaped by the ideals of one man, William Hesketh Lever, demonstrating \'prosperity-sharing\' and place-making.', levels: ['A-Level'] },
    { name: 'Puerto Rico', aqaUnitMapping: ['Population and the Environment', 'Hazards'], geographicContext: 'Hazard-Affected Area', keyConcepts: ['Out-migration', 'hurricane impact'], criticalDetailExample: 'Referenced regarding out-migration following the devastation caused by Hurricane Maria in 2017.', levels: ['A-Level'] },
    { name: 'Sheffield (Eccleshall, Kelham Island and Neepsend)', aqaUnitMapping: ['Contemporary Urban Environments', 'Changing Places'], geographicContext: 'Urban Areas (UK)', keyConcepts: ['Urban resurgence', 'demographics', 'income'], criticalDetailExample: 'Cited as three specific areas to investigate urban resurgence and its effect on demographics and income.', levels: ['A-Level'] },
    { name: 'Shimla, northern India', aqaUnitMapping: ['Resource Security'], geographicContext: 'Water Resource Location', keyConcepts: ['Water resources'], criticalDetailExample: 'Used as a specified place to study water resources.', levels: ['A-Level'] },
    { name: 'Singapore', aqaUnitMapping: ['Global Systems and Global Governance'], geographicContext: 'Global Hub', keyConcepts: ['Global economy'], criticalDetailExample: 'Mentioned as a country that plays a large part in the global economy.', levels: ['A-Level'] },
    { name: 'Southwold (Suffolk)', aqaUnitMapping: ['Changing Places', 'Coastal Systems and Landscapes'], geographicContext: 'UK Coastal Town', keyConcepts: ['High street change', 'house prices', 'coastal management'], criticalDetailExample: 'Used extensively for human and coastal NEA fieldwork, covering high street change and coastal management.', levels: ['A-Level'] },
    { name: 'St. Michael’s on Wyre', aqaUnitMapping: ['Hazards', 'Water and Carbon Cycles'], geographicContext: 'UK Flood Location', keyConcepts: ['Flooding'], criticalDetailExample: 'Cited in the context of UK flooding.', levels: ['A-Level'] },
    { name: 'Sub-Saharan Africa', aqaUnitMapping: ['Global Systems and Global Governance'], geographicContext: 'Global Region', keyConcepts: ['Trade flows'], criticalDetailExample: 'Referenced for trade flows, particularly with China.', levels: ['A-Level'] },
    { name: 'The Sundarbans, Bangladesh', aqaUnitMapping: ['Coastal Systems and Landscapes'], geographicContext: 'LEDC Coastal Environment', keyConcepts: ['Coastal challenges', 'human responses'], criticalDetailExample: 'Referenced regarding challenges, opportunities, and evaluation of human responses in a coastal environment.', levels: ['A-Level'] },
    { name: 'Tanzania', aqaUnitMapping: ['Population and the Environment'], geographicContext: 'LEDC', keyConcepts: ['Education', 'fertility rates'], criticalDetailExample: 'Referenced for knowledge related to education and fertility rates.', levels: ['A-Level'] },
    { name: 'Torquay (Tormohun ward)', aqaUnitMapping: ['Changing Places'], geographicContext: 'Local Place (UK)', keyConcepts: ['History', 'demographic characteristics'], criticalDetailExample: 'Used as a specific local place study, describing its history and demographic characteristics.', levels: ['A-Level'] },
    { name: 'World Trade Routes', aqaUnitMapping: ['Global Systems and Global Governance', 'Resource Security'], geographicContext: 'Global Chokepoints', keyConcepts: ['Energy resources', 'geopolitical risk', 'piracy'], criticalDetailExample: 'Movement of energy resources subject to risks, referencing the Straits of Hormuz and piracy off Somalia.', levels: ['A-Level'] },
    { name: 'Rio de Janeiro', aqaUnitMapping: ['Urban Issues and Challenges'], geographicContext: 'NEE City (Brazil)', keyConcepts: ['Favelas', 'inequality', 'Olympic legacy'], criticalDetailExample: 'Focus on Rocinha favela improvements and the impact of hosting major sporting events.', levels: ['GCSE'] },
    { name: 'Freiburg', aqaUnitMapping: ['Urban Issues and Challenges'], geographicContext: 'Sustainable City (Germany)', keyConcepts: ['Sustainability', 'green energy', 'waste recycling'], criticalDetailExample: 'Vauban district housing and solar energy initiatives.', levels: ['GCSE'] },
    { name: 'Holderness Coast', aqaUnitMapping: ['Physical Landscapes in the UK'], geographicContext: 'UK Coastline', keyConcepts: ['Erosion', 'management', 'Mappleton'], criticalDetailExample: 'Fastest eroding coastline in Europe, protected by rock groynes at Mappleton.', levels: ['GCSE', 'A-Level'] },
    { name: 'River Tees', aqaUnitMapping: ['Physical Landscapes in the UK'], geographicContext: 'UK River', keyConcepts: ['Landforms', 'High Force waterfall'], criticalDetailExample: 'Formation of High Force waterfall and meanders downstream.', levels: ['GCSE'] },
    { name: 'Nigeria', aqaUnitMapping: ['The Changing Economic World'], geographicContext: 'NEE Country', keyConcepts: ['Development', 'TNCs', 'Aid'], criticalDetailExample: 'Shell Oil in the Niger Delta and the impact of aid on health.', levels: ['GCSE'] },
    { name: 'Thar Desert', aqaUnitMapping: ['The Living World'], geographicContext: 'Hot Desert', keyConcepts: ['Development opportunities', 'challenges'], criticalDetailExample: 'Indira Gandhi Canal providing water for farming.', levels: ['GCSE'] },
];
