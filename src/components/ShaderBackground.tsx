import React from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import { Canvas, Fill, Shader, Skia, useClock } from '@shopify/react-native-skia';
import { useDerivedValue } from 'react-native-reanimated';
import { TOKENS } from '../theme/tokens';

const { pulseSpeed, pulseAmplitude, glowFalloffBias, glowIntensity, baseColor, glowColor, msPerSecond } =
  TOKENS.shader;

/**
 * SkSL runtime effect — a slow-breathing radial neon glow, evaluated
 * entirely on the GPU. Tuning constants are injected from the design
 * tokens so the shader source carries no magic numbers of its own.
 */
const source = Skia.RuntimeEffect.Make(`
  uniform float u_time;
  uniform vec2 u_resolution;

  vec4 main(vec2 fragCoord) {
    vec2 uv = fragCoord.xy / u_resolution.xy;
    vec2 center = uv - 0.5;
    center.x *= u_resolution.x / u_resolution.y;

    float dist = length(center);
    float pulse = 0.5 + 0.5 * sin(u_time * ${pulseSpeed});

    vec3 baseColor = vec3(${baseColor.r}, ${baseColor.g}, ${baseColor.b});
    vec3 glow = vec3(${glowColor.r}, ${glowColor.g}, ${glowColor.b}) * ${glowIntensity};
    vec3 color = baseColor + (glow / (dist + ${glowFalloffBias} + pulse * ${pulseAmplitude}));

    return vec4(color, 1.0);
  }
`);

export const ShaderBackground = () => {
  const { width, height } = useWindowDimensions();
  const clock = useClock();

  const uniforms = useDerivedValue(
    () => ({
      u_time: clock.value / msPerSecond,
      u_resolution: [width, height],
    }),
    [width, height]
  );

  if (!source) return null;

  return (
    <Canvas style={StyleSheet.absoluteFill} pointerEvents="none">
      <Fill>
        <Shader source={source} uniforms={uniforms} />
      </Fill>
    </Canvas>
  );
};
