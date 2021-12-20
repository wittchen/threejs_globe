import {
    Scene, PerspectiveCamera, WebGLRenderer, SphereGeometry, MeshPhongMaterial, Mesh,
    TextureLoader, DirectionalLight, Color, MeshBasicMaterial, BackSide
} from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

enum Images {
    earth_map = 'images/2k_earth_daymap.jpg',
    earth_bump = 'images/2k_earth_normal_map.tif',
    earth_spec = 'images/2k_earth_specular_map.tif',
    clouds_map = 'images/2k_earth_clouds.jpg',
    moon_map = 'images/moonmap1k.jpg',
    moon_bump = 'images/moonbump1k.jpg',
    clouds_alpha = 'images/earthcloudmaptrans.jpg',
    stars = 'images/8k_stars.jpg'
}

class earth {

    private EARTH_RADIUS: number = 0.95
    private EARTH_ROTATIONSPEED: number = 0.002
    private EARTH_TILDE: number = 0.6

    private CLOUDS_RADIUS: number = this.EARTH_RADIUS * 1.05
    private CLOUDS_ROTATIONSPEED: number = 0.0005

    private MOON_RADIUS: number = this.EARTH_RADIUS * 0.27  // mond is 27% the size of earth
    private MOON_ANGLE: number = 180
    private MOON_ANGLE_STEP: number = 0.002
    private MOON_DISTANCE: number = 4

    private SUNLIGHT: any = 0xffffff

    private _TextureLoader = new TextureLoader()
    private _Scene = new Scene()
    private _Renderer = new WebGLRenderer()
    private _Camera !: PerspectiveCamera
    private _Controls !: OrbitControls

    private _EarthMesh !: Mesh
    private _CloudsMesh !: Mesh
    private _MoonMesh !: Mesh
    private _StarsMesh !: Mesh

    private _Sunlight: DirectionalLight = new DirectionalLight(this.SUNLIGHT)

    constructor() {

        this._Camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
        this._Camera.position.z = 5

        this._Renderer.setSize(window.innerWidth, window.innerHeight)
        document.body.appendChild(this._Renderer.domElement)

        this._Controls = new OrbitControls(this._Camera, this._Renderer.domElement)
        this._Controls.autoRotate = true
        this._Controls.autoRotateSpeed = 0.5

        this._Sunlight.position.set(0, 1, 1).normalize()

        this.initMeshes()

        this._EarthMesh.rotation.x += this.EARTH_TILDE


        this._Scene.add(this._StarsMesh)
        this._Scene.add(this._EarthMesh)
        this._Scene.add(this._MoonMesh)
        this._Scene.add(this._Sunlight)

        window.addEventListener('resize', () => this.onWindowResize(), false)

    }

    private initMeshes() {

        this._EarthMesh = new Mesh(
            new SphereGeometry(this.EARTH_RADIUS),
            new MeshPhongMaterial({
                map: this._TextureLoader.load(Images.earth_map),
                bumpMap: this._TextureLoader.load(Images.earth_bump),
                bumpScale: 0.05,
                specularMap: this._TextureLoader.load(Images.earth_spec),
                specular: new Color('grey')
            })
        )

        this._CloudsMesh = new Mesh(
            new SphereGeometry(this.CLOUDS_RADIUS),
            new MeshPhongMaterial({
                map: this._TextureLoader.load(Images.clouds_map),
                alphaMap: this._TextureLoader.load(Images.clouds_map),
                transparent: true
            })
        )
        this._EarthMesh.add(this._CloudsMesh)

        this._MoonMesh = new Mesh(
            new SphereGeometry(this.MOON_RADIUS),
            new MeshPhongMaterial({
                map: this._TextureLoader.load(Images.moon_map),
                bumpMap: this._TextureLoader.load(Images.moon_bump),
                bumpScale: 0.05
            })
        )

        this._StarsMesh = new Mesh(
            new SphereGeometry(100),
            new MeshBasicMaterial({
                map: this._TextureLoader.load(Images.stars),
                side: BackSide
            })
        )
    }

    private render(): void {
        this._Renderer.render(this._Scene, this._Camera)
    }

    private onWindowResize(): void {
        this._Camera.aspect = window.innerWidth / window.innerHeight
        this._Camera.updateProjectionMatrix()
        this._Renderer.setSize(window.innerWidth, window.innerHeight)
        this.render()
    }

    public runApp(): void {
        requestAnimationFrame(() => this.runApp())

        this.doMovements()

        this._Controls.update()
        this.render()
    }

    private doMovements() {

        this._EarthMesh.rotation.y -= this.EARTH_ROTATIONSPEED
        this._CloudsMesh.rotation.y -= this.CLOUDS_ROTATIONSPEED

        this._MoonMesh.position.x = this.MOON_DISTANCE * Math.cos(this.MOON_ANGLE)
        this._MoonMesh.position.z = this.MOON_DISTANCE * Math.sin(this.MOON_ANGLE)
        this.MOON_ANGLE += this.MOON_ANGLE_STEP
        this.MOON_ANGLE = this.MOON_ANGLE > 360 ? 1 : this.MOON_ANGLE
    }

}

let x = new earth()
x.runApp()