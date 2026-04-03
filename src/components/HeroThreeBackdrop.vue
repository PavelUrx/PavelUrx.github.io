<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { Color, InstancedMesh, SpotLight } from 'three'

const host = ref<HTMLElement | null>(null)

/** User toggle: stop the render loop (saves GPU); distinct from prefers-reduced-motion. */
const backdropPaused = ref(false)

type THREE_Module = typeof import('three')

function readCssColor(varName: string, fallback: string, THREE: THREE_Module): Color {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(varName).trim()
  try {
    return new THREE.Color(raw || fallback)
  } catch {
    return new THREE.Color(fallback)
  }
}

let teardown: (() => void) | undefined
let loadCancelled = false

onMounted(() => {
  const el = host.value
  if (!el) return

  void import('three').then((THREE) => {
    if (loadCancelled || !host.value) return
    const mountEl = host.value

    const voidCol = readCssColor('--color-background-solid', '#050514', THREE)
    const voidPanel = readCssColor('--void-panel', '#0d1024', THREE)
    const neoBlue = readCssColor('--neo-blue', 'rgb(12, 235, 255)', THREE)
    const neoPink = readCssColor('--neo-pink', 'rgb(255, 64, 208)', THREE)
    const neoViolet = readCssColor('--neo-violet', 'rgb(176, 102, 255)', THREE)
    const neoFuchsia = readCssColor('--neo-fuchsia', 'rgb(255, 38, 170)', THREE)
    const spotPalette = [neoBlue, neoPink, neoViolet, neoFuchsia]

    /** Phones / narrow / touch-primary: cheaper GL (no AA, DPR cap, no shadows). */
    const lite =
      window.matchMedia('(max-width: 1024px)').matches ||
      (window.matchMedia('(hover: none)').matches &&
        window.matchMedia('(pointer: coarse)').matches)

    const scene = new THREE.Scene()
    scene.background = voidCol.clone()

    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.2, 40)
    camera.position.set(0, 0, 10)

    const screenMat = new THREE.MeshStandardMaterial({
      color: voidPanel.clone().lerp(neoBlue, 0.035),
      roughness: 0.92,
      metalness: 0.14,
      side: THREE.FrontSide,
      emissive: neoBlue.clone().multiplyScalar(0.028).lerp(neoViolet, 0.35),
      emissiveIntensity: 0.1,
    })

    const screenGeom = new THREE.PlaneGeometry(1, 1)
    const screen = new THREE.Mesh(screenGeom, screenMat)
    screen.receiveShadow = !lite
    scene.add(screen)

    const rainMat = new THREE.MeshStandardMaterial({
      color: 0x0f1626,
      roughness: 0.52,
      metalness: 0.52,
    })

    const OCT_COUNT = 38
    const BOX_COUNT = 44
    const octGeom = new THREE.OctahedronGeometry(0.055, 0)
    const boxGeom = new THREE.BoxGeometry(0.072, 0.072, 0.072)
    const rainOct = new THREE.InstancedMesh(octGeom, rainMat, OCT_COUNT) as InstancedMesh
    const rainBox = new THREE.InstancedMesh(boxGeom, rainMat, BOX_COUNT) as InstancedMesh
    rainOct.castShadow = !lite
    rainOct.receiveShadow = false
    rainBox.castShadow = !lite
    rainBox.receiveShadow = false
    scene.add(rainOct)
    scene.add(rainBox)

    type RainLayer = {
      mesh: InstancedMesh
      n: number
      px: Float32Array
      py: Float32Array
      pz: Float32Array
      vx: Float32Array
      vy: Float32Array
      rot: Float32Array
      vr: Float32Array
      scl: Float32Array
    }

    const dummy = new THREE.Object3D()

    let rainHalfW = 6
    let rainHalfH = 3.8

    const respawn = (L: RainLayer, i: number) => {
      const hw = rainHalfW * 1.05
      const hh = rainHalfH
      L.px[i] = (Math.random() * 2 - 1) * hw
      L.py[i] = hh * (1.05 + Math.random() * 0.95)
      L.pz[i] = 0.4 + Math.random() * 0.22
      L.vx[i] = (Math.random() - 0.5) * 0.14
      L.vy[i] = -(0.58 + Math.random() * 0.42)
      L.rot[i] = Math.random() * Math.PI * 2
      L.vr[i] = (Math.random() - 0.5) * 0.75
      L.scl[i] = 0.65 + Math.random() * 0.35
    }

    const initLayer = (L: RainLayer) => {
      for (let i = 0; i < L.n; i++) {
        respawn(L, i)
        L.py[i]! -= Math.random() * rainHalfH * 1.55
      }
    }

    const pxOct = new Float32Array(OCT_COUNT)
    const pyOct = new Float32Array(OCT_COUNT)
    const pzOct = new Float32Array(OCT_COUNT)
    const vxOct = new Float32Array(OCT_COUNT)
    const vyOct = new Float32Array(OCT_COUNT)
    const rotOct = new Float32Array(OCT_COUNT)
    const vrOct = new Float32Array(OCT_COUNT)
    const sclOct = new Float32Array(OCT_COUNT)

    const pxBox = new Float32Array(BOX_COUNT)
    const pyBox = new Float32Array(BOX_COUNT)
    const pzBox = new Float32Array(BOX_COUNT)
    const vxBox = new Float32Array(BOX_COUNT)
    const vyBox = new Float32Array(BOX_COUNT)
    const rotBox = new Float32Array(BOX_COUNT)
    const vrBox = new Float32Array(BOX_COUNT)
    const sclBox = new Float32Array(BOX_COUNT)

    const layerOct: RainLayer = {
      mesh: rainOct,
      n: OCT_COUNT,
      px: pxOct,
      py: pyOct,
      pz: pzOct,
      vx: vxOct,
      vy: vyOct,
      rot: rotOct,
      vr: vrOct,
      scl: sclOct,
    }
    const layerBox: RainLayer = {
      mesh: rainBox,
      n: BOX_COUNT,
      px: pxBox,
      py: pyBox,
      pz: pzBox,
      vx: vxBox,
      vy: vyBox,
      rot: rotBox,
      vr: vrBox,
      scl: sclBox,
    }

    const updateRainMatrices = (L: RainLayer) => {
      for (let i = 0; i < L.n; i++) {
        dummy.position.set(L.px[i]!, L.py[i]!, L.pz[i]!)
        const r = L.rot[i]!
        dummy.rotation.set(r * 0.38, r * 0.62, r * 0.28)
        dummy.scale.setScalar(L.scl[i]!)
        dummy.updateMatrix()
        L.mesh.setMatrixAt(i, dummy.matrix)
      }
      L.mesh.instanceMatrix.needsUpdate = true
    }

    const stepRain = (L: RainLayer, dto: number) => {
      const mult = 1.22
      const floorY = -rainHalfH * 1.25
      for (let i = 0; i < L.n; i++) {
        L.px[i]! += L.vx[i]! * dto * mult
        L.py[i]! += L.vy[i]! * dto * mult
        L.rot[i]! += L.vr[i]! * dto
        if (L.py[i]! < floorY) respawn(L, i)
      }
    }

    const amb = new THREE.AmbientLight(0x1a2448, 0.035)
    scene.add(amb)

    const fill = new THREE.HemisphereLight(0x352060, 0x060818, 0.07)
    scene.add(fill)

    const spotTarget = new THREE.Object3D()
    spotTarget.position.set(0, 0, 0)
    scene.add(spotTarget)

    const spots: SpotLight[] = []
    const spotOrbitBase = [
      { phase: 0, speed: 0.48, rx: 6.6, ry: 5.6, rz: 2.55, cx: 0.95 },
      { phase: 2.1, speed: 0.4, rx: 6.0, ry: 5.1, rz: 2.95, cx: -0.52 },
      { phase: 4.2, speed: 0.52, rx: 7.2, ry: 4.6, rz: 2.25, cx: 0.3 },
      { phase: 1.4, speed: 0.44, rx: 6.4, ry: 5.35, rz: 2.75, cx: 0.65 },
    ]
    const spotTimeScale = 0.76

    for (let i = 0; i < 4; i++) {
      const col = spotPalette[i % spotPalette.length]
      const s = new THREE.SpotLight(col, 96, 48, Math.PI / 5.2, 0.48, 1.25)
      s.position.set(2 + i * 0.85, 4.5, 7.2)
      s.target = spotTarget
      s.castShadow = !lite && i < 2
      if (s.castShadow) {
        s.shadow.mapSize.set(1024, 1024)
        s.shadow.radius = 2.8
        s.shadow.bias = -0.00012
        s.shadow.normalBias = 0.042
      }
      scene.add(s)
      spots.push(s)
    }

    const renderer = new THREE.WebGLRenderer({
      antialias: !lite,
      powerPreference: lite ? 'default' : 'high-performance',
    })
    renderer.setPixelRatio(
      lite ? Math.min(window.devicePixelRatio, 1) : Math.min(window.devicePixelRatio, 2),
    )
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 0.9
    renderer.shadowMap.enabled = !lite
    renderer.shadowMap.type = THREE.PCFSoftShadowMap

    const mouse = { x: 0, y: 0, tx: 0, ty: 0 }
    const onPointerMove = (e: PointerEvent) => {
      mouse.tx = (e.clientX / window.innerWidth) * 2 - 1
      mouse.ty = (e.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('pointermove', onPointerMove, { passive: true })

    const clock = new THREE.Clock()

    const updateLayout = (w: number, h: number) => {
      const aspect = w / Math.max(h, 1)
      const halfH = 3.8
      const halfW = halfH * aspect

      rainHalfW = halfW
      rainHalfH = halfH

      camera.left = -halfW
      camera.right = halfW
      camera.top = halfH
      camera.bottom = -halfH
      camera.updateProjectionMatrix()

      const sw = halfW * 2
      const sh = halfH * 2
      screen.scale.set(sw, sh, 1)
      screen.position.set(0, 0, 0)
    }

    const resize = () => {
      const w = mountEl.clientWidth
      const h = mountEl.clientHeight
      updateLayout(w, h)
      renderer.setSize(w, h, false)
    }

    resize()
    initLayer(layerOct)
    initLayer(layerBox)
    updateRainMatrices(layerOct)
    updateRainMatrices(layerBox)

    mountEl.appendChild(renderer.domElement)

    const reduceMotionMq = window.matchMedia('(prefers-reduced-motion: reduce)')

    const ro = new ResizeObserver(() => {
      resize()
      if (reduceMotionMq.matches) {
        renderer.render(scene, camera)
      }
    })
    ro.observe(mountEl)

    let raf = 0
    let stopPauseWatch: (() => void) | undefined

    const renderFrame = () => {
      const dt = Math.min(clock.getDelta(), 0.05)
      const t = clock.getElapsedTime()

      mouse.x += (mouse.tx - mouse.x) * 0.045
      mouse.y += (mouse.ty - mouse.y) * 0.045

      if (!reduceMotionMq.matches) {
        camera.position.x = mouse.x * 0.28
        camera.position.y = mouse.y * 0.18
        camera.position.z = 10
        camera.lookAt(0, 0, 0)

        for (let i = 0; i < spots.length; i++) {
          const cfg = spotOrbitBase[i]!
          const a = t * spotTimeScale * cfg.speed + cfg.phase
          const bx = Math.sin(a * cfg.cx) * cfg.rx
          const by = Math.cos(a * 0.73 + cfg.phase) * cfg.ry + 1.35 + Math.sin(a * 0.35 + i) * 0.55
          const bz = 5.9 + Math.sin(a * 0.58 + i * 1.1) * cfg.rz
          spots[i]!.position.set(bx, by, bz)
          spots[i]!.intensity =
            112 + Math.sin(t * spotTimeScale * 2.15 + i * 1.75) * 26
        }

        stepRain(layerOct, dt)
        stepRain(layerBox, dt)
        updateRainMatrices(layerOct)
        updateRainMatrices(layerBox)
      } else {
        camera.position.set(mouse.x * 0.1, mouse.y * 0.06, 10)
        camera.lookAt(0, 0, 0)
      }

      spotTarget.updateMatrixWorld()
      renderer.render(scene, camera)
    }

    const loop = () => {
      renderFrame()
      raf = requestAnimationFrame(loop)
    }

    const startMotion = () => {
      cancelAnimationFrame(raf)
      raf = 0
      if (reduceMotionMq.matches) {
        renderFrame()
        return
      }
      if (backdropPaused.value) {
        renderer.render(scene, camera)
        return
      }
      raf = requestAnimationFrame(loop)
    }

    stopPauseWatch = watch(
      backdropPaused,
      () => {
        cancelAnimationFrame(raf)
        raf = 0
        renderer.render(scene, camera)
        if (!backdropPaused.value && !reduceMotionMq.matches) {
          raf = requestAnimationFrame(loop)
        }
      },
      { flush: 'sync' },
    )

    reduceMotionMq.addEventListener('change', startMotion)
    clock.start()
    startMotion()

    teardown = () => {
      stopPauseWatch?.()
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onPointerMove)
      reduceMotionMq.removeEventListener('change', startMotion)
      ro.disconnect()
      screenGeom.dispose()
      screenMat.dispose()
      octGeom.dispose()
      boxGeom.dispose()
      rainMat.dispose()
      renderer.dispose()
      if (renderer.domElement.parentElement === mountEl) {
        mountEl.removeChild(renderer.domElement)
      }
    }
  })
})

onBeforeUnmount(() => {
  loadCancelled = true
  teardown?.()
  teardown = undefined
})
</script>

<template>
  <div class="hero-backdrop-root">
    <div ref="host" class="hero-canvas-host" aria-hidden="true" />
    <button
      type="button"
      class="backdrop-pause-btn"
      :aria-pressed="backdropPaused"
      :aria-label="backdropPaused ? 'Resume animated background' : 'Pause animated background'"
      @click="backdropPaused = !backdropPaused"
    >
      <span class="backdrop-pause-btn__text" aria-hidden="true">{{ backdropPaused ? 'Play' : 'Pause' }}</span>
      <span class="backdrop-pause-btn__hint">animation</span>
    </button>
  </div>
</template>

<style scoped>
.hero-backdrop-root {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
}

.hero-canvas-host {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.hero-canvas-host :deep(canvas) {
  display: block;
  width: 100%;
  height: 100%;
}

.backdrop-pause-btn {
  position: absolute;
  right: clamp(0.65rem, 3vmin, 1.1rem);
  bottom: clamp(0.65rem, 3vmin, 1.1rem);
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.06rem;
  margin: 0;
  padding: 0.4rem 0.55rem 0.38rem;
  font-family: var(--font-mono);
  line-height: 1.1;
  color: rgba(210, 225, 255, 0.88);
  background: rgba(5, 8, 22, 0.72);
  border: 1px solid rgba(12, 235, 255, 0.28);
  border-radius: 6px;
  cursor: pointer;
  pointer-events: auto;
  box-shadow:
    0 4px 18px rgba(0, 0, 0, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.04);
  transition:
    border-color 0.15s ease,
    background 0.15s ease,
    color 0.15s ease;
}

.backdrop-pause-btn:hover {
  border-color: rgba(12, 235, 255, 0.45);
  color: rgba(248, 250, 255, 0.96);
}

.backdrop-pause-btn:focus-visible {
  outline: 2px solid rgba(12, 235, 255, 0.55);
  outline-offset: 2px;
}

.backdrop-pause-btn[aria-pressed='true'] {
  border-color: rgba(176, 102, 255, 0.45);
  background: rgba(176, 102, 255, 0.1);
}

.backdrop-pause-btn__text {
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.backdrop-pause-btn__hint {
  font-size: 0.52rem;
  font-weight: 500;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  opacity: 0.55;
}
</style>
