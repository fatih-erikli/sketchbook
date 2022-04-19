attribute vec4 a_position;
attribute vec3 a_normal;
attribute vec2 a_texcoord;
attribute vec4 a_color;

uniform mat4 u_projection;
uniform mat4 u_view;
uniform mat4 u_world;
uniform vec3 u_view_world_position;

varying vec3 v_normal;
varying vec3 v_surface_to_view;
varying vec2 v_texcoord;
varying vec4 v_color;


void main() {
  vec4 world_position = u_world * a_position;

  
  gl_Position = u_projection * u_view * world_position;


  v_surface_to_view = u_view_world_position - world_position.xyz;
  v_normal = mat3(u_world) * a_normal;
  v_texcoord = a_texcoord;
  v_color = a_color;
}
