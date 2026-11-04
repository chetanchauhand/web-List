
import * as THREE from
"https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

import { OrbitControls } from
"https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/controls/OrbitControls.js";

// -------------------------------------
// SCENE SETUP
// -------------------------------------

const container = document.getElementById("solar-container");

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x03040a);

const camera = new THREE.PerspectiveCamera(
    45,
    container.clientWidth / container.clientHeight,
    0.1,
    2000
);

camera.position.set(0, 55, 105);

const renderer = new THREE.WebGLRenderer({
    antialias: true
});

renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.25;

container.appendChild(renderer.domElement);

// -------------------------------------
// CAMERA CONTROLS
// -------------------------------------

const controls = new OrbitControls(camera, renderer.domElement);

controls.enableDamping = true;
controls.dampingFactor = 0.04;
controls.minDistance = 12;
controls.maxDistance = 180;
controls.maxPolarAngle = Math.PI * 0.48;

// -------------------------------------
// LIGHTING
// -------------------------------------

scene.add(new THREE.AmbientLight(0xffffff, 0.35));

const sunLight = new THREE.PointLight(0xffffff, 1800, 500);
sunLight.position.set(0, 0, 0);
scene.add(sunLight);

// -------------------------------------
// PLANET INFORMATION
// -------------------------------------

const planets = [
    {
        name: "Mercury",
        size: 0.65,
        distance: 9,
        color: 0x99918a,
        diameter: "4,879 km",
        period: "88 days",
        moons: "0",
        type: "Terrestrial",
        description: "The smallest planet and closest planet to the Sun.",
        speed: 0.48
    },
    {
        name: "Venus",
        size: 1.05,
        distance: 14,
        color: 0xd9a56d,
        diameter: "12,104 km",
        period: "225 days",
        moons: "0",
        type: "Terrestrial",
        description: "A hot world covered by thick clouds and a dense atmosphere.",
        speed: 0.35
    },
    {
        name: "Earth",
        size: 1.15,
        distance: 20,
        color: 0x2879e8,
        diameter: "12,742 km",
        period: "365 days",
        moons: "1",
        type: "Terrestrial",
        description: "Our home planet, the only known world supporting life.",
        speed: 0.25
    },
    {
        name: "Mars",
        size: 0.85,
        distance: 27,
        color: 0xd65b36,
        diameter: "6,779 km",
        period: "687 days",
        moons: "2",
        type: "Terrestrial",
        description: "The red planet, with giant volcanoes and ancient valleys.",
        speed: 0.20
    },
    {
        name: "Jupiter",
        size: 3.5,
        distance: 39,
        color: 0xc99a70,
        diameter: "139,820 km",
        period: "11.86 years",
        moons: "95",
        type: "Gas Giant",
        description: "The largest planet, famous for its Great Red Spot.",
        speed: 0.11
    },
    {
        name: "Saturn",
        size: 3,
        distance: 53,
        color: 0xd6bd91,
        diameter: "116,460 km",
        period: "29.4 years",
        moons: "274",
        type: "Gas Giant",
        description: "A gas giant surrounded by its spectacular ring system.",
        speed: 0.08
    },
    {
        name: "Uranus",
        size: 1.9,
        distance: 66,
        color: 0x7ed8df,
        diameter: "50,724 km",
        period: "84 years",
        moons: "28",
        type: "Ice Giant",
        description: "An ice giant that rotates on its side.",
        speed: 0.055
    },
    {
        name: "Neptune",
        size: 1.85,
        distance: 79,
        color: 0x315de0,
        diameter: "49,244 km",
        period: "165 years",
        moons: "16",
        type: "Ice Giant",
        description: "A distant blue planet with extremely powerful winds.",
        speed: 0.04
    }
];

// -------------------------------------
// PROCEDURAL PLANET TEXTURES
// -------------------------------------

function createTexture(baseColor, type) {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 512;

    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#" + baseColor.toString(16).padStart(6, "0");
    ctx.fillRect(0, 0, 1024, 512);

    for (let i = 0; i < 3000; i++) {
        const x = Math.random() * 1024;
        const y = Math.random() * 512;

        if (type === "Earth") {
            ctx.fillStyle = Math.random() > 0.48
                ? "rgba(48,130,75,0.55)"
                : "rgba(100,190,225,0.35)";
        } else if (type === "Jupiter" || type === "Saturn") {
            ctx.fillStyle = Math.random() > 0.5
                ? "rgba(255,230,190,0.3)"
                : "rgba(90,50,30,0.25)";
        } else {
            ctx.fillStyle = "rgba(255,255,255,0.10)";
        }

        ctx.beginPath();
        ctx.ellipse(
            x, y,
            Math.random() * 40 + 5,
            Math.random() * 8 + 2,
            0, 0, Math.PI * 2
        );
        ctx.fill();
    }

    // Atmospheric/cloud bands
    if (["Jupiter", "Saturn"].includes(type)) {
        for (let y = 0; y < 512; y += 20) {
            ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.12})`;
            ctx.fillRect(0, y, 1024, 10);
        }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;

    return texture;
}

// -------------------------------------
// STAR FIELD
// -------------------------------------

function createStars() {
    const positions = [];

    for (let i = 0; i < 12000; i++) {
        const radius = 100 + Math.random() * 450;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);

        positions.push(
            radius * Math.sin(phi) * Math.cos(theta),
            radius * Math.cos(phi),
            radius * Math.sin(phi) * Math.sin(theta)
        );
    }

    const geometry = new THREE.BufferGeometry();

    geometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(positions, 3)
    );

    const material = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.65,
        transparent: true,
        opacity: 0.85,
        sizeAttenuation: true
    });

    const stars = new THREE.Points(geometry, material);
    scene.add(stars);

    return stars;
}

const stars = createStars();

// -------------------------------------
// SUN
// -------------------------------------

const sunGeometry = new THREE.SphereGeometry(5, 64, 64);

const sunMaterial = new THREE.MeshBasicMaterial({
    color: 0xffaa22
});

const sun = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sun);

const sunGlow = new THREE.Sprite(
    new THREE.SpriteMaterial({
        map: (() => {
            const canvas = document.createElement("canvas");
            canvas.width = canvas.height = 256;

            const ctx = canvas.getContext("2d");
            const gradient = ctx.createRadialGradient(128, 128, 5, 128, 128, 128);

            gradient.addColorStop(0, "rgba(255,240,160,0.8)");
            gradient.addColorStop(0.2, "rgba(255,160,30,0.35)");
            gradient.addColorStop(1, "rgba(255,100,0,0)");

            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, 256, 256);

            return new THREE.CanvasTexture(canvas);
        })(),
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    })
);

sunGlow.scale.set(23, 23, 1);
scene.add(sunGlow);

// -------------------------------------
// CREATE ORBIT PATH
// -------------------------------------

function createOrbit(distance) {
    const points = [];

    for (let i = 0; i <= 256; i++) {
        const angle = (i / 256) * Math.PI * 2;

        points.push(
            new THREE.Vector3(
                Math.cos(angle) * distance,
                0,
                Math.sin(angle) * distance
            )
        );
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(points);

    const material = new THREE.LineBasicMaterial({
        color: 0x555b78,
        transparent: true,
        opacity: 0.35
    });

    const orbit = new THREE.LineLoop(geometry, material);
    scene.add(orbit);
}

// -------------------------------------
// PLANET CREATION
// -------------------------------------

const planetObjects = [];

planets.forEach((data, index) => {
    createOrbit(data.distance);

    const group = new THREE.Group();
    scene.add(group);

    const geometry = new THREE.SphereGeometry(
        data.size, 64, 64
    );

    const texture = createTexture(data.color, data.name);

    const material = new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.85,
        metalness: 0.02
    });

    const planet = new THREE.Mesh(geometry, material);

    planet.position.x = data.distance;
    group.add(planet);

    // Planet atmosphere
    if (["Earth", "Venus"].includes(data.name)) {
        const atmosphere = new THREE.Mesh(
            new THREE.SphereGeometry(data.size * 1.08, 48, 48),
            new THREE.MeshBasicMaterial({
                color: data.name === "Earth" ? 0x3388ff : 0xffd49a,
                transparent: true,
                opacity: 0.12,
                side: THREE.BackSide
            })
        );

        planet.add(atmosphere);
    }

    // Saturn rings
    if (data.name === "Saturn") {
        const ring = new THREE.Mesh(
            new THREE.RingGeometry(
                data.size * 1.35,
                data.size * 2.3,
                128
            ),
            new THREE.MeshStandardMaterial({
                color: 0xc8b18d,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.8
            })
        );

        ring.rotation.x = Math.PI / 2.35;
        planet.add(ring);
    }

    // Uranus rings
    if (data.name === "Uranus") {
        const ring = new THREE.Mesh(
            new THREE.RingGeometry(
                data.size * 1.5,
                data.size * 1.85,
                100
            ),
            new THREE.MeshStandardMaterial({
                color: 0x9ccfd3,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.35
            })
        );

        ring.rotation.x = Math.PI / 2;
        planet.add(ring);
    }

    // Earth Moon
    if (data.name === "Earth") {
        const moonGroup = new THREE.Group();
        planet.add(moonGroup);

        const moon = new THREE.Mesh(
            new THREE.SphereGeometry(0.27, 32, 32),
            new THREE.MeshStandardMaterial({
                color: 0xc7c7c7,
                roughness: 1
            })
        );

        moon.position.x = 2;
        moonGroup.add(moon);

        planetObjects.push({
            moonGroup
        });
    }

    planetObjects.push({
        group,
        planet,
        data,
        angle: index * 0.65,
        speed: data.speed
    });
});

// -------------------------------------
// PLANET SELECTION
// -------------------------------------

let selectedPlanet = null;

const list = document.getElementById("planetList");

planets.forEach((planet, index) => {
    const button = document.createElement("button");

    button.className = "planet-btn";
    button.textContent = planet.name;

    button.addEventListener("click", () => {
        selectPlanet(index);
    });

    list.appendChild(button);
});

function selectPlanet(index) {
    const object = planetObjects.find(item =>
        item.data && item.data.name === planets[index].name
    );

    if (!object) return;

    selectedPlanet = object;

    document.getElementById("planetName").textContent =
        object.data.name;

    document.getElementById("planetDescription").textContent =
        object.data.description;

    document.getElementById("diameter").textContent =
        object.data.diameter;

    document.getElementById("period").textContent =
        object.data.period;

    document.getElementById("moons").textContent =
        object.data.moons;

    document.getElementById("planetType").textContent =
        object.data.type;

    document.querySelectorAll(".planet-btn").forEach((btn, i) => {
        btn.classList.toggle("active", i === index);
    });
}

// Default selection: Earth
selectPlanet(2);

// -------------------------------------
// FOCUS PLANET
// -------------------------------------

document.getElementById("focusButton").addEventListener("click", () => {
    if (!selectedPlanet) return;

    const position = new THREE.Vector3();

    selectedPlanet.planet.getWorldPosition(position);

    const targetPosition = position.clone().add(
        new THREE.Vector3(0, 7, 13)
    );

    camera.position.copy(targetPosition);
    controls.target.copy(position);
});

// -------------------------------------
// PAUSE / PLAY
// -------------------------------------

let paused = false;

const pauseButton = document.getElementById("pauseButton");

pauseButton.addEventListener("click", () => {
    paused = !paused;

    pauseButton.textContent = paused
        ? "▶ RESUME"
        : "Ⅱ PAUSE";
});

// -------------------------------------
// SPEED CONTROL
// -------------------------------------

let globalSpeed = 1;

const speedInput = document.getElementById("speed");
const speedValue = document.getElementById("speedValue");

speedInput.addEventListener("input", () => {
    globalSpeed = Number(speedInput.value);

    speedValue.textContent = globalSpeed.toFixed(1) + "x";
});

// -------------------------------------
// RESET CAMERA
// -------------------------------------

document.getElementById("resetButton").addEventListener("click", () => {
    camera.position.set(0, 55, 105);
    controls.target.set(0, 0, 0);
});

// -------------------------------------
// ANIMATION LOOP
// -------------------------------------

const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);

    const delta = Math.min(clock.getDelta(), 0.05);

    if (!paused) {
        sun.rotation.y += delta * 0.08;

        stars.rotation.y += delta * 0.002;

        planetObjects.forEach(object => {
            if (object.group) {
                object.angle +=
                    object.speed * globalSpeed * delta * 0.35;

                object.group.rotation.y = object.angle;

                object.planet.rotation.y += delta * 0.3;
            }

            if (object.moonGroup) {
                object.moonGroup.rotation.y +=
                    delta * globalSpeed * 1.5;
            }
        });
    }

    controls.update();
    renderer.render(scene, camera);
}

animate();

// -------------------------------------
// RESPONSIVE RESIZE
// -------------------------------------

window.addEventListener("resize", () => {
    const width = container.clientWidth;
    const height = container.clientHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// -------------------------------------
// LOADING SCREEN
// -------------------------------------

window.addEventListener("load", () => {
    setTimeout(() => {
        const loader = document.getElementById("loader");

        loader.style.opacity = "0";

        setTimeout(() => {
            loader.style.display = "none";
        }, 650);
    }, 500);
});
