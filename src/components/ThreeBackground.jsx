import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, PerspectiveCamera, Sparkles, Environment, Sphere, Torus } from '@react-three/drei';

const FloatingShapes = () => {
    const groupRef = useRef();

    useFrame((state) => {
        const time = state.clock.getElapsedTime();
        if (groupRef.current) {
            groupRef.current.rotation.y = time * 0.05;
            groupRef.current.rotation.x = Math.sin(time * 0.1) * 0.05;
        }
    });

    return (
        <group ref={groupRef}>
            {/* Main Center Orb */}
            <Float speed={2} rotationIntensity={1} floatIntensity={2} floatingRange={[-0.5, 0.5]}>
                <Sphere args={[2.5, 64, 64]} position={[0, 0, -5]}>
                    <meshPhysicalMaterial
                        color="#ffffff"
                        envMapIntensity={1}
                        clearcoat={1}
                        clearcoatRoughness={0.1}
                        metalness={0.1}
                        roughness={0.15}
                        transmission={0.9}
                        ior={1.5}
                        thickness={2.5}
                    />
                </Sphere>
            </Float>

            {/* Orbiting Soft Glass Rings */}
            <Float speed={1.5} rotationIntensity={3} floatIntensity={1}>
                <Torus args={[5, 0.06, 32, 100]} position={[0, 0, -5]} rotation={[Math.PI / 4, 0, 0]}>
                    <meshPhysicalMaterial color="#c084fc" transmission={0.9} roughness={0.1} />
                </Torus>
            </Float>
            <Float speed={2} rotationIntensity={2} floatIntensity={1.5}>
                <Torus args={[6, 0.04, 32, 100]} position={[0, 0, -5]} rotation={[-Math.PI / 3, Math.PI / 4, 0]}>
                    <meshPhysicalMaterial color="#38bdf8" transmission={0.8} roughness={0.2} />
                </Torus>
            </Float>

            {/* Floating Supporting Orbs */}
            {[...Array(15)].map((_, i) => {
                const isGlass = i % 2 === 0;
                return (
                    <Float key={i} speed={2} rotationIntensity={isGlass ? 1 : 3} floatIntensity={isGlass ? 2 : 4}>
                        <mesh
                            position={[
                                (Math.random() - 0.5) * 20,
                                (Math.random() - 0.5) * 15,
                                (Math.random() - 0.5) * 10 - 2
                            ]}
                            scale={Math.random() * 0.5 + 0.3}
                        >
                            {isGlass ? (
                                <icosahedronGeometry args={[1, 0]} />
                            ) : (
                                <sphereGeometry args={[1, 32, 32]} />
                            )}
                            {isGlass ? (
                                <meshPhysicalMaterial
                                    color="#ffffff"
                                    roughness={0.1}
                                    transmission={0.9}
                                    thickness={1.5}
                                    ior={1.2}
                                />
                            ) : (
                                <meshStandardMaterial
                                    color={i % 3 === 0 ? "#818cf8" : i % 3 === 1 ? "#38bdf8" : "#f472b6"}
                                    roughness={0.4}
                                    metalness={0.1}
                                />
                            )}
                        </mesh>
                    </Float>
                );
            })}
        </group>
    );
};

export default function ThreeBackground() {
    return (
        <div className="absolute inset-0 z-0 pointer-events-none opacity-80">
            <Canvas dpr={[1, 2]}>
                <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={50} />

                {/* Advanced Clean Lighting */}
                <ambientLight intensity={1.5} />
                <directionalLight position={[10, 10, 5]} intensity={2} color="#ffffff" />
                <directionalLight position={[-10, -10, -5]} intensity={1} color="#c084fc" />
                <pointLight position={[5, -5, -5]} intensity={1.5} color="#38bdf8" />
                <pointLight position={[-5, 5, 5]} intensity={1.5} color="#f472b6" />

                {/* Environment Map for stunning glass reflections */}
                <Environment preset="city" />

                <FloatingShapes />

                {/* Subtle soft sparkles */}
                <Sparkles count={80} scale={20} size={1.5} speed={0.4} opacity={0.3} color="#ffffff" />
            </Canvas>
        </div>
    );
}
