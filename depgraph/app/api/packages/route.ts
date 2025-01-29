import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import type { Package } from "@/types/package"

interface PackageResponse {
  [key: string]: {
    imports: string[]
    creator: string
  }
}

export async function GET(request: NextRequest) {
  try {
    const response = await fetch("http://localhost:8080/getAllPackages")

    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch data from Go API" }, { status: response.status })
    }

    const data: PackageResponse = await response.json()

    const packages: Package[] = Object.keys(data).map((pkgName) => ({
      name: pkgName,
      imports: data[pkgName].imports,
      creator: data[pkgName].creator,
    }))

    return NextResponse.json(packages)
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

