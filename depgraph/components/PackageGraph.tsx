"use client"

import { useEffect, useRef, useState } from "react"
import * as d3 from "d3"
import type { Package } from "@/types/package"

interface PackageGraphProps {
  packages: Package[]
  onSelectPackage: (pkg: Package | null) => void
}

export default function PackageGraph({ packages, onSelectPackage }: PackageGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null)

  useEffect(() => {
    if (!packages.length || !svgRef.current) return

    const svg = d3.select(svgRef.current)
    const width = svg.node()?.getBoundingClientRect().width || 800
    const height = svg.node()?.getBoundingClientRect().height || 600

    svg.selectAll("*").remove()

    const g = svg.append("g")

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => {
        g.attr("transform", event.transform)
      })

    svg.call(zoom)

    const simulation = d3
      .forceSimulation(packages)
      .force("charge", d3.forceManyBody().strength(-200))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(30))

    const links = g
      .selectAll("line")
      .data([])
      .join("line")
      .style("stroke", "#999")
      .style("stroke-opacity", 0.6)
      .style("stroke-width", 2)

    const nodes = g
      .selectAll("circle")
      .data(packages)
      .join("circle")
      .attr("r", 20)
      .style("fill", "#69b3a2")
      .style("cursor", "pointer")
      .on("click", (event, d) => {
        event.stopPropagation()
        handleNodeClick(d)
      })

    const labels = g
      .selectAll("text")
      .data(packages)
      .join("text")
      .text((d) => d.name)
      .attr("font-size", "12px")
      .attr("text-anchor", "middle")
      .attr("dy", 30)

    simulation.on("tick", () => {
      nodes.attr("cx", (d) => d.x!).attr("cy", (d) => d.y!)

      labels.attr("x", (d) => d.x!).attr("y", (d) => d.y!)

      links
        .attr("x1", (d) => d.source.x)
        .attr("y1", (d) => d.source.y)
        .attr("x2", (d) => d.target.x)
        .attr("y2", (d) => d.target.y)
    })

    // Reset zoom on double click
    svg.on("dblclick.zoom", null)
    svg.on("dblclick", () => {
      svg
        .transition()
        .duration(750)
        .call(zoom.transform, d3.zoomIdentity, d3.zoomTransform(svg.node()!).invert([width / 2, height / 2]))
      handleNodeClick(null)
    })

    function handleNodeClick(clickedPackage: Package | null) {
      setSelectedPackage(clickedPackage)
      onSelectPackage(clickedPackage)

      if (clickedPackage) {
        const importedPackages = packages.filter((p) => clickedPackage.imports.includes(p.name))
        const newLinks = importedPackages.map((p) => ({ source: clickedPackage, target: p }))

        links
          .data(newLinks)
          .join("line")
          .attr("x1", (d) => d.source.x!)
          .attr("y1", (d) => d.source.y!)
          .attr("x2", (d) => d.target.x!)
          .attr("y2", (d) => d.target.y!)

        nodes
          .style("fill", (p) => (p === clickedPackage || importedPackages.includes(p) ? "#69b3a2" : "#ddd"))
          .style("opacity", (p) => (p === clickedPackage || importedPackages.includes(p) ? 1 : 0.5))

        labels.style("opacity", (p) => (p === clickedPackage || importedPackages.includes(p) ? 1 : 0.5))
      } else {
        links.data([]).exit().remove()
        nodes.style("fill", "#69b3a2").style("opacity", 1)
        labels.style("opacity", 1)
      }
    }
  }, [packages, onSelectPackage])

  return <svg ref={svgRef} width="100%" height="100%" onClick={() => handleNodeClick(null)} />
}

