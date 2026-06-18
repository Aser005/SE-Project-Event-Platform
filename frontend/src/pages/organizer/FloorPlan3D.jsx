import React, { useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PointerLockControls, Box, Cylinder, Environment, MeshReflectorMaterial, SpotLight, RoundedBox, Grid, SoftShadows, Sparkles, QuadraticBezierLine, Text, useTexture } from '@react-three/drei';
import { EffectComposer, Bloom, N8AO, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';

const lyricsData = [
  { time: 0, text: "" },
  { time: 8.18, text: "Feeling my way through the darkness" },
  { time: 11.55, text: "Guided by a beating heart" },
  { time: 16.23, text: "I can't tell where the journey will end" },
  { time: 19.52, text: "But I know where to start" },
  { time: 23.27, text: "They tell me I'm too young to understand" },
  { time: 27.03, text: "They say I'm caught up in a dream" },
  { time: 30.15, text: "Well life will pass me by if I don't open up my eyes" },
  { time: 34.94, text: "Well that's fine by me" },
  { time: 38.07, text: "So wake me up when it's all over" },
  { time: 41.88, text: "When I'm wiser and I'm older" },
  { time: 45.68, text: "All this time I was finding myself" },
  { time: 49.74, text: "And I didn't know I was lost" },
  { time: 53.73, text: "So wake me up when it's all over" },
  { time: 57.48, text: "When I'm wiser and I'm older" },
  { time: 61.60, text: "All this time I was finding myself" },
  { time: 64.96, text: "And I didn't know I was lost" },
  { time: 68.00, text: "" },
  { time: 117.04, text: "I tried carrying the weight of the world" },
  { time: 120.65, text: "But I only have two hands" },
  { time: 124.33, text: "Hope I get the chance to travel the world" },
  { time: 128.13, text: "But I don't have any plans" },
  { time: 132.31, text: "Wish that I could stay forever this young" },
  { time: 135.81, text: "Not afraid to close my eyes" },
  { time: 139.49, text: "Life's a game made for everyone" },
  { time: 144.05, text: "And love is the prize" },
  { time: 146.67, text: "So wake me up when it's all over" },
  { time: 150.22, text: "When I'm wiser and I'm older" },
  { time: 153.90, text: "All this time I was finding myself" },
  { time: 157.52, text: "And I didn't know I was lost" },
  { time: 161.73, text: "So wake me up when it's all over" },
  { time: 165.59, text: "When I'm wiser and I'm older" },
  { time: 169.52, text: "All this time I was finding myself" },
  { time: 173.90, text: "And I didn't know I was lost" },
  { time: 178.89, text: "Didn't know I was lost" },
  { time: 182.32, text: "I didn't know I was lost" },
  { time: 186.26, text: "I didn't know I was lost" },
  { time: 190.31, text: "I didn't know (didn't know, didn't know)" },
  { time: 194.00, text: "" }
];

const SCALE = 0.05; // 1 pixel in 2D = 0.05 meters in 3D

function Player() {
  const [movement, setMovement] = useState({ forward: false, backward: false, left: false, right: false, up: false, down: false });

  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.code) {
        case 'KeyW': case 'ArrowUp': setMovement(m => ({ ...m, forward: true })); break;
        case 'KeyS': case 'ArrowDown': setMovement(m => ({ ...m, backward: true })); break;
        case 'KeyA': case 'ArrowLeft': setMovement(m => ({ ...m, left: true })); break;
        case 'KeyD': case 'ArrowRight': setMovement(m => ({ ...m, right: true })); break;
        case 'Space': setMovement(m => ({ ...m, up: true })); break;
        case 'ShiftLeft': case 'ShiftRight': setMovement(m => ({ ...m, down: true })); break;
        default: break;
      }
    };
    const handleKeyUp = (e) => {
      switch (e.code) {
        case 'KeyW': case 'ArrowUp': setMovement(m => ({ ...m, forward: false })); break;
        case 'KeyS': case 'ArrowDown': setMovement(m => ({ ...m, backward: false })); break;
        case 'KeyA': case 'ArrowLeft': setMovement(m => ({ ...m, left: false })); break;
        case 'KeyD': case 'ArrowRight': setMovement(m => ({ ...m, right: false })); break;
        case 'Space': setMovement(m => ({ ...m, up: false })); break;
        case 'ShiftLeft': case 'ShiftRight': setMovement(m => ({ ...m, down: false })); break;
        default: break;
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const direction = new THREE.Vector3();
  const frontVector = new THREE.Vector3();
  const sideVector = new THREE.Vector3();
  const speed = 5;

  useFrame((state, delta) => {
    frontVector.set(0, 0, Number(movement.backward) - Number(movement.forward));
    sideVector.set(Number(movement.left) - Number(movement.right), 0, 0);
    direction.subVectors(frontVector, sideVector).normalize().multiplyScalar(speed * delta);
    
    state.camera.translateX(direction.x);
    state.camera.translateZ(direction.z);
    
    // Fly up/down
    if (movement.up) state.camera.position.y += speed * delta;
    if (movement.down) state.camera.position.y -= speed * delta;
    
    // Prevent going under the floor
    if (state.camera.position.y < 1.0) state.camera.position.y = 1.0;
  });

  return <PointerLockControls />;
}

// ==========================================
// 3D Architectural Elements 
// ==========================================

function Table3D({ x, y, width, rotation }) {
  const cx = x + width / 2;
  const cy = y + width / 2;
  const radius = (width * SCALE) / 2;
  
  return (
    <group position={[cx * SCALE, 0, cy * SCALE]} rotation={[0, -rotation * Math.PI / 180, 0]}>
      {/* Sleek Modern Tablecloth */}
      <Cylinder args={[radius, radius*1.05, 0.75, 32]} position={[0, 0.375, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#f8fafc" roughness={0.9} />
      </Cylinder>
      {/* High-Refraction Crystal Centerpiece */}
      <Cylinder args={[0.08, 0.05, 0.2, 16]} position={[0, 0.85, 0]}>
        <meshPhysicalMaterial color="#ffffff" transmission={1} ior={1.5} thickness={0.5} roughness={0} clearcoat={1} />
      </Cylinder>
      {/* Glowing Candle */}
      <Cylinder args={[0.02, 0.02, 0.1, 8]} position={[0, 0.8, 0]}>
        <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={3} />
      </Cylinder>
      
      {/* Minimalist Banquet Chairs */}
      {Array.from({length: 8}).map((_, i) => {
        const angle = (Math.PI * 2 / 8) * i;
        const chairRadius = radius + 0.45;
        const plateRadius = radius - 0.2; 
        
        return (
          <group key={i}>
            {/* Fine China Plate */}
            <Cylinder args={[0.15, 0.1, 0.02, 32]} position={[Math.cos(angle)*plateRadius, 0.76, Math.sin(angle)*plateRadius]}>
              <meshPhysicalMaterial color="#ffffff" roughness={0.1} clearcoat={1} />
            </Cylinder>
            {/* Crystal Wine Glass */}
            <Cylinder args={[0.03, 0.01, 0.12, 16]} position={[Math.cos(angle - 0.2)*plateRadius, 0.81, Math.sin(angle - 0.2)*plateRadius]} castShadow>
               <meshPhysicalMaterial color="#ffffff" transmission={1} ior={1.5} thickness={0.1} roughness={0} clearcoat={1} />
            </Cylinder>

            {/* Elegant Chair */}
            <group position={[Math.cos(angle)*chairRadius, 0, Math.sin(angle)*chairRadius]} rotation={[0, -angle + Math.PI/2, 0]}>
              {/* Leather Seat */}
              <RoundedBox args={[0.35, 0.05, 0.35]} position={[0, 0.45, 0]} radius={0.02} castShadow>
                <meshStandardMaterial color="#0f172a" roughness={0.6} />
              </RoundedBox>
              {/* Curved Backrest */}
              <Cylinder args={[0.18, 0.18, 0.3, 32, 1, false, 0, Math.PI]} position={[0, 0.65, -0.15]} rotation={[Math.PI/2, Math.PI, 0]} castShadow>
                <meshStandardMaterial color="#0f172a" roughness={0.6} side={THREE.DoubleSide} />
              </Cylinder>
              {/* Thin Metal Legs */}
              <Cylinder args={[0.01, 0.01, 0.45, 8]} position={[-0.15, 0.225, 0.15]} castShadow><meshStandardMaterial color="#94a3b8" metalness={1} roughness={0.2} /></Cylinder>
              <Cylinder args={[0.01, 0.01, 0.45, 8]} position={[0.15, 0.225, 0.15]} castShadow><meshStandardMaterial color="#94a3b8" metalness={1} roughness={0.2} /></Cylinder>
              <Cylinder args={[0.01, 0.01, 0.45, 8]} position={[-0.15, 0.225, -0.15]} castShadow><meshStandardMaterial color="#94a3b8" metalness={1} roughness={0.2} /></Cylinder>
              <Cylinder args={[0.01, 0.01, 0.45, 8]} position={[0.15, 0.225, -0.15]} castShadow><meshStandardMaterial color="#94a3b8" metalness={1} roughness={0.2} /></Cylinder>
            </group>
          </group>
        );
      })}
    </group>
  );
}

const beamVertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const beamFragmentShader = `
uniform vec3 beamColor;
uniform float beamOpacity;
varying vec2 vUv;
void main() {
  // Use clamp to prevent negative values from entering pow(), which causes NaN and corrupts the Bloom pass with black squares!
  float fade = pow(clamp(1.0 - vUv.y, 0.0, 1.0), 2.5); 
  gl_FragColor = vec4(beamColor, fade * beamOpacity);
}
`;

function MovingHead({ position, index, audio }) {
  const groupRef = React.useRef();
  const matRef = React.useRef();
  const spotRef = React.useRef();
  
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    
    if (audio && !audio.paused) {
      const audioTime = audio.currentTime;
      // Avicii - Wake Me Up Instrumental Drop (1:07 - 1:57)
      const isDrop = audioTime > 67.0 && audioTime < 117.0;
      
      const beat = Math.max(0, Math.sin(t * Math.PI * (124/60)));
      const speed = isDrop ? 4.0 : 1.0;
      
      const side = index < 2 ? 1 : -1;
      const panAngle = Math.sin(t * 1.5 * speed + index * 0.5) * 0.9 * side;
      const tiltAngle = (Math.PI / 4.5) + Math.sin(t * 1.1 * speed + index * 0.3) * (Math.PI / 6); 
      
      if (groupRef.current) {
        groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, panAngle, isDrop ? 0.4 : 0.15);
        groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, tiltAngle, isDrop ? 0.4 : 0.15);
      }
      
      if (matRef.current) {
        const hue = (t * 0.2 * speed + index * 0.25) % 1;
        const color = new THREE.Color().setHSL(hue, 1, 0.6);
        matRef.current.uniforms.beamColor.value.copy(color);
        
        let targetIntensity = 0;
        if (isDrop) {
           // Insane blinding strobe during the drop
           const fastStrobe = Math.sin(t * 80.0) > 0 ? 1.0 : 0.0;
           targetIntensity = fastStrobe * beat;
        } else {
           const slowPulse = Math.sin(t * 0.5 + index);
           if (slowPulse > 0) {
              targetIntensity = Math.max(0, Math.sin(t * 30.0)) * beat * 0.8;
           } else {
              targetIntensity = beat * 0.6;
           }
        }
        
        const lerpSpeed = isDrop ? 0.8 : 0.2; // Snappy during drop, liquid smooth otherwise
        matRef.current.uniforms.beamOpacity.value = THREE.MathUtils.lerp(matRef.current.uniforms.beamOpacity.value, targetIntensity, lerpSpeed);
        
        if (spotRef.current) {
           spotRef.current.color.copy(color);
           spotRef.current.intensity = THREE.MathUtils.lerp(spotRef.current.intensity, targetIntensity * 150, lerpSpeed);
        }
      }
    } else {
      if (groupRef.current) {
        groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, 0, 0.05);
        groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, Math.PI / 4, 0.05);
      }
      if (matRef.current) matRef.current.uniforms.beamOpacity.value = THREE.MathUtils.lerp(matRef.current.uniforms.beamOpacity.value, 0, 0.1);
      if (spotRef.current) spotRef.current.intensity = THREE.MathUtils.lerp(spotRef.current.intensity, 0, 0.1);
    }
  });

  return (
    <group position={position}>
      <Box args={[0.2, 0.1, 0.2]} position={[0, 0.05, 0]}><meshStandardMaterial color="#020617" /></Box>
      <group position={[0, -0.05, 0]} ref={groupRef}>
        <Cylinder args={[0.08, 0.12, 0.2, 16]} rotation={[Math.PI/2, 0, 0]}>
          <meshStandardMaterial color="#0f172a" />
        </Cylinder>
        <Cylinder args={[1.5, 0.05, 50, 32, 1, true]} position={[0, 0, 25]} rotation={[Math.PI/2, 0, 0]}>
          <shaderMaterial 
            ref={matRef}
            vertexShader={beamVertexShader}
            fragmentShader={beamFragmentShader}
            transparent={true}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            side={THREE.DoubleSide}
            uniforms={{
              beamColor: { value: new THREE.Color() },
              beamOpacity: { value: 0 }
            }}
          />
        </Cylinder>
        <spotLight 
          ref={spotRef}
          distance={100} angle={0.25} attenuation={5} intensity={0} 
          position={[0, 0, 0]} castShadow 
          target-position={[0, 0, 1]}
          ref={(el) => {
             if (el && !el.target.parent) {
                el.add(el.target);
                el.target.position.set(0, 0, 1);
             }
          }}
        />
      </group>
    </group>
  );
}

function LaserBeam({ position, index, audio }) {
  const groupRef = React.useRef();
  const coreRef = React.useRef();
  const haloRef = React.useRef();

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    
    if (audio && !audio.paused) {
      const audioTime = audio.currentTime;
      const isDrop = audioTime > 67.0 && audioTime < 117.0;
      
      const beat = Math.max(0, Math.sin(t * Math.PI * (124/60)));
      
      let panAngle = 0;
      let tiltAngle = 0;
      
      if (isDrop) {
        // Go completely crazy during the drop!
        const panOsc = Math.sin(t * 4.1 + index) + Math.sin(t * 5.4 + index * 2.1) * 0.5;
        panAngle = panOsc * 1.5;
        const tiltOsc = Math.sin(t * 3.8 + index * 1.5);
        tiltAngle = -(Math.PI / 4) + tiltOsc * (Math.PI / 6);
      } else {
        // Form a perfectly spaced, mostly stationary laser fan array
        const panOsc = Math.sin(t * 0.2 + index) * 0.1;
        panAngle = (index - 2) * 0.35 + panOsc; 
        
        const tiltOsc = Math.sin(t * 0.15 + index * 0.8) * 0.05;
        tiltAngle = -(Math.PI / 3) + tiltOsc; 
      }
      
      if (groupRef.current) {
        groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, panAngle, isDrop ? 0.5 : 0.05);
        groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, tiltAngle, isDrop ? 0.5 : 0.05);
      }
      
      if (coreRef.current && haloRef.current) {
        const hue = (t * (isDrop ? 1.0 : 0.1) + index * 0.2) % 1;
        const color = new THREE.Color().setHSL(hue, 1, 0.5);
        coreRef.current.color.copy(color);
        haloRef.current.color.copy(color);
        
        let targetOpacity = 0;
        if (isDrop) {
           const isStrobe = Math.sin(t * 60.0 + index) > 0;
           targetOpacity = isStrobe ? beat : 0;
        } else {
           // Gracefully fade in and out very slowly
           targetOpacity = (Math.sin(t * 0.5 + index * 1.2) * 0.5 + 0.5) * beat * 0.8;
        }
        
        const lerpSpeed = isDrop ? 0.8 : 0.05; // Liquid slow fade normally, sharp strobe on drop
        coreRef.current.opacity = THREE.MathUtils.lerp(coreRef.current.opacity, targetOpacity, lerpSpeed);
        haloRef.current.opacity = THREE.MathUtils.lerp(haloRef.current.opacity, targetOpacity * 0.25, lerpSpeed);
      }
    } else {
      if (groupRef.current) {
        groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, 0, 0.05);
        groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, -(Math.PI / 4), 0.05);
      }
      if (coreRef.current) coreRef.current.opacity = THREE.MathUtils.lerp(coreRef.current.opacity, 0, 0.1);
      if (haloRef.current) haloRef.current.opacity = THREE.MathUtils.lerp(haloRef.current.opacity, 0, 0.1);
    }
  });

  return (
    <group position={position} ref={groupRef}>
      <Cylinder args={[0.015, 0.015, 150, 8]} position={[0, 0, 75]} rotation={[Math.PI/2, 0, 0]}>
         <meshBasicMaterial ref={coreRef} color="#00ff00" transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} />
      </Cylinder>
      <Cylinder args={[0.05, 0.05, 150, 8]} position={[0, 0, 75]} rotation={[Math.PI/2, 0, 0]}>
         <meshBasicMaterial ref={haloRef} color="#ffffff" transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} />
      </Cylinder>
    </group>
  );
}

function Stage3D({ x, y, width, height, rotation, audio }) {
  const cx = x + width / 2;
  const cy = y + height / 2;
  const w = width * SCALE; // Rely on new massive 2D layout size natively
  const d = height * SCALE;
  const h = 1.0;
  
  const textGroupRef = React.useRef();
  const ledStripsRef = React.useRef([]);
  
  const [lyric, setLyric] = useState(" ");
  
  const logoTexture = useTexture('/avicii_logo.png');
  const logoAspect = logoTexture && logoTexture.image ? logoTexture.image.width / logoTexture.image.height : 2.5;
  
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    
    // Sync Lyrics Safely & Flicker LED Strips
    if (audio) {
      const audioTime = audio.currentTime;
      let currentLyric = " ";
      for (let j = 0; j < lyricsData.length; j++) {
        if (audioTime >= lyricsData[j].time && (j === lyricsData.length - 1 || audioTime < lyricsData[j+1].time)) {
          currentLyric = lyricsData[j].text || " ";
          break;
        }
      }
      if (currentLyric !== lyric) {
        setLyric(currentLyric);
      }
      
      const beat = Math.max(0, Math.sin(audioTime * Math.PI * (124/60)));
      
      // Pulse only the text scale
      const scale = 1 + beat * 0.05;
      if (textGroupRef.current) {
        textGroupRef.current.scale.set(scale, scale, scale);
      }
      
      // Flicker LED Strips
      if (audio && !audio.paused) {
        const audioTime = audio.currentTime;
        const isDrop = audioTime > 67.0 && audioTime < 117.0;
        
        let targetIntensity = 1;
        if (isDrop) {
          targetIntensity = Math.sin(t * 50.0) > 0 ? 15 : 0;
        } else {
          targetIntensity = beat > 0.8 ? 8 : 1;
        }

        ledStripsRef.current.forEach((mat, i) => {
          if (mat) {
            const step = Math.floor(t * (isDrop ? 4 : 1));
            const hue = (step * 0.2 + i * 0.5) % 1;
            mat.color.setHSL(hue, 1, 0.5);
            mat.emissive.setHSL(hue, 1, 0.5);
            mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, targetIntensity, isDrop ? 0.8 : 0.2);
          }
        });
      } else {
        ledStripsRef.current.forEach(mat => {
          if (mat) mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, 0, 0.1);
        });
      }
    }
  });

  return (
    <group position={[cx * SCALE, 0, cy * SCALE]} rotation={[0, -rotation * Math.PI / 180, 0]}>
      {/* Dark Polished Wood Stage Floor */}
      <Box args={[w, 0.05, d]} position={[0, h, 0]} castShadow receiveShadow>
        <meshPhysicalMaterial color="#1e130c" roughness={0.2} clearcoat={1} clearcoatRoughness={0.1} />
      </Box>
      {/* Matte Black Stage Base */}
      <Box args={[w - 0.05, h, d - 0.05]} position={[0, h/2, 0]} receiveShadow>
        <meshStandardMaterial color="#020617" roughness={0.9} />
      </Box>
      
      {/* Stage Edge LED Strip */}
      <Box args={[w, 0.05, 0.05]} position={[0, h + 0.025, d/2 - 0.025]}>
        <meshStandardMaterial ref={(el) => ledStripsRef.current[0] = el} color="#ffffff" emissive="#ffffff" emissiveIntensity={0} />
      </Box>

      {/* Massive Single LED Screen at the back (Black with White Text) */}
      <group position={[0, h + 2.0, -d/2 + 0.1]}>
        <Box args={[w * 0.95, 4.0, 0.1]} castShadow>
          <meshStandardMaterial color="#000000" roughness={0.2} />
        </Box>
        
        <group ref={textGroupRef} position={[0, 0, 0.06]}>
          {lyric.trim() !== "" ? (
            <Text 
              fontSize={0.8} 
              color="#ffffff"
              anchorX="center" 
              anchorY="middle"
              maxWidth={w * 0.85}
              textAlign="center"
              font="/LeviReBrushed.ttf"
              lineHeight={1.2}
            >
              {lyric}
            </Text>
          ) : (
            <mesh>
              <planeGeometry args={[
                Math.min(4.0 * logoAspect, w * 0.95), 
                Math.min(4.0 * logoAspect, w * 0.95) / logoAspect
              ]} />
              <meshBasicMaterial map={logoTexture} transparent={true} />
            </mesh>
          )}
        </group>
      </group>

      {/* Realistic Metal Truss Lattice */}
      <Box args={[0.1, 4.5, 0.1]} position={[-w/2 + 0.1, h + 2.25, -d/2 + 0.2]} castShadow><meshStandardMaterial color="#64748b" metalness={1} roughness={0.3}/></Box>
      <Box args={[0.1, 4.5, 0.1]} position={[w/2 - 0.1, h + 2.25, -d/2 + 0.2]} castShadow><meshStandardMaterial color="#64748b" metalness={1} roughness={0.3}/></Box>
      <Box args={[w, 0.2, 0.1]} position={[0, h + 4.5, -d/2 + 0.2]} castShadow><meshStandardMaterial color="#64748b" metalness={1} roughness={0.3}/></Box>
      
      {/* Top Truss LED Strip */}
      <Box args={[w, 0.05, 0.05]} position={[0, h + 4.65, -d/2 + 0.2]}>
        <meshStandardMaterial ref={(el) => ledStripsRef.current[1] = el} color="#ffffff" emissive="#ffffff" emissiveIntensity={0} />
      </Box>
      
      {/* Moving Head Lights (Fully Functional with Volumetric Beams) */}
      {[-w*0.4, -w*0.15, w*0.15, w*0.4].map((lx, i) => (
        <MovingHead key={`light-${i}`} position={[lx, h + 4.3, -d/2 + 0.3]} index={i} audio={audio} />
      ))}

      {/* Lasers */}
      {[-w*0.45, -w*0.25, 0, w*0.25, w*0.45].map((lx, i) => (
        <LaserBeam key={`laser-${i}`} position={[lx, h + 0.1, -d/2 + 0.5]} index={i} audio={audio} />
      ))}
      {/* Metal Steps */}
      <Box args={[w * 0.3, 0.4, 0.5]} position={[0, 0.2, d/2 + 0.25]} castShadow><meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.5} /></Box>
      <Box args={[w * 0.3, 0.8, 0.5]} position={[0, 0.4, d/2 - 0.25]} castShadow><meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.5} /></Box>
    </group>
  );
}

function DanceFloor3D({ x, y, width, height, rotation }) {
  const cx = x + width / 2;
  const cy = y + height / 2;
  const w = width * SCALE;
  const d = height * SCALE;
  
  // LED Matrix Dimensions (tiles are roughly 1 meter square)
  const cols = Math.max(1, Math.floor(w / 1));
  const rows = Math.max(1, Math.floor(d / 1));
  const tileW = w / cols;
  const tileD = d / rows;

  const tilesRef = React.useRef([]);
  
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    tilesRef.current.forEach((mat, i) => {
      if (mat) {
        const r = Math.floor(i / cols);
        const c = i % cols;
        // Animated color shifting across the floor
        const hue = (t * 0.2 + (r * 0.1) + (c * 0.1)) % 1;
        mat.color.setHSL(hue, 0.8, 0.3);
        mat.emissive.setHSL(hue, 0.9, 0.6);
        // Pulse intensity wave
        mat.emissiveIntensity = Math.sin(t * 3 + r + c) * 1.5 + 2;
      }
    });
  });

  return (
    <group position={[cx * SCALE, 0.01, cy * SCALE]} rotation={[0, -rotation * Math.PI / 180, 0]}>
      {/* Dark Base */}
      <Box args={[w, 0.02, d]} position={[0, 0.01, 0]}>
        <meshStandardMaterial color="#020617" roughness={0.9} />
      </Box>

      {/* Individual Glowing Glass Tiles */}
      {Array.from({length: rows * cols}).map((_, i) => {
        const r = Math.floor(i / cols);
        const c = i % cols;
        const px = -w/2 + tileW/2 + c * tileW;
        const pz = -d/2 + tileD/2 + r * tileD;
        return (
          <group key={i} position={[px, 0.03, pz]}>
            {/* LED Box */}
            <Box args={[tileW - 0.02, 0.04, tileD - 0.02]} position={[0, 0, 0]}>
               <meshStandardMaterial 
                 ref={(el) => tilesRef.current[i] = el}
                 color="#000000" 
                 emissive="#000000" 
                 roughness={0.1}
               />
            </Box>
            {/* Glass Surface */}
            <Box args={[tileW - 0.01, 0.01, tileD - 0.01]} position={[0, 0.025, 0]}>
               <meshPhysicalMaterial color="#ffffff" transmission={0.9} roughness={0.05} clearcoat={1} transparent />
            </Box>
          </group>
        );
      })}
      
      {/* Floating Sparkles above the dance floor */}
      <Sparkles count={150} scale={[w, 4, d]} size={4} speed={0.5} opacity={0.6} color="#ffffff" position={[0, 2, 0]} />
    </group>
  );
}

function Bar3D({ x, y, width, height, rotation }) {
  const cx = x + width / 2;
  const cy = y + height / 2;
  const w = width * SCALE;
  const d = height * SCALE;
  const h = 1.1; 
  return (
    <group position={[cx * SCALE, 0, cy * SCALE]} rotation={[0, -rotation * Math.PI / 180, 0]}>
      {/* Luxury Polished Mahogany Wood Counter Base */}
      <Box args={[w, h - 0.05, d * 0.4]} position={[0, (h - 0.05)/2, d * 0.2]} castShadow receiveShadow>
        <meshPhysicalMaterial color="#2c1404" roughness={0.2} clearcoat={1} clearcoatRoughness={0.1} />
      </Box>
      {/* White Marble Counter Top */}
      <Box args={[w + 0.2, 0.05, d * 0.5]} position={[0, h, d * 0.25]} castShadow receiveShadow>
        <meshPhysicalMaterial color="#f8fafc" roughness={0.1} clearcoat={1} clearcoatRoughness={0.1} />
      </Box>
      
      {/* Backbar Base (Dark Wood) */}
      <Box args={[w, 0.9, d * 0.3]} position={[0, 0.45, -d * 0.35]} castShadow receiveShadow>
        <meshPhysicalMaterial color="#1a0b02" roughness={0.2} clearcoat={1} />
      </Box>
      
      {/* Backbar Shelves (Glass) */}
      <Box args={[w, 2, 0.1]} position={[0, 1.9, -d/2 + 0.05]} castShadow>
        <meshStandardMaterial color="#0f172a" roughness={0.9} />
      </Box>
      {[1.2, 1.6, 2.0].map((shelfY, i) => (
        <Box key={i} args={[w, 0.02, 0.2]} position={[0, shelfY, -d/2 + 0.15]}>
          <meshPhysicalMaterial color="#ffffff" transmission={0.9} opacity={1} roughness={0} />
        </Box>
      ))}

      {/* Crystal Bottles with glowing liquid */}
      {Array.from({length: Math.floor(w * 8)}).map((_, i) => {
        const shelf = [1.2, 1.6, 2.0][Math.floor(Math.random() * 3)];
        const bottleColor = ['#22c55e', '#ef4444', '#f59e0b', '#3b82f6', '#ffffff'][Math.floor(Math.random() * 5)];
        const bx = -w/2 + 0.1 + (i % Math.floor(w * 8)) * 0.12;
        return (
          <Cylinder key={i} args={[0.03, 0.03, 0.15, 16]} position={[bx, shelf + 0.08, -d/2 + 0.15]}>
            <meshPhysicalMaterial color={bottleColor} transmission={1} ior={1.5} roughness={0.1} clearcoat={1} emissive={bottleColor} emissiveIntensity={0.2} />
          </Cylinder>
        );
      })}

      {/* Modern High-End Stools */}
      {Array.from({length: Math.floor(w / 0.6)}).map((_, i) => {
        const sx = -w/2 + 0.3 + i * 0.6;
        return (
          <group key={i} position={[sx, 0, d/2 + 0.2]}>
            <Cylinder args={[0.15, 0.2, 0.05, 32]} position={[0, 0.025, 0]} castShadow><meshStandardMaterial color="#94a3b8" metalness={1} roughness={0.2} /></Cylinder>
            <Cylinder args={[0.02, 0.02, 0.7, 16]} position={[0, 0.35, 0]} castShadow><meshStandardMaterial color="#94a3b8" metalness={1} roughness={0.2} /></Cylinder>
            {/* Leather Cushion */}
            <Cylinder args={[0.18, 0.18, 0.05, 32]} position={[0, 0.725, 0]} castShadow><meshStandardMaterial color="#0f172a" roughness={0.7} /></Cylinder>
          </group>
        );
      })}
    </group>
  );
}

function Buffet3D({ x, y, width, height, rotation }) {
  const cx = x + width / 2;
  const cy = y + height / 2;
  const w = width * SCALE;
  const d = height * SCALE;
  const h = 0.9; 
  return (
    <group position={[cx * SCALE, 0, cy * SCALE]} rotation={[0, -rotation * Math.PI / 180, 0]}>
      {/* Pristine White Tablecloth */}
      <Box args={[w, h, d]} position={[0, h/2, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#ffffff" roughness={0.9} />
      </Box>
      
      {/* Highly Polished Chrome Chafing Dishes */}
      {Array.from({length: Math.floor(w / 0.8)}).map((_, i) => {
        const posX = -w/2 + 0.4 + i * 0.8;
        return (
          <group key={i} position={[posX, h, d/4]}>
            <Box args={[0.5, 0.1, 0.3]} position={[0, 0.05, 0]} castShadow>
              <meshStandardMaterial color="#e2e8f0" metalness={1} roughness={0.1} />
            </Box>
            <Cylinder args={[0.25, 0.25, 0.3, 32, 1, false, 0, Math.PI]} position={[0, 0.1, 0]} rotation={[0, 0, Math.PI/2]} castShadow>
               <meshStandardMaterial color="#f8fafc" metalness={1} roughness={0.1} side={THREE.DoubleSide} />
            </Cylinder>
            {/* Sterno flame */}
            <Box args={[0.05, 0.05, 0.05]} position={[0, -0.05, 0]}>
              <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={3} />
            </Box>
          </group>
        );
      })}

      {/* Porcelain Plates */}
      {Array.from({length: Math.floor(w / 1.5)}).map((_, i) => {
        const px = -w/2 + 0.8 + i * 1.5;
        return (
          <group key={i} position={[px, h + 0.05, -d/4]}>
             <Cylinder args={[0.12, 0.12, 0.1, 32]} position={[0, 0, 0]} castShadow>
                <meshPhysicalMaterial color="#ffffff" roughness={0.1} clearcoat={1} />
             </Cylinder>
          </group>
        );
      })}
    </group>
  );
}

function Entrance3D({ x, y, width, height, rotation }) {
  const cx = x + width / 2;
  const cy = y + height / 2;
  const w = width * SCALE;
  const d = height * SCALE;
  return (
    <group position={[cx * SCALE, 0, cy * SCALE]} rotation={[0, -rotation * Math.PI / 180, 0]}>
      {/* Plush Red Carpet */}
      <Box args={[w, 0.02, d + 2]} position={[0, 0.01, 1]} receiveShadow>
        <meshStandardMaterial color="#991b1b" roughness={1} />
      </Box>
      
      {/* Gold Stanchions with Catenary Velvet Ropes */}
      {Array.from({length: Math.floor((d + 2) / 1.0) + 1}).map((_, i) => {
        const pz = -d/2 + i * 1.0;
        return (
          <group key={i}>
            {/* Gold Poles */}
            <Cylinder args={[0.03, 0.05, 1.0, 32]} position={[-w/2 + 0.1, 0.5, pz]} castShadow><meshStandardMaterial color="#fbbf24" metalness={1} roughness={0.1} /></Cylinder>
            <Cylinder args={[0.03, 0.05, 1.0, 32]} position={[w/2 - 0.1, 0.5, pz]} castShadow><meshStandardMaterial color="#fbbf24" metalness={1} roughness={0.1} /></Cylinder>
            
            {/* Velvet Rope (Quadratic Bezier Curve for realistic drooping) */}
            {i < Math.floor((d + 2) / 1.0) && (
              <>
                <QuadraticBezierLine 
                  start={[-w/2 + 0.1, 0.9, pz]} 
                  end={[-w/2 + 0.1, 0.9, pz + 1.0]} 
                  mid={[-w/2 + 0.1, 0.4, pz + 0.5]} 
                  color="#7f1d1d" lineWidth={8} 
                />
                <QuadraticBezierLine 
                  start={[w/2 - 0.1, 0.9, pz]} 
                  end={[w/2 - 0.1, 0.9, pz + 1.0]} 
                  mid={[w/2 - 0.1, 0.4, pz + 0.5]} 
                  color="#7f1d1d" lineWidth={8} 
                />
              </>
            )}
          </group>
        );
      })}

      {/* Minimalist Dark Metal Archway */}
      <Box args={[0.4, 3, 0.4]} position={[-w/2 + 0.2, 1.5, d/2]} castShadow><meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.3} /></Box>
      <Box args={[0.4, 3, 0.4]} position={[w/2 - 0.2, 1.5, d/2]} castShadow><meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.3} /></Box>
      <Box args={[w, 0.4, 0.4]} position={[0, 3.2, d/2]} castShadow><meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.3} /></Box>
      
      {/* High-End Glowing Neon Sign */}
      <Box args={[w - 0.8, 0.3, 0.42]} position={[0, 3.2, d/2]}>
        <meshStandardMaterial color="#fef08a" emissive="#fef08a" emissiveIntensity={2} />
      </Box>
    </group>
  );
}

function DJBooth3D({ x, y, width, height, rotation }) {
  const cx = x + width / 2;
  const cy = y + height / 2;
  const w = width * SCALE;
  const d = height * SCALE;
  const h = 1.0;
  return (
    <group position={[cx * SCALE, 0, cy * SCALE]} rotation={[0, -rotation * Math.PI / 180, 0]}>
      {/* Sleek DJ Desk */}
      <Box args={[w, h, d]} position={[0, h/2, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#0f172a" roughness={0.8} />
      </Box>
      {/* Front LED Panel */}
      <Box args={[w - 0.4, 0.4, 0.05]} position={[0, h/2, d/2 + 0.01]}>
        <meshStandardMaterial color="#0ea5e9" emissive="#0ea5e9" emissiveIntensity={3} />
      </Box>
      
      {/* Metal CDJs and Mixer */}
      <Cylinder args={[0.2, 0.2, 0.05, 32]} position={[-0.4, h + 0.025, 0]} castShadow>
         <meshStandardMaterial color="#cbd5e1" metalness={1} roughness={0.2} />
      </Cylinder>
      <Cylinder args={[0.2, 0.2, 0.05, 32]} position={[0.4, h + 0.025, 0]} castShadow>
         <meshStandardMaterial color="#cbd5e1" metalness={1} roughness={0.2} />
      </Cylinder>
      <Box args={[0.3, 0.05, 0.3]} position={[0, h + 0.025, 0]} castShadow>
         <meshStandardMaterial color="#1e293b" />
      </Box>
    </group>
  );
}

function VenueElements({ elements, audio }) {
  return (
    <>
      {elements.map((el) => {
        switch (el.type) {
          case 'table': return <Table3D key={el.id} {...el} />;
          case 'stage': return <Stage3D key={el.id} {...el} audio={audio} />;
          case 'dancefloor': return <DanceFloor3D key={el.id} {...el} />;
          case 'bar': return <Bar3D key={el.id} {...el} />;
          case 'buffet': return <Buffet3D key={el.id} {...el} />;
          case 'entrance': return <Entrance3D key={el.id} {...el} />;
          case 'djbooth': return <DJBooth3D key={el.id} {...el} />;
          default: return null;
        }
      })}
    </>
  );
}

export default function FloorPlan3D({ elements, onClose }) {
  let maxX = 800, maxY = 500;
  elements.forEach(el => {
    if (el.x + el.width > maxX) maxX = el.x + el.width;
    if (el.y + el.height > maxY) maxY = el.y + el.height;
  });
  
  const startX = (maxX / 2) * SCALE;
  const startZ = (maxY / 2) * SCALE;

  const [clicked, setClicked] = useState(false);
  const [audio] = useState(() => new Audio('/wakemeup.mp3'));

  useEffect(() => {
    if (clicked) {
      audio.play().catch(e => console.error("Audio playback failed:", e));
    }
    return () => {
      audio.pause();
      audio.currentTime = 0;
    }
  }, [clicked, audio]);

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 9999, background: 'black' }}>
      {!clicked && (
        <div style={{
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          color: 'white', zIndex: 10, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)'
        }}>
          <h2 style={{ fontSize: '3rem', marginBottom: '1rem', fontWeight: 300, letterSpacing: '2px' }}>3D VENUE PREVIEW</h2>
          <p style={{ fontSize: '1.2rem', marginBottom: '2rem', color: '#cbd5e1' }}>High-Fidelity Architectural Rendering</p>
          <button className="btn" style={{ padding: '1rem 3rem', fontSize: '1.1rem', backgroundColor: '#ffffff', color: '#000' }} onClick={() => setClicked(true)}>Enter Walkthrough</button>
          <button className="btn btn-secondary" style={{ marginTop: '1rem', border: 'none' }} onClick={onClose}>Exit</button>
        </div>
      )}
      
      {clicked && (
        <div style={{ position: 'absolute', top: '1rem', left: '1rem', zIndex: 10, color: 'white', textShadow: '1px 1px 2px black', background: 'rgba(0,0,0,0.5)', padding: '1rem', borderRadius: '8px' }}>
          <p style={{ margin: 0 }}><strong>Controls:</strong></p>
          <ul style={{ margin: '0.5rem 0', paddingLeft: '1.2rem' }}>
            <li>Mouse: Look around</li>
            <li>WASD / Arrows: Walk horizontally</li>
            <li>Space: Fly Up</li>
            <li>Shift: Fly Down</li>
          </ul>
          <p style={{ margin: '0.5rem 0' }}>Press <strong>ESC</strong> to unlock mouse.</p>
          <button className="btn btn-sm btn-secondary" onClick={() => { document.exitPointerLock?.(); onClose(); }}>Close 3D View</button>
        </div>
      )}

      <Canvas shadows camera={{ position: [startX, 1.7, startZ + 30], fov: 75 }}>
        <color attach="background" args={['#020617']} />
        
        {/* Soft Shadows for physical accuracy */}
        <SoftShadows size={25} samples={16} focus={0.5} />
        
        <EffectComposer disableNormalPass>
          <N8AO distanceFalloff={1} aoRadius={2} intensity={5} />
          <Bloom luminanceThreshold={1} mipmapBlur intensity={1.5} />
          <Vignette eskil={false} offset={0.1} darkness={1.1} />
        </EffectComposer>

        <Environment preset="night" />
        
        <ambientLight intensity={0.5} color="#ffffff" />
        <directionalLight castShadow position={[15, 30, 15]} intensity={0.8} shadow-mapSize={[2048, 2048]} shadow-camera-far={100} shadow-camera-left={-40} shadow-camera-right={40} shadow-camera-top={40} shadow-camera-bottom={-40} />
        
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[startX, -0.01, startZ]}>
          <planeGeometry args={[400, 400]} />
          <MeshReflectorMaterial
            blur={[400, 100]}
            resolution={2048}
            mixBlur={1}
            mixStrength={80}
            roughness={0.15}
            depthScale={1.2}
            minDepthThreshold={0.4}
            maxDepthThreshold={1.4}
            color="#0f172a"
            metalness={0.6}
          />
        </mesh>
        
        <Grid infiniteGrid fadeDistance={200} sectionColor="#334155" cellColor="#0f172a" position={[startX, 0, startZ]} />

        <VenueElements elements={elements} audio={audio} />

        {clicked && <Player />}
      </Canvas>
    </div>
  );
}
