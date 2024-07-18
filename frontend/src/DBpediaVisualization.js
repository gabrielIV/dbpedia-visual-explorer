import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const DBpediaVisualization = ({ data }) => {
  const svgRef = useRef(null);
  const [selectedEntity, setSelectedEntity] = useState(null);

  useEffect(() => {
    if (!data || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const width = 800;
    const height = 600;

    svg.attr('width', width).attr('height', height);

    const simulation = d3
      .forceSimulation(data.entities)
      .force('charge', d3.forceManyBody().strength(-100))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force(
        'collision',
        d3.forceCollide().radius((d) => d.card_size / 2)
      );

    const lines = svg
      .selectAll('line')
      .data(data.entities.slice(1))
      .enter()
      .append('line')
      .style('stroke', '#999')
      .style('stroke-opacity', 0.6);

    const nodes = svg
      .selectAll('circle')
      .data(data.entities)
      .enter()
      .append('circle')
      .attr('r', (d) => d.card_size / 2)
      .style('fill', (d, i) => (i === 0 ? '#ff0000' : '#00ff00'))
      .call(
        d3
          .drag()
          .on('start', dragstarted)
          .on('drag', dragged)
          .on('end', dragended)
      );

    nodes.on('click', (event, d) => {
      setSelectedEntity(d);
    });

    const labels = svg
      .selectAll('text')
      .data(data.entities)
      .enter()
      .append('text')
      .text((d) => d.query)
      .attr('font-size', '12px')
      .attr('text-anchor', 'middle');

    simulation.on('tick', () => {
      lines
        .attr('x1', (d) => data.entities[0].x)
        .attr('y1', (d) => data.entities[0].y)
        .attr('x2', (d) => d.x)
        .attr('y2', (d) => d.y);

      nodes.attr('cx', (d) => d.x).attr('cy', (d) => d.y);

      labels.attr('x', (d) => d.x).attr('y', (d) => d.y + d.card_size / 2 + 15);
    });

    function dragstarted(event) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    return () => {
      simulation.stop();
    };
  }, [data]);

  return (
    <div className='flex'>
      <div className='w-3/4'>
        <svg ref={svgRef}></svg>
      </div>
      <div className='w-1/4 p-4 bg-gray-100'>
        {selectedEntity && (
          <div>
            <h2 className='text-xl font-bold'>{selectedEntity.query}</h2>
            <p>{selectedEntity.data.comment}</p>
            {selectedEntity.data.thumbnail && (
              <img
                src={selectedEntity.data.thumbnail}
                alt={selectedEntity.query}
                className='mt-4'
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DBpediaVisualization;
