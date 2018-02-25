declare var cytoscape: any;

(function() {
  function processReport(id: string) {
    fetch('/reports/' + id)
      .then(r => r.json())
      .then(render);
  }

  document.getElementById('report-btn').addEventListener('click', () => {
    const input = document.getElementById('report-input') as HTMLInputElement;
    const id = input.value;
    input.value = '';
    processReport(id);
  });

  function normalizeElements(graph: any) {
    const calculateNodeStrength = (graph: any, n: string) => {
      let sum = 0;
      Object.keys(graph[n] || {}).forEach((k: any) => {
        sum += graph[n][k] || 0;
      });

      Object.keys(graph)
        .filter(k => k !== n)
        .forEach(k => {
          sum += graph[k][n] || 0;
        });

      return sum;
    };

    const nodeSet = Object.keys(graph).reduce((a: Set<string>, c) => {
      a.add(c);
      Object.keys(graph[c]).forEach(n => a.add(n));
      return a;
    }, new Set<string>());
    const nodes: any[] = [];
    for (const n of nodeSet) {
      const nodeStrength = calculateNodeStrength(graph, n);
      nodes.push({
        data: {
          id: n,
          name: n,
          width: Math.max(nodeStrength * 0.8, 30)
        }
      });
    }

    const edges: any[] = [];
    Object.keys(graph).forEach(k => {
      Object.keys(graph[k]).forEach(n => {
        edges.push({
          data: {
            id: k + '-' + n,
            source: k,
            target: n,
            weight: graph[k][n]
          }
        });
      });
    });

    return {
      nodes,
      edges
    };
  }

  function render(graph: any) {
    cytoscape({
      layout: {
        name: 'cose',
        idealEdgeLength: 100,
        nodeOverlap: 100,
        refresh: 20,
        fit: true,
        padding: 10,
        randomize: false,
        componentSpacing: 100,
        nodeRepulsion: 4000000,
        edgeElasticity: 100000,
        nestingFactor: 5,
        gravity: 100,
        numIter: 1000,
        initialTemp: 200,
        coolingFactor: 0.95,
        minTemp: 1.0
      },

      style: cytoscape
        .stylesheet()
        .selector('edge')
        .style({
          width(n: any) {
            return n.data().weight;
          }
        })
        .selector('node')
        .style({
          width(n: any) {
            return n.data().width;
          }
        })
        .style({
          height(n: any) {
            return n.data().width;
          },
          label(n: any) {
            return n.data().name;
          }
        }),

      container: document.getElementById('canvas'),

      elements: normalizeElements(graph),

      ready: function() {
        (window as any).cy = this;
      }
    });
  }

  processReport('128035004');
})();
