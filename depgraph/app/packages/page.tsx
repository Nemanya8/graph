"use client"

import { useEffect, useState } from "react"
import type { Package } from "@/types/package"
import PackageGraph from "@/components/PackageGraph"
import PackageDetails from "@/components/PackageDetails"

export default function PackagesPage() {
  const [packages, setPackages] = useState<Package[]>([])
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await fetch("/api/packages")
        if (!response.ok) {
          throw new Error("Failed to fetch packages")
        }
        const data: Package[] = await response.json()
        setPackages(data)
        console.log("All packages:", data)
      } catch (err) {
        setError("Error fetching packages")
        console.error("Error fetching packages:", err)
      }
    }

    fetchPackages()
  }, [])

  if (error) {
    return <div className="text-red-500">{error}</div>
  }

  return (
    <div className="flex h-screen">
      <div className="w-1/3 p-4 border-r overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Package Details</h2>
        <PackageDetails package={selectedPackage} />
      </div>
      <div className="w-2/3 relative">
        <PackageGraph packages={packages} onSelectPackage={setSelectedPackage} />
        <div className="absolute top-4 right-4 bg-white p-2 rounded shadow">
          <p className="text-sm">
            <strong>Zoom:</strong> Scroll or pinch
            <br />
            <strong>Move:</strong> Click and drag
            <br />
            <strong>Reset:</strong> Double-click
            <br />
            <strong>Select:</strong> Click on a node
            <br />
            <strong>Deselect:</strong> Click on background
          </p>
        </div>
      </div>
    </div>
  )
}

