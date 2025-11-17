"use client"

import { Canvas, useFrame } from "@react-three/fiber"
import { useRef, useMemo } from "react"
import * as THREE from "three"

interface ParticleWavesProps {
  hovering: boolean
}

function ParticleWaves({ hovering }: ParticleWavesProps) {
  const groupRef = useRef<THREE.Group>(null)
  const timeRef = useRef(0)

  // Configuration for the particle waves
  const config = {
    waveCount: 5,
    particlesPerWave: 3000,
    waveAmplitude: 1.2,
    waveFrequency: 0.8,
    waveSpeed: 0.3,
    waveSpacing: 0.8,
    particleSize: 0.015,
  }

  // Create particle systems for each wave
  const waves = useMemo(() => {
    const wavesArray = []

    for (let waveIndex = 0; waveIndex < config.waveCount; waveIndex++) {
      const positions = new Float32Array(config.particlesPerWave * 3)
      const colors = new Float32Array(config.particlesPerWave * 3)

      // Calculate depth for this wave layer
      const depth = waveIndex / config.waveCount
      const opacity = 0.4 + depth * 0.6

      for (let i = 0; i < config.particlesPerWave; i++) {
        // Distribute particles evenly across the width
        const x = (i / config.particlesPerWave) * 20 - 10
        const y = 0
        const z = -waveIndex * config.waveSpacing

        positions[i * 3] = x
        positions[i * 3 + 1] = y
        positions[i * 3 + 2] = z

        // White color with varying opacity
        colors[i * 3] = 1
        colors[i * 3 + 1] = 1
        colors[i * 3 + 2] = 1
      }

      const geometry = new THREE.BufferGeometry()
      geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3))
      geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3))

      wavesArray.push({
        geometry,
        waveIndex,
        depth,
        opacity,
      })
    }

    return wavesArray
  }, [])

  useFrame((state, delta) => {
    if (!groupRef.current) return

    timeRef.current += delta * config.waveSpeed

    // Update each wave
    waves.forEach(({ geometry, waveIndex, depth }) => {
      const positions = geometry.attributes.position.array as Float32Array
      const depthScale = 1 - depth * 0.3

      for (let i = 0; i < config.particlesPerWave; i++) {
        const x = positions[i * 3]

        // Calculate wave motion with multiple sine waves for complexity
        const wavePhase = timeRef.current + waveIndex * 0.5
        const primaryWave = Math.sin(x * config.waveFrequency + wavePhase) * config.waveAmplitude * depthScale
        const secondaryWave =
          Math.sin(x * config.waveFrequency * 2.1 + wavePhase * 1.4) * (config.waveAmplitude * 0.15) * depthScale
        const tertiaryWave =
          Math.sin(x * config.waveFrequency * 0.6 + wavePhase * 0.8) * (config.waveAmplitude * 0.1) * depthScale

        const y = primaryWave + secondaryWave + tertiaryWave

        // Vertical offset for wave separation
        const waveOffset = (waveIndex - config.waveCount / 2) * config.waveSpacing

        positions[i * 3 + 1] = y + waveOffset
      }

      geometry.attributes.position.needsUpdate = true
    })

    // Subtle rotation on hover
    if (hovering) {
      groupRef.current.rotation.y += delta * 0.1
    } else {
      groupRef.current.rotation.y *= 0.95
    }
  })

  return (
    <group ref={groupRef}>
      {waves.map(({ geometry, opacity }, index) => (
        <points key={index} geometry={geometry}>
          <pointsMaterial
            size={config.particleSize}
            vertexColors
            transparent
            opacity={opacity}
            sizeAttenuation
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </points>
      ))}
    </group>
  )
}

export function GL({ hovering }: ParticleWavesProps) {
  return (
    <div className="fixed inset-0 -z-10">
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }} gl={{ antialias: true, alpha: true }} dpr={[1, 2]}>
        <color attach="background" args={["#000000"]} />
        <ParticleWaves hovering={hovering} />
      </Canvas>
    </div>
  )
}
