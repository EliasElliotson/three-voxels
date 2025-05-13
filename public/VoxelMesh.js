import * as THREE from 'three';

export class VoxelMesh extends THREE.Group {
  constructor() {
    super();

    // The material for the mesh
    this.material = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      wireframe: true,
    });

    // The mesh initially empty; geometry will be added later
    this.mesh = new THREE.Mesh(null, this.material);
    this.add(this.mesh); // Add the mesh to the group

    // Map to track voxel positions
    this.voxelMap = new Map();

    // Voxel geometry constants (used temporarily in updateGeometry)
    this.vertices = [
      [0, 0, 0],
      [0, 0, 1],
      [0, 1, 0],
      [0, 1, 1],
      [1, 0, 0],
      [1, 0, 1],
      [1, 1, 0],
      [1, 1, 1],
    ];

    this.textureUVs = [
      [0, 0],
      [0, 1],
      [1, 0],
      [1, 1],
    ];

    this.triangles = [
      [1, 0, 4, 0, 1, 3, "top"],
      [4, 5, 1, 3, 2, 0, "top"],
      [3, 2, 0, 0, 1, 3, "left"],
      [0, 1, 3, 3, 2, 0, "left"],
      [0, 2, 6, 0, 1, 3, "front"],
      [6, 4, 0, 3, 2, 0, "front"],
      [2, 3, 7, 0, 1, 3, "bottom"],
      [7, 6, 2, 3, 2, 0, "bottom"],
      [5, 4, 6, 0, 1, 3, "right"],
      [6, 7, 5, 3, 2, 0, "right"],
      [3, 1, 5, 0, 1, 3, "back"],
      [5, 7, 3, 3, 2, 0, "back"],
    ];
  }

  getVoxelKey(x, y, z) {
    return `${x},${y},${z}`;
  }

  addVoxel(x, y, z) {
    const key = this.getVoxelKey(x, y, z);
    if (this.voxelMap.has(key)) return;
    this.voxelMap.set(key, true);
  }

  removeVoxel(x, y, z) {
    const key = this.getVoxelKey(x, y, z);
    if (!this.voxelMap.has(key)) return;
    this.voxelMap.delete(key);
  }

  updateGeometry() {
    // Dispose of the current geometry before creating a new one
    if (this.mesh.geometry) {
      this.mesh.geometry.dispose();
      this.mesh.geometry = null; // Completely remove the old geometry reference
    }

    // Create a new geometry
    const geometry = new THREE.BufferGeometry();

    // Temporary arrays for geometry data
    const positions = [];
    const uvs = [];
    const indices = [];

    // Generate geometry for each voxel in the map
    for (const [voxelKey] of this.voxelMap) {
      const [x, y, z] = voxelKey.split(',').map(Number);
      const baseIndex = positions.length / 3;

      for (const vertex of this.vertices) {
        positions.push(vertex[0] + x, vertex[1] + y, vertex[2] + z);
      }

      for (const triangle of this.triangles) {
        indices.push(
          baseIndex + triangle[0],
          baseIndex + triangle[1],
          baseIndex + triangle[2]
        );

        uvs.push(...this.textureUVs[triangle[3]]);
        uvs.push(...this.textureUVs[triangle[4]]);
        uvs.push(...this.textureUVs[triangle[5]]);
      }
    }

    // Update the geometry attributes
    geometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(positions, 3)
    );
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices);

    // Recompute vertex normals
    geometry.computeVertexNormals();

    // Assign the new geometry to the mesh
    this.mesh.geometry = geometry;
  }
}