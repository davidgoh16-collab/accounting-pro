
import { CaseStudyLocation } from './types';

export const CASE_STUDY_LOCATIONS: CaseStudyLocation[] = [
  // --- A-LEVEL: WATER & CARBON ---
  { name: 'The Amazon Basin', topic: 'Water and Carbon Cycles', geography: 'Physical Geography', lat: -3.4653, lng: -62.2159, details: 'Tropical rainforest. 20% of global river discharge. Carbon sink sequestering 2.4bn tonnes/year. Deforestation impacts water cycle (less evapotranspiration).', citation: 'Mandated Study: Tropical Rainforest', levels: ['A-Level'] },
  { name: 'The River Wyre', topic: 'Water and Carbon Cycles', geography: 'Physical Geography', lat: 53.88, lng: -2.83, details: 'UK River Catchment (Lancashire). Issues of flooding (St Michael\'s). Flood management schemes (embankments, storage basins).', citation: 'Mandated Study: River Catchment', levels: ['A-Level'] },
  { name: 'The River Eden', topic: 'Water and Carbon Cycles', geography: 'Physical Geography', lat: 54.89, lng: -2.93, details: 'Cumbria (UK). Flashy hydrograph due to relief and geology (impermeable igneous rock). Storm Desmond (2015) impacts.', citation: 'River Catchment', levels: ['A-Level'] },
  { name: 'The Yukon River', topic: 'Water and Carbon Cycles', geography: 'Physical Geography', lat: 64.0, lng: -150.0, details: 'Tundra/Permafrost catchment. Climate change causing permafrost thaw, altering river regimes and releasing methane.', citation: 'Catchment Change', levels: ['A-Level'] },
  { name: 'Indonesia Peatlands', topic: 'Water and Carbon Cycles', geography: 'Physical Geography', lat: -0.7893, lng: 113.9213, details: 'Massive carbon store. Threats from drainage for palm oil. Peat fires release huge CO2 (2015 fires exceeded US daily emissions).', citation: 'Carbon Store', levels: ['A-Level'] },
  { name: 'Colorado River', topic: 'Water and Carbon Cycles', geography: 'Physical Geography', lat: 36.0, lng: -113.0, details: 'Human interference in water cycle. Hoover Dam/Lake Mead. Over-allocation causing delta to dry up.', citation: 'Water Management', levels: ['A-Level'] },

  // --- A-LEVEL: COASTS ---
  { name: 'The Sundarbans, Bangladesh', topic: 'Coastal Systems and Landscapes', geography: 'Physical Geography', lat: 21.94, lng: 89.18, details: 'Largest mangrove forest. Coastal challenges: Cyclones, sea-level rise, salinity. Resilience strategies: Mangrove planting, salt-tolerant rice.', citation: 'LEDC Coastal Environment', levels: ['A-Level'] },
  { name: 'Pevensey Bay', topic: 'Coastal Systems and Landscapes', geography: 'Physical Geography', lat: 50.81, lng: 0.35, details: 'UK Coast. Soft engineering (beach replenishment, reprofiling) used to protect 10,000 properties. Sustainable management.', citation: 'UK Coastal Management', levels: ['A-Level'] },
  { name: 'Odisha Coast, India', topic: 'Coastal Systems and Landscapes', geography: 'Physical Geography', lat: 20.29, lng: 85.82, details: 'Integrated Coastal Zone Management (ICZM). Issues: Cyclones, erosion. Stakeholders: Government, Greenpeace, local fishers.', citation: 'Case study of coastal management', levels: ['A-Level'] },
  { name: 'Holderness Coast', topic: 'Coastal Systems and Landscapes', geography: 'Physical Geography', lat: 53.8, lng: -0.1, details: 'Fastest eroding coastline in Europe. Geology: Boulder Clay. Flamborough Head (Chalk). Management at Mappleton and Hornsea.', citation: 'High Energy Coast', levels: ['A-Level'] },
  { name: 'Sefton Coast', topic: 'Coastal Systems and Landscapes', geography: 'Physical Geography', lat: 53.6, lng: -3.05, details: 'Largest sand dune system in England. Management of dunes (planting marram grass, boardwalks) for conservation and tourism.', citation: 'Sand Dune System', levels: ['A-Level'] },
  { name: 'Nile Delta', topic: 'Coastal Systems and Landscapes', geography: 'Physical Geography', lat: 31.0, lng: 31.0, details: 'Low energy coastal environment. Sediment deposition exceeding erosion. Impact of Aswan High Dam reducing sediment supply.', citation: 'Low Energy Coast', levels: ['A-Level'] },
  { name: 'Happisburgh', topic: 'Coastal Systems and Landscapes', geography: 'Physical Geography', lat: 52.82, lng: 1.53, details: 'North Norfolk. "Do Nothing" policy. Rapid erosion of soft cliffs. Loss of homes and property value.', citation: 'Management Conflict', levels: ['A-Level'] },
  { name: 'Kiribati', topic: 'Coastal Systems and Landscapes', geography: 'Physical Geography', lat: 1.83, lng: -157.37, details: 'Eustatic sea level rise threat. Climate refugees. "Migration with Dignity" policy.', citation: 'Sea Level Rise', levels: ['A-Level'] },

  // --- A-LEVEL: HAZARDS ---
  { name: 'Gili Trawangan (Tectonics)', topic: 'Hazards', geography: 'Physical Geography', lat: -8.35, lng: 116.04, details: 'Tectonic hazard setting. Near subduction zone (Indo-Australian under Eurasian). 2018 Lombok earthquake impacts.', citation: 'Tectonic hazard event', levels: ['A-Level'] },
  { name: 'Alberta Wildfires (2016)', topic: 'Hazards', geography: 'Physical Geography', lat: 56.72, lng: -111.38, details: 'The "Beast". Fort McMurray fire. Causes: El Nino, dry winter. Impacts: 90,000 evacuated, $9bn damage. Management evaluation.', citation: 'Wildfire Case Study', levels: ['A-Level'] },
  { name: 'Haiti Earthquake (2010)', topic: 'Hazards', geography: 'Physical Geography', lat: 18.53, lng: -72.33, details: 'Multi-hazard zone. 7.0 Magnitude. 220,000 deaths. Vulnerability: Poverty, poor building codes, cholera outbreak.', citation: 'Seismic event in LIC', levels: ['A-Level'] },
  { name: 'Christchurch Earthquake (2011)', topic: 'Hazards', geography: 'Physical Geography', lat: -43.53, lng: 172.63, details: '6.3 Magnitude. 185 deaths. Liquefaction major issue. Strong governance and insurance response.', citation: 'Seismic event in HIC', levels: ['A-Level'] },
  { name: 'Tohoku Earthquake (2011)', topic: 'Hazards', geography: 'Physical Geography', lat: 38.3, lng: 142.4, details: 'Magnitude 9.0. Tsunami triggered Fukushima nuclear disaster. Illustrates limits of high-tech defences.', citation: 'Multi-Hazard Event', levels: ['A-Level'] },
  { name: 'Eyjafjallajökull (2010)', topic: 'Hazards', geography: 'Physical Geography', lat: 63.63, lng: -19.62, details: 'Icelandic Eruption. Ash cloud grounded European flights. Global economic impact vs local benefits (tourism).', citation: 'Volcanic Event', levels: ['A-Level'] },
  { name: 'Montserrat (1995-)', topic: 'Hazards', geography: 'Physical Geography', lat: 16.74, lng: -62.18, details: 'Soufrière Hills volcano. Long-term eruption. 2/3 of island abandoned. Migration and demographic change.', citation: 'Long-term Volcanic Impact', levels: ['A-Level'] },
  { name: 'Victoria Bushfires (2009)', topic: 'Hazards', geography: 'Physical Geography', lat: -37.8, lng: 145.0, details: 'Black Saturday bushfires. Extreme weather conditions (Indian Ocean Dipole). Policy change ("Leave Early").', citation: 'Wildfire Management', levels: ['A-Level'] },
  { name: 'Hurricane Katrina (2005)', topic: 'Hazards', geography: 'Physical Geography', lat: 29.95, lng: -90.07, details: 'Storm surge overwhelmed levees in New Orleans. Social vulnerability (poverty, race). Governance failure.', citation: 'Storm Hazard HIC', levels: ['A-Level'] },
  { name: 'Typhoon Haiyan (2013)', topic: 'Hazards', geography: 'Physical Geography', lat: 11.0, lng: 125.0, details: 'Category 5. Philippines. Tacloban surge. NGO response (Red Cross). Resilience of community.', citation: 'Storm Hazard LIC', levels: ['A-Level'] },

  // --- A-LEVEL: GLOBAL SYSTEMS ---
  { name: 'Antarctica', topic: 'Global Systems and Global Governance', geography: 'Human Geography', lat: -82.86, lng: 135.0, details: 'Global Commons. Antarctic Treaty System (ATS). Threats: Fishing, Whaling, Mining, Tourism, Climate Change.', citation: 'Global Commons Study', levels: ['A-Level'] },
  { name: 'Apple Inc.', topic: 'Global Systems and Global Governance', geography: 'Human Geography', lat: 37.33, lng: -122.03, details: 'TNC case study. HQ in Cupertino. Manufacturing in China (Foxconn). European HQ in Cork (Tax). Spatial organisation.', citation: 'TNC Case Study', levels: ['A-Level'] },
  { name: 'Tata Steel', topic: 'Global Systems and Global Governance', geography: 'Human Geography', lat: 22.8, lng: 86.2, details: 'Indian TNC. Mergers and acquisitions (Corus/Jaguar Land Rover). Reverse colonialism concept.', citation: 'NEE TNC', levels: ['A-Level'] },
  { name: 'Banana Trade', topic: 'Global Systems and Global Governance', geography: 'Human Geography', lat: -1.2, lng: -78.0, details: 'Commodity trade. "Race to the bottom". Power of supermarkets. Trade wars (Lome Convention). Fairtrade growth.', citation: 'Global Trade Pattern', levels: ['A-Level'] },
  { name: 'Coffee Trade', topic: 'Global Systems and Global Governance', geography: 'Human Geography', lat: 4.0, lng: -73.0, details: 'Volatile commodity prices. Role of TNCs (Nestle, Starbucks) vs Fairtrade co-operatives.', citation: 'Global Trade', levels: ['A-Level'] },
  { name: 'United Nations', topic: 'Global Systems and Global Governance', geography: 'Human Geography', lat: 40.75, lng: -73.97, details: 'Global Governance institution. Role in peacekeeping, SDGs, and climate change (IPCC). Successes vs Failures.', citation: 'Global Governance', levels: ['A-Level'] },
  { name: 'Shell in Nigeria', topic: 'Global Systems and Global Governance', geography: 'Human Geography', lat: 4.8, lng: 7.0, details: 'TNC impacts in NEE. Oil spills in Niger Delta. Conflict with Ogoni people. Economic benefits vs environmental cost.', citation: 'TNC Impact', levels: ['A-Level'] },

  // --- A-LEVEL: CHANGING PLACES ---
  { name: 'Detroit, USA', topic: 'Changing Places', geography: 'Human Geography', lat: 42.33, lng: -83.04, details: 'Exogenous factors (Auto industry decline). White flight. "Doughnut effect". Rebranding attempts (Detroit Future City).', citation: 'Far Place / Urban Decline', levels: ['A-Level'] },
  { name: 'Stratford (London)', topic: 'Changing Places', geography: 'Human Geography', lat: 51.54, lng: -0.00, details: 'Regeneration. Rebranding from industrial wasteland to Olympic Park. Gentrification issues. Legacy.', citation: 'Place Rebranding', levels: ['A-Level'] },
  { name: 'Brick Lane', topic: 'Changing Places', geography: 'Human Geography', lat: 51.52, lng: -0.07, details: 'Shifting flows of people (Huguenots, Jewish, Bangladeshi). Gentrification vs Local character. "Banglatown".', citation: 'Local Place / Migration', levels: ['A-Level'] },
  { name: 'Bournville', topic: 'Changing Places', geography: 'Human Geography', lat: 52.43, lng: -1.93, details: 'Place making. Model village built by Cadbury family. Paternalism. Shaping character through design.', citation: 'Local Place Study', levels: ['A-Level'] },
  { name: 'Poundbury', topic: 'Changing Places', geography: 'Human Geography', lat: 50.71, lng: -2.46, details: 'Experimental new town. King Charles III vision. Traditional architecture mixed with modern planning.', citation: 'Placemaking', levels: ['A-Level'] },
  { name: 'Amsterdam', topic: 'Changing Places', geography: 'Human Geography', lat: 52.36, lng: 4.90, details: '"I Amsterdam" rebranding campaign. Successful shift in perception from drugs/red-light to culture/business.', citation: 'Rebranding Success', levels: ['A-Level'] },
  { name: 'Llandudno', topic: 'Changing Places', geography: 'Human Geography', lat: 53.32, lng: -3.83, details: 'Alice in Wonderland rebranding. Use of heritage and literature to boost tourism.', citation: 'Rebranding Strategy', levels: ['A-Level'] },

  // --- A-LEVEL: CONTEMPORARY URBAN ENVIRONMENTS ---
  { name: 'Curitiba, Brazil', topic: 'Contemporary Urban Environments', geography: 'Human Geography', lat: -25.42, lng: -49.26, details: 'Sustainable City. Bus Rapid Transit (BRT). Green Exchange (waste for food). Pedestrianisation.', citation: 'Sustainable Urban Living', levels: ['A-Level'] },
  { name: 'Mumbai', topic: 'Contemporary Urban Environments', geography: 'Human Geography', lat: 19.07, lng: 72.87, details: 'Megacity. Dharavi slum. Issues: Sanitation, water, informal economy. Vision Mumbai redevelopment.', citation: 'Urbanisation in Developing World', levels: ['A-Level'] },
  { name: 'London (Urban Climate)', topic: 'Contemporary Urban Environments', geography: 'Physical Geography', lat: 51.50, lng: -0.12, details: 'Urban Heat Island effect. Air quality management (ULEZ). SUDS implementation.', citation: 'Urban Climate', levels: ['A-Level'] },
  { name: 'Los Angeles', topic: 'Contemporary Urban Environments', geography: 'Human Geography', lat: 34.05, lng: -118.24, details: 'Photochemical Smog. Car-dependent urban sprawl. Donut city effect.', citation: 'Urban Pollution', levels: ['A-Level'] },
  { name: 'Bangalore', topic: 'Contemporary Urban Environments', geography: 'Human Geography', lat: 12.97, lng: 77.59, details: 'India\'s "Silicon Valley". IT cluster growth. Inequality and waste management challenges.', citation: 'World City Growth', levels: ['A-Level'] },
  { name: 'Freiburg, Germany', topic: 'Contemporary Urban Environments', geography: 'Human Geography', lat: 47.99, lng: 7.84, details: 'Solar city. Vauban district (car-free). Sustainable water and waste management.', citation: 'Sustainable City HIC', levels: ['A-Level'] },

  // --- A-LEVEL: POPULATION ---
  { name: 'Japan', topic: 'Population and the Environment', geography: 'Human Geography', lat: 36.2, lng: 138.2, details: 'Aging population. Stage 5 DTM. Shrinking workforce. Solutions: Robotics, pro-natalist policies (Angel Plan).', citation: 'Aging Population', levels: ['A-Level'] },
  { name: 'Uganda', topic: 'Population and the Environment', geography: 'Human Geography', lat: 1.37, lng: 32.29, details: 'Youthful population. High dependency ratio. Pressure on education and jobs. Demographic dividend potential.', citation: 'Youthful Population', levels: ['A-Level'] },
  { name: 'China (One Child Policy)', topic: 'Population and the Environment', geography: 'Human Geography', lat: 35.8, lng: 104.1, details: 'Anti-natalist policy. 400m births prevented. Gender imbalance. 4-2-1 problem.', citation: 'Population Policy', levels: ['A-Level'] },
  { name: 'Kerala, India', topic: 'Population and the Environment', geography: 'Human Geography', lat: 10.85, lng: 76.27, details: 'Success of education (especially women) in lowering fertility rates without coercive policy.', citation: 'Demographic Transition', levels: ['A-Level'] },

  // --- GCSE: HAZARDS ---
  { name: 'L\'Aquila, Italy (2009)', topic: 'The Challenge of Natural Hazards', geography: 'Physical Geography', lat: 42.35, lng: 13.40, details: 'HIC Earthquake. Primary/Secondary effects (308 deaths, heritage sites damaged). Immediate/Long-term responses.', citation: 'Tectonic Hazard in HIC', levels: ['GCSE'] },
  { name: 'Gorkha, Nepal (2015)', topic: 'The Challenge of Natural Hazards', geography: 'Physical Geography', lat: 28.16, lng: 84.72, details: 'LIC Earthquake. 7.8 Mag. 8841 deaths. Avalanche on Everest. Tourism impacted. Aid dependence.', citation: 'Tectonic Hazard in LIC', levels: ['GCSE'] },
  { name: 'Typhoon Haiyan', topic: 'The Challenge of Natural Hazards', geography: 'Physical Geography', lat: 11.0, lng: 125.0, details: 'Super Typhoon (2013). Philippines. Storm surge in Tacloban. 6190 deaths. Primary vs Secondary effects.', citation: 'Tropical Storm', levels: ['GCSE'] },
  { name: 'Cumbria Floods (2009)', topic: 'The Challenge of Natural Hazards', geography: 'Physical Geography', lat: 54.66, lng: -3.36, details: 'Cockermouth. Record rainfall. River Derwent. £100m damage. New flood defences (mobile wall).', citation: 'Extreme Weather in UK', levels: ['GCSE'] },
  { name: 'Beast from the East (2018)', topic: 'The Challenge of Natural Hazards', geography: 'Physical Geography', lat: 51.5, lng: 0.0, details: 'Extreme cold wave in UK. Jet stream anomaly. Impacts on transport and economy.', citation: 'UK Extreme Weather', levels: ['GCSE'] },
  
  // --- GCSE: LIVING WORLD ---
  { name: 'Epping Forest', topic: 'The Living World', geography: 'Physical Geography', lat: 51.66, lng: 0.05, details: 'Deciduous woodland ecosystem in UK. Nutrient cycling, food web, interdependence, sustainable management.', citation: 'UK Ecosystem', levels: ['GCSE'] },
  { name: 'Amazon Rainforest (Brazil)', topic: 'The Living World', geography: 'Physical Geography', lat: -3.46, lng: -62.21, details: 'Tropical Rainforest. Deforestation causes (cattle, soy, logging, mining). Impacts (soil erosion, indigenous tribes). Sustainable management.', citation: 'Tropical Rainforest Case Study', levels: ['GCSE'] },
  { name: 'Western Desert (USA)', topic: 'The Living World', geography: 'Physical Geography', lat: 36.0, lng: -115.0, details: 'Hot Desert (Mojave/Sonoran). Opportunities (mineral extraction, energy, tourism). Challenges (extreme temperatures, water supply).', citation: 'Hot Desert Case Study', levels: ['GCSE'] },
  { name: 'Alaska', topic: 'The Living World', geography: 'Physical Geography', lat: 64.0, lng: -150.0, details: 'Cold Environment. Opportunities (oil, fishing, tourism). Challenges (permafrost, inaccessibility). Trans-Alaskan Pipeline.', citation: 'Cold Environment Case Study', levels: ['GCSE'] },
  { name: 'Thar Desert', topic: 'The Living World', geography: 'Physical Geography', lat: 27.0, lng: 71.0, details: 'Alternative Hot Desert. India/Pakistan. Indira Gandhi Canal for irrigation. Energy (solar/wind).', citation: 'Hot Desert', levels: ['GCSE'] },

  // --- GCSE: PHYSICAL LANDSCAPES ---
  { name: 'Dorset Coast', topic: 'Physical Landscapes in the UK', geography: 'Physical Geography', lat: 50.60, lng: -2.0, details: 'Jurassic Coast. Landforms: Durdle Door (arch), Lulworth Cove, Old Harry Rocks (stacks), Swanage Bay, Chesil Beach.', citation: 'Coastal Landforms', levels: ['GCSE'] },
  { name: 'Medmerry', topic: 'Physical Landscapes in the UK', geography: 'Physical Geography', lat: 50.73, lng: -0.83, details: 'Managed Retreat (West Sussex). Realignment scheme to create saltmarsh buffer. Sustainable defence.', citation: 'Coastal Management Scheme', levels: ['GCSE'] },
  { name: 'River Severn', topic: 'Physical Landscapes in the UK', geography: 'Physical Geography', lat: 52.0, lng: -2.5, details: 'River Landforms. V-shaped valley (upper), Meanders (middle), Levées/Estuary (lower).', citation: 'River Valley', levels: ['GCSE'] },
  { name: 'Jubilee River', topic: 'Physical Landscapes in the UK', geography: 'Physical Geography', lat: 51.50, lng: -0.65, details: 'Flood relief channel for River Thames (Maidenhead/Windsor). Hard engineering. Social/Economic issues.', citation: 'Flood Management Scheme', levels: ['GCSE'] },
  { name: 'Lake District', topic: 'Physical Landscapes in the UK', geography: 'Physical Geography', lat: 54.46, lng: -3.08, details: 'Glacial Landforms. Corries (Red Tarn), Arêtes (Striding Edge), Ribbon Lakes (Windermere). Tourism impacts.', citation: 'Glacial Landscapes', levels: ['GCSE'] },
  { name: 'Isle of Arran', topic: 'Physical Landscapes in the UK', geography: 'Physical Geography', lat: 55.58, lng: -5.15, details: 'Glacial features (Goatfell). Tourism management and conflicts.', citation: 'Glacial Landscape / Tourism', levels: ['GCSE'] },
  { name: 'River Tees', topic: 'Physical Landscapes in the UK', geography: 'Physical Geography', lat: 54.6, lng: -1.2, details: 'River landforms. High Force Waterfall (whinstone intrusion). Meanders near Yarm.', citation: 'River Tees Case Study', levels: ['GCSE'] },

  // --- GCSE: URBAN ISSUES ---
  { name: 'Lagos, Nigeria', topic: 'Urban Issues and Challenges', geography: 'Human Geography', lat: 6.52, lng: 3.37, details: 'NEE City. Rural-urban migration. Squatter settlements (Makoko). Informal economy (Olusosun dump). Urban planning (Floating School).', citation: 'City in NEE', levels: ['GCSE'] },
  { name: 'London', topic: 'Urban Issues and Challenges', geography: 'Human Geography', lat: 51.50, lng: -0.12, details: 'UK Major City. Shoreditch (regeneration/gentrification). Docklands. Crossrail. Urban greening. Stratford (Olympic legacy).', citation: 'City in UK', levels: ['GCSE'] },
  { name: 'East Village (London)', topic: 'Urban Issues and Challenges', geography: 'Human Geography', lat: 51.54, lng: -0.01, details: 'Sustainable urban living. Olympic legacy. Water recycling, green spaces, energy efficiency.', citation: 'Urban Sustainability', levels: ['GCSE'] },
  { name: 'Rio de Janeiro', topic: 'Urban Issues and Challenges', geography: 'Human Geography', lat: -22.9, lng: -43.1, details: 'NEE City alternative. Favelas (Rocinha). Pacification. Cable car transport solution.', citation: 'City in NEE', levels: ['GCSE'] },
  { name: 'Bristol', topic: 'Urban Issues and Challenges', geography: 'Human Geography', lat: 51.45, lng: -2.58, details: 'UK Core City. Urban Greening (European Green Capital). Waste recycling. Temple Quarter regeneration.', citation: 'City in UK', levels: ['GCSE'] },

  // --- GCSE: ECONOMIC WORLD ---
  { name: 'Nigeria', topic: 'The Changing Economic World', geography: 'Human Geography', lat: 9.0, lng: 8.0, details: 'NEE. Economic structure change (oil dependence). TNCs (Shell). Aid. Quality of life improvements.', citation: 'NEE Country Study', levels: ['GCSE'] },
  { name: 'Tunisia', topic: 'The Changing Economic World', geography: 'Human Geography', lat: 33.88, lng: 9.53, details: 'Closing the development gap via Tourism. Multiplier effect. Infrastructure vs dependence.', citation: 'Tourism and Development', levels: ['GCSE'] },
  { name: 'Jamaica', topic: 'The Changing Economic World', geography: 'Human Geography', lat: 18.1, lng: -77.3, details: 'Tourism as a development strategy. Cruise ships vs local economy.', citation: 'Tourism and Development', levels: ['GCSE'] },
  { name: 'Science Parks (UK)', topic: 'The Changing Economic World', geography: 'Human Geography', lat: 52.2, lng: 0.1, details: 'Cambridge Science Park. Post-industrial economy. Links to universities. Hi-tech industry.', citation: 'Economic Change UK', levels: ['GCSE'] },

  // --- GCSE: RESOURCE MANAGEMENT ---
  { name: 'Almería, Spain', topic: 'The Challenge of Resource Management', geography: 'Human Geography', lat: 36.83, lng: -2.46, details: 'Large scale agricultural development. Greenhouses (plastic culture). Hydroponics. Migrant labour.', citation: 'Large Scale Agriculture', levels: ['GCSE'] },
  { name: 'Jamalpur, Bangladesh', topic: 'The Challenge of Resource Management', geography: 'Human Geography', lat: 24.92, lng: 89.94, details: 'Rice-fish culture. Sustainable local food production. Increasing yields and protein.', citation: 'Sustainable Food Production', levels: ['GCSE'] },
  { name: 'Hitosa, Ethiopia', topic: 'The Challenge of Resource Management', geography: 'Human Geography', lat: 8.15, lng: 39.30, details: 'Local water scheme. Gravity-fed system. Community management. Successes and problems.', citation: 'Local Water Scheme', levels: ['GCSE'] },
  { name: 'SNWTP (China)', topic: 'The Challenge of Resource Management', geography: 'Human Geography', lat: 35.0, lng: 114.0, details: 'South-North Water Transfer Project. Large scale engineering. Moving water from surplus to deficit areas.', citation: 'Large Scale Water Transfer', levels: ['GCSE'] },
  { name: 'Micro-hydro, Nepal', topic: 'The Challenge of Resource Management', geography: 'Human Geography', lat: 28.39, lng: 84.12, details: 'Sustainable energy in LIC. Run-of-river. Community owned. Appropriate technology.', citation: 'Sustainable Energy', levels: ['GCSE'] },
  { name: 'Lesotho Highland Water Project', topic: 'The Challenge of Resource Management', geography: 'Human Geography', lat: -29.6, lng: 28.2, details: 'Transferring water from Lesotho to South Africa (Vaal dam). Economic benefits vs displacement.', citation: 'Water Transfer', levels: ['GCSE'] },
  { name: 'Makueni, Kenya', topic: 'The Challenge of Resource Management', geography: 'Human Geography', lat: -1.8, lng: 37.6, details: 'Sand dams. Local sustainable food strategy. Harvesting rainwater in dry season.', citation: 'Food Security Strategy', levels: ['GCSE'] },

  // --- IGCSE: RIVER ENVIRONMENTS ---
  { name: 'The River Tees (IGCSE)', topic: 'River environments', geography: 'Physical Geography', lat: 54.6, lng: -1.2, details: 'Upper Course: High Force waterfall (whinstone intrusion). Middle Course: Meanders near Barnard Castle. Lower Course: Industry near Middlesbrough, Tees Barrage.', citation: 'River Case Study', levels: ['IGCSE'] },

  // --- IGCSE: COASTAL ENVIRONMENTS ---
  { name: 'Miami Beach', topic: 'Coastal environments', geography: 'Physical Geography', lat: 25.79, lng: -80.13, details: 'Coastal management. Beach nourishment (18m cubic meters), seawalls, dunes. Conflicts: Economic vs Environmental costs. Tourism revival.', citation: 'Coastal Management', levels: ['IGCSE'] },
  { name: 'Palisadoes Peninsula', topic: 'Coastal environments', geography: 'Physical Geography', lat: 17.93, lng: -76.78, details: 'Jamaica. Protects Kingston Harbour. Rock revetments, road elevation, boardwalk. Response to Hurricane Ivan/Sandy. Chinese investment (CHEC).', citation: 'Coastal Management', levels: ['IGCSE'] },

  // --- IGCSE: HAZARDOUS ENVIRONMENTS ---
  { name: 'Nepal Earthquake (2015)', topic: 'Hazardous environments', geography: 'Physical Geography', lat: 28.16, lng: 84.72, details: '7.8 Mag. Collision margin (Indo-Australian/Eurasian). 8,600 deaths. Tourism impacts (Everest). Long-term housing issues.', citation: 'Earthquake in LIC', levels: ['IGCSE'] },
  { name: 'Haiti Earthquake (2021)', topic: 'Hazardous environments', geography: 'Physical Geography', lat: 18.35, lng: -73.5, details: '7.2 Mag. 2,250 deaths. Compound hazard (Hurricane Grace). Political instability hindered response. Shelter crisis.', citation: 'Earthquake Case Study', levels: ['IGCSE'] },
  { name: 'Mount Merapi (2010)', topic: 'Hazardous environments', geography: 'Physical Geography', lat: -7.54, lng: 110.44, details: 'Indonesia. Composite volcano. Pyroclastic flows. 353 deaths. 350,000 evacuated. Lahars. Long-term soil fertility benefits.', citation: 'Volcano Case Study', levels: ['IGCSE'] },
  { name: 'Mount Sinabung (2021)', topic: 'Hazardous environments', geography: 'Physical Geography', lat: 3.17, lng: 98.39, details: 'Indonesia. Reawakened 2010. 2021 eruption caused ash fall (2.8km high), respiratory issues. Permanent relocation of villages.', citation: 'Active Volcano', levels: ['IGCSE'] },
  { name: 'Cyclone Komen (2015)', topic: 'Hazardous environments', geography: 'Physical Geography', lat: 21.0, lng: 91.0, details: 'Myanmar/Bangladesh. Monsoon season. 800mm rain. Flooding killed 100+, displaced 1.2m. Poor infrastructure worsened impact.', citation: 'Tropical Cyclone', levels: ['IGCSE'] },
  { name: 'Amatrice Earthquake (2016)', topic: 'Hazardous environments', geography: 'Physical Geography', lat: 42.63, lng: 13.29, details: 'Italy. 6.2 Mag. Shallow focus (5.1km). 299 deaths. Medieval buildings collapsed ("Pancake" failure). "Italian Homes" rebuild initiative.', citation: 'Earthquake in HIC', levels: ['IGCSE'] },
  { name: 'Taiwan Earthquake (2024)', topic: 'Hazardous environments', geography: 'Physical Geography', lat: 23.8, lng: 121.6, details: '7.4 Mag. Hualien. Landslides trapped people in tunnels. Advanced early warning system reduced casualties (17 deaths). Resilience.', citation: 'Earthquake Management', levels: ['IGCSE'] },

  // --- IGCSE: RIVER MANAGEMENT ---
  { name: 'Three Gorges Dam (China)', topic: 'River environments', geography: 'Physical Geography', lat: 30.82, lng: 111.00, details: 'River management. Yangtze River. Largest hydroelectric dam. Flood control, energy (22,500 MW), navigation. Displacement of 1.3m people. Environmental concerns.', citation: 'River Management', levels: ['IGCSE'] },

  // --- IGCSE: COASTAL MANAGEMENT ---
  { name: 'Studland Bay', topic: 'Coastal environments', geography: 'Physical Geography', lat: 50.64, lng: -1.95, details: 'Coastal management. Dorset. Sand dunes. Conflict resolution between tourists, conservation (National Trust), and nudists. Soft engineering.', citation: 'Coastal Management', levels: ['IGCSE'] },
  { name: 'Holderness Coast (IGCSE)', topic: 'Coastal environments', geography: 'Physical Geography', lat: 53.8, lng: -0.1, details: 'Fastest eroding coastline in Europe. Geology: Boulder Clay. Flamborough Head (Chalk). Management at Mappleton and Hornsea.', citation: 'Coastal Erosion', levels: ['IGCSE'] },

  // --- IGCSE: ECONOMIC ACTIVITY ---
  { name: 'Nike in Vietnam', topic: 'Economic activity and energy', geography: 'Human Geography', lat: 10.82, lng: 106.63, details: 'TNC in Emerging Country. Low labour costs. Employment for women. Multiplier effect. Issues: Working conditions, environmental standards.', citation: 'TNC Case Study', levels: ['IGCSE'] },
  { name: 'Iceland (Geothermal)', topic: 'Economic activity and energy', geography: 'Human Geography', lat: 64.14, lng: -21.94, details: 'Energy Management. 100% renewable electricity (Geothermal/Hydro). Sustainable energy use. Hellisheidi Power Station.', citation: 'Sustainable Energy', levels: ['IGCSE'] },

  // --- IGCSE: URBAN ENVIRONMENTS ---
  { name: 'Mumbai (Dharavi)', topic: 'Urban environments', geography: 'Human Geography', lat: 19.07, lng: 72.87, details: 'Urban challenge in Emerging Country. Slum management. Informal economy ($1bn annual turnover). Redevelopment plans vs community needs.', citation: 'Urban Challenge', levels: ['IGCSE'] },
  { name: 'London (Docklands)', topic: 'Urban environments', geography: 'Human Geography', lat: 51.50, lng: -0.02, details: 'Urban regeneration in Developed Country. LDDC. Economic growth (Canary Wharf). Social inequality. Gentrification.', citation: 'Urban Regeneration', levels: ['IGCSE'] },

  // --- IGCSE: RURAL ENVIRONMENTS ---
  { name: 'Kenya (Horticulture)', topic: 'Rural environments', geography: 'Human Geography', lat: -1.29, lng: 36.82, details: 'Rural change in Developing Country. Flower farming for export to Europe. Economic benefits vs Water usage (Lake Naivasha).', citation: 'Rural Change', levels: ['IGCSE'] },
  { name: 'Lake District (Tourism)', topic: 'Rural environments', geography: 'Human Geography', lat: 54.46, lng: -3.08, details: 'Rural challenge in Developed Country. Tourism pressure (traffic, footpath erosion). Honeypot sites. Management strategies.', citation: 'Rural Tourism', levels: ['IGCSE'] },

  // --- IGCSE: FRAGILE ENVIRONMENTS ---
  { name: 'Sahel (Desertification)', topic: 'Fragile environments and climate change', geography: 'Physical Geography', lat: 15.0, lng: 0.0, details: 'Desertification. Causes: Overgrazing, deforestation, climate change. Management: Great Green Wall, stone lines (magic stones).', citation: 'Desertification', levels: ['IGCSE'] },
  { name: 'Amazon Rainforest (Deforestation)', topic: 'Fragile environments and climate change', geography: 'Physical Geography', lat: -3.46, lng: -62.21, details: 'Deforestation causes: Cattle ranching, soy, logging. Impacts: Climate change, biodiversity loss. Sustainable management (ecotourism, reserves).', citation: 'Deforestation', levels: ['IGCSE'] }
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
    'Geographical Applications': '#6366f1', // Added color for Paper 3

    // IGCSE Specific
    'River environments': '#0ea5e9',
    'Coastal environments': '#14b8a6',
    'Hazardous environments': '#ef4444',
    'Economic activity and energy': '#f59e0b',
    'Rural environments': '#84cc16',
    'Urban environments': '#f97316',
    'Fragile environments and climate change': '#10b981',
    'Globalisation and migration': '#8b5cf6',
    'Development and human welfare': '#ec4899'
};

export const GEOGRAPHY_TYPES = ['All', 'Physical Geography', 'Human Geography'];
