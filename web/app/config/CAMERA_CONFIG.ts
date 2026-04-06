import { Euler, Vector3 } from 'three'

export const CAMERA_TYPES = {
  default: {
    position: new Vector3(5.5, 2, 7.5),
    rotation: new Euler(0, 0, 0),
    target: new Vector3(0, 0, 0),
    fov: 50,
  },
  blank: {
    position: new Vector3(0, 4, 6),
    rotation: new Euler(0, 0, 0),
    target: new Vector3(0, 0.5, 1.5),
    fov: 50,
  },
}
