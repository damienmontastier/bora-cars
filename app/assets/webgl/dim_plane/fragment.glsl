varying vec2 vUv;

precision highp float;

uniform sampler2D diffuseMap;
uniform sampler2D alphaMap;

in vec4 vAO;

void main() {
    vec4 diffuseColor = texture(diffuseMap, vUv);
    float alphaColor = texture(alphaMap, vUv).r;
    gl_FragColor = diffuseColor * vAO;
    gl_FragColor.a *= alphaColor;

    #include <colorspace_fragment>
    #include <tonemapping_fragment>
}