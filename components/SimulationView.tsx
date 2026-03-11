import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowUp, ArrowDown, Minus, RefreshCcw, Info, X, Trash2, ArrowLeft } from 'lucide-react';
import { AuthUser, Page } from '../types';

const SCENARIOS = {
  oak: {
    id: 'oak',
    name: 'Oak Woodland Ecosystem',
    description: 'A typical UK woodland ecosystem centered around an oak tree.',
    levels: [
      { id: 'top', title: 'Top Predators', species: ['hawks', 'owls'] },
      { id: 'secondary', title: 'Secondary Consumers', species: ['woodpeckers', 'bluebirds', 'spiders'] },
      { id: 'primary', title: 'Primary Consumers', species: ['beetles', 'caterpillars', 'aphids'] },
      { id: 'producers', title: 'Producers', species: ['oak'] }
    ],
    speciesData: {
      oak: { name: 'Common Oak', icon: '🌳', type: 'producer', eats: [] },
      beetles: { name: 'Beetles', icon: '🪲', type: 'primary', eats: ['oak'] },
      caterpillars: { name: 'Moth Caterpillars', icon: '🐛', type: 'primary', eats: ['oak'] },
      aphids: { name: 'Aphids & Capsids', icon: '🐜', type: 'primary', eats: ['oak'] },
      woodpeckers: { name: 'Woodpeckers', icon: '🐦', type: 'secondary', eats: ['beetles'] },
      bluebirds: { name: 'Blue Birds', icon: '🐦‍⬛', type: 'secondary', eats: ['caterpillars', 'spiders', 'beetles'] },
      spiders: { name: 'Spiders', icon: '🕷️', type: 'secondary', eats: ['aphids'] },
      hawks: { name: 'Hawks', icon: '🦅', type: 'top', eats: ['bluebirds', 'woodpeckers'] },
      owls: { name: 'Owls', icon: '🦉', type: 'top', eats: ['woodpeckers', 'bluebirds'] }
    },
    events: [
      {
        id: 'beetle_disease',
        name: 'Beetle Disease Outbreak',
        type: 'Physical',
        description: 'A disease severely reduces the beetle population, as seen in your lesson.',
        effects: { beetles: 'low', woodpeckers: 'low', oak: 'high', owls: 'low' },
        explanations: {
          beetles: 'Disease drastically reduces the population.',
          woodpeckers: 'Decreasing due to loss of main food source (Beetles).',
          oak: 'Increasing slightly due to reduced grazing by Beetles.',
          owls: 'Decreasing due to fewer Woodpeckers available to eat.'
        }
      },
      {
        id: 'deforestation',
        name: 'Woodland Clearance',
        type: 'Human',
        description: 'Humans cut down the oak trees to make way for a new housing estate.',
        effects: { oak: 'extinct', beetles: 'extinct', caterpillars: 'extinct', aphids: 'extinct', woodpeckers: 'extinct', bluebirds: 'extinct', spiders: 'extinct', hawks: 'low', owls: 'low' },
        explanations: {
          oak: 'Cleared by humans for development.',
          beetles: 'Lost their sole habitat and food source.',
          caterpillars: 'Lost their sole habitat and food source.',
          aphids: 'Lost their sole habitat and food source.',
          woodpeckers: 'Locally extinct due to total loss of prey.',
          bluebirds: 'Locally extinct due to total loss of prey.',
          spiders: 'Locally extinct due to total loss of prey.',
          hawks: 'Numbers plummet; forced to migrate to find food.',
          owls: 'Numbers plummet; forced to migrate to find food.'
        }
      }
    ]
  },
  yellowstone: {
    id: 'yellowstone',
    name: 'Yellowstone National Park',
    description: 'A complex ecosystem demonstrating trophic cascades following human intervention.',
    levels: [
      { id: 'top', title: 'Apex Predators & Scavengers', species: ['wolves', 'bears'] },
      { id: 'secondary', title: 'Secondary Consumers', species: ['coyotes', 'foxes'] },
      { id: 'primary', title: 'Primary Consumers', species: ['elk', 'beavers', 'rodents'] },
      { id: 'producers', title: 'Producers', species: ['aspen'] }
    ],
    speciesData: {
      aspen: { name: 'Aspen & Vegetation', icon: '🌲', type: 'producer', eats: [] },
      elk: { name: 'Elk', icon: '🦌', type: 'primary', eats: ['aspen'] },
      beavers: { name: 'Beavers', icon: '🦫', type: 'primary', eats: ['aspen'] },
      rodents: { name: 'Voles & Mice', icon: '🐁', type: 'primary', eats: ['aspen'] },
      coyotes: { name: 'Coyotes', icon: '🦊', type: 'secondary', eats: ['rodents', 'elk'] },
      foxes: { name: 'Birds of Prey', icon: '🦅', type: 'secondary', eats: ['rodents'] },
      wolves: { name: 'Grey Wolves', icon: '🐺', type: 'top', eats: ['elk', 'coyotes'] },
      bears: { name: 'Grizzly Bears', icon: '🐻', type: 'top', eats: ['elk'] }
    },
    events: [
      {
        id: 'wolves_extinct',
        name: 'Wolves Hunted to Extinction',
        type: 'Human',
        description: 'Before 1995, humans hunted wolves to extinction in the park. Elk populations exploded.',
        effects: { wolves: 'extinct', elk: 'high', aspen: 'low', coyotes: 'high', rodents: 'low', beavers: 'low', bears: 'low' },
        explanations: {
          wolves: 'Hunted to extinction by humans.',
          elk: 'Exploded in numbers without their main predator.',
          aspen: 'Overgrazed by the massive elk population.',
          coyotes: 'Increased rapidly without competition from wolves.',
          rodents: 'Decreased due to overhunting by coyotes and less vegetation.',
          beavers: 'Decreased heavily due to lack of Aspen for food/dams.',
          bears: 'Suffered from less berries (vegetation loss) and no wolf kills to scavenge.'
        }
      },
      {
        id: 'reintroduce_wolves',
        name: 'Reintroduce Grey Wolves',
        type: 'Human',
        description: 'In 1995, wolves were reintroduced. They hunted elk and changed the ecosystem balance.',
        effects: { wolves: 'high', elk: 'low', aspen: 'high', coyotes: 'low', rodents: 'high', beavers: 'high', bears: 'high' },
        explanations: {
          wolves: 'Reintroduced to the park by conservationists.',
          elk: 'Numbers controlled and behaviour changed due to wolf predation.',
          aspen: 'Regenerated rapidly as elk grazing pressure decreased.',
          coyotes: 'Numbers reduced due to direct competition with wolves.',
          rodents: 'Recovered as coyote numbers dropped and vegetation grew.',
          beavers: 'Thrived as Aspen and Willow trees returned to the riverbanks.',
          bears: 'Increased due to more berries and scavenging abandoned wolf kills.'
        }
      }
    ]
  }
};

const EcosystemBalanceSimulator: React.FC = () => {
  const [activeScenarioId, setActiveScenarioId] = useState<keyof typeof SCENARIOS>('oak');
  const [populations, setPopulations] = useState<Record<string, string>>({});
  const [explanations, setExplanations] = useState<Record<string, string>>({});
  const [activeEvent, setActiveEvent] = useState<{name: string, type?: string, description?: string} | null>(null);
  const [lines, setLines] = useState<{id: string, x1: number, y1: number, x2: number, y2: number}[]>([]);

  const containerRef = useRef<HTMLDivElement>(null);
  const currentScenario = SCENARIOS[activeScenarioId];

  // Reset populations when switching scenarios
  useEffect(() => {
    resetSimulation();
  }, [activeScenarioId]);

  // Update lines on resize or state change
  const updateLines = useCallback(() => {
    if (!containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const newLines: any[] = [];

    Object.keys(currentScenario.speciesData).forEach(predatorId => {
      const predator = currentScenario.speciesData[predatorId as keyof typeof currentScenario.speciesData];
      predator.eats.forEach((preyId: string) => {
        const predatorEl = document.getElementById(`node-${predatorId}`);
        const preyEl = document.getElementById(`node-${preyId}`);

        if (predatorEl && preyEl) {
          const pRect = predatorEl.getBoundingClientRect();
          const prRect = preyEl.getBoundingClientRect();

          // Draw from top of prey to bottom of predator
          const x1 = prRect.left - containerRect.left + prRect.width / 2;
          const y1 = prRect.top - containerRect.top;
          const x2 = pRect.left - containerRect.left + pRect.width / 2;
          const y2 = pRect.bottom - containerRect.bottom + containerRect.height;

          newLines.push({ id: `${preyId}-${predatorId}`, x1, y1, x2, y2 });
        }
      });
    });
    setLines(newLines);
  }, [currentScenario]);

  useEffect(() => {
    // Timeout ensures DOM elements are fully rendered before calculating coordinates
    const timer = setTimeout(updateLines, 100);
    window.addEventListener('resize', updateLines);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateLines);
    };
  }, [activeScenarioId, populations, updateLines]);

  const resetSimulation = () => {
    const initialPopulations: Record<string, string> = {};
    Object.keys(currentScenario.speciesData).forEach(key => {
      initialPopulations[key] = 'normal';
    });
    setPopulations(initialPopulations);
    setExplanations({});
    setActiveEvent(null);
  };

  const applyEvent = (event: any) => {
    setActiveEvent(event);
    const newPopulations: Record<string, string> = {};
    const newExplanations: Record<string, string> = {};

    Object.keys(currentScenario.speciesData).forEach(key => {
      newPopulations[key] = 'normal';
    });

    Object.keys(event.effects).forEach(speciesId => {
      newPopulations[speciesId] = event.effects[speciesId];
      if (event.explanations && event.explanations[speciesId]) {
        newExplanations[speciesId] = event.explanations[speciesId];
      }
    });

    setPopulations(newPopulations);
    setExplanations(newExplanations);
  };

  const handleManualRemoval = (removedId: string) => {
    setActiveEvent({ name: 'Manual Species Removal' });
    const newPopulations = { ...populations };
    const newExplanations = { ...explanations };

    // Reset any previous manual removals if we want a fresh cascade,
    // or we can build upon the current state. Let's build upon it.
    newPopulations[removedId] = 'extinct';
    newExplanations[removedId] = 'Manually removed from the ecosystem.';

    const species = currentScenario.speciesData as any;

    // Cascade Level 1: What happens directly?
    Object.keys(species).forEach(sId => {
      if (sId === removedId) return;

      // 1. If it eats the removed species (Predator loses prey)
      if (species[sId].eats.includes(removedId)) {
        newPopulations[sId] = 'low';
        newExplanations[sId] = `Decreasing due to loss of prey (${species[removedId].name}).`;
      }

      // 2. If it is eaten by the removed species (Prey loses predator)
      if (species[removedId].eats.includes(sId)) {
        newPopulations[sId] = 'high';
        newExplanations[sId] = `Increasing rapidly because its predator (${species[removedId].name}) was removed.`;

        // Cascade Level 2: Secondary impacts from prey overpopulation
        Object.keys(species).forEach(s2Id => {
          if (species[sId].eats.includes(s2Id) && newPopulations[s2Id] !== 'extinct') {
            newPopulations[s2Id] = 'low';
            newExplanations[s2Id] = `Decreasing due to overconsumption by increased ${species[sId].name}.`;
          }
        });
      }
    });

    setPopulations(newPopulations);
    setExplanations(newExplanations);
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'high':
        return <div className="flex items-center text-green-700 bg-green-100 px-2 py-1 rounded font-bold"><ArrowUp size={16} className="mr-1" /> Increasing</div>;
      case 'low':
        return <div className="flex items-center text-red-700 bg-red-100 px-2 py-1 rounded font-bold"><ArrowDown size={16} className="mr-1" /> Decreasing</div>;
      case 'extinct':
        return <div className="flex items-center text-slate-700 bg-slate-200 px-2 py-1 rounded font-bold"><X size={16} className="mr-1" /> Extinct</div>;
      default:
        return <div className="flex items-center text-slate-500 bg-slate-50 px-2 py-1 rounded"><Minus size={16} className="mr-1" /> Stable</div>;
    }
  };

  const getLevelColor = (index: number) => {
    const colors = [
      'border-green-300 bg-green-50/50',
      'border-yellow-300 bg-yellow-50/50',
      'border-orange-300 bg-orange-50/50',
      'border-red-300 bg-red-50/50'
    ];
    return colors[3 - index];
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">

      {/* Sidebar */}
      <div className="w-full lg:w-1/3 space-y-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-xl font-bold mb-4 text-slate-800">1. Choose Ecosystem</h2>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => setActiveScenarioId('oak')}
              className={`p-3 text-left rounded-lg transition-colors border-2 ${activeScenarioId === 'oak' ? 'border-blue-500 bg-blue-50' : 'border-transparent bg-slate-100 hover:bg-slate-200'}`}
            >
              <span className="font-semibold block text-slate-900">Oak Woodland</span>
              <span className="text-sm text-slate-600">UK temperate deciduous forest</span>
            </button>
            <button
              onClick={() => setActiveScenarioId('yellowstone')}
              className={`p-3 text-left rounded-lg transition-colors border-2 ${activeScenarioId === 'yellowstone' ? 'border-blue-500 bg-blue-50' : 'border-transparent bg-slate-100 hover:bg-slate-200'}`}
            >
              <span className="font-semibold block text-slate-900">Yellowstone Park</span>
              <span className="text-sm text-slate-600">North American trophic cascade</span>
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-slate-800">2. Trigger Event</h2>
            <button
              onClick={resetSimulation}
              className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
              title="Reset to Stable Balance"
            >
              <RefreshCcw size={20} />
            </button>
          </div>
          <p className="text-sm text-slate-600 mb-4">Select an event or manually remove a species using the red trash icons on the food web.</p>

          <div className="space-y-3">
            {currentScenario.events.map(event => (
              <button
                key={event.id}
                onClick={() => applyEvent(event)}
                className={`w-full p-4 text-left rounded-lg transition-all border ${activeEvent?.name === event.name ? 'border-indigo-500 bg-indigo-50 shadow-md ring-1 ring-indigo-500' : 'border-slate-200 hover:border-indigo-300 hover:shadow'}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-bold text-slate-900">{event.name}</span>
                  <span className={`text-xs px-2 py-1 rounded-full font-semibold ${event.type === 'Human' ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    {event.type}
                  </span>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">{event.description}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Display */}
      <div className="w-full lg:w-2/3">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-full flex flex-col relative min-h-[600px]">

          <div className="mb-6 z-10 relative flex items-start bg-blue-50 p-4 rounded-lg border border-blue-100 text-blue-800 shadow-sm">
            <Info className="mr-3 flex-shrink-0 mt-1" size={20} />
            <div>
              <h3 className="font-bold">{currentScenario.name}</h3>
              <p className="text-sm">{activeEvent ? `Current Event: ${activeEvent.name}` : 'Ecosystem is currently in a stable state. Trigger an event or manually remove a species to disturb the balance.'}</p>
            </div>
          </div>

          {/* Ecosystem Grid with Lines Overlay */}
          <div className="flex-grow relative mt-2 pb-4" ref={containerRef}>

            {/* SVG Lines for Food Web */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" style={{ overflow: 'visible' }}>
              {lines.map(line => {
                // Create a subtle curve for visual appeal
                const midY = (line.y1 + line.y2) / 2;
                const d = `M ${line.x1} ${line.y1} C ${line.x1} ${midY}, ${line.x2} ${midY}, ${line.x2} ${line.y2}`;
                return (
                  <path
                    key={line.id}
                    d={d}
                    fill="none"
                    stroke="#cbd5e1"
                    strokeWidth="3"
                    strokeDasharray="4 4"
                    className="opacity-70"
                  />
                );
              })}
            </svg>

            {/* Trophic Levels */}
            <div className="flex flex-col justify-between space-y-8 relative z-10">
              {currentScenario.levels.map((level, index) => (
                <div key={level.id} className={`p-4 rounded-xl border-2 ${getLevelColor(index)} relative shadow-sm`}>
                  <div className="absolute -top-3 left-4 bg-white px-3 py-0.5 text-xs font-bold uppercase tracking-wider text-slate-600 rounded border border-slate-300 shadow-sm">
                    {level.title}
                  </div>

                  <div className="flex flex-wrap justify-center gap-6 mt-4">
                    {level.species.map(speciesId => {
                      const species = (currentScenario.speciesData as any)[speciesId];
                      const status = populations[speciesId];
                      const explanation = explanations[speciesId];
                      const isExtinct = status === 'extinct';

                      return (
                        <div
                          key={speciesId}
                          id={`node-${speciesId}`}
                          className={`flex flex-col items-center p-3 bg-white rounded-lg shadow-sm border transition-all duration-300 w-44 relative group ${isExtinct ? 'opacity-50 grayscale border-slate-300' : 'border-slate-200 hover:shadow-md hover:border-blue-400'}`}
                        >
                          {/* Manual Removal Button */}
                          {!isExtinct && (
                            <button
                              onClick={() => handleManualRemoval(speciesId)}
                              className="absolute top-2 right-2 p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                              title={`Remove ${species.name} from ecosystem`}
                            >
                              <Trash2 size={16} />
                            </button>
                          )}

                          <div className="text-4xl mb-2 mt-1">{species.icon}</div>
                          <span className="font-bold text-sm text-slate-900 mb-2 leading-tight text-center">{species.name}</span>

                          <div className="w-full flex justify-center text-xs mb-1">
                            {getStatusDisplay(status)}
                          </div>

                          {/* Explanation Tooltip / Text */}
                          {explanation && (
                            <div className="mt-2 text-[11px] leading-tight text-slate-600 bg-slate-50 p-2 rounded border border-slate-100 text-center w-full">
                              <i>{explanation}</i>
                            </div>
                          )}

                          {species.eats.length > 0 && !explanation && (
                            <div className="mt-3 text-[10px] text-slate-400 font-medium text-center uppercase tracking-wide">
                              Eats: {species.eats.map((eatId: string) => (currentScenario.speciesData as any)[eatId].name).join(', ')}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};

interface SimulationViewProps {
  onBack: () => void;
  user: AuthUser;
  simulationId: string;
}

const SimulationView: React.FC<SimulationViewProps> = ({ onBack, user, simulationId }) => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <button
            onClick={onBack}
            className="flex items-center text-slate-600 hover:text-blue-600 font-medium mb-6 transition-colors"
        >
            <ArrowLeft size={20} className="mr-2" /> Back to Hub
        </button>

        <header className="mb-8 text-center md:text-left">
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">Ecosystem Balance Simulator</h1>
          <p className="text-slate-600 text-lg">Visualise how physical forces, human intervention, and species removal disturb food webs.</p>
        </header>

        {simulationId === 'ecosystem_balance' ? (
           <EcosystemBalanceSimulator />
        ) : (
           <div className="p-8 text-center text-slate-500 bg-white rounded-xl shadow-sm border border-slate-200">
               Simulation not found.
           </div>
        )}
      </div>
    </div>
  );
};

export default SimulationView;