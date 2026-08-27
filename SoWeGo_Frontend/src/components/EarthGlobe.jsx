import { Canvas } from '@react-three/fiber'
import { OrbitControls, Sphere } from '@react-three/drei'

const Earth = () => {
  // Using a simple material for a light, semi-transparent Earth
  return (
    <Sphere args={[2, 64, 64]}>
      <meshStandardMaterial
        color="#4a90e2"
        opacity={0.15}
        transparent
        emissive="#5a9ff0"
        emissiveIntensity={0.2}
        roughness={0.8}
        metalness={0.1}
      />
    </Sphere>
  )
}

const EarthGlobe = () => {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-15 -z-0">
      <div className="w-full h-full max-w-4xl max-h-4xl">
        <Canvas camera={{ position: [0, 0, 6], fov: 50 }}>
          <ambientLight intensity={0.8} />
          <pointLight position={[10, 10, 10]} intensity={0.4} />
          <directionalLight position={[-5, 5, 5]} intensity={0.2} />
          <Earth />
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate
            autoRotateSpeed={0.5}
            rotateSpeed={0.3}
          />
        </Canvas>
      </div>
    </div>
  )
}

export default EarthGlobe

