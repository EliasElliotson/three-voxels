import * as THREE from 'three';

export class VoxelMesh extends THREE.Group {
  constructor() {
    super();

    // The material for the mesh (this will remain constant)
    this.material = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      wireframe: true,
    });

    // Initialize the mesh to null; it will be created during the first update
    this.mesh = null;

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

    this.faces = {
      top: { indices: [2, 6, 7, 3], normal: [0, 1, 0], neighborOffset: [0, 1, 0] },
      bottom: { indices: [0, 1, 5, 4], normal: [0, -1, 0], neighborOffset: [0, -1, 0] },
      front: { indices: [0, 4, 6, 2], normal: [0, 0, 1], neighborOffset: [0, 0, 1] },
      back: { indices: [1, 3, 7, 5], normal: [0, 0, -1], neighborOffset: [0, 0, -1] },
      left: { indices: [0, 2, 3, 1], normal: [-1, 0, 0], neighborOffset: [-1, 0, 0] },
      right: { indices: [4, 5, 7, 6], normal: [1, 0, 0], neighborOffset: [1, 0, 0] },
    };
  }

  getVoxelKey(x, y, z) {
    return `${x},${y},${z}`;
  }

  hasVoxel(x, y, z) {
    return this.voxelMap.has(this.getVoxelKey(x, y, z));
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
    // Remove the current mesh from the group if it exists
    if (this.mesh) {
      this.remove(this.mesh);

      // Dispose of the existing geometry to free GPU resources
      this.mesh.geometry.dispose();
      this.mesh = null;
    }

    // Create a new geometry
    const geometry = new THREE.BufferGeometry();

    // Temporary arrays for geometry data
    const positions = [];
    const normals = [];
    const indices = [];
    const uvs = [];

    let indexCount = 0;

    // Generate geometry for each voxel in the map
    for (const [voxelKey] of this.voxelMap) {
      const [x, y, z] = voxelKey.split(',').map(Number);

      // Check each face of the voxel
      for (const [face, { indices: faceIndices, normal, neighborOffset }] of Object.entries(this.faces)) {
        const [nx, ny, nz] = neighborOffset;

        // If there's a neighboring voxel, skip this face
        if (this.hasVoxel(x + nx, y + ny, z + nz)) {
          continue;
        }

        // Add the face vertices, normals, and indices
        const vertexCount = positions.length / 3; // Number of vertices already added
        for (const i of faceIndices) {
          const [vx, vy, vz] = this.vertices[i];
          positions.push(vx + x, vy + y, vz + z);
          normals.push(...normal);
        }

        // Add indices for the two triangles that make up the face
        indices.push(
          vertexCount,
          vertexCount + 1,
          vertexCount + 2,
          vertexCount + 2,
          vertexCount + 3,
          vertexCount
        );

        // Add UVs for the face (assuming a simple square UV mapping)
        uvs.push(0, 0, 0, 1, 1, 1, 1, 0);
      }
    }

    // Update the geometry attributes
    geometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(positions, 3)
    );
    geometry.setAttribute(
      'normal',
      new THREE.Float32BufferAttribute(normals, 3)
    );
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices);

    // Create a new mesh with the updated geometry and the existing material
    this.mesh = new THREE.Mesh(geometry, this.material);

    // Add the new mesh to the group
    this.add(this.mesh);
  }
}