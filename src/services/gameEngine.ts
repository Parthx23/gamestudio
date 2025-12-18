import * as THREE from 'three';

export class GameEngine {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private gameObjects: Map<string, THREE.Object3D> = new Map();

  constructor(container: HTMLElement) {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setClearColor(0x1a1a2e);
    container.appendChild(this.renderer.domElement);

    // Basic lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    this.scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    this.scene.add(directionalLight);

    this.camera.position.set(0, 5, 10);
    this.camera.lookAt(0, 0, 0);
  }

  loadGameConfig(config: any) {
    // Clear existing objects
    this.gameObjects.forEach(obj => this.scene.remove(obj));
    this.gameObjects.clear();

    // Load objects from config
    config.objects?.forEach((objConfig: any) => {
      const object = this.createGameObject(objConfig);
      if (object) {
        this.gameObjects.set(objConfig.id, object);
        this.scene.add(object);
      }
    });

    // Apply settings
    if (config.settings?.environment) {
      this.setEnvironment(config.settings.environment);
    }
  }

  private createGameObject(config: any): THREE.Object3D | null {
    let geometry: THREE.BufferGeometry;
    let material: THREE.Material;

    // Create geometry based on type
    switch (config.type) {
      case 'car':
        geometry = new THREE.BoxGeometry(2, 1, 4);
        material = new THREE.MeshLambertMaterial({ color: config.properties?.color || 0xff0000 });
        break;
      case 'track':
        geometry = new THREE.PlaneGeometry(50, 50);
        material = new THREE.MeshLambertMaterial({ color: 0x333333 });
        break;
      case 'block':
        geometry = new THREE.BoxGeometry(1, 1, 1);
        material = new THREE.MeshLambertMaterial({ color: config.properties?.color || 0x00ff00 });
        break;
      case 'platform':
        geometry = new THREE.BoxGeometry(4, 0.5, 4);
        material = new THREE.MeshLambertMaterial({ color: config.properties?.color || 0x0000ff });
        break;
      default:
        return null;
    }

    const mesh = new THREE.Mesh(geometry, material);
    
    // Apply transforms
    if (config.position) {
      mesh.position.set(config.position.x, config.position.y, config.position.z);
    }
    if (config.rotation) {
      mesh.rotation.set(config.rotation.x, config.rotation.y, config.rotation.z);
    }
    if (config.scale) {
      mesh.scale.set(config.scale.x, config.scale.y, config.scale.z);
    }

    return mesh;
  }

  private setEnvironment(environment: string) {
    switch (environment) {
      case 'space':
        this.scene.background = new THREE.Color(0x000011);
        break;
      case 'forest':
        this.scene.background = new THREE.Color(0x228B22);
        break;
      case 'desert':
        this.scene.background = new THREE.Color(0xF4A460);
        break;
      default:
        this.scene.background = new THREE.Color(0x87CEEB);
    }
  }

  updatePlayerPosition(playerId: string, position: any, rotation: any) {
    const player = this.gameObjects.get(playerId);
    if (player) {
      player.position.set(position.x, position.y, position.z);
      player.rotation.set(rotation.x, rotation.y, rotation.z);
    }
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    this.render();
  }

  resize(width: number, height: number) {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  dispose() {
    this.renderer.dispose();
    this.gameObjects.clear();
  }
}