
import { CaseStudyLocation } from './types';

export const CASE_STUDY_LOCATIONS: CaseStudyLocation[] = [
  // --- A-LEVEL: WATER & CARBON ---
  { name: 'The Amazon Basin', topic: 'Water and Carbon Cycles', geography: 'Physical Geography', lat: -3.4653, lng: -62.2159, details: 'Tropical rainforest. 20% of global river discharge. Carbon sink sequestering 2.4bn tonnes/year. Deforestation impacts water cycle (less evapotranspiration).', citation: 'Mandated Study: Tropical Rainforest', levels: ['A-Level'] },
  { name: 'The River Wyre', topic: 'Water and Carbon Cycles', geography: 'Physical Geography', lat: 53.88, lng: -2.83, details: 'UK River Catchment (Lancashire). Issues of flooding (St Michael\'s). Flood management schemes (embankments, storage basins).', citation: 'Mandated Study: River Catchment', levels: ['A-Level'] },
  { name: 'The River Eden', topic: 'Water and Carbon Cycles', geography: 'Physical Geography', lat: 54.89, lng: -2.93, details: 'Cumbria (UK). Flashy hydrograph due to relief and geology (impermeable igneous rock). Storm Desmond (2015) impacts.', citation: 'River Catchment', levels: ['A-Level'] },
  { name: 'The Yukon River', topic: 'Water and Carbon Cycles', geography: 'Physical Geography', lat: 64.0, lng: -150.0, details: 'Tundra/Permafrost catchment. Climate change causing permafrost thaw, altering river regimes and releasing methane.', citation: 'Catchment Change', levels: ['A-Level'] },

  // --- A-LEVEL: COASTS ---
  { name: 'The Sundarbans, Bangladesh', topic: 'Coastal Systems and Landscapes', geography: 'Physical Geography', lat: 21.94, lng: 89.18, details: 'Largest mangrove forest. Coastal challenges: Cyclones, sea-level rise, salinity. Resilience strategies: Mangrove planting, salt-tolerant rice.', citation: 'LEDC Coastal Environment', levels: ['A-Level'] },
  { name: 'Pevensey Bay', topic: 'Coastal Systems and Landscapes', geography: 'Physical Geography', lat: 50.81, lng: 0.35, details: 'UK Coast. Soft engineering (beach replenishment, reprofiling) used to protect 10,000 properties. Sustainable management.', citation: 'UK Coastal Management', levels: ['A-Level'] },
  { name: 'Odisha Coast, India', topic: 'Coastal Systems and Landscapes', geography: 'Physical Geography', lat: 20.29, lng: 85.82, details: 'Integrated Coastal Zone Management (ICZM). Issues: Cyclones, erosion. Stakeholders: Government, Greenpeace, local fishers.', citation: 'Case study of coastal management', levels: ['A-Level'] },
  { name: 'Holderness Coast', topic: 'Coastal Systems and Landscapes', geography: 'Physical Geography', lat: 53.8, lng: -0.1, details: 'Fastest eroding coastline in Europe. Geology: Boulder Clay. Flamborough Head (Chalk). Management at Mappleton and Hornsea.', citation: 'High Energy Coast', levels: ['A-Level'] },
  { name: 'Sefton Coast', topic: 'Coastal Systems and Landscapes', geography: 'Physical Geography', lat: 53.6, lng: -3.05, details: 'Largest sand dune system in England. Management of dunes (planting marram grass, boardwalks) for conservation and tourism.', citation: 'Sand Dune System', levels: ['A-Level'] },
  { name: 'Nile Delta', topic: 'Coastal Systems and Landscapes', geography: 'Physical Geography', lat: 31.0, lng: 31.0, details: 'Low energy coastal environment. Sediment deposition exceeding erosion. Impact of Aswan High Dam reducing sediment supply.', citation: 'Low Energy Coast', levels: ['A-Level'] },

  // --- A-LEVEL: HAZARDS ---
  { name: 'Gili Trawangan (Tectonics)', topic: 'Hazards', geography: 'Physical Geography', lat: -8.35, lng: 116.04, details: 'Tectonic hazard setting. Near subduction zone (Indo-Australian under Eurasian). 2018 Lombok earthquake impacts.', citation: 'Tectonic hazard event', levels: ['A-Level'] },
  { name: 'Alberta Wildfires (2016)', topic: 'Hazards', geography: 'Physical Geography', lat: 56.72, lng: -111.38, details: 'The "Beast". Fort McMurray fire. Causes: El Nino, dry winter. Impacts: 90,000 evacuated, $9bn damage. Management evaluation.', citation: 'Wildfire Case Study', levels: ['A-Level'] },
  { name: 'Haiti Earthquake (2010)', topic: 'Hazards', geography: 'Physical Geography', lat: 18.53, lng: -72.33, details: 'Multi-hazard zone. 7.0 Magnitude. 220,000 deaths. Vulnerability: Poverty, poor building codes, cholera outbreak.', citation: 'Seismic event in LIC', levels: ['A-Level'] },
  { name: 'Christchurch Earthquake (2011)', topic: 'Hazards', geography: 'Physical Geography', lat: -43.53, lng: 172.63, details: '6.3 Magnitude. 185 deaths. Liquefaction major issue. Strong governance and insurance response.', citation: 'Seismic event in HIC', levels: ['A-Level'] },
  { name: 'Tohoku Earthquake (2011)', topic: 'Hazards', geography: 'Physical Geography', lat: 38.3, lng: 142.4, details: 'Magnitude 9.0. Tsunami triggered Fukushima nuclear disaster. Illustrates limits of high-tech defences.', citation: 'Multi-Hazard Event', levels: ['A-Level'] },
  { name: 'Eyjafjallajökull (2010)', topic: 'Hazards', geography: 'Physical Geography', lat: 63.63, lng: -19.62, details: 'Icelandic Eruption. Ash cloud grounded European flights. Global economic impact vs local benefits (tourism).', citation: 'Volcanic Event', levels: ['A-Level'] },
  { name: 'Montserrat (1995-)', topic: 'Hazards', geography: 'Physical Geography', lat: 16.74, lng: -62.18, details: 'Soufrière Hills volcano. Long-term eruption. 2/3 of island abandoned. Migration and demographic change.', citation: 'Long-term Volcanic Impact', levels: ['A-Level'] },
  { name: 'Victoria Bushfires (2009)', topic: 'Hazards', geography: 'Physical Geography', lat: -37.8, lng: 145.0, details: 'Black Saturday bushfires. Extreme weather conditions (Indian Ocean Dipole). Policy change ("Leave Early").', citation: 'Wildfire Management', levels: ['A-Level'] },

  // --- A-LEVEL: GLOBAL SYSTEMS ---
  { name: 'Antarctica', topic: 'Global Systems and Global Governance', geography: 'Human Geography', lat: -82.86, lng: 135.0, details: 'Global Commons. Antarctic Treaty System (ATS). Threats: Fishing, Whaling, Mining, Tourism, Climate Change.', citation: 'Global Commons Study', levels: ['A-Level'] },
  { name: 'Apple Inc.', topic: 'Global Systems and Global Governance', geography: 'Human Geography', lat: 37.33, lng: -122.03, details: 'TNC case study. HQ in Cupertino. Manufacturing in China (Foxconn). European HQ in Cork (Tax). Spatial organisation.', citation: 'TNC Case Study', levels: ['A-Level'] },
  { name: 'Tata Steel', topic: 'Global Systems and Global Governance', geography: 'Human Geography', lat: 22.8, lng: 86.2, details: 'Indian TNC. Mergers and acquisitions (Corus/Jaguar Land Rover). Reverse colonialism concept.', citation: 'NEE TNC', levels: ['A-Level'] },
  { name: 'Banana Trade', topic: 'Global Systems and Global Governance', geography: 'Human Geography', lat: -1.2, lng: -78.0, details: 'Commodity trade. "Race to the bottom". Power of supermarkets. Trade wars (Lome Convention). Fairtrade growth.', citation: 'Global Trade Pattern', levels: ['A-Level'] },
  { name: 'Coffee Trade', topic: 'Global Systems and Global Governance', geography: 'Human Geography', lat: 4.0, lng: -73.0, details: 'Volatile commodity prices. Role of TNCs (Nestle, Starbucks) vs Fairtrade co-operatives.', citation: 'Global Trade', levels: ['A-Level'] },
  { name: 'United Nations', topic: 'Global Systems and Global Governance', geography: 'Human Geography', lat: 40.75, lng: -73.97, details: 'Global Governance institution. Role in peacekeeping, SDGs, and climate change (IPCC). Successes vs Failures.', citation: 'Global Governance', levels: ['A-Level'] },

  // --- A-LEVEL: CHANGING PLACES ---
  { name: 'Detroit, USA', topic: 'Changing Places', geography: 'Human Geography', lat: 42.33, lng: -83.04, details: 'Exogenous factors (Auto industry decline). White flight. "Doughnut effect". Rebranding attempts (Detroit Future City).', citation: 'Far Place / Urban Decline', levels: ['A-Level'] },
  { name: 'Stratford (London)', topic: 'Changing Places', geography: 'Human Geography', lat: 51.54, lng: -0.00, details: 'Regeneration. Rebranding from industrial wasteland to Olympic Park. Gentrification issues. Legacy.', citation: 'Place Rebranding', levels: ['A-Level'] },
  { name: 'Brick Lane', topic: 'Changing Places', geography: 'Human Geography', lat: 51.52, lng: -0.07, details: 'Shifting flows of people (Huguenots, Jewish, Bangladeshi). Gentrification vs Local character. "Banglatown".', citation: 'Local Place / Migration', levels: ['A-Level'] },
  { name: 'Bournville', topic: 'Changing Places', geography: 'Human Geography', lat: 52.43, lng: -1.93, details: 'Place making. Model village built by Cadbury family. Paternalism. Shaping character through design.', citation: 'Local Place Study', levels: ['A-Level'] },
  { name: 'Poundbury', topic: 'Changing Places', geography: 'Human Geography', lat: 50.71, lng: -2.46, details: 'Experimental new town. King Charles III vision. Traditional architecture mixed with modern planning.', citation: 'Placemaking', levels: ['A-Level'] },
  { name: 'Amsterdam', topic: 'Changing Places', geography: 'Human Geography', lat: 52.36, lng: 4.90, details: '"I Amsterdam" rebranding campaign. Successful shift in perception from drugs/red-light to culture/business.', citation: 'Rebranding Success', levels: ['A-Level'] },

  // --- A-LEVEL: CONTEMPORARY URBAN ENVIRONMENTS ---
  { name: 'Curitiba, Brazil', topic: 'Contemporary Urban Environments', geography: 'Human Geography', lat: -25.42, lng: -49.26, details: 'Sustainable City. Bus Rapid Transit (BRT). Green Exchange (waste for food). Pedestrianisation.', citation: 'Sustainable Urban Living', levels: ['A-Level'] },
  { name: 'Mumbai', topic: 'Contemporary Urban Environments', geography: 'Human Geography', lat: 19.07, lng: 72.87, details: 'Megacity. Dharavi slum. Issues: Sanitation, water, informal economy. Vision Mumbai redevelopment.', citation: 'Urbanisation in Developing World', levels: ['A-Level'] },
  { name: 'London (Urban Climate)', topic: 'Contemporary Urban Environments', geography: 'Physical Geography', lat: 51.50, lng: -0.12, details: 'Urban Heat Island effect. Air quality management (ULEZ). SUDS implementation.', citation: 'Urban Climate', levels: ['A-Level'] },
  { name: 'Los Angeles', topic: 'Contemporary Urban Environments', geography: 'Human Geography', lat: 34.05, lng: -118.24, details: 'Photochemical Smog. Car-dependent urban sprawl. Donut city effect.', citation: 'Urban Pollution', levels: ['A-Level'] },
  { name: 'Bangalore', topic: 'Contemporary Urban Environments', geography: 'Human Geography', lat: 12.97, lng: 77.59, details: 'India\'s "Silicon Valley". IT cluster growth. Inequality and waste management challenges.', citation: 'World City Growth', levels: ['A-Level'] },

  // --- A-LEVEL: POPULATION ---
  { name: 'Japan', topic: 'Population and the Environment', geography: 'Human Geography', lat: 36.2, lng: 138.2, details: 'Aging population. Stage 5 DTM. Shrinking workforce. Solutions: Robotics, pro-natalist policies (Angel Plan).', citation: 'Aging Population', levels: ['A-Level'] },
  { name: 'Uganda', topic: 'Population and the Environment', geography: 'Human Geography', lat: 1.37, lng: 32.29, details: 'Youthful population. High dependency ratio. Pressure on education and jobs. Demographic dividend potential.', citation: 'Youthful Population', levels: ['A-Level'] },
  { name: 'China (One Child Policy)', topic: 'Population and the Environment', geography: 'Human Geography', lat: 35.8, lng: 104.1, details: 'Anti-natalist policy. 400m births prevented. Gender imbalance. 4-2-1 problem.', citation: 'Population Policy', levels: ['A-Level'] },

  // --- GCSE: HAZARDS ---
  { name: 'L\'Aquila, Italy (2009)', topic: 'The Challenge of Natural Hazards', geography: 'Physical Geography', lat: 42.35, lng: 13.40, details: 'HIC Earthquake. Primary/Secondary effects (308 deaths, heritage sites damaged). Immediate/Long-term responses.', citation: 'Tectonic Hazard in HIC', levels: ['GCSE'] },
  { name: 'Gorkha, Nepal (2015)', topic: 'The Challenge of Natural Hazards', geography: 'Physical Geography', lat: 28.16, lng: 84.72, details: 'LIC Earthquake. 7.8 Mag. 8841 deaths. Avalanche on Everest. Tourism impacted. Aid dependence.', citation: 'Tectonic Hazard in LIC', levels: ['GCSE'] },
  { name: 'Typhoon Haiyan', topic: 'The Challenge of Natural Hazards', geography: 'Physical Geography', lat: 11.0, lng: 125.0, details: 'Super Typhoon (2013). Philippines. Storm surge in Tacloban. 6190 deaths. Primary vs Secondary effects.', citation: 'Tropical Storm', levels: ['GCSE'] },
  { name: 'Cumbria Floods (2009)', topic: 'The Challenge of Natural Hazards', geography: 'Physical Geography', lat: 54.66, lng: -3.36, details: 'Cockermouth. Record rainfall. River Derwent. £100m damage. New flood defences (mobile wall).', citation: 'Extreme Weather in UK', levels: ['GCSE'] },
  
  // --- GCSE: LIVING WORLD ---
  { name: 'Epping Forest', topic: 'The Living World', geography: 'Physical Geography', lat: 51.66, lng: 0.05, details: 'Deciduous woodland ecosystem in UK. Nutrient cycling, food web, interdependence, sustainable management.', citation: 'UK Ecosystem', levels: ['GCSE'] },
  { name: 'Amazon Rainforest (Brazil)', topic: 'The Living World', geography: 'Physical Geography', lat: -3.46, lng: -62.21, details: 'Tropical Rainforest. Deforestation causes (cattle, soy, logging, mining). Impacts (soil erosion, indigenous tribes). Sustainable management.', citation: 'Tropical Rainforest Case Study', levels: ['GCSE'] },
  { name: 'Western Desert (USA)', topic: 'The Living World', geography: 'Physical Geography', lat: 36.0, lng: -115.0, details: 'Hot Desert (Mojave/Sonoran). Opportunities (mineral extraction, energy, tourism). Challenges (extreme temperatures, water supply).', citation: 'Hot Desert Case Study', levels: ['GCSE'] },
  { name: 'Alaska', topic: 'The Living World', geography: 'Physical Geography', lat: 64.0, lng: -150.0, details: 'Cold Environment. Opportunities (oil, fishing, tourism). Challenges (permafrost, inaccessibility). Trans-Alaskan Pipeline.', citation: 'Cold Environment Case Study', levels: ['GCSE'] },

  // --- GCSE: PHYSICAL LANDSCAPES ---
  { name: 'Dorset Coast', topic: 'Physical Landscapes in the UK', geography: 'Physical Geography', lat: 50.60, lng: -2.0, details: 'Jurassic Coast. Landforms: Durdle Door (arch), Lulworth Cove, Old Harry Rocks (stacks), Swanage Bay, Chesil Beach.', citation: 'Coastal Landforms', levels: ['GCSE'] },
  { name: 'Medmerry', topic: 'Physical Landscapes in the UK', geography: 'Physical Geography', lat: 50.73, lng: -0.83, details: 'Managed Retreat (West Sussex). Realignment scheme to create saltmarsh buffer. Sustainable defence.', citation: 'Coastal Management Scheme', levels: ['GCSE'] },
  { name: 'River Severn', topic: 'Physical Landscapes in the UK', geography: 'Physical Geography', lat: 52.0, lng: -2.5, details: 'River Landforms. V-shaped valley (upper), Meanders (middle), Levées/Estuary (lower).', citation: 'River Valley', levels: ['GCSE'] },
  { name: 'Jubilee River', topic: 'Physical Landscapes in the UK', geography: 'Physical Geography', lat: 51.50, lng: -0.65, details: 'Flood relief channel for River Thames (Maidenhead/Windsor). Hard engineering. Social/Economic issues.', citation: 'Flood Management Scheme', levels: ['GCSE'] },
  { name: 'Lake District', topic: 'Physical Landscapes in the UK', geography: 'Physical Geography', lat: 54.46, lng: -3.08, details: 'Glacial Landforms. Corries (Red Tarn), Arêtes (Striding Edge), Ribbon Lakes (Windermere). Tourism impacts.', citation: 'Glacial Landscapes', levels: ['GCSE'] },
  { name: 'Isle of Arran', topic: 'Physical Landscapes in the UK', geography: 'Physical Geography', lat: 55.58, lng: -5.15, details: 'Glacial features (Goatfell). Tourism management and conflicts.', citation: 'Glacial Landscape / Tourism', levels: ['GCSE'] },

  // --- GCSE: URBAN ISSUES ---
  { name: 'Lagos, Nigeria', topic: 'Urban Issues and Challenges', geography: 'Human Geography', lat: 6.52, lng: 3.37, details: 'NEE City. Rural-urban migration. Squatter settlements (Makoko). Informal economy (Olusosun dump). Urban planning (Floating School).', citation: 'City in NEE', levels: ['GCSE'] },
  { name: 'London', topic: 'Urban Issues and Challenges', geography: 'Human Geography', lat: 51.50, lng: -0.12, details: 'UK Major City. Shoreditch (regeneration/gentrification). Docklands. Crossrail. Urban greening. Stratford (Olympic legacy).', citation: 'City in UK', levels: ['GCSE'] },
  { name: 'East Village (London)', topic: 'Urban Issues and Challenges', geography: 'Human Geography', lat: 51.54, lng: -0.01, details: 'Sustainable urban living. Olympic legacy. Water recycling, green spaces, energy efficiency.', citation: 'Urban Sustainability', levels: ['GCSE'] },

  // --- GCSE: ECONOMIC WORLD ---
  { name: 'Nigeria', topic: 'The Changing Economic World', geography: 'Human Geography', lat: 9.0, lng: 8.0, details: 'NEE. Economic structure change (oil dependence). TNCs (Shell). Aid. Quality of life improvements.', citation: 'NEE Country Study', levels: ['GCSE'] },
  { name: 'Tunisia', topic: 'The Changing Economic World', geography: 'Human Geography', lat: 33.88, lng: 9.53, details: 'Closing the development gap via Tourism. Multiplier effect. Infrastructure vs dependence.', citation: 'Tourism and Development', levels: ['GCSE'] },
  { name: 'Almería, Spain', topic: 'The Challenge of Resource Management', geography: 'Human Geography', lat: 36.83, lng: -2.46, details: 'Large scale agricultural development. Greenhouses (plastic culture). Hydroponics. Migrant labour.', citation: 'Large Scale Agriculture', levels: ['GCSE'] },
  { name: 'Jamalpur, Bangladesh', topic: 'The Challenge of Resource Management', geography: 'Human Geography', lat: 24.92, lng: 89.94, details: 'Rice-fish culture. Sustainable local food production. Increasing yields and protein.', citation: 'Sustainable Food Production', levels: ['GCSE'] },
  { name: 'Hitosa, Ethiopia', topic: 'The Challenge of Resource Management', geography: 'Human Geography', lat: 8.15, lng: 39.30, details: 'Local water scheme. Gravity-fed system. Community management. Successes and problems.', citation: 'Local Water Scheme', levels: ['GCSE'] },
  { name: 'SNWTP (China)', topic: 'The Challenge of Resource Management', geography: 'Human Geography', lat: 35.0, lng: 114.0, details: 'South-North Water Transfer Project. Large scale engineering. Moving water from surplus to deficit areas.', citation: 'Large Scale Water Transfer', levels: ['GCSE'] },
  { name: 'Micro-hydro, Nepal', topic: 'The Challenge of Resource Management', geography: 'Human Geography', lat: 28.39, lng: 84.12, details: 'Sustainable energy in LIC. Run-of-river. Community owned. Appropriate technology.', citation: 'Sustainable Energy', levels: ['GCSE'] }
];

export const TOPIC_COLORS: { [key: string]: string } = {
    // Physical
    'Water and Carbon Cycles': '#0ea5e9', 
    'Coastal Systems and Landscapes': '#14b8a6', 
    'Physical Landscapes in the UK': '#14b8a6',
    'The Challenge of Natural Hazards': '#ef4444',
    'Hazards': '#ef4444',
    'The Living World': '#84cc16',
    'Ecosystems Under Stress': '#84cc16',
    'Population and the Environment': '#10b981',
    
    // Human
    'Global Systems and Global Governance': '#a855f7',
    'Changing Places': '#ec4899',
    'Contemporary Urban Environments': '#f59e0b',
    'Urban Issues and Challenges': '#f59e0b',
    'The Changing Economic World': '#a855f7',
    'The Challenge of Resource Management': '#3b82f6',
    'Resource Security': '#3b82f6',
    'Geographical Applications': '#6366f1' // Added color for Paper 3
};

export const GEOGRAPHY_TYPES = ['All', 'Physical Geography', 'Human Geography'];
