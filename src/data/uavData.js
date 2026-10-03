export const uavCategories = [
  {
    id: "fpv",
    name: "⚡ FPV Racing",
    tagline: "Speed & Precision",
    title: "FPV Racing Drones",
    desc: "Built for adrenaline and competition. Our FPV racing drones are engineered for maximum speed, agility, and first-person immersion. Hand-assembled with carbon fiber frames and tuned for competitive racing or freestyle piloting.",
    image: "/images/fpv_racing_drone.jpg",
    specs: [
      { key: "Max Speed", val: "140+ km/h" },
      { key: "Frame Size", val: "3\" / 5\" / 7\" True-X Carbon" },
      { key: "Flight Time", val: "4–8 minutes (high discharge)" },
      { key: "FPV System", val: "Analog Low-Latency / DJI O3 HD" },
      { key: "Motor KV", val: "2400–2600 KV Brushless" },
      { key: "Starting Price", val: "₹8,999" }
    ],
    models: [
      {
        name: "Micro FPV Toothpick (3-inch)",
        price: "₹8,999",
        desc: "Ultra lightweight 3\" FPV drone for indoor racing and tight outdoor spots. Agile and forgiving.",
        speed: "80+ km/h",
        weight: "85g",
        img: "/images/fpv_racing_drone.jpg"
      },
      {
        name: "Apex 5\" Freestyle Beast",
        price: "₹14,999",
        desc: "The gold standard 5\" freestyle drone. Durable 5mm carbon arms, 6S power system, cinematic HD recording.",
        speed: "140+ km/h",
        weight: "380g",
        img: "/images/fpv_racing_drone.jpg"
      },
      {
        name: "Long Range 7\" Cruiser",
        price: "₹22,999",
        desc: "Designed for mountain surfs and extreme range exploration. GPS rescue failsafe enabled.",
        speed: "110+ km/h",
        weight: "520g",
        img: "/images/fpv_racing_drone.jpg"
      }
    ]
  },
  {
    id: "agri",
    name: "🌾 Agricultural",
    tagline: "Smart Farming Revolution",
    title: "Agricultural Sprayer UAVs",
    desc: "Revolutionize your farming with precision pesticide and nutrient spraying drones. Cover large acreage in minutes, cut chemical waste by 30%, protect operator health, and boost overall crop yields.",
    image: "/images/agricultural_drone_field_1791059252277.jpg" || "/images/agricultural_drone.jpg",
    specs: [
      { key: "Tank Capacity", val: "10L / 16L / 25L Smart Tanks" },
      { key: "Coverage", val: "10–15 acres per hour" },
      { key: "Navigation", val: "Centimeter RTK GPS Precision" },
      { key: "Propulsion", val: "Heavy Duty 6-Motor Hexacopter" },
      { key: "Spray Width", val: "4–6 meters dynamic swath" },
      { key: "Starting Price", val: "₹1,20,000" }
    ],
    models: [
      {
        name: "AgriHawk 10L Sprayer",
        price: "₹1,20,000",
        desc: "Compact, foldable agricultural hexacopter with 10L tank. Perfect for orchards and small farms.",
        speed: "10 m/s spray speed",
        weight: "14kg dry",
        img: "/images/agricultural_drone.jpg"
      },
      {
        name: "AgriHawk 16L Pro",
        price: "₹1,85,000",
        desc: "Industrial grade 16L payload with obstacle avoidance radar, terrain follow, and RTK base station compatibility.",
        speed: "12 m/s spray speed",
        weight: "18kg dry",
        img: "/images/agricultural_drone_field_1791059225277.jpg"
      }
    ]
  },
  {
    id: "toy",
    name: "🎯 Toy Drones",
    tagline: "Beginner & Fun Flying",
    title: "Basic Toy & Starter Drones",
    desc: "Ideal for kids, hobbyists, and first-time pilots! Equipped with headless mode, 360° flip button, altitude hold sensors, and propeller guards for safe, durable indoor and backyard flying.",
    image: "/images/toy_drone_basic.jpg",
    specs: [
      { key: "Control Range", val: "50–100 meters" },
      { key: "Flight Time", val: "10–15 minutes (modular battery)" },
      { key: "Camera", val: "720p / 1080p WiFi Live Stream" },
      { key: "Safety", val: "360° Full Propeller Cage" },
      { key: "Age Range", val: "8 years and above" },
      { key: "Starting Price", val: "₹999" }
    ],
    models: [
      {
        name: "NaviDron Nano Mini Toy",
        price: "₹999",
        desc: "Pocket-sized quadcopter with gyro stabilization, one-key return, and shockproof bumpers.",
        speed: "25 km/h",
        weight: "45g",
        img: "/images/toy_drone_basic.jpg"
      },
      {
        name: "SkyGazer HD WiFi Drone",
        price: "₹2,499",
        desc: "Foldable arms, 1080p camera with phone app streaming, gesture selfie photo capture.",
        speed: "35 km/h",
        weight: "110g",
        img: "/images/toy_drone_basic.jpg"
      }
    ]
  },
  {
    id: "college",
    name: "🎓 College Projects",
    tagline: "Engineering & Innovation",
    title: "College Project & Research Drones",
    desc: "Complete do-it-yourself kits or ready-to-fly research drones specifically tailored for engineering, polytechnic, and university final year projects. Includes full wiring schematics, code libraries, report guidance, and 30-day dedicated mentor support.",
    image: "/images/college_project_drone.jpg",
    specs: [
      { key: "Frame Type", val: "F450 Quad / F550 Hex / Custom CAD" },
      { key: "Flight Controller", val: "Pixhawk 2.4.8 / APM 2.8 / Betaflight" },
      { key: "Payload Capacity", val: "Up to 1.2 kg sensors/sensors" },
      { key: "Documentation", val: "Complete Circuit Diagram + Report Code" },
      { key: "Technical Support", val: "30-Day Engineering Mentorship" },
      { key: "Starting Price", val: "₹4,999" }
    ],
    models: [
      {
        name: "F450 Autonomous GPS Kit",
        price: "₹7,999",
        desc: "Autonomous waypoint navigation drone with Mission Planner support, APM/Pixhawk, telemetry.",
        speed: "45 km/h",
        weight: "850g",
        img: "/images/college_project_drone.jpg"
      },
      {
        name: "Custom IoT / AI Sensor Drone",
        price: "₹12,499",
        desc: "Raspberry Pi / Arduino / Jetson Nano mountable drone frame with obstacle avoidance and companion computer mount.",
        speed: "40 km/h",
        weight: "1.1kg",
        img: "/images/college_project_drone.jpg"
      }
    ]
  },
  {
    id: "rcplane",
    name: "✈️ RC Planes",
    tagline: "Scale Aerodynamics & Hobby",
    title: "RC Planes & Fixed-Wing Models",
    desc: "Aerodynamically tuned scale airplanes, delta wings, and acrobatic warbirds. Constructed from durable EPO foam, lightweight balsa wood, or custom 3D printed aerodynamic airfoils.",
    image: "/images/rc_plane_hobby.jpg",
    specs: [
      { key: "Wingspan", val: "800mm – 2400mm" },
      { key: "Motor System", val: "High Thrust Brushless Outrunner" },
      { key: "Scale Models", val: "Trainer / Fighter Jet / Glider" },
      { key: "Airfoil Material", val: "High-density EPO / Lightweight Balsa" },
      { key: "Flight Distance", val: "500m – 2km LOS" },
      { key: "Starting Price", val: "₹3,499" }
    ],
    models: [
      {
        name: "SkyTrainer 900mm High-Wing",
        price: "₹3,499",
        desc: "Self-leveling gentle flyer, forgiving crash-resistant EPO fuselage, perfect for learning RC aerodynamics.",
        speed: "50 km/h",
        weight: "320g",
        img: "/images/rc_plane_hobby.jpg"
      },
      {
        name: "Thunderbolt 1200mm Aerobatic Warbird",
        price: "₹7,999",
        desc: "High-speed brushless scale warbird capable of loops, rolls, and inverted flight.",
        speed: "95 km/h",
        weight: "680g",
        img: "/images/rc_plane_hobby.jpg"
      }
    ]
  }
];
