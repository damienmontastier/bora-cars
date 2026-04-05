import { Spherical, Vector3 } from 'three'

export function getAzimuthalAngleFromPositionAndTarget(position: Vector3, target: Vector3): number {
  const offset = new Vector3().copy(position).sub(target)
  const spherical = new Spherical().setFromVector3(offset)
  return spherical.theta // ← azimuthal angle
}
