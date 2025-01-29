import type { Package } from "@/types/package"

interface PackageDetailsProps {
  package: Package | null
}

export default function PackageDetails({ package: selectedPackage }: PackageDetailsProps) {
  if (!selectedPackage) {
    return <p>Select a package to view details</p>
  }

  return (
    <div>
      <h3 className="text-lg font-semibold">{selectedPackage.name}</h3>
      <p>Creator: {selectedPackage.creator}</p>
      <h4 className="text-md font-semibold mt-2">Imports:</h4>
      {selectedPackage.imports && selectedPackage.imports.length > 0 ? (
        <ul className="list-disc pl-5">
          {selectedPackage.imports.map((imp) => (
            <li key={imp}>{imp}</li>
          ))}
        </ul>
      ) : (
        <p>No imports</p>
      )}
    </div>
  )
}

