import  { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { origins } from './Managment';
import axios from 'axios';
const PlantMap = () => {


  const [activeZone, setActiveZone] = useState(null);
const [zonesData, setZonesData] = useState([]);
  const navigate = useNavigate();

  const goToZones = ({id, name, type}) => {
  navigate('/mainlayout/zone', { 
    state: { id, name, type } 
  });
};
useEffect(() =>  {
 const fetchZones = async () => {
    try {
      const response = await axios.get(`${origins}/api/zones`);
      const data = response.data;
      console.log('Zones récupérées :', data);
      setZonesData(data);
    } catch (error) {
      console.error('Erreur lors de la récupération des zones :', error);
    }         
};
fetchZones();
},[]);
  
  const zonesLocations = {
    'SILO-N': { x: 440, y: 280, w: 90, h: 110 },
    'SILO-S': { x: 440, y: 400, w: 90, h: 110 },
    'CONV-1': { x: 410, y: 390, w: 30, h: 10 },
    'RAFF-SUG': { x: 580, y: 320, w: 100, h: 140 },
    'RAFF-OIL': { x: 580, y: 470, w: 100, h: 120 },
    'THERM': { x: 690, y: 350, w: 60, h: 80 },
    'PACK-S': { x: 700, y: 550, w: 120, h: 90 },
    'PACK-H': { x: 700, y: 650, w: 120, h: 90 },
    'TK-FARM': { x: 550, y: 180, w: 140, h: 80 },
  };

      
const zones2 = zonesData.map(zone => {
  const { x, y, w, h } = zonesLocations[zone.code_zone] || { x: 0, y: 0, w: 50, h: 50 }
  return {
    code_zone: zone.code_zone,
    name: zone.nom_zone,
    id: zone.id,
    x,
    y,
    w,
    h
  };
});


  const zones = [

    // BLOC DE DÉCHARGEMENT (Proche des quais - Bassin du Port)

    { id: 'SILO-N', name: 'Silos Grains Nord', type: 'Stockage', x: 440, y: 280, w: 90, h: 110 },

    { id: 'SILO-S', name: 'Silos Grains Sud', type: 'Stockage', x: 440, y: 400, w: 90, h: 110 },

    { id: 'CONV-1', name: 'Galerie Convoyage', type: 'Logistique', x: 410, y: 390, w: 30, h: 10 },



    // BLOC PROCESS (Le cœur industriel - Centre du terrain)

    { id: 'RAFF-SUG', name: 'Raffinerie Sucre', type: 'Process', x: 580, y: 320, w: 100, h: 140 },

    { id: 'RAFF-OIL', name: 'Raffinerie Huiles', type: 'Process', x: 580, y: 470, w: 100, h: 120 },

    { id: 'THERM', name: 'Centrale Thermique', type: 'Énergie', x: 690, y: 350, w: 60, h: 80 },



    // BLOC CONDITIONNEMENT & EXPÉDITION (Proche de la route nationale)

    { id: 'PACK-S', name: 'Conditionnement Sucre', type: 'Logistique', x: 700, y: 550, w: 120, h: 90 },

    { id: 'PACK-H', name: 'Conditionnement Huiles', type: 'Logistique', x: 700, y: 650, w: 120, h: 90 },

   

    // STOCKAGE BRUT (Partie haute, proche Sonatrach)

    { id: 'TK-FARM', name: 'Parc à Huile Brut', type: 'Storage', x: 550, y: 180, w: 140, h: 80 },

  ];



  return (

    <div className="w-full bg-slate-50 min-h-screen ">

      <main className="max-w-7xl mx-auto relative w-full h-[100vh] bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden">

       

        <svg viewBox="0 0 1000 800" className="w-full h-full" preserveAspectRatio="xMidYMid slice">

          {/* DESSIN DE L'ENVIRONNEMENT (Le Plan de Masse) */}

          <g id="geographic-background">

            {/* Mer et Bassins */}

            <rect x="0" y="0" width="400" height="800" fill="#f0f9ff" /> {/* Bassin du Port */}

            <path d="M400 0 L1000 0 L1000 200 L750 200 L400 300 Z" fill="#f0f9ff" /> {/* Mer Méditerranée */}

           

            {/* Ligne de Quai principale */}

            <path d="M400 800 L400 300 L750 200 L1000 200" fill="none" stroke="#cbd5e1" strokeWidth="4" />



            {/* Jetée / Extension Quai (Celle avec les navires rouges sur ton plan) */}

            <rect x="0" y="320" width="380" height="40" fill="#e2e8f0" stroke="#94a3b8" />

            <text x="20" y="345" className="text-[10px] font-mono fill-slate-500">EXTENSION QUAI S=4HA</text>



            {/* Routes et accès (Route vers Bejaia Ville) */}

            <path d="M850 800 L850 300 L750 200" fill="none" stroke="#f1f5f9" strokeWidth="30" strokeLinecap="square" />

            <path d="M400 700 L900 700" fill="none" stroke="#f1f5f9" strokeWidth="20" />

          </g>



          {/* DESSIN DES BÂTIMENTS DU COMPLEXE */}

          <g id="cevital-buildings">

            {zones2.map((zone) => {

              const isActive = activeZone === zone.code_zone;

              return (

                <g

                  key={zone.code_zone}

                  onMouseEnter={() => setActiveZone(zone.code_zone)}

                  onMouseLeave={() => setActiveZone(null)}

                  className="cursor-pointer"

                >

                  {/* Effet d'ombre / Glow au survol */}

                  <rect

                    x={zone.x - 2} y={zone.y - 2} width={zone.w + 4} height={zone.h + 4}

                    fill={isActive ? "rgba(59, 130, 246, 0.1)" : "transparent"}

                    rx="2"

                  />

                 

                  {/* Bâtiment */}

                  <rect
                  onClick={() => {
                    goToZones({id: zone.id, name: zone.name, code_zone: zone.code_zone});
                  }}

                    x={zone.x} y={zone.y} width={zone.w} height={zone.h}

                    fill={isActive ? "#ffffff" : "#f8fafc"}

                    stroke={isActive ? "#3b82f6" : "#cbd5e1"}

                    strokeWidth={isActive ? "2.5" : "1"}

                    rx="1"

                    className="transition-all duration-200"

                  />



                  {/* Étiquette ID (visible uniquement au survol ou très petite) */}

                  <text

                    x={zone.x + 5} y={zone.y + 12}

                    className={`text-[8px] font-mono ${isActive ? 'fill-blue-600' : 'fill-slate-400'}`}

                  >

                    {zone.id}

                  </text>



                  {/* Nom du bâtiment si actif */}

                  {isActive && (

                    <text

                      x={zone.x + zone.w / 2} y={zone.y + zone.h / 2}

                      textAnchor="middle"

                      className="text-[10px] font-bold fill-slate-800 pointer-events-none"

                    >

                      {zone.name}

                    </text>

                  )}

                </g>

              );

            })}

          </g>

        </svg>



        {/* OVERLAY D'INFORMATIONS TEMPS RÉEL */}

        {activeZone && (

          <div className="absolute top-8 right-8 w-72 bg-white/90 backdrop-blur-md p-5 rounded-2xl border border-blue-100 shadow-2xl animate-in slide-in-from-top-4">

             <div className="flex justify-between items-start mb-4">

                <h3 className="text-lg font-bold text-slate-900">{zones.find(z => z.id === activeZone)?.name}</h3>

                <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded-full font-mono">{activeZone}</span>

             </div>

             <div className="space-y-3">

                <div className="flex justify-between border-b border-slate-100 pb-2">

                    <span className="text-xs text-slate-500 italic">Statut</span>

                    <span className="text-xs font-bold text-emerald-600 uppercase">En Service</span>

                </div>

                <div className="flex justify-between border-b border-slate-100 pb-2">

                    <span className="text-xs text-slate-500 italic">Température</span>

                    <span className="text-xs font-mono text-slate-700">34.2°C</span>

                </div>

                <div className="flex justify-between border-b border-slate-100 pb-2">

                    <span className="text-xs text-slate-500 italic">Capacité</span>

                    <span className="text-xs font-mono text-slate-700">88%</span>

                </div>

             </div>

          </div>

        )}

      </main>

    </div>

  );

};



export default PlantMap;