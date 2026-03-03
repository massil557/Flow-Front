// import { useLocation } from 'react-router-dom';
// import Sensor from '../components/sensor';
// import { useEffect ,useState} from 'react';
// import axios from 'axios';
// import { origins } from './Managment';


// const Zone = () => {

//   const [sensores, setSensores] = useState([]);
//   const [showForm, setShowForm] = useState(false);
//   const [newSensor, setNewSensor] = useState({
//     code_unique: '',
//     type_grandeur: '',
//     unite: '',
//     adresse_ip: ''
//   });

//   const location = useLocation();
//   const data = location.state; 

// useEffect(() => {
//   const fetchSensors = async () => {
//     try {
//       const response = await axios.get(`${origins}/api/sensors/zone/${data?.id}`);
//       setSensores(response.data);
//       console.log('Capteurs récupérés :', sensores);
//     } catch (error) {
//       console.error('Erreur lors de la récupération des capteurs :', error);
//     }
//   }
//   fetchSensors();

// },[data?.id]);

// // creation handler
// const handleCreate = async (e) => {
//   e.preventDefault();
//   try {
//     const payload = {...newSensor, zone_id: data.id};
//     const res = await axios.post(`${origins}/api/sensors`, payload);
//     setSensores(prev => [...prev, res.data]);
//     setShowForm(false);
//     setNewSensor({ code_unique:'', type_grandeur:'', unite:'', adresse_ip:''});
//   } catch (err) {
//     console.error('Erreur création capteur', err);
//   }
// };

//   return (
//     <div>
//       <div className="flex items-center justify-between">
//         <h1 className='text-3xl text-slate-800 mb-[20px]'>Zone {data?.name}</h1>
//         <button
//           className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
//           onClick={() => setShowForm(true)}
//         >Ajouter un capteur</button>
//       </div>

//       {/* formulaire d'ajout */}
//       {showForm && (
//         <form onSubmit={handleCreate} className="mb-6 p-4 bg-white rounded-lg shadow-sm">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <input
//               required
//               placeholder="Code unique"
//               value={newSensor.code_unique}
//               onChange={e => setNewSensor({...newSensor, code_unique: e.target.value})}
//               className="border p-2 rounded w-full"
//             />
//             <input
//               required
//               placeholder="Type de grandeur"
//               value={newSensor.type_grandeur}
//               onChange={e => setNewSensor({...newSensor, type_grandeur: e.target.value})}
//               className="border p-2 rounded w-full"
//             />
//             <input
//               required
//               placeholder="Unité"
//               value={newSensor.unite}
//               onChange={e => setNewSensor({...newSensor, unite: e.target.value})}
//               className="border p-2 rounded w-full"
//             />
//             <input
//               required
//               placeholder="Adresse IP"
//               value={newSensor.adresse_ip}
//               onChange={e => setNewSensor({...newSensor, adresse_ip: e.target.value})}
//               className="border p-2 rounded w-full"
//             />
//           </div>
//           <div className="mt-4 flex gap-2">
//             <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition">
//               Créer
//             </button>
//             <button
//               type="button"
//               className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400 transition"
//               onClick={() => setShowForm(false)}
//             >Annuler</button>
//           </div>
//         </form>
//       )}

//       <div className='w-full h-[300px] overflow-auto'>
//         {/* flex container so individual sensors (200px wide) can sit side‑by‑side */}
//         <div className='flex flex-wrap gap-4'>
//           {sensores.map(sensor => (
//             <Sensor key={sensor.id} sensor={sensor} onToggle={(updated)=>{
//                 setSensores(prev=> prev.map(s=> s.id===updated.id?updated:s));
//             }} />
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };
// export default Zone;

import { useLocation } from 'react-router-dom';
import Sensor from '../components/sensor';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { origins } from './Managment';

const Zone = () => {
  const [sensores, setSensores] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newSensor, setNewSensor] = useState({
    code_unique: '',
    type_grandeur: '',
    unite: '',
    adresse_ip: ''
  });

  const location = useLocation();
  const data = location.state;

  // Listes d'options pour les selects
  const typesOptions = ["Température", "Humidité", "Pression", "Qualité Air"];
  const unitesOptions = ["°C", "%", "bar", "ppm"];

  useEffect(() => {
    const fetchSensors = async () => {
      try {
        const response = await axios.get(`${origins}/api/sensors/zone/${data?.id}`);
        setSensores(response.data);
      } catch (error) {
        console.error('Erreur lors de la récupération des capteurs :', error);
      }
    }
    if (data?.id) fetchSensors();
  }, [data?.id]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...newSensor, zone_id: data.id };
      const res = await axios.post(`${origins}/api/sensors`, payload);
      setSensores(prev => [...prev, res.data]);
      setShowForm(false);
      setNewSensor({ code_unique: '', type_grandeur: '', unite: '', adresse_ip: '' });
    } catch (err) {
      console.error('Erreur création capteur', err);
    }
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className='text-3xl font-bold text-slate-800'>Zone {data?.name}</h1>
        <button
          className="bg-blue-600 text-white px-5 py-2 rounded-xl hover:bg-blue-700 transition shadow-lg font-semibold"
          onClick={() => setShowForm(true)}
        >
          + Ajouter un capteur
        </button>
      </div>

      {/* Formulaire d'ajout */}
      {showForm && (
        <form onSubmit={handleCreate} className="mb-8 p-6 bg-slate-50 border border-slate-200 rounded-2xl shadow-sm animate-in fade-in zoom-in duration-200">
          <h2 className="text-lg font-bold text-slate-700 mb-4">Nouveau Capteur</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <input
              required
              placeholder="Code unique (ex: TEMP_001)"
              value={newSensor.code_unique}
              onChange={e => setNewSensor({ ...newSensor, code_unique: e.target.value })}
              className="border border-slate-300 p-2.5 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none"
            />

            {/* SELECT POUR LE TYPE */}
            <select
              required
              value={newSensor.type_grandeur}
              onChange={e => setNewSensor({ ...newSensor, type_grandeur: e.target.value })}
              className="border border-slate-300 p-2.5 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">-- Choisir le Type --</option>
              {typesOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>

            {/* SELECT POUR L'UNITÉ */}
            <select
              required
              value={newSensor.unite}
              onChange={e => setNewSensor({ ...newSensor, unite: e.target.value })}
              className="border border-slate-300 p-2.5 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">-- Choisir l'Unité --</option>
              {unitesOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>

            <input
              required
              placeholder="Adresse IP (ex: 192.168.1.10)"
              value={newSensor.adresse_ip}
              onChange={e => setNewSensor({ ...newSensor, adresse_ip: e.target.value })}
              className="border border-slate-300 p-2.5 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="mt-6 flex gap-3">
            <button type="submit" className="bg-emerald-500 text-white px-6 py-2 rounded-lg font-bold hover:bg-emerald-600 transition shadow-md">
              Créer le capteur
            </button>
            <button
              type="button"
              className="bg-slate-200 text-slate-600 px-6 py-2 rounded-lg font-bold hover:bg-slate-300 transition"
              onClick={() => setShowForm(false)}
            >
              Annuler
            </button>
          </div>
        </form>
      )}

      <div className='w-full overflow-hidden'>
        <div className='flex flex-wrap gap-6'>
          {sensores.map(sensor => (
            <Sensor 
              key={sensor.id} 
              sensor={sensor} 
              onToggle={(updated) => {
                setSensores(prev => prev.map(s => s.id === updated.id ? updated : s));
              }} 
            />
          ))}
          
          {sensores.length === 0 && (
            <div className="w-full text-center py-20 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl">
              <p className="text-slate-400 font-medium">Aucun capteur dans cette zone. Cliquez sur le bouton en haut pour en ajouter un.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Zone;