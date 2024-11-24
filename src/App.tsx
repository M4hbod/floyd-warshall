import React, { useEffect, useState } from "react"
import CytoscapeComponent from "react-cytoscapejs"
import "./App.css"
import { GraphElement } from "./types/Graph"
import CoseBilkent from "cytoscape-cose-bilkent"
import Cytoscape from "cytoscape"

Cytoscape.use(CoseBilkent)

const generateRandomEvenNumber = (min: number, max: number): number => {
	const random = min + Math.round((Math.random() * (max - min)) / 2) * 2
	return random
}

const generateRandomNumber = (min: number, max: number): number => {
	const random = min + Math.round(Math.random() * (max - min))
	return random
}

const App: React.FC = () => {
	const cyRef = React.useRef<cytoscape.Core | null>(null)
	const [graph, setGraph] = useState<GraphElement[]>([])
	const [matrix, setMatrix] = useState<number[][]>()
	const [darkMode, setDarkMode] = useState<boolean>(true)
	const [source, setSource] = useState<string>("A")
	const [destination, setDestination] = useState<string>("A")
	const [path, setPath] = useState<string[]>([])

	useEffect(() => {
		const nodeCount = generateRandomEvenNumber(10, 20)
		const edgeCount = Math.floor(nodeCount / 3)
		const graph: GraphElement[] = []
		const edges: GraphElement[] = []
		const matrix: number[][] = Array.from({ length: nodeCount }, () =>
			Array.from({ length: nodeCount }, () => Infinity),
		)

		for (let i = 0; i < nodeCount; i++) {
			graph.push({
				data: {
					id: String.fromCharCode(65 + i),
					label: String.fromCharCode(65 + i),
				},
			})
			matrix[i][i] = 0
		}

		for (let i = 0; i < nodeCount; i++) {
			const source = String.fromCharCode(65 + i)
			const targets: number[] = []
			while (targets.length < edgeCount) {
				const target = generateRandomNumber(0, nodeCount - 1)
				if (!targets.includes(target) && target !== i) {
					targets.push(target)
				}
			}
			for (const target of targets) {
				const weight = generateRandomNumber(40, 80)
				edges.push({
					data: {
						source,
						target: String.fromCharCode(65 + target),
						label: weight.toString(),
					},
				})
				matrix[i][target] = weight
			}
		}
		setGraph([...graph, ...edges])
		setMatrix(matrix)
	}, [])

	const layout = {
		name: "cose-bilkent",
		idealEdgeLength: 200,
	}

	const floydWarshall = (): void => {
		if (!matrix) return
		const n = matrix.length
		const dist = matrix.map((row) => [...row])
		const next: (number | null)[][] = Array.from({ length: n }, () =>
			Array.from({ length: n }, () => null),
		)

		for (let i = 0; i < n; i++) {
			for (let j = 0; j < n; j++) {
				if (i !== j && matrix[i][j] !== Infinity) {
					next[i][j] = j
				}
			}
		}

		for (let k = 0; k < n; k++) {
			for (let i = 0; i < n; i++) {
				for (let j = 0; j < n; j++) {
					if (dist[i][k] + dist[k][j] < dist[i][j]) {
						dist[i][j] = dist[i][k] + dist[k][j]
						next[i][j] = next[i][k]
					}
				}
			}
		}

		const getPath = (u: number, v: number): string[] => {
			if (next[u][v] === null) return []
			const path = [u]
			while (u !== v) {
				u = next[u][v]!
				path.push(u)
			}
			return path.map((node) => String.fromCharCode(65 + node))
		}

		if (source && destination) {
			const sourceIndex = source.charCodeAt(0) - 65
			const destinationIndex = destination.charCodeAt(0) - 65
			const shortestPath = getPath(sourceIndex, destinationIndex)
			setPath(shortestPath)
		}

		setMatrix(dist)
	}

	return (
		<div className={`${darkMode ? "dark" : ""} debug-screens`}>
			<div className='min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100'>
				<header className='p-4 shadow-md flex justify-between items-center'>
					<h1 className='text-2xl font-bold'>
						Floyd–Warshall Visualizer
					</h1>
					<button
						onClick={() => setDarkMode(!darkMode)}
						className='p-2 bg-gray-300 dark:bg-gray-800 rounded'
					>
						{darkMode ? "Light Mode" : "Dark Mode"}
					</button>
				</header>
				<main className='desktop:flex-row p-4 gap-y-4 gap-x-4 flex-col flex min-h-[90vh]'>
					<div className='w-full desktop:w-2/4 bg-white dark:bg-gray-800 p-4 rounded shadow flex justify-center flex-col items-center'>
						<h2 className='text-lg font-semibold mb-2'>
							Graph Input
						</h2>
						<div className='flex flex-col gap-y-2 my-4'>
							<label
								htmlFor='source'
								className='text-lg font-semibold'
							>
								Source Node
							</label>
							<select
								id='source'
								className='p-2 border rounded-md dark:bg-gray-700 border-gray-500 focus:border-blue-500 outline-none'
								onChange={(e) => setSource(e.target.value)}
							>
								{matrix &&
									Array.from({ length: matrix.length }).map(
										(_, i) => {
											return (
												<option
													key={String.fromCharCode(
														65 + i,
													)}
													value={String.fromCharCode(
														65 + i,
													)}
												>
													{String.fromCharCode(
														65 + i,
													)}
												</option>
											)
										},
									)}
							</select>

							<label
								htmlFor='destination'
								className='text-lg font-semibold'
							>
								Destination Node
							</label>
							<select
								id='destination'
								className='p-2 border rounded-md dark:bg-gray-700 border-gray-500 focus:border-blue-500 outline-none'
								onChange={(e) => setDestination(e.target.value)}
							>
								{matrix &&
									Array.from({ length: matrix.length }).map(
										(_, i) => {
											return (
												<option
													key={String.fromCharCode(
														65 + i,
													)}
													value={String.fromCharCode(
														65 + i,
													)}
												>
													{String.fromCharCode(
														65 + i,
													)}
												</option>
											)
										},
									)}
							</select>
						</div>
						<button
							onClick={floydWarshall}
							className='px-4 py-2 bg-blue-500 text-white rounded shadow'
						>
							Run Floyd-Warshall
						</button>

						{matrix && (
							<div className='mt-4 space-y-2'>
								{matrix.map((row, i) => (
									<div key={i} className='flex gap-x-2'>
										{row.map((cell, j) => (
											<div
												key={j}
												className='border border-gray-500 min-w-8 min-h-8 items-center justify-center flex'
											>
												{cell === Infinity ? "∞" : cell}
											</div>
										))}
									</div>
								))}
							</div>
						)}

						{path.length > 0 && (
							<div className='mt-4'>
								<h3 className='text-lg font-semibold'>
									Shortest Path
								</h3>
								<p>{path.join(" -> ")}</p>
							</div>
						)}
					</div>

					<div className='w-full h-[80vh] desktop:min-h-[90vh] desktop:w-2/4 rounded bg-white dark:bg-gray-800'>
						<CytoscapeComponent
							key={graph.length} // Forces the graph to re-render when the graph changes
							cy={(cy) => {
								if (!cyRef.current) cyRef.current = cy
							}}
							zoomingEnabled={false}
							elements={graph}
							style={{ width: "100%", height: "100%" }}
							layout={layout}
							stylesheet={[
								{
									selector: "node",
									style: {
										label: "data(label)",
										backgroundColor: "#0074D9",
										color: "#fff",
										"font-weight": "bold",
									},
								},
								{
									selector: "edge",
									style: {
										label: "data(label)",
										width: 2,
										color: "#fff",
										"font-size": "22px",
										"curve-style": "unbundled-bezier",
										"target-arrow-shape": "chevron",
									},
								},
							]}
						/>
					</div>
				</main>
			</div>
		</div>
	)
}

export default App
