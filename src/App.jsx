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

const API_URL = import.meta.env.VITE_API_URL;

function App() {
  const [city, setCity] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [plants, setPlants] = useState([]);
  const [activeTab, setActiveTab] = useState("home");
  const  [username, setUsername] = useState(
    localStorage.getItem("bonsaiUser") || "Jardinero"
  );
  const avatarUrl =  `https://api.dicebear.com/7.x/adventurer/svg?seed=${username}`;

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
  : "rgba(255,255,255,0.45)";

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
      `${API_URL}/api/bonsai/care?city=${city}`
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
    alert("Geolocalización no soportada");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;

      try {
        setLoading(true);

        const response = await fetch(
          `${API_URL}/api/bonsai/care?lat=${lat}&lon=${lon}`
        );

        const result = await response.json();
        setData(result);

      } catch (error) {
        setError("Error obteniendo ubicación");
      } finally {
        setLoading(false);
      }
    },
    (error) => {
    console.error("ERROR GEO:", error);
    alert(error.message);
    }
  );
};

  const loadPlants = async () => {
  try {
    const res = await fetch(`${API_URL}/api/bonsai/all`);
    const data = await res.json();

    console.log("DATA FROM BACKEND:", data);

    setPlants(data);
  } catch (error) {
    console.error("ERROR LOAD PLANTS:", error);
  }
};

useEffect(() => {
  loadPlants();
  const savedCity = localStorage.getItem("favoriteCity");

  if(savedCity){
    setCity(savedCity);

    fetch(
      `${API_URL}/api/bonsai/care?city=${savedCity}`
    )

    .then(res => res.json())
    .then(result => {
      setData(result);
    })
    .catch(err => {
      console.error(err);
    });
  }
}, []);

const waterPlant = async (id) => {
  try {
    await fetch(`${API_URL}/api/bonsai/water`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ id })
    });

    alert("💧 Riego registrado");
    loadPlants();

  } catch (error) {
    console.error(error);
    alert("❌ Error al registrar riego");
  }
};

const quickWater = () => {

  if (plants.length === 0) {
    alert("No hay plantas");
    return;
  }

  waterPlant(plants[0]._id);
};

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

  const daysSinceWatering =
    (Date.now() - new Date(plant.lastWatered)) /
    (1000 * 60 * 60 * 24);

  let moodEmoji = "😊";
  let moodMessage = "Me siento muy bien hoy ☀️";

  // SALUD BAJA
  if (plant.health < 40) {
    moodEmoji = "🥀";
    moodMessage = "Necesito ayuda pronto...";
  }

  // MUY SECA
  if (daysSinceWatering > 4) {
    moodEmoji = "💧";
    moodMessage = "Tengo mucha sed 🌱";
  }

  // SOBRE-RIEGO
  if (daysSinceWatering < 1) {
    moodEmoji = "😵";
    moodMessage = "Creo que tengo demasiada agua...";
  }

  // SALUD EXCELENTE
  if (plant.health > 85) {
    moodEmoji = "🌟";
    moodMessage = "Estoy creciendo increíblemente bien";
  }

  return {
    moodEmoji,
    moodMessage
  };
};

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
        fontSize: "60px",
        color: "white",
        textShadow: "0 4px 15px rgba(0,0,0,0.3)"
        }}>
        Bonsai Care 🌱
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

      <button onClick={getLocation}>
        📍 Usar mi ubicación
      </button>

      {loading && <p>⏳ Cargando clima...</p>}
      {error && <p style={{ color: "red" }}>❌ {error}</p>}

      <br /><br />

      {city && (
        <p style={{
          color: textPrimary,
          marginTop: "-10px",
          marginBottom: "20px"
        }}> 🌿 Bienvenido de nuevo — {city} </p>
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
              fontSize: "55px",
              marginBottom: "10px"
            }}> ☀️ </div>

            <h2 style={{
              margin: 0,
              fontSize: "55px",
              color: textSecondary
            }}> {Math.round(data.climate.temperature)}° </h2>

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

              <div>
                <p style={{margin: 0, fontSize: "24px"}}> 💧 </p>
                <p style={{margin: 0}}>
                  {data.climate.humidity}%
                </p>
              </div>

              <div>
                <p style={{margin: 0, fontSize: "24px"}}> 🌡️ </p>
                <p style={{margin: 0}}>
                  {weatherDescription}
                </p>
              </div>
            </div>
          </motion.div>
          </>
          )}
        

          {data.dailyInsight && (
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
                {data.dailyInsight}
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
              🌟 {data.gardenerTitle}
            </h2>

            <p style={{
              color: textSecondary,
              fontSize: "18px",
              marginBottom: "15px"
            }}>
              Nivel {data.level}
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
                width: `${(data.xp / data.nextLevelXP) * 100}%`,
                background: "#4CAF50",
                height: "100%",
                transition: "1s ease"
              }} />

            </div>

            <p style={{
              marginTop: "10px",
              color: textSecondary
            }}>
              XP: {data.xp} / {data.nextLevelXP}
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
                {data.health.score}/100
              </p>
              
              <p>{data.health.status}</p>
            
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

        </div>
      )}

          {activeTab === "stats" && (
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
              {data.healthPrediction}
            </p>

            </div>
          )}
          </>
        )}
          
        {activeTab === "plants" && (
          <>
          <h3 style={{marginTop: "25px",
            color: textPrimary
          }}>🌿 Mis plantas</h3>
          
          {plants.length === 0 ? (
            <p>No hay plantas registradas 🌱</p>
          ) : (
            plants.map((plant, i) => {

              const status = getPlantStatus(plant);

              const mood = getPlantMood(plant);

              let plantIcon = "🌱";

              if(plant.species === "cactus") {
                plantIcon = "🌵";
              }

              if(plant.species === "bonsai"){
                plantIcon = "🪴";
              }

              return(
                <motion.div
                  key={plant._id}
                  initial={{ opacity: 0, y: 25 }}
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
                    ? "rgba(255,255,255,0.08)"
                    : status.color,
                  padding: "10px",
                  margin: "10px 0",
                  borderRadius: "20px",
                  boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
                  transition: "0.3 ease",
                  textAlign: "left"
                  }}>

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
                      margin: "5px 0",
                      color: textSecondary
                    }}> {status.health} </p>

                    <div style={{
                      marginTop: "10px",
                      padding: "12px",
                      borderRadius: "14px",
                      background: "rgba(255,255,255,0.35)",
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

                  <button onClick={() => waterPlant(plant._id)}
                    style={{
                      marginTop: "15px",
                      width: "100%",
                      padding: "12px",
                      borderRadius: "12px",
                      border: "none",
                      background: "#4CAF50",
                      color: "white",
                      fontWeight: "bold",
                      cursor: "pointer",
                      boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
                    }}> 💧 Regar </button>

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

            <img src={avatarUrl} alt="avatar"
              style={{
                width: "120px",
                height: "120px",
                borderRadius: "50%",
                border: "4px solid rgba(255,255,255,0.25)",
                background: "white",
                padding: "10px"
              }} />

            <h2 style={{
              color: textPrimary,
              marginBottom: "5px"
            }}> {username}
            </h2>

            <p style={{
              color: textSecondary,
              marginTop: 0
            }}> 🌱 {data?.gardenerTitle || "Jardinero"} 
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
              width: "100%",
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
                : "rgba(255,255,255,0.45)",
              padding: "20px",
              borderRadius: "18px"
            }}>
              <h3 style={{
                margin: 0,
                color: textPrimary
              }}> 🔥 Racha
              </h3>

              <p style={{
                fontSize: "24px",
                margin: "10px 0 0 0",
                color: textSecondary
              }}> 5 días
              </p>
            </div>

            <div style={{
              background: isNight
                ? "rgba(255,255,255,0.08)"
                : "rgba(255,255,255,0.45)",
              padding: "20px",
              borderRadius: "18px"
            }}>
              <h3 style={{
                margin: 0,
                color: textPrimary
              }}> 💧 Riegos
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
              <div style={{fontSize:"24px"}}> 🏠 </div>
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
              <div style={{ fontSize: "24px" }}>📈</div>
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
              <div style={{fontSize:"24px"}}> 🌱 </div>
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
              <div style={{fontSize:"24px"}}> 👤 </div>
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