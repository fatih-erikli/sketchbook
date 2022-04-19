import { PointerEventHandler, useEffect, useMemo, useRef } from "react";
import { Color, Geometry, Projection, Vec2 } from "../types/Sketch";
import { createIdentity, inverse } from "../utils/mat4";
import { normalize } from "../utils/vector";

const TEXTURE0 = 0x84c0;
const DYNAMIC_DRAW = 0x88e8;

const ARRAY_BUFFER = 0x8892;
const ELEMENT_ARRAY_BUFFER = 0x8893;
const UNIFORM_BUFFER = 0x8a11;
const TRANSFORM_FEEDBACK_BUFFER = 0x8c8e;

const TRANSFORM_FEEDBACK = 0x8e22;

const COMPILE_STATUS = 0x8b81;
const LINK_STATUS = 0x8b82;
const FRAGMENT_SHADER = 0x8b30;
const VERTEX_SHADER = 0x8b31;
const SEPARATE_ATTRIBS = 0x8c8d;

const ACTIVE_UNIFORMS = 0x8b86;
const ACTIVE_ATTRIBUTES = 0x8b89;
const TRANSFORM_FEEDBACK_VARYINGS = 0x8c83;
const ACTIVE_UNIFORM_BLOCKS = 0x8a36;
const UNIFORM_BLOCK_REFERENCED_BY_VERTEX_SHADER = 0x8a44;
const UNIFORM_BLOCK_REFERENCED_BY_FRAGMENT_SHADER = 0x8a46;
const UNIFORM_BLOCK_DATA_SIZE = 0x8a40;
const UNIFORM_BLOCK_ACTIVE_UNIFORM_INDICES = 0x8a43;

const FLOAT = 0x1406;
const FLOAT_VEC2 = 0x8b50;
const FLOAT_VEC3 = 0x8b51;
const FLOAT_VEC4 = 0x8b52;
const INT = 0x1404;
const INT_VEC2 = 0x8b53;
const INT_VEC3 = 0x8b54;
const INT_VEC4 = 0x8b55;
const BOOL = 0x8b56;
const BOOL_VEC2 = 0x8b57;
const BOOL_VEC3 = 0x8b58;
const BOOL_VEC4 = 0x8b59;
const FLOAT_MAT2 = 0x8b5a;
const FLOAT_MAT3 = 0x8b5b;
const FLOAT_MAT4 = 0x8b5c;
const SAMPLER_2D = 0x8b5e;
const SAMPLER_CUBE = 0x8b60;
const SAMPLER_3D = 0x8b5f;
const SAMPLER_2D_SHADOW = 0x8b62;
const FLOAT_MAT2x3 = 0x8b65;
const FLOAT_MAT2x4 = 0x8b66;
const FLOAT_MAT3x2 = 0x8b67;
const FLOAT_MAT3x4 = 0x8b68;
const FLOAT_MAT4x2 = 0x8b69;
const FLOAT_MAT4x3 = 0x8b6a;
const SAMPLER_2D_ARRAY = 0x8dc1;
const SAMPLER_2D_ARRAY_SHADOW = 0x8dc4;
const SAMPLER_CUBE_SHADOW = 0x8dc5;
const UNSIGNED_INT = 0x1405;
const UNSIGNED_INT_VEC2 = 0x8dc6;
const UNSIGNED_INT_VEC3 = 0x8dc7;
const UNSIGNED_INT_VEC4 = 0x8dc8;
const INT_SAMPLER_2D = 0x8dca;
const INT_SAMPLER_3D = 0x8dcb;
const INT_SAMPLER_CUBE = 0x8dcc;
const INT_SAMPLER_2D_ARRAY = 0x8dcf;
const UNSIGNED_INT_SAMPLER_2D = 0x8dd2;
const UNSIGNED_INT_SAMPLER_3D = 0x8dd3;
const UNSIGNED_INT_SAMPLER_CUBE = 0x8dd4;
const UNSIGNED_INT_SAMPLER_2D_ARRAY = 0x8dd7;

const TEXTURE_2D = 0x0de1;
const TEXTURE_CUBE_MAP = 0x8513;
const TEXTURE_3D = 0x806f;
const TEXTURE_2D_ARRAY = 0x8c1a;

let typeMap: Record<
  number,
  {
    Type: any;
    size: number;
    setter: (...values: any[]) => void;
    arraySetter?: (...values: any[]) => void;
    rows?: number;
    cols?: number;
    bindPoint?: number;
  }
> = {};

function floatAttribSetter(gl: WebGL2RenderingContext, index: any) {
  return function (b: any) {
    if (b.value) {
      gl.disableVertexAttribArray(index);
      switch (b.value.length) {
        case 4:
          gl.vertexAttrib4fv(index, b.value);
          break;
        case 3:
          gl.vertexAttrib3fv(index, b.value);
          break;
        case 2:
          gl.vertexAttrib2fv(index, b.value);
          break;
        case 1:
          gl.vertexAttrib1fv(index, b.value);
          break;
        default:
          throw new Error(
            "the length of a float constant value must be between 1 and 4!"
          );
      }
    } else {
      gl.bindBuffer(ARRAY_BUFFER, b.buffer);
      gl.enableVertexAttribArray(index);
      gl.vertexAttribPointer(
        index,
        b.numComponents || b.size,
        b.type || FLOAT,
        b.normalize || false,
        b.stride || 0,
        b.offset || 0
      );
      if (b.divisor !== undefined) {
        gl.vertexAttribDivisor(index, b.divisor);
      }
    }
  };
}

function intAttribSetter(gl: WebGL2RenderingContext, index: any) {
  return function (b: any) {
    if (b.value) {
      gl.disableVertexAttribArray(index);
      if (b.value.length === 4) {
        (gl as any).vertexAttrib4iv(index, b.value);
      } else {
        throw new Error("The length of an integer constant value must be 4!");
      }
    } else {
      gl.bindBuffer(ARRAY_BUFFER, b.buffer);
      gl.enableVertexAttribArray(index);
      gl.vertexAttribIPointer(
        index,
        b.numComponents || b.size,
        b.type || INT,
        b.stride || 0,
        b.offset || 0
      );
      if (b.divisor !== undefined) {
        gl.vertexAttribDivisor(index, b.divisor);
      }
    }
  };
}

function uintAttribSetter(gl: WebGL2RenderingContext, index: any) {
  return function (b: any) {
    if (b.value) {
      gl.disableVertexAttribArray(index);
      if (b.value.length === 4) {
        (gl as any).vertexAttrib4uiv(index, b.value);
      } else {
        throw new Error(
          "The length of an unsigned integer constant value must be 4!"
        );
      }
    } else {
      gl.bindBuffer(ARRAY_BUFFER, b.buffer);
      gl.enableVertexAttribArray(index);
      gl.vertexAttribIPointer(
        index,
        b.numComponents || b.size,
        b.type || UNSIGNED_INT,
        b.stride || 0,
        b.offset || 0
      );
      if (b.divisor !== undefined) {
        gl.vertexAttribDivisor(index, b.divisor);
      }
    }
  };
}

function matAttribSetter(
  gl: WebGL2RenderingContext,
  index: any,
  typeInfo: any
) {
  const defaultSize = typeInfo.size;
  const count = typeInfo.count;

  return function (b: any) {
    gl.bindBuffer(ARRAY_BUFFER, b.buffer);
    const numComponents = b.size || b.numComponents || defaultSize;
    const size = numComponents / count;
    const type = b.type || FLOAT;
    const typeInfo = typeMap[type];
    const stride = typeInfo.size * numComponents;
    const normalize = b.normalize || false;
    const offset = b.offset || 0;
    const rowOffset = stride / count;
    for (let i = 0; i < count; ++i) {
      gl.enableVertexAttribArray(index + i);
      gl.vertexAttribPointer(
        index + i,
        size,
        type,
        normalize,
        stride,
        offset + rowOffset * i
      );
      if (b.divisor !== undefined) {
        gl.vertexAttribDivisor(index + i, b.divisor);
      }
    }
  };
}

const attrTypeMap: Record<any, any> = {};
attrTypeMap[FLOAT] = { size: 4, setter: floatAttribSetter };
attrTypeMap[FLOAT_VEC2] = { size: 8, setter: floatAttribSetter };
attrTypeMap[FLOAT_VEC3] = { size: 12, setter: floatAttribSetter };
attrTypeMap[FLOAT_VEC4] = { size: 16, setter: floatAttribSetter };
attrTypeMap[INT] = { size: 4, setter: intAttribSetter };
attrTypeMap[INT_VEC2] = { size: 8, setter: intAttribSetter };
attrTypeMap[INT_VEC3] = { size: 12, setter: intAttribSetter };
attrTypeMap[INT_VEC4] = { size: 16, setter: intAttribSetter };
attrTypeMap[UNSIGNED_INT] = { size: 4, setter: uintAttribSetter };
attrTypeMap[UNSIGNED_INT_VEC2] = { size: 8, setter: uintAttribSetter };
attrTypeMap[UNSIGNED_INT_VEC3] = { size: 12, setter: uintAttribSetter };
attrTypeMap[UNSIGNED_INT_VEC4] = { size: 16, setter: uintAttribSetter };
attrTypeMap[BOOL] = { size: 4, setter: intAttribSetter };
attrTypeMap[BOOL_VEC2] = { size: 8, setter: intAttribSetter };
attrTypeMap[BOOL_VEC3] = { size: 12, setter: intAttribSetter };
attrTypeMap[BOOL_VEC4] = { size: 16, setter: intAttribSetter };
attrTypeMap[FLOAT_MAT2] = { size: 4, setter: matAttribSetter, count: 2 };
attrTypeMap[FLOAT_MAT3] = { size: 9, setter: matAttribSetter, count: 3 };
attrTypeMap[FLOAT_MAT4] = { size: 16, setter: matAttribSetter, count: 4 };

function getBindPointForSamplerType(gl: WebGL2RenderingContext, type: number) {
  return typeMap[type].bindPoint;
}

function floatSetter(
  gl: WebGL2RenderingContext,
  location: WebGLUniformLocation
) {
  return function (v: any) {
    gl.uniform1f(location, v);
  };
}

function floatArraySetter(
  gl: WebGL2RenderingContext,
  location: WebGLUniformLocation
) {
  return function (v: any) {
    gl.uniform1fv(location, v);
  };
}

function floatVec2Setter(
  gl: WebGL2RenderingContext,
  location: WebGLUniformLocation
) {
  return function (v: any) {
    gl.uniform2fv(location, v);
  };
}

function floatVec3Setter(
  gl: WebGL2RenderingContext,
  location: WebGLUniformLocation
) {
  return function (v: any) {
    gl.uniform3fv(location, v);
  };
}

function floatVec4Setter(
  gl: WebGL2RenderingContext,
  location: WebGLUniformLocation
) {
  return function (v: any) {
    gl.uniform4fv(location, v);
  };
}

function intSetter(gl: WebGL2RenderingContext, location: WebGLUniformLocation) {
  return function (v: any) {
    gl.uniform1i(location, v);
  };
}

function intArraySetter(
  gl: WebGL2RenderingContext,
  location: WebGLUniformLocation
) {
  return function (v: any) {
    gl.uniform1iv(location, v);
  };
}

function intVec2Setter(
  gl: WebGL2RenderingContext,
  location: WebGLUniformLocation
) {
  return function (v: any) {
    gl.uniform2iv(location, v);
  };
}

function intVec3Setter(
  gl: WebGL2RenderingContext,
  location: WebGLUniformLocation
) {
  return function (v: any) {
    gl.uniform3iv(location, v);
  };
}

function intVec4Setter(
  gl: WebGL2RenderingContext,
  location: WebGLUniformLocation
) {
  return function (v: any) {
    gl.uniform4iv(location, v);
  };
}

function uintSetter(
  gl: WebGL2RenderingContext,
  location: WebGLUniformLocation
) {
  return function (v: any) {
    gl.uniform1ui(location, v);
  };
}

function uintArraySetter(
  gl: WebGL2RenderingContext,
  location: WebGLUniformLocation
) {
  return function (v: any) {
    gl.uniform1uiv(location, v);
  };
}

function uintVec2Setter(
  gl: WebGL2RenderingContext,
  location: WebGLUniformLocation
) {
  return function (v: any) {
    gl.uniform2uiv(location, v);
  };
}

function uintVec3Setter(
  gl: WebGL2RenderingContext,
  location: WebGLUniformLocation
) {
  return function (v: any) {
    gl.uniform3uiv(location, v);
  };
}

function uintVec4Setter(
  gl: WebGL2RenderingContext,
  location: WebGLUniformLocation
) {
  return function (v: any) {
    gl.uniform4uiv(location, v);
  };
}

function floatMat2Setter(
  gl: WebGL2RenderingContext,
  location: WebGLUniformLocation
) {
  return function (v: any) {
    gl.uniformMatrix2fv(location, false, v);
  };
}

function floatMat3Setter(
  gl: WebGL2RenderingContext,
  location: WebGLUniformLocation
) {
  return function (v: any) {
    gl.uniformMatrix3fv(location, false, v);
  };
}

function floatMat4Setter(
  gl: WebGL2RenderingContext,
  location: WebGLUniformLocation
) {
  return function (v: any) {
    gl.uniformMatrix4fv(location, false, v);
  };
}

function floatMat23Setter(
  gl: WebGL2RenderingContext,
  location: WebGLUniformLocation
) {
  return function (v: any) {
    gl.uniformMatrix2x3fv(location, false, v);
  };
}

function floatMat32Setter(
  gl: WebGL2RenderingContext,
  location: WebGLUniformLocation
) {
  return function (v: any) {
    gl.uniformMatrix3x2fv(location, false, v);
  };
}

function floatMat24Setter(
  gl: WebGL2RenderingContext,
  location: WebGLUniformLocation
) {
  return function (v: any) {
    gl.uniformMatrix2x4fv(location, false, v);
  };
}

function floatMat42Setter(
  gl: WebGL2RenderingContext,
  location: WebGLUniformLocation
) {
  return function (v: any) {
    gl.uniformMatrix4x2fv(location, false, v);
  };
}

function floatMat34Setter(
  gl: WebGL2RenderingContext,
  location: WebGLUniformLocation
) {
  return function (v: any) {
    gl.uniformMatrix3x4fv(location, false, v);
  };
}

function floatMat43Setter(
  gl: WebGL2RenderingContext,
  location: WebGLUniformLocation
) {
  return function (v: any) {
    gl.uniformMatrix4x3fv(location, false, v);
  };
}

function samplerSetter(
  gl: WebGL2RenderingContext,
  type: number,
  unit: any,
  location: WebGLUniformLocation
) {
  const bindPoint = getBindPointForSamplerType(gl, type);
  return function (textureOrPair: any) {
    let texture;
    let sampler;
    if (textureOrPair instanceof WebGLTexture) {
      texture = textureOrPair;
      sampler = null;
    } else {
      texture = textureOrPair.texture;
      sampler = textureOrPair.sampler;
    }
    gl.uniform1i(location, unit);
    gl.activeTexture(TEXTURE0 + unit);
    gl.bindTexture(bindPoint!, texture);
    gl.bindSampler(unit, sampler);
  };
}

function samplerArraySetter(
  gl: WebGL2RenderingContext,
  type: number,
  unit: any,
  location: WebGLUniformLocation,
  size: number
) {
  const bindPoint = getBindPointForSamplerType(gl, type);
  const units = new Int32Array(size);
  for (let ii = 0; ii < size; ++ii) {
    units[ii] = unit + ii;
  }

  return function (textures: any[]) {
    gl.uniform1iv(location, units);
    textures.forEach(function (textureOrPair, index) {
      gl.activeTexture(TEXTURE0 + units[index]);
      let texture;
      let sampler;
      if (textureOrPair instanceof WebGLTexture) {
        texture = textureOrPair;
        sampler = null;
      } else {
        texture = textureOrPair.texture;
        sampler = textureOrPair.sampler;
      }
      gl.bindSampler(unit, sampler);
      gl.bindTexture(bindPoint!, texture);
    });
  };
}

typeMap[FLOAT] = {
  Type: Float32Array,
  size: 4,
  setter: floatSetter,
  arraySetter: floatArraySetter,
};
typeMap[FLOAT_VEC2] = {
  Type: Float32Array,
  size: 8,
  setter: floatVec2Setter,
  cols: 2,
};
typeMap[FLOAT_VEC3] = {
  Type: Float32Array,
  size: 12,
  setter: floatVec3Setter,
  cols: 3,
};
typeMap[FLOAT_VEC4] = {
  Type: Float32Array,
  size: 16,
  setter: floatVec4Setter,
  cols: 4,
};
typeMap[INT] = {
  Type: Int32Array,
  size: 4,
  setter: intSetter,
  arraySetter: intArraySetter,
};
typeMap[INT_VEC2] = {
  Type: Int32Array,
  size: 8,
  setter: intVec2Setter,
  cols: 2,
};
typeMap[INT_VEC3] = {
  Type: Int32Array,
  size: 12,
  setter: intVec3Setter,
  cols: 3,
};
typeMap[INT_VEC4] = {
  Type: Int32Array,
  size: 16,
  setter: intVec4Setter,
  cols: 4,
};
typeMap[UNSIGNED_INT] = {
  Type: Uint32Array,
  size: 4,
  setter: uintSetter,
  arraySetter: uintArraySetter,
};
typeMap[UNSIGNED_INT_VEC2] = {
  Type: Uint32Array,
  size: 8,
  setter: uintVec2Setter,
  cols: 2,
};
typeMap[UNSIGNED_INT_VEC3] = {
  Type: Uint32Array,
  size: 12,
  setter: uintVec3Setter,
  cols: 3,
};
typeMap[UNSIGNED_INT_VEC4] = {
  Type: Uint32Array,
  size: 16,
  setter: uintVec4Setter,
  cols: 4,
};
typeMap[BOOL] = {
  Type: Uint32Array,
  size: 4,
  setter: intSetter,
  arraySetter: intArraySetter,
};
typeMap[BOOL_VEC2] = {
  Type: Uint32Array,
  size: 8,
  setter: intVec2Setter,
  cols: 2,
};
typeMap[BOOL_VEC3] = {
  Type: Uint32Array,
  size: 12,
  setter: intVec3Setter,
  cols: 3,
};
typeMap[BOOL_VEC4] = {
  Type: Uint32Array,
  size: 16,
  setter: intVec4Setter,
  cols: 4,
};
typeMap[FLOAT_MAT2] = {
  Type: Float32Array,
  size: 32,
  setter: floatMat2Setter,
  rows: 2,
  cols: 2,
};
typeMap[FLOAT_MAT3] = {
  Type: Float32Array,
  size: 48,
  setter: floatMat3Setter,
  rows: 3,
  cols: 3,
};
typeMap[FLOAT_MAT4] = {
  Type: Float32Array,
  size: 64,
  setter: floatMat4Setter,
  rows: 4,
  cols: 4,
};
typeMap[FLOAT_MAT2x3] = {
  Type: Float32Array,
  size: 32,
  setter: floatMat23Setter,
  rows: 2,
  cols: 3,
};
typeMap[FLOAT_MAT2x4] = {
  Type: Float32Array,
  size: 32,
  setter: floatMat24Setter,
  rows: 2,
  cols: 4,
};
typeMap[FLOAT_MAT3x2] = {
  Type: Float32Array,
  size: 48,
  setter: floatMat32Setter,
  rows: 3,
  cols: 2,
};
typeMap[FLOAT_MAT3x4] = {
  Type: Float32Array,
  size: 48,
  setter: floatMat34Setter,
  rows: 3,
  cols: 4,
};
typeMap[FLOAT_MAT4x2] = {
  Type: Float32Array,
  size: 64,
  setter: floatMat42Setter,
  rows: 4,
  cols: 2,
};
typeMap[FLOAT_MAT4x3] = {
  Type: Float32Array,
  size: 64,
  setter: floatMat43Setter,
  rows: 4,
  cols: 3,
};
typeMap[SAMPLER_2D] = {
  Type: null,
  size: 0,
  setter: samplerSetter,
  arraySetter: samplerArraySetter,
  bindPoint: TEXTURE_2D,
};
typeMap[SAMPLER_CUBE] = {
  Type: null,
  size: 0,
  setter: samplerSetter,
  arraySetter: samplerArraySetter,
  bindPoint: TEXTURE_CUBE_MAP,
};
typeMap[SAMPLER_3D] = {
  Type: null,
  size: 0,
  setter: samplerSetter,
  arraySetter: samplerArraySetter,
  bindPoint: TEXTURE_3D,
};
typeMap[SAMPLER_2D_SHADOW] = {
  Type: null,
  size: 0,
  setter: samplerSetter,
  arraySetter: samplerArraySetter,
  bindPoint: TEXTURE_2D,
};
typeMap[SAMPLER_2D_ARRAY] = {
  Type: null,
  size: 0,
  setter: samplerSetter,
  arraySetter: samplerArraySetter,
  bindPoint: TEXTURE_2D_ARRAY,
};
typeMap[SAMPLER_2D_ARRAY_SHADOW] = {
  Type: null,
  size: 0,
  setter: samplerSetter,
  arraySetter: samplerArraySetter,
  bindPoint: TEXTURE_2D_ARRAY,
};
typeMap[SAMPLER_CUBE_SHADOW] = {
  Type: null,
  size: 0,
  setter: samplerSetter,
  arraySetter: samplerArraySetter,
  bindPoint: TEXTURE_CUBE_MAP,
};
typeMap[INT_SAMPLER_2D] = {
  Type: null,
  size: 0,
  setter: samplerSetter,
  arraySetter: samplerArraySetter,
  bindPoint: TEXTURE_2D,
};
typeMap[INT_SAMPLER_3D] = {
  Type: null,
  size: 0,
  setter: samplerSetter,
  arraySetter: samplerArraySetter,
  bindPoint: TEXTURE_3D,
};
typeMap[INT_SAMPLER_CUBE] = {
  Type: null,
  size: 0,
  setter: samplerSetter,
  arraySetter: samplerArraySetter,
  bindPoint: TEXTURE_CUBE_MAP,
};
typeMap[INT_SAMPLER_2D_ARRAY] = {
  Type: null,
  size: 0,
  setter: samplerSetter,
  arraySetter: samplerArraySetter,
  bindPoint: TEXTURE_2D_ARRAY,
};
typeMap[UNSIGNED_INT_SAMPLER_2D] = {
  Type: null,
  size: 0,
  setter: samplerSetter,
  arraySetter: samplerArraySetter,
  bindPoint: TEXTURE_2D,
};
typeMap[UNSIGNED_INT_SAMPLER_3D] = {
  Type: null,
  size: 0,
  setter: samplerSetter,
  arraySetter: samplerArraySetter,
  bindPoint: TEXTURE_3D,
};
typeMap[UNSIGNED_INT_SAMPLER_CUBE] = {
  Type: null,
  size: 0,
  setter: samplerSetter,
  arraySetter: samplerArraySetter,
  bindPoint: TEXTURE_CUBE_MAP,
};
typeMap[UNSIGNED_INT_SAMPLER_2D_ARRAY] = {
  Type: null,
  size: 0,
  setter: samplerSetter,
  arraySetter: samplerArraySetter,
  bindPoint: TEXTURE_2D_ARRAY,
};

export function createUniformSetters(
  gl: WebGL2RenderingContext,
  program: WebGLProgram
) {
  let textureUnit = 0;

  /**
   * Creates a setter for a uniform of the given program with it's
   * location embedded in the setter.
   * @param {WebGLProgram} program
   * @param {WebGLUniformInfo} uniformInfo
   * @returns {function} the created setter.
   */
  function createUniformSetter(
    program: WebGLProgram,
    uniformInfo: any,
    location: WebGLUniformLocation
  ) {
    const isArray = uniformInfo.name.endsWith("[0]");
    const type = uniformInfo.type;
    const typeInfo = typeMap[type];
    console.log(typeInfo);
    if (!typeInfo) {
      throw new Error(`unknown type: 0x${type.toString(16)}`); // we should never get here.
    }
    let setter;
    if (typeInfo.bindPoint) {
      const unit = textureUnit;
      textureUnit += uniformInfo.size;
      if (isArray) {
        setter = typeInfo.arraySetter!(
          gl,
          type,
          unit,
          location,
          uniformInfo.size
        );
      } else {
        setter = typeInfo.setter(gl, type, unit, location, uniformInfo.size);
      }
    } else {
      if (typeInfo.arraySetter && isArray) {
        setter = typeInfo.arraySetter(gl, location);
      } else {
        setter = typeInfo.setter(gl, location);
      }
    }
    (setter as any).location = location;
    return setter;
  }

  const uniformSetters: any = {};
  const numUniforms = gl.getProgramParameter(program, ACTIVE_UNIFORMS);

  for (let ii = 0; ii < numUniforms; ++ii) {
    const uniformInfo: any = gl.getActiveUniform(program, ii);
    if (
      uniformInfo.name.startsWith("gl_") ||
      uniformInfo.name.startsWith("webgl_")
    ) {
      continue;
    }
    let name = uniformInfo.name;
    const location = gl.getUniformLocation(program, uniformInfo.name);
    if (location) {
      const setter = createUniformSetter(program, uniformInfo, location);
      uniformSetters[name] = setter;
    }
  }
  return uniformSetters;
}

export function getGLTypeForTypedArray(
  gl: WebGL2RenderingContext,
  typedArray: any
) {
  switch (typedArray.constructor) {
    case Float32Array:
      return gl.FLOAT;
    case Int8Array:
      return gl.BYTE;
    case Uint8Array:
      return gl.UNSIGNED_BYTE;
    case Int16Array:
      return gl.SHORT;
    case Uint16Array:
      return gl.UNSIGNED_SHORT;
    case Int32Array:
      return gl.INT;
    case Uint32Array:
      return gl.UNSIGNED_INT;
  }
}

function loadShader(
  gl: WebGL2RenderingContext,
  type: number,
  source: string
): WebGLShader {
  const shader = gl.createShader(type);
  if (!shader) {
    throw new Error();
  }
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    return shader;
  } else {
    var lastError = gl.getShaderInfoLog(shader);
    console.log(lastError);
    gl.deleteShader(shader);
    throw new Error();
  }
}

function numberOfComponentsByName(name: string) {
  switch (name) {
    case "color":
      return 4;
    case "position":
    case "normal":
      return 3;
    default:
      return 2;
  }
}

export function createProgram(
  gl: WebGL2RenderingContext,
  shaders: WebGLShader[]
) {
  const program = gl.createProgram()!;
  shaders.forEach(function (shader) {
    gl.attachShader(program, shader);
  });

  gl.linkProgram(program);

  // Check the link status
  const linked = gl.getProgramParameter(program, LINK_STATUS);
  if (!linked) {
    const lastError = gl.getProgramInfoLog(program);
    gl.deleteProgram(program);
    for (const shader of shaders) {
      gl.deleteShader(shader);
    }
    throw new Error(lastError!);
  }
  return program;
}

export function create1PixelTexture(gl: WebGL2RenderingContext, pixel: Color) {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    1,
    1,
    0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    pixel
  );
  return texture;
}

export function createAttributeSetters(
  gl: WebGL2RenderingContext,
  program: WebGLProgram
) {
  const attribSetters: any = {};

  const numAttribs = gl.getProgramParameter(program, ACTIVE_ATTRIBUTES);
  for (let ii = 0; ii < numAttribs; ++ii) {
    const attribInfo: WebGLActiveInfo = gl.getActiveAttrib(program, ii)!;
    if (
      attribInfo.name.startsWith("gl_") ||
      attribInfo.name.startsWith("webgl_")
    ) {
      continue;
    }
    const index = gl.getAttribLocation(program, attribInfo.name);
    const typeInfo = attrTypeMap[attribInfo.type];
    const setter = typeInfo.setter(gl, index, typeInfo);
    setter.location = index;
    attribSetters[attribInfo.name] = setter;
  }

  return attribSetters;
}

export const CanvasWebGLWithMaterials = ({
  projection,
  vertexShaderSource,
  fragmentShaderSource,
  width,
  height,
  geometries,
  onClick,
}: {
  projection: Projection;
  vertexShaderSource: string;
  fragmentShaderSource: string;
  width: number;
  height: number;
  geometries: Geometry[];
  onClick: (coords: Vec2) => void;
}) => {
  const webglProgramInfo = useRef<any>();
  const canvasElement = useRef<HTMLCanvasElement>(null);
  const geometryBuffers = useMemo(() => {
    const canvas = canvasElement.current!;
    if (!canvas) {
      return;
    }
    const gl = canvas.getContext("webgl2");
    if (!gl) {
      return;
    }
    console.log('geometry buffers will be calculated.');
    const textures = {
      defaultWhite: create1PixelTexture(
        gl,
        new Uint8ClampedArray([255, 255, 255, 255])
      ),
    };
    return geometries.map(({ data }) => {
      const arrays: any = { ...data, color: { value: [1, 1, 1, 1] } };
      const attribs: any = {};
      for (const key in arrays) {
        const attribName = `a_${key}`;
        const array = arrays[key];
        if (key === "normal" && data.normal.length === 0) {
          const data_ = data.position;
          const normals = new Float32Array(data_.length);
          let curr = 0;
          for (let i = 0; i < data_.length; i += 9) {
            const Ux = data_[i + 3] - data_[i];
            const Uy = data_[i + 4] - data_[i + 1];
            const Uz = data_[i + 5] - data_[i + 2];
            const Vx = data_[i + 6] - data_[i];
            const Vy = data_[i + 7] - data_[i + 1];
            const Vz = data_[i + 8] - data_[i + 2];

            const nx = Uy * Vz - Uz * Vy;
            const ny = Uz * Vx - Ux * Vz;
            const nz = Ux * Vy - Uy * Vx;

            for (let j = 0; j < 3; ++j) {
              normals[curr++] = nx;
              normals[curr++] = ny;
              normals[curr++] = nz;
            }
          }
          const buffer = gl.createBuffer();
          gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
          gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);
          attribs["a_normal"] = {
            buffer: buffer,
            numComponents: numberOfComponentsByName(key),
            type: getGLTypeForTypedArray(gl, array),
            normalize: false,
          };
        } else if (array.value) {
          attribs[attribName] = { value: array.value };
        } else {
          const buffer = gl.createBuffer();
          gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
          gl.bufferData(gl.ARRAY_BUFFER, array, gl.STATIC_DRAW);
          attribs[attribName] = {
            buffer: buffer,
            numComponents: numberOfComponentsByName(key),
            type: getGLTypeForTypedArray(gl, array),
            normalize: array instanceof Int8Array,
          };
        }
      }
      const bufferInfo = {
        attribs,
        numElements:
          data.position.length / numberOfComponentsByName("position"),
      };
      return {
        matrix: data.matrix,
        material: {
          diffuse: [1, 1, 1],
          diffuse_map: textures.defaultWhite,
          ambient: [0, 0, 0],
          specular: [1, 1, 1],
          specular_map: textures.defaultWhite,
          shininess: 400,
          opacity: 1,
        },
        bufferInfo,
      };
    });
  }, [geometries]);
  useEffect(() => {
    const canvas = canvasElement.current!;
    const gl = canvas.getContext("webgl2");
    if (!gl || !geometryBuffers) {
      return;
    }

    let programInfo: any;
    if (webglProgramInfo.current) {
      programInfo = webglProgramInfo.current;
    } else {
      const program = createProgram(gl, [
        loadShader(gl, gl.VERTEX_SHADER, vertexShaderSource),
        loadShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource),
      ]);
      const uniformSetters = createUniformSetters(gl, program);
      const attribSetters = createAttributeSetters(gl, program);
      programInfo = {
        gl,
        program,
        uniformSetters,
        attribSetters,
      };
      webglProgramInfo.current = programInfo;
    }

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.enable(gl.DEPTH_TEST);
    gl.useProgram(programInfo.program);
    programInfo.uniformSetters["u_light_direction"](
      normalize(new Float32Array([17, 28, -1]))
    );
    programInfo.uniformSetters["u_view"](projection.view);
    programInfo.uniformSetters["u_projection"](projection.projection);
    programInfo.uniformSetters["u_view_world_position"](
      projection.cameraPosition
    );

    for (const { bufferInfo, material, matrix } of geometryBuffers) {
      programInfo.attribSetters["a_position"](bufferInfo.attribs["a_position"]);

      // if (bufferInfo.attribs['a_normal'].length > 0) {
      programInfo.attribSetters["a_normal"](bufferInfo.attribs["a_normal"]);
      // }
      programInfo.attribSetters["a_color"](bufferInfo.attribs["a_color"]);
      // programInfo.uniformSetters["u_world"](inverse(projection.view));
      programInfo.uniformSetters["u_world"](matrix);
      programInfo.uniformSetters["diffuse"](material["diffuse"]);
      programInfo.uniformSetters["diffuse_map"](material["diffuse_map"]);
      programInfo.uniformSetters["ambient"](material["ambient"]);
      programInfo.uniformSetters["specular"](material["specular"]);
      programInfo.uniformSetters["specular_map"](material["specular_map"]);
      programInfo.uniformSetters["shininess"](material["shininess"]);
      programInfo.uniformSetters["opacity"](material["opacity"]);
      gl.drawArrays(gl.TRIANGLES, 0, bufferInfo.numElements);
    }
  }, [fragmentShaderSource, vertexShaderSource, geometryBuffers, projection]);
  const handleClick: PointerEventHandler<HTMLCanvasElement> = (event) => {
    const canvas = canvasElement.current!;
    const boundingBox = canvas.getBoundingClientRect();
    onClick(
      new Float32Array([
        event.clientX - boundingBox.left,
        event.clientY - boundingBox.top,
      ])
    );
  };
  return (
    <canvas
      onClick={handleClick}
      ref={canvasElement}
      width={width * 2}
      height={height * 2}
      style={{ width, height }}
    ></canvas>
  );
};
