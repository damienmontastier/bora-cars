varying vec2 vUv;

precision highp float;

uniform float layerThickness;
uniform float layersCount;
uniform vec4 colorStart;
uniform vec4 colorEnd;
uniform float uTime;
uniform float waveScale;
uniform float stiffness;
uniform sampler2D alphaMap; // Ajoute l’uniform ici

out vec4 vAO;

const float RANDOM_COEFF_1 = 0.1376;
const float RANDOM_COEFF_2 = 0.3726;
const float RANDOM_COEFF_3 = 0.2546;

void main(void) {
    vUv = uv;

    float f = float(gl_InstanceID) * layerThickness;
    float layerCoeff = float(gl_InstanceID) / layersCount;

    vec3 vertex = position + normal * f;
    float waveScaleFinal = waveScale * pow(layerCoeff, stiffness);

    vertex.x += sin(uTime + ((position.x+position.y+position.z) )) * waveScaleFinal;
    vertex.y += cos(uTime + ((position.x-position.y+position.z) )) * waveScaleFinal;
    vertex.z += sin(uTime + ((position.x+position.y-position.z) )) * waveScaleFinal;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(vertex,1.0);

    vAO = mix(colorStart, colorEnd, layerCoeff);
}