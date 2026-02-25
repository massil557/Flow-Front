import { useLocation } from 'react-router-dom';
import Sensor from '../components/sensor';
import { useEffect ,useState} from 'react';
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

useEffect(() => {
  const fetchSensors = async () => {
    try {
      const response = await axios.get(`${origins}/api/sensors/zone/${data?.id}`);
      setSensores(response.data);
      console.log('Capteurs récupérés :', sensores);
    } catch (error) {
      console.error('Erreur lors de la récupération des capteurs :', error);
    }
  }
  fetchSensors();

},[data?.id]);

// creation handler
const handleCreate = async (e) => {
  e.preventDefault();
  try {
    const payload = {...newSensor, zone_id: data.id};
    const res = await axios.post(`${origins}/api/sensors`, payload);
    setSensores(prev => [...prev, res.data]);
    setShowForm(false);
    setNewSensor({ code_unique:'', type_grandeur:'', unite:'', adresse_ip:''});
  } catch (err) {
    console.error('Erreur création capteur', err);
  }
};

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className='text-3xl text-slate-800 mb-[20px]'>Zone {data?.name}</h1>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
          onClick={() => setShowForm(true)}
        >Ajouter un capteur</button>
      </div>

      {/* formulaire d'ajout */}
      {showForm && (
        <form onSubmit={handleCreate} className="mb-6 p-4 bg-white rounded-lg shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              required
              placeholder="Code unique"
              value={newSensor.code_unique}
              onChange={e => setNewSensor({...newSensor, code_unique: e.target.value})}
              className="border p-2 rounded w-full"
            />
            <input
              required
              placeholder="Type de grandeur"
              value={newSensor.type_grandeur}
              onChange={e => setNewSensor({...newSensor, type_grandeur: e.target.value})}
              className="border p-2 rounded w-full"
            />
            <input
              required
              placeholder="Unité"
              value={newSensor.unite}
              onChange={e => setNewSensor({...newSensor, unite: e.target.value})}
              className="border p-2 rounded w-full"
            />
            <input
              required
              placeholder="Adresse IP"
              value={newSensor.adresse_ip}
              onChange={e => setNewSensor({...newSensor, adresse_ip: e.target.value})}
              className="border p-2 rounded w-full"
            />
          </div>
          <div className="mt-4 flex gap-2">
            <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition">
              Créer
            </button>
            <button
              type="button"
              className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400 transition"
              onClick={() => setShowForm(false)}
            >Annuler</button>
          </div>
        </form>
      )}

      <div className='w-full h-[300px] overflow-auto'>
        {/* flex container so individual sensors (200px wide) can sit side‑by‑side */}
        <div className='flex flex-wrap gap-4'>
          {sensores.map(sensor => (
            <Sensor key={sensor.id} sensor={sensor} onToggle={(updated)=>{
                setSensores(prev=> prev.map(s=> s.id===updated.id?updated:s));
            }} />
          ))}
        </div>
      </div>
    </div>
  );
};
export default Zone;