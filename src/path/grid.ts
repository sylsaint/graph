import { Grid, GridPoint, ShortestPath } from './index';

function isEqual(p1: GridPoint, p2: GridPoint): boolean {
    return p1.x === p2.x && p1.y === p2.y;
}

function isBarrier(p: GridPoint, grid: Grid): boolean {
    const v: number = grid[p.y][p.x];
    return v == 1;
}

export function breadFirstShortestGridSearch(grid: Grid, start: GridPoint, end: GridPoint): ShortestPath {
    // visited points
    const visited: { [key: string]: boolean } = {};
    // prev map
    const prevLink: { [key: string]: string} = {};
    // top, right, bottom, left, top-right, bottom-right, bottom-left, top-left
    const directionX: number[] = [0, 1, 0, -1, 1, 1, -1, -1];
    const directionY: number[] = [-1, 0, -1, 0, -1, 1, 1, -1];
    
    let tmp: GridPoint = { ...start };
    const pointStack: GridPoint[] = [tmp];

    while(pointStack.length) {
        const point: GridPoint = pointStack.shift() as GridPoint;
        visited[`${point.x}_${point.y}`] = true;
        for (let i = 0; i < directionX.length; i++) {
            tmp = { x: point.x + directionX[i], y: point.y + directionY[i] };
            if (tmp.x < 0 || tmp.x >= grid[0].length) continue;
            if (tmp.y < 0 || tmp.y >= grid.length) continue;
            if (visited[`${tmp.x}_${tmp.y}`]) continue;
            if (isBarrier(tmp, grid)) continue;
            prevLink[`${tmp.x}-${tmp.y}`] = `${point.x}-${point.y}`;
            pointStack.push(tmp);
            if (isEqual(tmp, end)) {
                while(pointStack.length) pointStack.pop();
                break;
            }
        }
    }
    const shortestPath: ShortestPath = { start, end, points: [] };
    tmp = {...end};
    while (!isEqual(start, tmp)) {
        shortestPath.points.push(tmp);
        const [x, y] = prevLink[`${tmp.x}-${tmp.y}`].split('-');
        tmp = { x: parseInt(x), y: parseInt(y) };
    }
    shortestPath.points.push(start);
    shortestPath.points.reverse();
    return shortestPath;
}