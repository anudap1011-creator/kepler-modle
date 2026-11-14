/**
 * NASA Kepler Space Telescope - 3D Interactive Dismantling Experience
 * Consolidated, Production-Grade Three.js Application
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/OrbitControls.js';
import { GLTFLoader } from 'three/addons/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/DRACOLoader.js';
import { KEPLER_COMPONENTS, MISSION_OVERVIEW } from './components-data.js';

class KeplerExplorerApp {
    constructor() {
        this.container = document.getElementById('canvas-container');
        this.loadingOverlay = document.getElementById('loading-overlay');
        this.progressBar = document.getElementById('loading-progress-bar');
        this.loadingText = document.getElementById('loading-text');
        this.errorModal = document.getElementById('error-modal');
        this.errorMessage = document.getElementById('error-message');

        // Three.js Core Components (Strictly single instance)
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.clock = new THREE.Clock();

        // Model & Component Tracking
        this.spacecraftGroup = null;
        this.componentMap = new Map(); // id -> ComponentData
        this.meshToComponentMap = new Map(); // mesh UUID / object -> ComponentData
        this.selectedComponentId = null;
        this.hoveredComponentId = null;
        this.isExploded = false;

        // Camera States
        this.initialCameraPosition = new THREE.Vector3(5.5, 3.2, 6.8);
        this.initialControlsTarget = new THREE.Vector3(0, 0, 0);
        this.isResettingCamera = false;
        this.cameraAnimProgress = 1;
        this.cameraStartPos = new THREE.Vector3();
        this.cameraTargetPos = new THREE.Vector3();

        // Raycasting & Interaction
        this.raycaster = new THREE.Raycaster();
        this.pointer = new THREE.Vector2();
        this.pointerDownPos = new THREE.Vector2();
        this.isPointerDown = false;

        // Animation Loop Control
        this.animationFrameId = null;
        this.autoRotate = false;
        this.isXRayMode = false;

        // Stars & Atmosphere
        this.starField = null;

        // Init
        this.init();
    }

    init() {
        this.setupScene();
        this.setupCamera();
        this.setupRenderer();
        this.setupControls();
        this.setupLights();
        this.setupStarField();
        this.setupEventListeners();
        this.setupUI();
        this.loadModel('models/kepler.glb');

        // Start the single unified animation loop
        this.animate = this.animate.bind(this);
        this.clock.start();
        this.animate();
    }

    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x080d1b);
        this.scene.fog = new THREE.FogExp2(0x080d1b, 0.018);
    }

    setupCamera() {
        const aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
        this.camera.position.copy(this.initialCameraPosition);
    }

    setupRenderer() {
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: false,
            powerPreference: 'high-performance'
        });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.15;
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.container.appendChild(this.renderer.domElement);
    }

    setupControls() {
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.minDistance = 2.5;
        this.controls.maxDistance = 25.0;
        this.controls.maxPolarAngle = Math.PI - 0.05;
        this.controls.target.copy(this.initialControlsTarget);
    }

    setupLights() {
        // Deep space solar illumination (Sun direction)
        const sunLight = new THREE.DirectionalLight(0xfff5e6, 2.8);
        sunLight.position.set(10, 8, 12);
        sunLight.castShadow = true;
        sunLight.shadow.mapSize.width = 2048;
        sunLight.shadow.mapSize.height = 2048;
        sunLight.shadow.bias = -0.0001;
        this.scene.add(sunLight);

        // Secondary sun bounce / solar array reflection
        const bounceLight = new THREE.DirectionalLight(0xb0d8ff, 1.2);
        bounceLight.position.set(-8, -4, -10);
        this.scene.add(bounceLight);

        // Soft deep space ambient fill
        const ambientLight = new THREE.AmbientLight(0x182442, 1.4);
        this.scene.add(ambientLight);

        // Subtle cyan rim light to highlight spacecraft silhouette against dark space
        const rimLight = new THREE.DirectionalLight(0x49b9ff, 1.5);
        rimLight.position.set(0, 15, -12);
        this.scene.add(rimLight);
    }

    setupStarField() {
        const starCount = 1800;
        const starGeometry = new THREE.BufferGeometry();
        const positions = new Float32Array(starCount * 3);
        const colors = new Float32Array(starCount * 3);

        const colorChoices = [
            new THREE.Color(0xffffff),
            new THREE.Color(0xd6e8ff),
            new THREE.Color(0xffeedd),
            new THREE.Color(0x8bc34a),
            new THREE.Color(0x49b9ff)
        ];

        for (let i = 0; i < starCount; i++) {
            const i3 = i * 3;
            // Distribute on a large sphere radius 120-250
            const radius = 120 + Math.random() * 130;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);

            positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i3 + 2] = radius * Math.cos(phi);

            const c = colorChoices[Math.floor(Math.random() * colorChoices.length)];
            const lum = 0.4 + Math.random() * 0.6;
            colors[i3] = c.r * lum;
            colors[i3 + 1] = c.g * lum;
            colors[i3 + 2] = c.b * lum;
        }

        starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        starGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const starMaterial = new THREE.PointsMaterial({
            size: 1.4,
            vertexColors: true,
            transparent: true,
            opacity: 0.85,
            sizeAttenuation: true
        });

        this.starField = new THREE.Points(starGeometry, starMaterial);
        this.scene.add(this.starField);
    }

    loadModel(modelPath) {
        this.updateLoading(10, 'Initializing Draco geometry decoder...');

        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath('./vendor/draco/');
        dracoLoader.preload();

        const loader = new GLTFLoader();
        loader.setDRACOLoader(dracoLoader);

        this.updateLoading(25, 'Downloading NASA Kepler 3D model...');

        loader.load(
            modelPath,
            (gltf) => {
                this.updateLoading(85, 'Analyzing spacecraft hierarchy & components...');
                try {
                    this.processLoadedModel(gltf);
                    this.updateLoading(100, 'Assembly ready!');
                    setTimeout(() => {
                        this.hideLoading();
                        this.renderComponentPills();
                        this.showMissionOverview();
                    }, 400);
                } catch (err) {
                    console.error('Error processing Kepler model:', err);
                    this.showError('Failed to process model hierarchy: ' + err.message);
                }
            },
            (xhr) => {
                if (xhr.lengthComputable && xhr.total > 0) {
                    const percent = Math.round((xhr.loaded / xhr.total) * 60) + 25;
                    this.updateLoading(percent, `Loading 3D asset (${Math.round(percent)}%)...`);
                }
            },
            (error) => {
                console.error('GLTF loading error:', error);
                this.showError(`Could not load model at "${modelPath}". Error details: ${error.message || error}`);
            }
        );
    }

    processLoadedModel(gltf) {
        this.spacecraftGroup = new THREE.Group();
        this.spacecraftGroup.name = 'KeplerSpacecraftRoot';

        const rawScene = gltf.scene;

        // Compute original bounding box
        const rawBox = new THREE.Box3().setFromObject(rawScene);
        const center = new THREE.Vector3();
        rawBox.getCenter(center);
        const size = new THREE.Vector3();
        rawBox.getSize(size);

        console.log(`Model Loaded! Raw Dimensions: X=${size.x.toFixed(2)}, Y=${size.y.toFixed(2)}, Z=${size.z.toFixed(2)}`);
        console.log(`Raw Center: (${center.x.toFixed(2)}, ${center.y.toFixed(2)}, ${center.z.toFixed(2)})`);

        // Transfer children to our spacecraft group
        const topChildren = [...rawScene.children];
        topChildren.forEach(child => {
            this.spacecraftGroup.add(child);
        });

        // Center the spacecraft group in our coordinate system
        this.spacecraftGroup.position.set(-center.x, -center.y, -center.z);

        // Adjust camera to frame model nicely
        const maxDim = Math.max(size.x, size.y, size.z);
        const fov = this.camera.fov * (Math.PI / 180);
        const cameraDistance = (maxDim / 2) / Math.tan(fov / 2) * 1.6;

        this.initialCameraPosition.set(cameraDistance * 0.75, cameraDistance * 0.35, cameraDistance * 0.95);
        this.camera.position.copy(this.initialCameraPosition);
        this.controls.target.set(0, 0, 0);
        this.controls.update();

        // Register each child object into our component mapping system
        this.spacecraftGroup.children.forEach(obj => {
            const rawName = obj.name;
            const compDef = KEPLER_COMPONENTS[rawName];

            if (compDef) {
                this.registerComponent(obj, compDef);
            } else {
                console.warn(`Unmapped scene object: "${rawName}"`, obj);
                // Fallback mapping if name variations occur
                const fallbackDef = this.findFallbackMapping(rawName) || {
                    id: rawName,
                    name: rawName,
                    category: 'Auxiliary Hardware',
                    nodeName: rawName,
                    explodeOffset: { x: 0, y: 1.5, z: 0 },
                    tag: 'Spacecraft Element',
                    specs: [],
                    shortDesc: 'Structural component of Kepler spacecraft.',
                    fullDesc: 'Identified element of the NASA Kepler 3D model hierarchy.',
                    missionContext: 'Part of the historic Kepler observatory.'
                };
                this.registerComponent(obj, fallbackDef);
            }
        });

        this.scene.add(this.spacecraftGroup);
        console.log(`Registered ${this.componentMap.size} distinct spacecraft components.`);
    }

    findFallbackMapping(name) {
        const lower = name.toLowerCase();
        for (const key of Object.keys(KEPLER_COMPONENTS)) {
            if (lower.includes(key.toLowerCase()) || key.toLowerCase().includes(lower)) {
                return KEPLER_COMPONENTS[key];
            }
        }
        return null;
    }

    registerComponent(rootObject, definition) {
        // Deep store original transforms
        const originalPosition = rootObject.position.clone();
        const originalRotation = rootObject.rotation.clone();
        const originalScale = rootObject.scale.clone();
        const originalQuaternion = rootObject.quaternion.clone();

        // Compute exploded target position
        const offset = definition.explodeOffset;
        const targetExplodedPos = originalPosition.clone().add(
            new THREE.Vector3(offset.x, offset.y, offset.z)
        );

        // Gather all meshes for material cloning, outlines, and raycasting
        const meshes = [];
        const originalMaterials = new Map();

        rootObject.traverse((node) => {
            if (node.isMesh) {
                meshes.push(node);
                node.castShadow = true;
                node.receiveShadow = true;

                // Clone materials so highlighting this component doesn't affect others
                if (Array.isArray(node.material)) {
                    node.material = node.material.map(m => m.clone());
                    originalMaterials.set(node, node.material.map(m => ({
                        emissive: m.emissive ? m.emissive.clone() : new THREE.Color(0, 0, 0),
                        emissiveIntensity: m.emissiveIntensity || 0,
                        wireframe: m.wireframe || false,
                        opacity: m.opacity !== undefined ? m.opacity : 1.0,
                        transparent: m.transparent || false
                    })));
                } else if (node.material) {
                    node.material = node.material.clone();
                    originalMaterials.set(node, {
                        emissive: node.material.emissive ? node.material.emissive.clone() : new THREE.Color(0, 0, 0),
                        emissiveIntensity: node.material.emissiveIntensity || 0,
                        wireframe: node.material.wireframe || false,
                        opacity: node.material.opacity !== undefined ? node.material.opacity : 1.0,
                        transparent: node.material.transparent || false
                    });
                }

                // Tag mesh with component ID for instantaneous recursive raycast mapping
                node.userData.componentId = definition.id;
                this.meshToComponentMap.set(node, definition.id);
            }
        });

        const componentData = {
            id: definition.id,
            definition: definition,
            rootObject: rootObject,
            meshes: meshes,
            originalMaterials: originalMaterials,
            originalPosition: originalPosition,
            originalRotation: originalRotation,
            originalScale: originalScale,
            originalQuaternion: originalQuaternion,
            targetPosition: originalPosition.clone(), // Current animation target
            currentAnimTime: 1.0, // 1 = arrived
            animStartPos: originalPosition.clone(),
            animEndPos: originalPosition.clone(),
            isDismantled: false,
            targetExplodedPos: targetExplodedPos
        };

        this.componentMap.set(definition.id, componentData);
    }

    /* =========================================================================
       DISMANTLING & REASSEMBLY LOGIC (Robust, Non-cumulative Tween System)
       ========================================================================= */

    animateComponentTo(comp, targetPos, duration = 1.0) {
        comp.animStartPos.copy(comp.rootObject.position);
        comp.animEndPos.copy(targetPos);
        comp.currentAnimTime = 0.0;
        comp.animDuration = duration;
    }

    explodeAll() {
        this.isExploded = true;
        this.componentMap.forEach((comp) => {
            comp.isDismantled = true;
            this.animateComponentTo(comp, comp.targetExplodedPos, 1.2);
        });

        this.updateExplodedButtonState(true);
        this.renderComponentPills();
    }

    assembleAll() {
        this.isExploded = false;
        this.selectedComponentId = null;

        this.componentMap.forEach((comp) => {
            comp.isDismantled = false;
            this.clearHighlight(comp);
            this.animateComponentTo(comp, comp.originalPosition, 1.1);
        });

        this.updateExplodedButtonState(false);
        this.renderComponentPills();
        this.showMissionOverview();
    }

    toggleComponentDismantle(id) {
        const comp = this.componentMap.get(id);
        if (!comp) return;

        if (comp.isDismantled) {
            // Reassemble this component
            comp.isDismantled = false;
            this.animateComponentTo(comp, comp.originalPosition, 0.9);
            this.clearHighlight(comp);
            if (this.selectedComponentId === id) {
                this.selectedComponentId = null;
                this.showMissionOverview();
            }
        } else {
            // Dismantle this component
            comp.isDismantled = true;
            this.animateComponentTo(comp, comp.targetExplodedPos, 0.9);
            this.selectComponent(id);
        }

        // Check if all are exploded
        const allExploded = Array.from(this.componentMap.values()).every(c => c.isDismantled);
        this.isExploded = allExploded;
        this.updateExplodedButtonState(allExploded);
        this.renderComponentPills();
    }

    selectComponent(id) {
        if (!this.componentMap.has(id)) return;

        // Unhighlight previously selected
        if (this.selectedComponentId && this.selectedComponentId !== id) {
            const prevComp = this.componentMap.get(this.selectedComponentId);
            if (prevComp) this.clearHighlight(prevComp);
        }

        this.selectedComponentId = id;
        const comp = this.componentMap.get(id);

        // Highlight selected component
        this.applyHighlight(comp, 0x49b9ff, 0.6);

        // Move component if not already dismantled
        if (!comp.isDismantled) {
            comp.isDismantled = true;
            this.animateComponentTo(comp, comp.targetExplodedPos, 0.9);
        }

        // Display rich educational information
        this.displayComponentInfo(comp.definition);
        this.renderComponentPills();
    }

    applyHighlight(comp, colorHex, intensity = 0.5) {
        comp.meshes.forEach(mesh => {
            const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
            mats.forEach(mat => {
                if (mat.emissive) {
                    mat.emissive.setHex(colorHex);
                    mat.emissiveIntensity = intensity;
                }
            });
        });
    }

    clearHighlight(comp) {
        comp.meshes.forEach(mesh => {
            const orig = comp.originalMaterials.get(mesh);
            if (!orig) return;

            if (Array.isArray(mesh.material)) {
                mesh.material.forEach((mat, idx) => {
                    const origMat = orig[idx];
                    if (mat.emissive && origMat) {
                        mat.emissive.copy(origMat.emissive);
                        mat.emissiveIntensity = origMat.emissiveIntensity;
                    }
                });
            } else if (mesh.material && orig) {
                if (mesh.material.emissive) {
                    mesh.material.emissive.copy(orig.emissive);
                    mesh.material.emissiveIntensity = orig.emissiveIntensity;
                }
            }
        });
    }

    resetCamera() {
        this.isResettingCamera = true;
        this.cameraAnimProgress = 0;
        this.cameraStartPos.copy(this.camera.position);
        this.cameraTargetPos.copy(this.initialCameraPosition);
    }

    /* =========================================================================
       RAYCASTING & INTERACTION
       ========================================================================= */

    setupEventListeners() {
        window.addEventListener('resize', () => this.onWindowResize());

        const dom = this.renderer.domElement;

        dom.addEventListener('pointerdown', (e) => {
            this.isPointerDown = true;
            this.pointerDownPos.set(e.clientX, e.clientY);
        });

        dom.addEventListener('pointermove', (e) => {
            const rect = dom.getBoundingClientRect();
            this.pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            this.pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

            if (!this.isPointerDown) {
                this.handlePointerHover();
            }
        });

        dom.addEventListener('pointerup', (e) => {
            if (!this.isPointerDown) return;
            this.isPointerDown = false;

            // Distinguish click from orbit drag
            const dist = Math.hypot(e.clientX - this.pointerDownPos.x, e.clientY - this.pointerDownPos.y);
            if (dist < 6) {
                this.handlePointerClick();
            }
        });
    }

    handlePointerHover() {
        if (!this.spacecraftGroup) return;

        this.raycaster.setFromCamera(this.pointer, this.camera);
        const intersects = this.raycaster.intersectObjects(this.spacecraftGroup.children, true);

        let hitComponentId = null;
        for (const hit of intersects) {
            let curr = hit.object;
            while (curr && curr !== this.spacecraftGroup) {
                if (curr.userData && curr.userData.componentId) {
                    hitComponentId = curr.userData.componentId;
                    break;
                }
                curr = curr.parent;
            }
            if (hitComponentId) break;
        }

        if (hitComponentId !== this.hoveredComponentId) {
            // Clear previous hover
            if (this.hoveredComponentId && this.hoveredComponentId !== this.selectedComponentId) {
                const prev = this.componentMap.get(this.hoveredComponentId);
                if (prev) this.clearHighlight(prev);
            }

            this.hoveredComponentId = hitComponentId;

            // Apply subtle hover glow
            if (this.hoveredComponentId && this.hoveredComponentId !== this.selectedComponentId) {
                const curr = this.componentMap.get(this.hoveredComponentId);
                if (curr) this.applyHighlight(curr, 0x76d2ff, 0.35);
            }

            this.renderer.domElement.style.cursor = hitComponentId ? 'pointer' : 'default';
        }
    }

    handlePointerClick() {
        if (!this.spacecraftGroup) return;

        this.raycaster.setFromCamera(this.pointer, this.camera);
        const intersects = this.raycaster.intersectObjects(this.spacecraftGroup.children, true);

        for (const hit of intersects) {
            let curr = hit.object;
            while (curr && curr !== this.spacecraftGroup) {
                if (curr.userData && curr.userData.componentId) {
                    const id = curr.userData.componentId;
                    this.toggleComponentDismantle(id);
                    return;
                }
                curr = curr.parent;
            }
        }
    }

    onWindowResize() {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    /* =========================================================================
       ANIMATION LOOP (Single, Unified, Smooth)
       ========================================================================= */

    animate() {
        this.animationFrameId = requestAnimationFrame(this.animate);

        const delta = Math.min(this.clock.getDelta(), 0.1);

        // Update controls
        this.controls.update();

        // Optional gentle auto-rotation
        if (this.autoRotate && !this.controls.state) {
            this.spacecraftGroup.rotation.y += 0.003;
        }

        // Starfield slow cosmic drift
        if (this.starField) {
            this.starField.rotation.y += 0.0002;
        }

        // Camera smooth reset animation
        if (this.isResettingCamera) {
            this.cameraAnimProgress += delta * 1.8;
            if (this.cameraAnimProgress >= 1.0) {
                this.cameraAnimProgress = 1.0;
                this.isResettingCamera = false;
            }
            const t = this.easeInOutCubic(this.cameraAnimProgress);
            this.camera.position.lerpVectors(this.cameraStartPos, this.cameraTargetPos, t);
            this.controls.target.lerp(this.initialControlsTarget, t);
        }

        // Component dismantling animations
        this.componentMap.forEach((comp) => {
            if (comp.currentAnimTime < 1.0) {
                comp.currentAnimTime += delta / (comp.animDuration || 1.0);
                if (comp.currentAnimTime >= 1.0) {
                    comp.currentAnimTime = 1.0;
                }
                const ease = this.easeInOutCubic(comp.currentAnimTime);
                comp.rootObject.position.lerpVectors(comp.animStartPos, comp.animEndPos, ease);
            }
        });

        this.renderer.render(this.scene, this.camera);
    }

    easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    /* =========================================================================
       UI & EDUCATIONAL STORYTELLING PANEL
       ========================================================================= */

    setupUI() {
        // Exploded View Button
        const explodeBtn = document.getElementById('btn-exploded-view');
        if (explodeBtn) {
            explodeBtn.addEventListener('click', () => {
                if (this.isExploded) {
                    this.assembleAll();
                } else {
                    this.explodeAll();
                }
            });
        }

        // Assemble Spacecraft Button
        const assembleBtn = document.getElementById('btn-assemble');
        if (assembleBtn) {
            assembleBtn.addEventListener('click', () => {
                this.assembleAll();
            });
        }

        // Reset Camera Button
        const resetCamBtn = document.getElementById('btn-reset-cam');
        if (resetCamBtn) {
            resetCamBtn.addEventListener('click', () => {
                this.resetCamera();
            });
        }

        // Auto-Rotate Button
        const autoRotateBtn = document.getElementById('btn-auto-rotate');
        if (autoRotateBtn) {
            autoRotateBtn.addEventListener('click', () => {
                this.autoRotate = !this.autoRotate;
                autoRotateBtn.classList.toggle('active', this.autoRotate);
            });
        }

        // Wireframe / X-Ray Mode Toggle
        const xrayBtn = document.getElementById('btn-xray');
        if (xrayBtn) {
            xrayBtn.addEventListener('click', () => {
                this.toggleXRayMode();
                xrayBtn.classList.toggle('active', this.isXRayMode);
            });
        }

        // Story modal toggle / close buttons
        const storyToggleBtn = document.getElementById('btn-story-overview');
        const infoPanel = document.getElementById('info-panel');
        const closePanelBtn = document.getElementById('btn-close-panel');

        if (storyToggleBtn) {
            storyToggleBtn.addEventListener('click', () => {
                if (infoPanel) {
                    infoPanel.classList.toggle('collapsed');
                    if (!infoPanel.classList.contains('collapsed')) {
                        this.showMissionOverview();
                    }
                }
            });
        }

        if (closePanelBtn) {
            closePanelBtn.addEventListener('click', () => {
                if (infoPanel) {
                    infoPanel.classList.add('collapsed');
                }
            });
        }
    }

    toggleXRayMode() {
        this.isXRayMode = !this.isXRayMode;
        this.componentMap.forEach((comp) => {
            comp.meshes.forEach(mesh => {
                const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
                mats.forEach(mat => {
                    mat.wireframe = this.isXRayMode;
                });
            });
        });
    }

    updateExplodedButtonState(isExploded) {
        const btn = document.getElementById('btn-exploded-view');
        if (!btn) return;
        if (isExploded) {
            btn.classList.add('active');
            btn.querySelector('.btn-label').textContent = 'Collapse View';
        } else {
            btn.classList.remove('active');
            btn.querySelector('.btn-label').textContent = 'Exploded View';
        }
    }

    renderComponentPills() {
        const container = document.getElementById('component-pills-list');
        if (!container) return;

        container.innerHTML = '';
        this.componentMap.forEach((comp, id) => {
            const pill = document.createElement('button');
            pill.className = 'comp-pill';
            if (this.selectedComponentId === id) pill.classList.add('selected');
            if (comp.isDismantled) pill.classList.add('dismantled');

            pill.innerHTML = `
                <span class="pill-dot"></span>
                <span class="pill-text">${comp.definition.name}</span>
            `;

            pill.addEventListener('click', () => {
                this.toggleComponentDismantle(id);
            });

            container.appendChild(pill);
        });
    }

    showMissionOverview() {
        const titleEl = document.getElementById('info-title');
        const tagEl = document.getElementById('info-tag');
        const descEl = document.getElementById('info-desc');
        const specsContainer = document.getElementById('info-specs');
        const contextEl = document.getElementById('info-context');
        const actionBtn = document.getElementById('info-action-btn');

        if (titleEl) titleEl.textContent = MISSION_OVERVIEW.title;
        if (tagEl) {
            tagEl.textContent = MISSION_OVERVIEW.subtitle;
            tagEl.className = 'info-badge overview-badge';
        }
        if (descEl) descEl.textContent = MISSION_OVERVIEW.summary;

        if (specsContainer) {
            specsContainer.innerHTML = '';
            MISSION_OVERVIEW.stats.forEach(stat => {
                const card = document.createElement('div');
                card.className = 'spec-item';
                card.innerHTML = `
                    <span class="spec-label">${stat.label}</span>
                    <span class="spec-value">${stat.value}</span>
                `;
                specsContainer.appendChild(card);
            });
        }

        if (contextEl) {
            contextEl.innerHTML = `
                <div class="mission-quote">
                    "Every future image of an exoplanet atmosphere and every search for life beyond Earth stands directly on the shoulders of the team that taught humanity how to watch the stars blink."
                    <div class="quote-author">— Dr. William Borucki & The Kepler Mission Team</div>
                </div>
            `;
        }

        if (actionBtn) {
            actionBtn.style.display = 'none';
        }
    }

    displayComponentInfo(def) {
        const infoPanel = document.getElementById('info-panel');
        if (infoPanel) infoPanel.classList.remove('collapsed');

        const titleEl = document.getElementById('info-title');
        const tagEl = document.getElementById('info-tag');
        const descEl = document.getElementById('info-desc');
        const specsContainer = document.getElementById('info-specs');
        const contextEl = document.getElementById('info-context');
        const actionBtn = document.getElementById('info-action-btn');

        if (titleEl) titleEl.textContent = def.name;
        if (tagEl) {
            tagEl.textContent = `${def.category} • ${def.tag}`;
            tagEl.className = 'info-badge comp-badge';
        }
        if (descEl) descEl.textContent = def.fullDesc;

        if (specsContainer) {
            specsContainer.innerHTML = '';
            def.specs.forEach(spec => {
                const item = document.createElement('div');
                item.className = 'spec-item';
                item.innerHTML = `
                    <span class="spec-label">${spec.label}</span>
                    <span class="spec-value">${spec.value}</span>
                `;
                specsContainer.appendChild(item);
            });
        }

        if (contextEl) {
            contextEl.innerHTML = `
                <div class="history-card">
                    <div class="history-title">Mission Engineering Context</div>
                    <div class="history-body">${def.missionContext}</div>
                </div>
            `;
        }

        if (actionBtn) {
            actionBtn.style.display = 'flex';
            const comp = this.componentMap.get(def.id);
            const isDismantled = comp && comp.isDismantled;
            actionBtn.textContent = isDismantled ? 'Return to Assembly' : 'Separate Component';
            actionBtn.onclick = () => {
                this.toggleComponentDismantle(def.id);
            };
        }
    }

    updateLoading(progress, message) {
        if (this.progressBar) this.progressBar.style.width = `${progress}%`;
        if (this.loadingText) this.loadingText.textContent = message;
    }

    hideLoading() {
        if (this.loadingOverlay) {
            this.loadingOverlay.classList.add('hidden');
            setTimeout(() => {
                this.loadingOverlay.style.display = 'none';
            }, 500);
        }
    }

    showError(message) {
        if (this.loadingOverlay) this.loadingOverlay.style.display = 'none';
        if (this.errorModal) {
            this.errorModal.classList.remove('hidden');
            this.errorMessage.textContent = message;
        }
    }
}

// Instantiate upon DOM load
window.addEventListener('DOMContentLoaded', () => {
    window.keplerApp = new KeplerExplorerApp();
});
