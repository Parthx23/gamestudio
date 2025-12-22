import * as THREE from 'three';

interface GamePrompt {
  environment: string;
  objects: string[];
  gameplay: string;
  theme: string;
}

interface GameObject3D {
  mesh: THREE.Mesh;
  type: string;
  behavior?: () => void;
}

export class Game3DGenerator {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private objects: GameObject3D[] = [];
  private animationId: number | null = null;

  constructor(container: HTMLElement) {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setClearColor(0x000011);
    container.appendChild(this.renderer.domElement);

    // Basic lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    this.scene.add(ambientLight, directionalLight);

    this.camera.position.set(0, 5, 10);
    this.camera.lookAt(0, 0, 0);
  }

  parsePrompt(prompt: string): GamePrompt {
    const lower = prompt.toLowerCase();
    
    // Environment detection
    let environment = 'space';
    if (lower.includes('forest') || lower.includes('tree')) environment = 'forest';
    else if (lower.includes('desert') || lower.includes('sand')) environment = 'desert';
    else if (lower.includes('ocean') || lower.includes('water')) environment = 'ocean';
    else if (lower.includes('city') || lower.includes('building')) environment = 'city';

    // Object detection
    const objects = [];
    if (lower.includes('cube') || lower.includes('box')) objects.push('cube');
    if (lower.includes('sphere') || lower.includes('ball')) objects.push('sphere');
    if (lower.includes('pyramid') || lower.includes('triangle')) objects.push('pyramid');
    if (lower.includes('platform')) objects.push('platform');
    if (lower.includes('enemy') || lower.includes('monster')) objects.push('enemy');
    if (lower.includes('collectible') || lower.includes('coin') || lower.includes('gem')) objects.push('collectible');

    // Gameplay detection
    let gameplay = 'exploration';
    if (lower.includes('jump') || lower.includes('platform')) gameplay = 'platformer';
    else if (lower.includes('shoot') || lower.includes('fight')) gameplay = 'shooter';
    else if (lower.includes('race') || lower.includes('speed')) gameplay = 'racing';
    else if (lower.includes('puzzle')) gameplay = 'puzzle';

    // Theme detection
    let theme = 'sci-fi';
    if (lower.includes('medieval') || lower.includes('fantasy')) theme = 'fantasy';
    else if (lower.includes('horror') || lower.includes('dark')) theme = 'horror';
    else if (lower.includes('cartoon') || lower.includes('colorful')) theme = 'cartoon';

    return { environment, objects, gameplay, theme };
  }

  generateGame(prompt: string) {
    this.clearScene();
    const parsed = this.parsePrompt(prompt);
    
    this.createEnvironment(parsed.environment, parsed.theme);
    this.createObjects(parsed.objects, parsed.theme);
    this.setupGameplay(parsed.gameplay);
    
    this.animate();
  }

  private clearScene() {
    this.objects.forEach(obj => this.scene.remove(obj.mesh));
    this.objects = [];
  }

  private createEnvironment(env: string, theme: string) {
    // Ground
    const groundGeometry = new THREE.PlaneGeometry(50, 50);
    let groundColor = 0x333333;
    
    switch (env) {
      case 'forest':
        groundColor = 0x2d5016;
        this.renderer.setClearColor(0x87CEEB);
        break;
      case 'desert':
        groundColor = 0xc2b280;
        this.renderer.setClearColor(0xffd700);
        break;
      case 'ocean':
        groundColor = 0x006994;
        this.renderer.setClearColor(0x87CEEB);
        break;
      case 'city':
        groundColor = 0x555555;
        this.renderer.setClearColor(0x2c3e50);
        break;
      default:
        groundColor = 0x111111;
        this.renderer.setClearColor(0x000011);
    }

    const groundMaterial = new THREE.MeshLambertMaterial({ color: groundColor });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    this.scene.add(ground);

    // Environment objects
    if (env === 'forest') {
      for (let i = 0; i < 10; i++) {
        const tree = this.createTree();
        tree.position.set(
          (Math.random() - 0.5) * 40,
          0,
          (Math.random() - 0.5) * 40
        );
        this.scene.add(tree);
      }
    }
  }

  private createTree(): THREE.Group {
    const tree = new THREE.Group();
    
    // Trunk
    const trunkGeometry = new THREE.CylinderGeometry(0.5, 0.8, 4);
    const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = 2;
    
    // Leaves
    const leavesGeometry = new THREE.SphereGeometry(3);
    const leavesMaterial = new THREE.MeshLambertMaterial({ color: 0x228B22 });
    const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
    leaves.position.y = 5;
    
    tree.add(trunk, leaves);
    return tree;
  }

  private createObjects(objects: string[], theme: string) {
    objects.forEach((objType, index) => {
      const obj = this.createObject(objType, theme);
      obj.mesh.position.set(
        (index - objects.length / 2) * 5,
        2,
        -5
      );
      this.scene.add(obj.mesh);
      this.objects.push(obj);
    });
  }

  private createObject(type: string, theme: string): GameObject3D {
    let geometry: THREE.BufferGeometry;
    let color = 0xff6b6b;

    switch (type) {
      case 'cube':
        geometry = new THREE.BoxGeometry(2, 2, 2);
        break;
      case 'sphere':
        geometry = new THREE.SphereGeometry(1.5);
        color = 0x4ecdc4;
        break;
      case 'pyramid':
        geometry = new THREE.ConeGeometry(1.5, 3, 4);
        color = 0xfeca57;
        break;
      case 'platform':
        geometry = new THREE.BoxGeometry(6, 0.5, 2);
        color = 0x95a5a6;
        break;
      case 'enemy':
        geometry = new THREE.OctahedronGeometry(1.5);
        color = 0xe74c3c;
        break;
      case 'collectible':
        geometry = new THREE.SphereGeometry(0.8);
        color = 0xf1c40f;
        break;
      default:
        geometry = new THREE.BoxGeometry(1, 1, 1);
    }

    const material = new THREE.MeshLambertMaterial({ color });
    const mesh = new THREE.Mesh(geometry, material);

    // Add behaviors
    let behavior;
    if (type === 'enemy') {
      behavior = () => {
        mesh.rotation.y += 0.02;
        mesh.position.y = 2 + Math.sin(Date.now() * 0.003) * 0.5;
      };
    } else if (type === 'collectible') {
      behavior = () => {
        mesh.rotation.y += 0.05;
        mesh.rotation.x += 0.02;
        mesh.position.y = 2 + Math.sin(Date.now() * 0.005) * 0.3;
      };
    }

    return { mesh, type, behavior };
  }

  private setupGameplay(gameplay: string) {
    // Add player controls based on gameplay type
    const handleKeyDown = (event: KeyboardEvent) => {
      const speed = 0.5;
      switch (event.key) {
        case 'ArrowUp':
        case 'w':
          this.camera.position.z -= speed;
          break;
        case 'ArrowDown':
        case 's':
          this.camera.position.z += speed;
          break;
        case 'ArrowLeft':
        case 'a':
          this.camera.position.x -= speed;
          break;
        case 'ArrowRight':
        case 'd':
          this.camera.position.x += speed;
          break;
        case ' ':
          if (gameplay === 'platformer') {
            this.camera.position.y += 2;
            setTimeout(() => {
              this.camera.position.y = Math.max(5, this.camera.position.y - 2);
            }, 500);
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
  }

  private animate = () => {
    this.animationId = requestAnimationFrame(this.animate);

    // Update object behaviors
    this.objects.forEach(obj => {
      if (obj.behavior) obj.behavior();
    });

    this.renderer.render(this.scene, this.camera);
  };

  dispose() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    
    // Clean up Three.js objects
    this.objects.forEach(obj => {
      if (obj.mesh.geometry) obj.mesh.geometry.dispose();
      if (obj.mesh.material) {
        if (Array.isArray(obj.mesh.material)) {
          obj.mesh.material.forEach(mat => mat.dispose());
        } else {
          obj.mesh.material.dispose();
        }
      }
      this.scene.remove(obj.mesh);
    });
    
    this.renderer.dispose();
    
    // Remove canvas from DOM
    if (this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
  }
}