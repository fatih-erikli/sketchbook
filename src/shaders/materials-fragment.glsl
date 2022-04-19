precision highp float;

varying vec3 v_normal;
varying vec3 v_surface_to_view;
varying vec2 v_texcoord;
varying vec4 v_color;

uniform vec3 diffuse;
uniform sampler2D diffuse_map;
uniform vec3 ambient;
uniform vec3 emissive;
uniform vec3 specular;
uniform sampler2D specular_map;
uniform float shininess;
uniform float opacity;
uniform vec3 u_light_direction;
uniform vec3 u_ambient_light;



void main() {
  vec3 normal = normalize(v_normal);

  vec3 surface_to_view_direction = normalize(v_surface_to_view);
  vec3 half_vector = normalize(u_light_direction + surface_to_view_direction);

  float fake_light = dot(u_light_direction, normal) * .5 + .5;
  float specular_light = clamp(dot(normal, half_vector), 0.0, 1.0);
  vec4 specular_map_color = texture2D(specular_map, v_texcoord);
  vec3 effective_specular = specular * specular_map_color.rgb;

  vec4 diffuse_map_color = texture2D(diffuse_map, v_texcoord);
  vec3 effective_diffuse = diffuse * diffuse_map_color.rgb * v_color.rgb;
  float effective_opacity = opacity * diffuse_map_color.a * v_color.a;

  gl_FragColor = vec4(emissive +
    ambient * u_ambient_light +
    effective_diffuse * fake_light +
    effective_specular * pow(specular_light, shininess), effective_opacity);
}
