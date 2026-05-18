import { useState, useEffect } from "react";
import {LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";
import { motion } from "framer-motion";
import { Home, LineChart as ChartIcon, Leaf, User, MapPin, Droplet, Sun, CloudRain, Snowflake, Thermometer, Wind, AlertCircle, Plus, LogOut, Trash2 } from "lucide-react";
import BonsaiAvatar from "./BonsaiAvatar";

const API_URL = import.meta.env.VITE_API_URL;

function App() {
  const [city, setCity] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [plants, setPlants] = useState([]);
  const [activeTab, setActiveTab] = useState("home");
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem("bonsaiUserObj");
    return saved ? JSON.parse(saved) : null;
  });
  const [authMode, setAuthMode] = useState("login");
  const [authUsername, setAuthUsername] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [showAddPlant, setShowAddPlant] = useState(false);
  const [newPlantName, setNewPlantName] = useState("");
  const [newPlantSpecies, setNewPlantSpecies] = useState("juniper");
  const [isWatering, setIsWatering] = useState(false);
  
  const [username, setUsername] = useState(
    currentUser?.username || "Jardinero"
  );
  const avatarUrl =  `https://api.dicebear.com/7.x/adventurer/svg?seed=${username}`;

  const speciesConfig = {
    
    juniper: {
      icon: "🌲",
      image: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?q=80&w=400",
      color: "#4CAF50",
      waterEvery: 3,
      heatTolerance: 35,
      coldTolerance: 5,
      difficulty: "Fácil",
      personality: "Calmado y resistente",
    },
    sakura: {
      icon: "🌸",
      image: "https://images.unsplash.com/photo-1527061011665-3652c757a4d4?q=80&w=400",
      color: "#F48FB1",
      waterEvery: 1,
      heatTolerance: 28,
      coldTolerance: 10,
      difficulty: "Difícil",
      personality: "Elegante y delicado"
    },
    maple: {
      icon: "🍁",
      image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=400",
      color: "#FF7043",
      waterEvery: 2,
      heatTolerance: 30,
      coldTolerance: 8,
      difficulty: "Media", 
      personality: "Energético y brillante"
    },
    pine: {
      icon: "🌿",
      image: "https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=400",
      color: "#66BB6A",
      waterEvery: 4,
      heatTolerance: 32,
      coldTolerance: -5,
      difficulty: "Fácil",
      personality: "Fuerte y paciente"
    },
    ficus: {
      icon: "🪴",
      image: "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?q=80&w=400",
      color: "#81C784",
      waterEvery: 2,
      heatTolerance: 38,
      coldTolerance: 15,
      difficulty: "Media",
      personality: "Tropical y amigable"
    }
  };

// Dark Mode 
const [isNight, setIsNight] = useState(
  window.matchMedia("(prefers-color-scheme: dark)").matches
);

useEffect(() =>{
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

  const handleThemeChange = (e) => {
    setIsNight(e.matches);
  };

  mediaQuery.addEventListener( "change", handleThemeChange);

  return () => {
    mediaQuery.removeEventListener("change", handleThemeChange);
  };
}, []);

const cardBackground = isNight
  ? "rgba(20,20,30,0.55)"
  : "rgba(255,255,255,0.72)";

const textPrimary = isNight
  ? "#f5f5f5"
  : "#2d3748";

const textSecondary = isNight
  ? "#d1d5db"
  : "#555";

const inputBackground = isNight
  ? "rgba(255,255,255,0.1)"
  : "rgba(255,255,255,0.7)";


const healthChartData =
  plants[0]?.healthHistory?.map(entry => ({
    date: new Date(entry.date).toLocaleDateString(),
    health: entry.value
  })) || [];

  const fetchData = async () => {
  if(!city.trim()){
    alert("Ingresa una ciudad");
    return;
  }

  try{
    setLoading(true);
    setError(null);

    const response = await fetch(
      `${API_URL}/api/bonsai/care?city=${city}${currentUser ? `&userId=${currentUser._id}` : ""}`
    );

    const result = await response.json();

    if(result.error){
      setError(result.error);
      setData(null);
      return;
    }

    setData(result);
    localStorage.setItem("favoriteCity", city);
  } catch (err){
    setError("Error al obtener datos");
    setData(null);
  } finally {
    setLoading(false);
  }
};

const getLocation = () => {
  if (!navigator.geolocation) {
    alert("Tu navegador no soporta geolocalización");
    return;
  }

  setLoading(true);

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;

      try {
        const response = await fetch(
          `${API_URL}/api/bonsai/care?lat=${lat}&lon=${lon}${currentUser ? `&userId=${currentUser._id}` : ""}`
        );

        const result = await response.json();
        setData(result);
        localStorage.setItem("savedLat", lat);
        localStorage.setItem("savedLon", lon);
        setLoading(false);
      } catch (error) {
        setError("Error obteniendo los datos del clima");
        setLoading(false);
      }
    },
    (error) => {
      console.error("ERROR GEO:", error);
      alert("No pudimos obtener tu ubicación. Verifica tus permisos o intenta escribir una ciudad.");
      setLoading(false);
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    }
  );
};

  const loadPlants = async () => {
    if (!currentUser) return;
  try {
    const res = await fetch(`${API_URL}/api/bonsai/all?userId=${currentUser._id}`);
    const data = await res.json();

    console.log("DATA FROM BACKEND:", data);

    setPlants(data);
  } catch (error) {
    console.error("ERROR LOAD PLANTS:", error);
  }
};

useEffect(() => {
  if (currentUser) {
    loadPlants();
  }
  const savedCity = localStorage.getItem("favoriteCity");
  const savedLat = localStorage.getItem("savedLat");
  const savedLon = localStorage.getItem("savedLon");

  if (savedLat && savedLon) {
    setLoading(true);
    fetch(
      `${API_URL}/api/bonsai/care?lat=${savedLat}&lon=${savedLon}${currentUser ? `&userId=${currentUser._id}` : ""}`
    )
    .then(res => res.json())
    .then(result => {
      setData(result);
      setLoading(false);
    })
    .catch(err => {
      console.error(err);
      setLoading(false);
    });
  } else if(savedCity){
    setCity(savedCity);

    fetch(
      `${API_URL}/api/bonsai/care?city=${savedCity}${currentUser ? `&userId=${currentUser._id}` : ""}`
    )

    .then(res => res.json())
    .then(result => {
      setData(result);
    })
    .catch(err => {
      console.error(err);
    });
  }
}, [currentUser]);

const waterPlant = async (id) => {
  setIsWatering(true);
  try {
    await fetch(`${API_URL}/api/bonsai/water`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ id })
    });

    loadPlants();
    setTimeout(() => setIsWatering(false), 2000);

  } catch (error) {
    console.error(error);
    alert("❌ Error al registrar riego");
    setIsWatering(false);
  }
};

const handleAddPlant = async () => {
  if (!newPlantName.trim()) return alert("Ingresa un nombre");
  try {
    const res = await fetch(`${API_URL}/api/bonsai/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newPlantName, species: newPlantSpecies, userId: currentUser._id })
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    alert("✅ Planta agregada");
    setShowAddPlant(false);
    setNewPlantName("");
    setNewPlantSpecies("juniper");
    loadPlants();
  } catch (e) {
    alert("❌ Error al agregar planta");
  }
};

const handleDeletePlant = async (id) => {
  if (!window.confirm("¿Seguro que quieres eliminar este bonsái?")) return;
  try {
    const res = await fetch(`${API_URL}/api/bonsai/${id}`, {
      method: "DELETE"
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    alert("✅ Bonsái eliminado");
    loadPlants();
  } catch (e) {
    alert("❌ Error al eliminar el bonsái");
  }
};

const quickWater = () => {

  if (plants.length === 0) {
    alert("No hay plantas");
    return;
  }

  let maxNeedsWater = -1;
  let plantsToWater = [];

  plants.forEach(plant => {
    const species = speciesConfig[plant.species] || speciesConfig.juniper;
    const daysSinceWatering = (Date.now() - new Date(plant.lastWatered)) / (1000 * 60 * 60 * 24);
    // Calculate how urgently it needs water (ratio of days passed vs ideal water days)
    const needScore = daysSinceWatering / species.waterEvery;

    // Slight epsilon to group similar scores
    if (needScore > maxNeedsWater + 0.1) {
      maxNeedsWater = needScore;
      plantsToWater = [plant._id];
    } else if (Math.abs(needScore - maxNeedsWater) <= 0.1 && needScore > 0.8) {
      plantsToWater.push(plant._id);
    }
  });

  if (maxNeedsWater < 0.5) {
    alert("Todas tus plantas están bien hidratadas 🌱");
    return;
  }

  setIsWatering(true);
  plantsToWater.forEach(id => waterPlant(id));
};

const calculateStreak = () => {
  if(plants.length === 0) return 0;

  let streak = 0;
  const today = new Date();

  const wateringDates = plants
    .flatMap(plant => plant.wateringHistory || [])
    .map(date => {
      const d = new Date(date);
      return d.toDateString();
    });

  const uniqueDates = [...new Set(wateringDates)];

  for(let i=0; i<30; i++) {
    const checkDate = new Date();
    checkDate.setDate(today.getDate() - i);

    const formatted = checkDate.toDateString();

    if(uniqueDates.includes(formatted)){
      streak++;
    } else {
      break;
    }
  }
  return streak;
};
const streak = calculateStreak();

const totalWaterings = plants.reduce(
  (acc, p) =>
    acc + (p.wateringHistory?.length || 0),
  0
);

const achievements = [
  {
    icon: "🪴",
    title: "Primer jardinero",
    description: "Registra tu primera planta",
    unlocked: plants.length >= 1,
    progress: plants.length,
    goal: 1
  },
  {
    icon: "🔥",
    title: "Racha activa",
    description: "Mantén 3 días seguidos",
    unlocked: streak >= 3,
    progress: streak,
    goal: 3
  },
  {
    icon: "💧",
    title: "Cuidador constante",
    description: "Realiza 5 riegos",
    unlocked: totalWaterings >= 5,
    progress: totalWaterings,
    goal: 5
  },
  {
    icon: "🌟",
    title: "Planta saludable",
    description: "Alcanza 80 de salud",
    unlocked: (data?.health?.score || 0) >= 80,
    progress: data?.health?.score || 0,
    goal: 80
  },
  {
    icon: "🏆",
    title: "Maestro Bonsai",
    description: "Llega a nivel 5",
    unlocked: (data?.level || 1) >= 5,
    progress: data?.level || 1,
    goal: 5
  },
  {
    icon: "👑",
    title: "Leyenda Verde",
    description: "Mantén una planta perfecta",
    unlocked: (data?.health?.score || 0) >= 95,
    progress: data?.health?.score || 0,
    goal: 95
  }
]

let healthColor = "#4CAF50";

if (data?.health?.score < 80) {
  healthColor = "#fbc02d";
}

if (data?.health?.score < 60) {
  healthColor = "#f44336";
}

let weatherDescription = "Clima agradable ☀️";

if (data?.climate?.temperature >= 30) {
  weatherDescription = "Mucho calor hoy 🔥";
}

if (data?.climate?.temperature < 20) {
  weatherDescription = "Temperatura fresca 🌿";
}

if (data?.climate?.temperature < 10) {
  weatherDescription = "Hace frío ❄️";
}

if (data?.climate?.humidity > 75) {
  weatherDescription = "Ambiente húmedo 🌧️";
}

let background = isNight
  ? "linear-gradient(to bottom, #0f172a, #1e293b)"
  : "#f3f4f6";

/* CALOR */
if (!isNight && data?.climate?.temperature > 28) {
  background =
    "linear-gradient(to bottom, #fbc2eb, #fcd34d)";
}

/* HUMEDAD */
if (!isNight && data?.climate?.humidity > 70) {
  background =
    "linear-gradient(to bottom, #74ebd5, #ACB6E5)";
}

/* FRÍO */
if (!isNight && data?.climate?.temperature < 10) {
  background =
    "linear-gradient(to bottom, #cfd9df, #e2ebf0)";
}

const getPlantStatus = (plant) => {
  const daysSinceWatering =
  (Date.now() - new Date(plant.lastWatered)) / (1000 * 60 * 60 * 24);

  let health = "🟢 Salud alta";
  let color = "#c8e6c9";

  if (daysSinceWatering >= 2){
    health = "🟡 Necesita atención";
    color = "#fff9c4";
  }

  if (daysSinceWatering >= 4) {
    health = "🔴 Riesgo de deshidratación";
    color = "#ffcdd2";
  }

  return{
    health,
    color,
    daysSinceWatering: Math.floor(daysSinceWatering)
  };
};

const getPlantMood = (plant) => {

  switch(plant.state){
    case "growing":
      return {
        moodEmoji: "🌱",
        moodMessage: "Estoy creciendo muy bien ✨"
      };

    case "thirsty":
      return {
        moodEmoji: "🥀",
        moodMessage: "Necesito agua pronto..."
      };
    
    case "overwatered":
      return {
        moodEmoji: "💧",
        moodMessage:  "Demasiada agua 😵"
      };

    case "resting":
      return {
        moodEmoji:  "😴",
        moodMessage:  "Estoy descansando tranquilamente"
      };

    case "overwatered":
      return {
        moodEmoji: "🌟",
        moodMessage:  "Me siento perfecta hoy"
      };

    default:
      return{
        moodEmoji: "😊",
        moodMessage: "Todo va bien 🌿"
      };
  }
};

  const handleAuth = async () => {
    try {
      const endpoint = authMode === "login" ? "/api/auth/login" : "/api/auth/register";
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: authUsername, password: authPassword })
      });
      const data = await res.json();
      if (data.error) {
        alert(data.error);
      } else {
        setCurrentUser(data);
        setUsername(data.username);
        localStorage.setItem("bonsaiUserObj", JSON.stringify(data));
      }
    } catch (err) {
      alert("Error de conexión");
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("bonsaiUserObj");
    setPlants([]);
    setData(null);
  };

  if (!currentUser) {
    return (
      <div style={{
        display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh",
        background: isNight ? "#1e293b" : "#f3f4f6", fontFamily: "Arial"
      }}>
        <div style={{
          background: isNight ? "rgba(30,41,59,0.8)" : "white", padding: "40px", borderRadius: "20px",
          boxShadow: "0 10px 25px rgba(0,0,0,0.1)", textAlign: "center", width: "100%", maxWidth: "400px"
        }}>
          <h1 style={{ color: textPrimary, marginBottom: "20px" }}>Bonsai Care 🌱</h1>
          <h2 style={{ color: textSecondary, marginBottom: "30px" }}>
            {authMode === "login" ? "Iniciar Sesión" : "Crear Cuenta"}
          </h2>
          <input type="text" placeholder="Usuario" value={authUsername} onChange={e => setAuthUsername(e.target.value)}
            style={{ width: "90%", padding: "12px", marginBottom: "15px", borderRadius: "10px", border: "1px solid #ccc", background: inputBackground, color: textPrimary }} />
          <input type="password" placeholder="Contraseña" value={authPassword} onChange={e => setAuthPassword(e.target.value)}
            style={{ width: "90%", padding: "12px", marginBottom: "25px", borderRadius: "10px", border: "1px solid #ccc", background: inputBackground, color: textPrimary }} />
          <button onClick={handleAuth} style={{ width: "100%", padding: "14px", borderRadius: "10px", border: "none", background: "#4CAF50", color: "white", fontWeight: "bold", cursor: "pointer", marginBottom: "15px" }}>
            {authMode === "login" ? "Entrar" : "Registrarse"}
          </button>
          <p style={{ color: textSecondary, cursor: "pointer" }} onClick={() => setAuthMode(authMode === "login" ? "register" : "login")}>
            {authMode === "login" ? "¿No tienes cuenta? Regístrate" : "¿Ya tienes cuenta? Inicia sesión"}
          </p>
        </div>
      </div>
    );
  }

  return (
  <div style={{
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    minHeight: "100vh",
    background,
    transition: "all 0.8s ease",
    fontFamily: "Arial",
    padding: "20px 20px 120px 20px"
  }}>
    
    <motion.div 
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      style={{
      background: cardBackground,
      backdropFilter: "blur(18px)",
      WebkitBackdropFilter: "blur(18px)",
      border: "1px solid rgba(255,255,255,0.2)",
      transition: "all 0.5s ease",
      padding: "30px",
      borderRadius: "15px",
      boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
      width: "100%",
      maxWidth: "500px",
      textAlign: "center"
      }}>
      
      <h1 style={{ marginBottom: "20px",
        fontSize: "clamp(32px, 8vw, 55px)",
        color: "white",
        textShadow: "0 4px 15px rgba(0,0,0,0.3)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "12px",
        lineHeight: "1.2"
        }}>
        Bonsai Care <Leaf size={45} color="#4CAF50" />
      </h1>

      <input
        type="text"
        placeholder="Escribe una ciudad"
        value={city}
        onChange={(e) => setCity(e.target.value)}
        style={{
            padding: "12px",
            width: "70%",
            borderRadius: "12px",
            border: "none",
            marginRight: "5px",
            background: inputBackground,
            color: textPrimary,
            backdropFilter: "blur(10px)",
            outline: "none",
            transition: "0.3s ease",
            boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
            opacity: 0.95
        }}/>

      <button
        onClick={fetchData}
        style={{
          fontWeight: "bold",
          boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
          transition: "0.3s",
          padding: "10px 15px",
          borderRadius: "10px",
          border: "none",
          background: "#4CAF50",
          backdropFilter: "blur(10px)",
          color: "white",
          cursor: "pointer"
        }}>
        Consultar
      </button>

      <br /><br />

      <button onClick={getLocation} style={{
          fontWeight: "bold",
          boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
          transition: "0.3s",
          padding: "10px 15px",
          borderRadius: "10px",
          border: "none",
          background: isNight ? "rgba(255,255,255,0.15)" : "#e2e8f0",
          color: textPrimary,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          margin: "0 auto"
      }}>
        <MapPin size={18} /> Usar mi ubicación
      </button>

      {loading && <p>⏳ Cargando clima...</p>}
      {error && <p style={{ color: "red" }}>❌ {error}</p>}

      <br /><br />

      {city && (
        <p style={{
          color: textPrimary,
          marginTop: "-10px",
          marginBottom: "20px"
        }}> 🌿 Bienvenido de nuevo — {username} </p>
      )}

      {activeTab === "home" && (
        <div style={{ marginTop: "20px" }}>
          
          {/* Clima */}
          {data?.climate &&(
          <>
          <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          style={{
            marginTop: "25px",
            marginBottom: "25px",
            padding: "25px",
            borderRadius: "25px",
            background: isNight
            ? "rgba(20,20,30,0.45)"
            : "rgba(255,255,255,0.25)",
            border : isNight
            ? "1px solid rgba(255,255,255,0.08)"
            : "1px solid rgba(255,255,255,0.35)",
            backdropFilter: "blur(12px)",
            boxShadow: isNight
            ? "0 8px 25px rgba(0,0,0,0.35)"
            : "0 8px 20px rgba(0,0,0,0.08)",
            }}>
            <div style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: "10px"
            }}>
              {plants.length > 0 ? (
                <BonsaiAvatar
                  plantStatus={plants.length > 0 ? getPlantStatus(plants[0]) : "perfect"}
                  temperature={data?.climate.temperature || 20}
                  isWatering={isWatering}
                  size={150}
                />
              ) : (
                <div style={{ fontSize: "55px" }}> ☀️ </div>
              )}
            </div>

            <h2 style={{
              margin: 0,
              fontSize: "55px",
              color: textSecondary
            }}> {Math.round(data?.climate.temperature)}° </h2>

            <p style={{
              marginTop: "5px",
              fontSize: "18px",
              color: textSecondary
            }}> {city || "Tu ubicación"} </p>

            <div style={{
              marginTop: "20px",
              display: "flex",
              justifyContent: "space-around"
            }}>

              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <Droplet size={30} color="#4CAF50" style={{ marginBottom: "5px" }} />
                <p style={{margin: 0, fontWeight: "bold"}}>
                  {data?.climate.humidity}%
                </p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <Thermometer size={30} color="#f59e0b" style={{ marginBottom: "5px" }} />
                <p style={{margin: 0, fontWeight: "bold"}}>
                  {weatherDescription}
                </p>
              </div>
            </div>
          </motion.div>
          </>
          )}
        

          {plants.length > 0 ? (
            <>
          {data?.dailyInsight && (
            <div style={{
              marginTop: "20px",
              marginBottom: "20px",
              padding: "20px",
              borderRadius: "20px",
              background: isNight
              ? "rgba(255,255,255,0.08)"
              : "rgba(255,255,255,0.35)",
              backdropFilter: "blur(10px)",
              boxShadow: "0 6px 15px rgba(0,0,0,0.08)"
            }}>
              
              <h3 style={{
                marginTop: 0,
                color: textPrimary
              }}>
                🌟 Insight del día
              </h3>

              <p style={{
                color: textSecondary,
                fontSize: "17px",
                lineHeight: "1.5"
              }}>
                {data?.dailyInsight}
              </p>
              </div>
            )}

          {data?.gardenerTitle && (
          <div style={{
            marginTop: "20px",
            marginBottom: "20px",
            padding: "20px",
            borderRadius: "20px",
            background: isNight
            ? "rgba(255,255,255,0.08)"
            : "rgba(255,255,255,0.35)",
            backdropFilter: "blur(10px)",
            boxShadow: "0 6px 15px rgba(0,0,0,0.08)"
          }}>
            <h2 style={{
              color: textPrimary,
              marginTop: 0
            }}>
              🌟 {data?.gardenerTitle}
            </h2>

            <p style={{
              color: textSecondary,
              fontSize: "18px",
              marginBottom: "15px"
            }}>
              Nivel {data?.level || 1}
            </p>

            <div style={{
              background: isNight
              ? "rgba(255,255,255,0.12)"
              : "#ddd",
              borderRadius: "20px",
              overflow: "hidden",
              height: "20px"
            }}>
              <div style={{
                width: `${((data?.xp || 0) / (data?.nextLevelXP || 100)) * 100}%`,
                background: "#4CAF50",
                height: "100%",
                transition: "1s ease"
              }} />

            </div>

            <p style={{
              marginTop: "10px",
              color: textSecondary
            }}>
              XP: {data?.xp || 0} / {data?.nextLevelXP || 100}
            </p>
          </div>
          )}

          {/* RECOMENDACIONES */}
          {data?.recommendations && (
          <>
          <h2 style={{ marginTop: "20px",
            color: textPrimary
          }}>🌱 Recomendaciones</h2>
          
          <ul style={{ listStyle: "none", padding: 0 }}>
            {data.recommendations.map((rec, i) => {
              let color = isNight
                ? "rgba(255,255,255,0.08)"
                : "#e8f5e9";
              
              if (!isNight && rec.action === "REGAR") color = "#d0f0c0";
              if (!isNight && rec.action === "SACAR") color = "#fff3cd";
              if (!isNight && rec.action === "PROTEGER") color = "#f8d7da";
              
              return (
              <li key={i} style={{
                background: color,
                margin: "8px 0",
                padding: "10px",
                borderRadius: "10px",
                fontWeight: "bold"
                }}>
                  {rec.message}
              </li>
              );
            })}
          </ul>
          </>
          )}

          {/* Health */}
          {data?.health && (
          <>
          <h2 style={{ color: textPrimary }}>🧠 Salud de la planta</h2>
          
          <div style={{ marginTop: "15px" }}>
            
            <div style={{
              background: isNight
              ? "rgba(255,255,255,0.12)"
              : "#ddd",
              borderRadius: "20px",
              overflow: "hidden",
              height: "25px",
              width: "100%"
            }}>
              
              <div style={{
                width: `${data.health.score}%`,
                background: healthColor,
                height: "100%",
                transition: "1s ease",
                borderRadius: "20px"
              }} />
              </div>
              
              <p style={{
                marginTop: "10px",
                fontWeight: "bold",
                fontSize: "20px",
                color: healthColor
              }}>
                {data?.health.score || 0}/100
              </p>
              
              <p>{data?.health.status}</p>
            
          </div>
          </>
          )}
          
          {/* TIMELINE */}
          {data?.timeDecisions && (
          <>
          <h3 style={{ color: textPrimary}}>🕒 Plan del día</h3>
          
          <div style={{
            marginTop: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "15px"
          }}>

            {data.timeDecisions?.map((rec, i) => {

              let icon = "🌤️";
              let bg = "rgba(255,255,255,0.35)";

              if (rec.time === "mañana") {
                icon = "🌅";
                bg = isNight
                  ? "rgba(255,255,255,0.08)"
                  : "rgba(255, 243, 205, 0.7)";
              }

              if (rec.time === "tarde") {
                icon = "☀️";
                bg = isNight
                  ? "rgba(255,255,255,0.08)"
                  : "rgba(255, 243, 205, 0.7)";
              }

              if (rec.time === "noche") {
                icon = "🌙";
                bg = isNight
                  ? "rgba(255,255,255,0.08)"
                  : "rgba(255, 243, 205, 0.7)";
              }

              return (
                <div key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "15px",
                  background: bg,
                  padding: "15px",
                  borderRadius: "18px",
                  boxShadow: "0 6px 15px rgba(0,0,0,0.08)",
                  backdropFilter: "blur(10px)",
                  transition: "0.3s ease"
                }}> 
                
                <div style={{
                  fontSize: "35px"
                }}> {icon}</div>

                <div style={{
                  textAlign: "left"
                }}>
                  <p style={{
                    margin: 0,
                    fontWeight: "bold",
                    fontSize: "18px",
                    color: textPrimary
                  }}> {rec.time.toUpperCase()}</p>

                  <p style={{
                    margin: "5px 0 0 0",
                    color: textSecondary
                  }}> {rec.message}</p>
                
                </div>
                
              </div>
              );
            })}
          </div>
          </>
          )}
          </>
          ) : (
            <div style={{
              marginTop: "30px",
              padding: "30px",
              borderRadius: "20px",
              background: isNight ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.5)",
              border: "1px dashed rgba(76,175,80,0.5)",
              color: textSecondary
            }}>
              <Leaf size={40} color="#4CAF50" style={{ marginBottom: "15px" }} />
              <h3 style={{ margin: "0 0 10px 0", color: textPrimary }}>Aún no hay plantas</h3>
              <p style={{ margin: 0 }}>Ve a la pestaña "Plantas" para registrar tu primer bonsái y comenzar a recibir recomendaciones y planes de riego diarios.</p>
            </div>
          )}

        </div>
      )}

          {activeTab === "stats" && (
            <>
            {plants.length > 0 ? (
              <>
            <div style={{
              marginTop: "30px",
              padding: "20px",
              borderRadius: "20px",
              background: isNight
              ? "rgba(255,255,255,0.08)"
              : "rgba(255,255,255,0.35)",
              backdropFilter: "blur(10px)",
              boxShadow: "0 6px 15px rgba(0,0,0,0.08)"
            }}>

            <h2 style={{
              color: textPrimary,
              marginBottom: "20px"
            }}>
              📈 Evolución de salud
            </h2>
            
            <ResponsiveContainer width="100%" height={250}>
              
              <LineChart data={healthChartData}>

              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              
              <Line
              type="monotone"
              dataKey="health"
              stroke="#4CAF50"
              strokeWidth={4}
              dot={{ r: 5 }}
              />

              </LineChart>

            </ResponsiveContainer>

            </div>
            
            {data?.healthPrediction && (

            <div style={{
              marginTop: "25px",
              padding: "20px",
              borderRadius: "20px",
              background: isNight
              ? "rgba(255,255,255,0.08)"
              : "rgba(255,255,255,0.35)",
              backdropFilter: "blur(10px)",
              boxShadow: "0 6px 15px rgba(0,0,0,0.08)"
            }}>

            <h2 style={{
              color: textPrimary,
              marginTop: 0
            }}>
              🔮 Predicción de salud
            </h2>

            <p style={{
              color: textSecondary,
              fontSize: "17px",
              lineHeight: "1.5"
            }}>
              {data?.healthPrediction}
            </p>

            </div>
          )}
              </>
            ) : (
              <div style={{
                marginTop: "30px",
                padding: "30px",
                borderRadius: "20px",
                background: isNight ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.5)",
                border: "1px dashed rgba(76,175,80,0.5)",
                color: textSecondary
              }}>
                <ChartIcon size={40} color="#4CAF50" style={{ marginBottom: "15px" }} />
                <h3 style={{ margin: "0 0 10px 0", color: textPrimary }}>Sin datos suficientes</h3>
                <p style={{ margin: 0 }}>Registra tu primera planta para ver la evolución de su salud a través del tiempo.</p>
              </div>
            )}
          </>
        )}
          
        {activeTab === "plants" && (
          <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "25px" }}>
            <h3 style={{ margin: 0, color: textPrimary }}>🌿 Mis plantas</h3>
            <button onClick={() => setShowAddPlant(!showAddPlant)} style={{
              background: "#4CAF50", color: "white", border: "none", padding: "8px 15px", borderRadius: "10px", fontWeight: "bold", cursor: "pointer"
            }}>
              {showAddPlant ? "Cancelar" : "+ Agregar"}
            </button>
          </div>

          {showAddPlant && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{
              marginTop: "20px", padding: "20px", borderRadius: "15px", background: cardBackground, border: "1px solid rgba(255,255,255,0.2)"
            }}>
              <h4 style={{ margin: "0 0 15px 0", color: textPrimary }}>Nueva Planta</h4>
              <input type="text" placeholder="Nombre" value={newPlantName} onChange={(e) => setNewPlantName(e.target.value)}
                style={{ width: "90%", padding: "10px", marginBottom: "15px", borderRadius: "8px", border: "none", background: inputBackground, color: textPrimary }} />
              <select value={newPlantSpecies} onChange={(e) => setNewPlantSpecies(e.target.value)}
                style={{ width: "95%", padding: "10px", marginBottom: "15px", borderRadius: "8px", border: "none", background: inputBackground, color: textPrimary }}>
                {Object.keys(speciesConfig).map(key => (
                  <option key={key} value={key} style={{ color: "black" }}>{speciesConfig[key].icon} {key.charAt(0).toUpperCase() + key.slice(1)}</option>
                ))}
              </select>
              <button onClick={handleAddPlant} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "none", background: "#4CAF50", color: "white", fontWeight: "bold", cursor: "pointer" }}>
                Guardar Planta
              </button>
            </motion.div>
          )}
          
          {plants.length === 0 ? (
            <p>No hay plantas registradas 🌱</p>
          ) : (
            plants.map((plant, i) => {

              const status = getPlantStatus(plant);

              const mood = getPlantMood(plant);

              let stateGlow = "0 8px 20px rgba(0,0,0,0.08)";

              /* Perfecta */
              if(plant.state === "perfect") {
                stateGlow = "0 0 25px rgba(76,175,80,0.35)";
              }
              /* Sobre-riego */
              if(plant.state === "overwatered") {
                stateGlow = "0 0 20px rgba(33,150,243,0.25)";
              }
              /* Sedienta */
              if(plant.state === "thirsty") {
                stateGlow =  "0 0 20px rgba(255,152,0,0.25)";
              }

              const species = 
                speciesConfig[plant.species] || 
                speciesConfig.juniper;

              const plantIcon = species.icon;

              return(
                <motion.div
                  key={plant._id}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{
                    scale: 1.02,
                    y: -3
                  }}
                  transition={{
                    duration: 0.5,
                    delay: i * 0.1
                  }}
                  style={{
                  background: isNight
                    ? (plant.state === "perfect"
                        ? "rgba(76,175,80,0.12)"
                        : plant.state === "overwatered"
                          ? "rgba(33,150,243,0.12)"
                          : plant.state === "thirsty"
                            ? "rgba(255,152,0,0.12)"
                            : "rgba(255,255,255,0.08)"
                      )
                    : status.color,
                  padding: "10px",
                  margin: "10px 0",
                  borderRadius: "20px",
                  boxShadow: stateGlow,
                  transition: "0.3s ease",
                  textAlign: "left"
                  }}>

                  <div style={{
                    width: "100%",
                    height: "180px",
                    background: "rgba(255,255,255,0.05)",
                    borderRadius: "18px",
                    marginBottom: "15px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "inset 0 4px 10px rgba(0,0,0,0.05)"
                  }}>
                    <BonsaiAvatar plantStatus={plant.state} temperature={20} size={150} />
                  </div>

                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}> 
                  
                    <div>
                    <h2 style={{
                      margin: 0,
                      color: textPrimary
                    }}>
                      {plantIcon} {plant.name}
                    </h2>

                    <p style={{
                      margin: "4px 0 10px 0",
                      color: textSecondary,
                      fontSize: "14px",
                      fontStyle: "italic"
                    }}>
                      {species.personality}
                    </p>

                    <div style={{
                      marginTop: "10px",
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "8px"
                    }}>
                      <span style={{
                        background: "rgba(76,175,80,0.15)",
                        padding: "6px 10px",
                        borderRadius: "12px",
                        fontSize: "12px",
                        color: textPrimary
                      }}>
                        💧 Cada {species.waterEvery} día(s)
                      </span>

                      <span style={{
                        background: "rgba(76,175,80,0.15)",
                        padding: "6px 10px",
                        borderRadius: "12px",
                        fontSize: "12px",
                        color: textPrimary
                      }}>
                        ☀️ {species.heatTolerance}° max
                      </span>

                      <span style={{
                        background: "rgba(76,175,80,0.15)",
                        padding: "6px 10px",
                        borderRadius: "12px",
                        fontSize: "12px",
                        color: textPrimary
                      }}>
                        ❄️ {species.coldTolerance}° min
                      </span>

                      <span style={{
                        background: "rgba(76,175,80,0.15)",
                        padding: "6px 10px",
                        borderRadius: "12px",
                        fontSize: "12px",
                        color: textPrimary
                      }}>
                        🌱 {species.difficulty}
                      </span>
                    </div>

                    <p style={{
                      margin: "5px 0",
                      color: textSecondary
                    }}> {status.health} </p>

                    <div style={{
                      marginTop: "10px",
                      padding: "12px",
                      borderRadius: "14px",
                      background: isNight
                        ? "rgba(255,255,255,0.08)"
                        : "rgba(255,255,255,0.35)",
                      backdropFilter: "blur(8px)"
                    }}>
                      <p style={{
                        margin: 0,
                        fontSize: "18px"
                      }}> 
                        {mood.moodEmoji}
                      </p>

                      <p style={{
                        margin: "5px 0 0 0",
                        color: textPrimary,
                        fontWeight: "500",
                        fontStyle: "italic"
                      }}>
                        {mood.moodMessage}
                      </p>
                    </div>
                    </div>
                    
                    <div style={{fontSize: "35px"}}>
                      {plantIcon}
                    </div>
                  </div>

                  <hr style={{
                    border: "none",
                    borderTop: "1px solid rgba(0,0,0,0.1)",
                    margin: "15px 0"
                  }}/>

                  <p style={{
                    fontWeight: "bold",
                    color: textPrimary
                  }}>
                    Hace {status.daysSinceWatering} día(s)
                  </p>
                  
                  {/* HISTORIAL */}
                  <h4 style={{
                    marginTop: "20px",
                    color: textPrimary
                  }}>📅 Historial</h4>

                  <ul style={{ listStyle: "none", padding: 0 }}>
                    {(plant.wateringHistory || [])
                    .slice(-3)
                    .reverse()
                    .map((date, i) => (
                    
                    <li key={i} style={{
                      marginBottom: "8px",
                      color: textSecondary
                    }}>
                      💧 {new Date(date).toLocaleString()}
                    </li>
                    ))}
                  </ul>

                  <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
                    <button onClick={() => waterPlant(plant._id)}
                      style={{
                        flex: 1,
                        padding: "12px",
                        borderRadius: "12px",
                        border: "none",
                        background: "#4CAF50",
                        color: "white",
                        fontWeight: "bold",
                        cursor: "pointer",
                        boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
                      }}> 💧 Regar </button>

                    <button onClick={() => handleDeletePlant(plant._id)}
                      style={{
                        padding: "12px",
                        borderRadius: "12px",
                        border: "none",
                        background: isNight ? "rgba(229,57,53,0.3)" : "#ffebee",
                        color: "#e53935",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}>
                      <Trash2 size={20} />
                    </button>
                  </div>

                </motion.div>
              );
            })
          )}
          </>
        )}

      {activeTab === "profile" && (
        <div style={{
          marginTop: "25px",
          padding: "25px",
          borderRadius: "25px",
          background: cardBackground,
          backdropFilter: "blur(12px)",
          boxShadow: isNight
            ? "0 8px 25px rgba(0,0,0,0.35)"
            : "0 8px 20px rgba(0,0,0,0.08)"
        }}>

          {/* Avatar */}
          <div style={{
            textAlign: "center"
          }}>

            <motion.img 
            whileHover={{
              scale: 1.05
            }} 
            src={avatarUrl} 
            alt="avatar"
              style={{
                width: "120px",
                height: "120px",
                borderRadius: "50%",
                border: isNight
                  ? "4px solid rgba(255,255,255,0.18)"
                  : "4px solid rgba(0,0,0,0.08)",
                background: isNight
                  ? "#1f2937"
                  : "white",
                boxShadow: isNight
                  ? "0 12px 30px rgba(0,0,0,0.35)"
                  : "0 8px 18px rgba(0,0,0,0.12)",
                padding: "10px",
              }} />

            <h2 style={{
              color: textPrimary,
              marginBottom: "5px"
            }}> {username}
            </h2>

            <p style={{
              color: textSecondary,
              marginTop: 0
            }}> {data?.gardenerTitle || "Jardinero"} 
            </p>
          </div>

          {/* Input Nombre */}
          <input type="text"
            placeholder="Cambiar nombre"
            onChange={(e) => {
              setUsername(e.target.value);
              localStorage.setItem(
                "bonsaiUser",
                e.target.value
              );
            }} 
            value={username}
            style={{
              width: "92%",
              margin: "20px auto 0 auto",
              display: "block",
              marginTop: "20px",
              padding: "14px",
              borderRadius: "14px",
              border: "none",
              background: inputBackground,
              color: textPrimary,
              fontSize: "16px"
            }}
          />

          {/* Stats */}
          <div style={{
            marginTop: "25px",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "15px"
          }}>
            <div style={{
              background: isNight
                ? "rgba(255,255,255,0.08)"
                : "rgba(255,255,255,0.92)",
              border: isNight
                ? "1px solid rgba(255,255,255,0.05)"
                : "1px solid rgba(0,0,0,0.04)",
              padding: "20px",
              borderRadius: "18px",
              minHeight: "160px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}>
              <h3>
                <span> 🔥 </span>
                <span> Racha </span> 
              </h3>

              <p style={{
                fontSize: "24px",
                margin: "10px 0 0 0",
                color: textSecondary
              }}> {streak > 0
                    ? `${streak} día${streak > 1 ? "s" : ""}`
                    : "Sin racha"}
              </p>
            </div>

            <div style={{
              background: isNight
                ? "rgba(255,255,255,0.08)"
                : "rgba(255,255,255,0.92)",
              border: isNight
                ? "1px solid rgba(255,255,255,0.05)"
                : "1px solid rgba(0,0,0,0.04)",
              padding: "20px",
              borderRadius: "18px",
              minHeight: "160px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}>
              <h3> 
                <span> 💧 </span>
                <span> Riegos </span> 
              </h3>

              <p style={{
                fontSize: "24px",
                margin: "10px 0 0 0",
                color: textSecondary
              }}>
                {plants.reduce(
                  (acc, p) => 
                    acc + (p.wateringHistory?.length || 0),
                    0
                )}
              </p>
            </div>
          </div>

          {/* Achievements */}
            <div style={{
              marginTop: "30px"
            }}>
              <h2 style={{
                color: textPrimary,
                marginBottom: "15px"
              }}>
                🏆 Logros
              </h2>

              <div style={{
                display: "flex",
                flexDirection: "column",
                gap: "14px"
              }}>
                {achievements.map((achievement, i) =>(
                  <motion.div 
                    key={i}
                    initial={{
                      opacity: 0,
                      y: 20
                    }}
                    animate={{
                      opacity: 1,
                      y: 0
                    }}
                    transition={{
                      delay: i * 0.15
                    }}
                    whileHover={{
                      scale: 1.02
                    }}
                    style={{
                      padding: "18px",
                      borderRadius: "20px",
                      background: achievement.unlocked
                      ?(isNight
                        ? "rgba(255,255,255,0.15)"
                        : "rgba(76,175,80,0.12)"
                      ) : (
                        isNight
                        ? "rgba(255,255,255,0.05)"
                        : "rgba(255,255,255,0.7)"
                      ),
                      border: achievement.unlocked
                      ? "1px solid rgba(76,175,80,0.35)"
                      : (isNight
                        ? "1px solid rgba(255,255,255,0.06)"
                        : "1px solid rgba(0,0,0,0.04)"),
                      opacity: achievement.unlocked ? 1 : 0.7,
                      boxShadow: achievement.unlocked
                        ? "0 0 20px rgba(76,175,80,0.18)"
                        : "0 4px 12px rgba(0,0,0,0.06)",
                      display: "flex",
                      alignItems: "center",
                      gap: "15px",
                      transition: "0.4s ease"
                    }}> 
                      <div style={{
                        fontSize: "30px",
                        filter: achievement.unlocked
                          ? "drop-shadow(0 0 10px rgba(76,175,80,0.55))"
                          : "grayscale(0.4)"
                      }}>
                        {achievement.unlocked
                          ? achievement.icon
                          : "🔒"
                        }
                      </div>
                      <div>
                        <h3 style={{
                          margin: 0,
                          color: textPrimary
                        }}>
                          {achievement.title}
                        </h3>
                        <p style={{
                          margin: "5px 0 0 0",
                          color: textSecondary,
                          fontSize: "14px"
                        }}>
                          {achievement.description}
                        </p>
                        <p style={{
                          margin: "8px 0 0 0",
                          fontSize: "13px",
                          color: achievement.unlocked
                            ? "#4CAF50"
                            : textSecondary,
                          fontWeight: "bold"
                        }}>
                          {achievement.unlocked
                            ? "✅ Desbloqueado"
                            : `🔒 ${achievement.progress}/${achievement.goal}`
                          }
                        </p>
                      </div>
                    </motion.div>
                ))}
              </div>
            </div>
          <div style={{ textAlign: "center", marginTop: "20px" }}>
            <button onClick={handleLogout} style={{ padding: "10px 20px", background: "#e53935", color: "white", border: "none", borderRadius: "10px", fontWeight: "bold", cursor: "pointer" }}>
              Cerrar Sesión
            </button>
          </div>
        </div>
    )}
    </motion.div>

    <motion.button onClick={quickWater}
      
      whileHover={{
        scale: 1.08
      }}

      whileTap={{
        scale: 0.94
      }}

      animate={{
        y: [0, -5, 0]
      }}

      transition={{
        duration: 2,
        repeat: Infinity
      }}

      style={{
        position: "fixed",
        bottom: "110px",
        right: "25px",
        width: "70px",
        height: "70px",
        borderRadius: "50%",
        border: "none",
        background: "linear-gradient(135deg, #4CAF50, #81C784)",
        color: "white",
        fontSize: "30px",
        cursor: "pointer",
        boxShadow: "0 10px 25px rgba(76,175,80,0.4)",
        zIndex: 1000
      }}> 💧
      </motion.button>

        <div style={{
          position: "fixed",
          bottom: "25px",
          paddingBottom: "env(safe-area-inset-bottom)",
          left: "50%",
          transform: "translateX(-50%)",
          width: "calc(100% - 40px)",
          maxWidth: "500px",
          background: isNight
          ? "rgba(20,20,30,0.75)"
          : "rgba(255,255,255,0.7)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.15)",
          borderRadius: "25px",
          padding: "12px 10px",
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
          boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
          zIndex: 999
        }}>

          {/* Home */}
          <div onClick={() => setActiveTab("home")}
            style={{
              textAlign: "center",
              cursor: "pointer",
              opacity: activeTab === "home" ? 1 : 0.55,

              transform:
                activeTab === "home"
                  ? "translateY(-5px)"
                  : "translateY(0)",
              background: 
                activeTab === "home"
                  ? "rgba(255,255,255,0.18)"
                  : "transparent",
              padding: "8px 14px",
              borderRadius: "14px",
              boxShadow:
                activeTab === "home"
                  ? "0 4px 12px rgba(0,0,0,0.12)"
                  : "none",
              transition: "0.3s"
            }}>
              <div style={{display: "flex", justifyContent: "center", marginBottom: "4px"}}> <Home size={24} color={textPrimary} /> </div>
              <div style={{
                fontSize: "12px",
                color: textPrimary
              }}>
                Inicio
              </div>
          </div>

          {/* Stats */}
          <div onClick={() => setActiveTab("stats")}
            style={{
              textAlign: "center",
              cursor: "pointer",
              opacity: activeTab === "stats" ? 1 : 0.55,

              transform:
                activeTab === "stats"
                  ? "translateY(-5px)"
                  : "translateY(0)",
              background: 
                activeTab === "stats"
                  ? "rgba(255,255,255,0.18)"
                  : "transparent",
              padding: "8px 14px",
              borderRadius: "14px",
              boxShadow:
                activeTab === "stats"
                  ? "0 4px 12px rgba(0,0,0,0.12)"
                  : "none",
              transition: "0.3s"
            }}>
              <div style={{display: "flex", justifyContent: "center", marginBottom: "4px"}}> <ChartIcon size={24} color={textPrimary} /> </div>
              <div style={{
                fontSize: "12px",
                color: textPrimary
              }}> Stats 
              </div>
            </div>

            {/* Plants */}
          <div onClick={() => setActiveTab("plants")}
            style={{
              textAlign: "center",
              cursor: "pointer",
              opacity: activeTab === "plants" ? 1 : 0.55,
              
              transform:
                activeTab === "plants"
                  ? "translateY(-5px)"
                  : "translateY(0)",
              background: 
                activeTab === "plants"
                  ? "rgba(255,255,255,0.18)"
                  : "transparent",
              padding: "8px 14px",
              borderRadius: "14px",
              boxShadow:
                activeTab === "plants"
                  ? "0 4px 12px rgba(0,0,0,0.12)"
                  : "none",
              transition: "0.3s"
            }}>
              <div style={{display: "flex", justifyContent: "center", marginBottom: "4px"}}> <Leaf size={24} color={textPrimary} /> </div>
              <div style={{
                fontSize: "12px",
                color: textPrimary
              }}>
                Plantas
              </div>
          </div>

          {/* Profile */}
          <div onClick={() => setActiveTab("profile")}
            style={{
              textAlign: "center",
              cursor: "pointer",
              opacity: activeTab === "profile" ? 1 : 0.55,
              
              transform:
                activeTab === "profile"
                  ? "translateY(-5px)"
                  : "translateY(0)",
              background: 
                activeTab === "profile"
                  ? "rgba(255,255,255,0.18)"
                  : "transparent",
              padding: "8px 14px",
              borderRadius: "14px",
              boxShadow:
                activeTab === "profile"
                  ? "0 4px 12px rgba(0,0,0,0.12)"
                  : "none",
              transition: "0.3s"
            }}>
              <div style={{display: "flex", justifyContent: "center", marginBottom: "4px"}}> <User size={24} color={textPrimary} /> </div>
              <div style={{
                fontSize: "12px",
                color: textPrimary
              }}>
                Perfil
              </div>
          </div>
    </div>

  </div>
);
}

export default App;