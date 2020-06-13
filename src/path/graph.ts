let countId = 0;

export class Graph {
    vertice: Vertex[] = [];
    constructor(vertice?: Vertex[]) {
        if (vertice) {
            this.vertice = vertice;
        }
    }
    getVertice(): Vertex[] {
        return this.vertice;
    }
}

export class Vertex {
    id: number;
    neighbours: Vertex[] = [];
    constructor(id: number) {
        this.id = id;
    }
    setNeighbours(vertice: Vertex[]) {
        this.neighbours = [...vertice];
    }
    getNeighbours(): Vertex[] {
        return this.neighbours;
    }
}
