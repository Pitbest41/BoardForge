import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';

function Stars(props: any) {
  const ref = useRef<any>(null);
  // Generate random points in a sphere natively
  const sphere = useMemo(() => {
    const positions = new Float32Array(5000);
    for (let i = 0; i < 5000; i += 3) {
      const u = Math.random();
      const v = Math.random();
      const theta = 2 * Math.PI * u;
      const phi = Math.acos(2 * v - 1);
      const r = 1.5 * Math.cbrt(Math.random());
      
      positions[i] = r * Math.sin(phi) * Math.cos(theta);
      positions[i + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i + 2] = r * Math.cos(phi);
    }
    return positions;
  }, []);

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.x -= delta / 10;
      ref.current.rotation.y -= delta / 15;
    }
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={sphere} stride={3} frustumCulled={false} {...props}>
        <PointMaterial
          transparent
          color="#ffffff"
          size={0.005}
          sizeAttenuation={true}
          depthWrite={false}
        />
      </Points>
    </group>
  );
}

export default function Background3D() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none opacity-50">
      <div className="absolute top-[-20%] left-[-10%] w-[120%] h-[120%] bg-[radial-gradient(circle_at_50%_50%,rgba(40,20,80,0.15),transparent_70%)]"></div>
      <div className="absolute top-[10%] right-[5%] w-[400px] h-[400px] bg-[#ff6b00] rounded-full blur-[150px] opacity-[0.08]"></div>
      <div className="absolute bottom-[10%] left-[5%] w-[500px] h-[500px] bg-[#4f46e5] rounded-full blur-[180px] opacity-[0.05]"></div>
      
      <Canvas camera={{ position: [0, 0, 1] }}>
        <Stars />
      </Canvas>
    </div>
  );
}
