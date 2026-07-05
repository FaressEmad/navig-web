import { NavigationNode, NavigationEdge, RouteData, NavInstruction, Place } from "../types";

// Helper to calculate distance in meters between two coordinates using Haversine formula
export function getHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) *
      Math.cos(phi2) *
      Math.sin(deltaLambda / 2) *
      Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // in meters
}

// Find the closest navigation node to a given coordinate
export function findClosestNode(
  latitude: number,
  longitude: number,
  nodes: NavigationNode[]
): NavigationNode | null {
  if (nodes.length === 0) return null;

  let closestNode: NavigationNode | null = null;
  let minDistance = Infinity;

  for (const node of nodes) {
    const distance = getHaversineDistance(latitude, longitude, node.latitude, node.longitude);
    if (distance < minDistance) {
      minDistance = distance;
      closestNode = node;
    }
  }

  return closestNode;
}

// Dijkstra's algorithm for shortest pathfinding
export function calculateShortestPath(
  startNodeId: string,
  endNodeId: string,
  nodes: NavigationNode[],
  edges: NavigationEdge[]
): NavigationNode[] {
  const distances: { [key: string]: number } = {};
  const previous: { [key: string]: string | null } = {};
  const queue: string[] = [];

  // Initialize
  for (const node of nodes) {
    distances[node.id] = node.id === startNodeId ? 0 : Infinity;
    previous[node.id] = null;
    queue.push(node.id);
  }

  // Helper map for node coordinates
  const nodesMap = new Map<string, NavigationNode>();
  for (const node of nodes) {
    nodesMap.set(node.id, node);
  }

  // Build adjacency list for fast graph lookup
  const adj: { [key: string]: { node: string; weight: number }[] } = {};
  for (const node of nodes) {
    adj[node.id] = [];
  }
  for (const edge of edges) {
    if (adj[edge.sourceId] && adj[edge.targetId]) {
      adj[edge.sourceId].push({ node: edge.targetId, weight: edge.distance });
      adj[edge.targetId].push({ node: edge.sourceId, weight: edge.distance });
    }
  }

  while (queue.length > 0) {
    // Extract min distance node from queue
    queue.sort((a, b) => distances[a] - distances[b]);
    const u = queue.shift()!;

    if (u === endNodeId) break;
    if (distances[u] === Infinity) break;

    const neighbors = adj[u] || [];
    for (const neighbor of neighbors) {
      const v = neighbor.node;
      if (!queue.includes(v)) continue;

      const alt = distances[u] + neighbor.weight;
      if (alt < distances[v]) {
        distances[v] = alt;
        previous[v] = u;
      }
    }
  }

  // Reconstruct path
  const path: NavigationNode[] = [];
  let curr: string | null = endNodeId;

  if (previous[curr] !== null || curr === startNodeId) {
    while (curr !== null) {
      const node = nodesMap.get(curr);
      if (node) {
        path.unshift(node);
      }
      curr = previous[curr];
    }
  }

  return path;
}

// Generate bilingual walking instructions based on Dijkstra nodes path
export function generateRoute(
  startPlace: Place,
  destinationPlace: Place,
  nodes: NavigationNode[],
  edges: NavigationEdge[]
): RouteData | null {
  // 1. Find closest entry node for Start
  const startNode = findClosestNode(startPlace.latitude, startPlace.longitude, nodes);
  // 2. Find closest entry node for Destination
  const destNode = findClosestNode(destinationPlace.latitude, destinationPlace.longitude, nodes);

  if (!startNode || !destNode) return null;

  // 3. Find path of waypoints
  const pathNodes = calculateShortestPath(startNode.id, destNode.id, nodes, edges);

  if (pathNodes.length === 0) return null;

  // 4. Assemble coordinates path
  const path: [number, number][] = [
    [startPlace.latitude, startPlace.longitude],
    ...pathNodes.map(n => [n.latitude, n.longitude] as [number, number]),
    [destinationPlace.latitude, destinationPlace.longitude]
  ];

  // 5. Calculate step distance and instructions
  const instructions: NavInstruction[] = [];
  let totalDistance = 0;

  // Step 1: Walk from Start Place to closest Entry waypoint
  const firstDistance = Math.round(getHaversineDistance(
    startPlace.latitude,
    startPlace.longitude,
    startNode.latitude,
    startNode.longitude
  ));
  
  totalDistance += firstDistance;
  instructions.push({
    instructionEn: `Walk from ${startPlace.nameEn} toward the main pathway`,
    instructionAr: `امشِ من ${startPlace.nameAr} باتجاه الممشى الرئيسي`,
    distance: firstDistance,
    coordinate: [startPlace.latitude, startPlace.longitude]
  });

  // Step 2: Internal path coordinates directions
  for (let i = 0; i < pathNodes.length - 1; i++) {
    const current = pathNodes[i];
    const next = pathNodes[i + 1];
    
    // Find edge distance
    const edge = edges.find(
      e => (e.sourceId === current.id && e.targetId === next.id) ||
           (e.sourceId === next.id && e.targetId === current.id)
    );
    const dist = edge ? edge.distance : Math.round(getHaversineDistance(current.latitude, current.longitude, next.latitude, next.longitude));

    totalDistance += dist;

    // Generate descriptive instruction based on landmarks
    const currentName = current.name || `Waypoint ${current.id}`;
    const nextName = next.name || `Waypoint ${next.id}`;
    
    instructions.push({
      instructionEn: `Continue along the road from ${currentName} to ${nextName}`,
      instructionAr: `تابع السير في الطريق من ${currentName} إلى ${nextName}`,
      distance: dist,
      coordinate: [current.latitude, current.longitude]
    });
  }

  // Step 3: Walk from last waypoint to Destination Place
  const lastNode = pathNodes[pathNodes.length - 1];
  const lastDistance = Math.round(getHaversineDistance(
    lastNode.latitude,
    lastNode.longitude,
    destinationPlace.latitude,
    destinationPlace.longitude
  ));

  totalDistance += lastDistance;
  instructions.push({
    instructionEn: `Turn and enter ${destinationPlace.nameEn}`,
    instructionAr: `انعطف وادخل إلى ${destinationPlace.nameAr}`,
    distance: lastDistance,
    coordinate: [lastNode.latitude, lastNode.longitude]
  });

  // 6. Calculate duration in minutes (average walking speed = 1.3 m/s)
  const walkingSpeed = 1.3;
  const duration = Math.max(1, Math.round(totalDistance / walkingSpeed / 60));

  return {
    path,
    distance: Math.round(totalDistance),
    duration,
    instructions
  };
}
