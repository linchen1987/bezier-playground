import { useState, useEffect, useRef, useMemo } from 'react'
import * as SliderPrimitive from "@radix-ui/react-slider"
import { Label } from '@/components/ui/label'

interface Point {
  x: number;
  y: number;
}

function App() {
  const [t, setT] = useState(0)
  const [order, setOrder] = useState(3)
  const [points, setPoints] = useState<Point[]>([])
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  // Initialize control points
  useEffect(() => {
    // Ensure order is within reasonable bounds to prevent excessive recursion
    const safeOrder = Math.max(1, Math.min(100, order))
    const newPoints: Point[] = Array.from({ length: safeOrder + 1 }, (_, i) => ({
      x: 50 + (i * 700) / safeOrder,
      y: 200 - Math.sin((i * Math.PI) / safeOrder) * 150
    }))
    if (newPoints.length > 0) {
      setPoints(newPoints)
    }
  }, [order])

  // Calculate Bezier curve points using De Casteljau's algorithm
  const calculateBezierPoint = (t: number, controlPoints: Point[]): Point => {
    if (controlPoints.length === 1) return controlPoints[0]

    const newPoints: Point[] = []
    for (let i = 0; i < controlPoints.length - 1; i++) {
      newPoints.push({
        x: (1 - t) * controlPoints[i].x + t * controlPoints[i + 1].x,
        y: (1 - t) * controlPoints[i].y + t * controlPoints[i + 1].y
      })
    }

    return calculateBezierPoint(t, newPoints)
  }

  // Generate curve points with memoization to prevent recalculation
  const curvePoints = useMemo(() => {
    if (points.length === 0) return []
    return Array.from({ length: 100 }, (_, i) => {
      const currentT = i / 99
      return calculateBezierPoint(currentT, points)
    })
  }, [points])

  // Handle dragging control points
  const handleMouseDown = (index: number) => {
    setDraggingIndex(index)
  }

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (draggingIndex === null || !svgRef.current) return

    const point = svgRef.current.createSVGPoint()
    point.x = e.clientX
    point.y = e.clientY

    // Transform the point from screen coordinates to SVG coordinates
    const ctm = svgRef.current.getScreenCTM()
    if (!ctm) return

    const svgPoint = point.matrixTransform(ctm.inverse())
    const x = Math.max(0, Math.min(800, svgPoint.x))
    const y = Math.max(0, Math.min(400, svgPoint.y))

    setPoints(prev =>
      prev.map((p, i) => i === draggingIndex ? { x, y } : p)
    )
  }

  const handleMouseUp = () => {
    setDraggingIndex(null)
  }

  // Calculate intermediate points for visualization using useMemo
  const intermediatePoints = useMemo(() => {
    let currentPoints = [...points]
    const allPoints: Point[][] = [currentPoints]

    while (currentPoints.length > 1) {
      const newPoints: Point[] = []
      for (let i = 0; i < currentPoints.length - 1; i++) {
        // Use direct linear interpolation for intermediate points
        newPoints.push({
          x: (1 - t) * currentPoints[i].x + t * currentPoints[i + 1].x,
          y: (1 - t) * currentPoints[i].y + t * currentPoints[i + 1].y
        })
      }
      currentPoints = newPoints
      allPoints.push(newPoints)
    }

    return allPoints
  }, [points, t])

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Bezier Playground</h1>
          <a
            href="https://github.com/linchen1987/bezier-playground"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <svg height="24" width="24" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
            </svg>
            <span>View on GitHub</span>
          </a>
        </div>

        <div className="space-y-6">
          <div className="w-full h-96 border rounded-lg bg-white">
            <svg
              ref={svgRef}
              viewBox="0 0 800 400"
              preserveAspectRatio="xMidYMid meet"
              className="w-full h-full"
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {/* Draw the Bezier curve */}
              <path
                d={curvePoints.length > 0 ? `M ${curvePoints.map(p => `${p.x},${p.y}`).join(' L ')}` : ''}
                fill="none"
                stroke="blue"
                strokeWidth="2"
              />

              {/* Draw intermediate construction lines */}
              {intermediatePoints.map((pointSet, setIndex) => (
                <g key={setIndex}>
                  {pointSet.length > 1 && (
                    <path
                      d={`M ${pointSet.map(p => `${p.x},${p.y}`).join(' L ')}`}
                      fill="#333333"
                      stroke="gray"
                      strokeWidth="1"
                      opacity="0.2"
                    />
                  )}
                  {pointSet.map((point, pointIndex) => (
                    <circle
                      key={pointIndex}
                      cx={point.x}
                      cy={point.y}
                      r={setIndex === 0 ? 6 : 4}
                      fill={setIndex === 0 ? 'red' : 'gray'}
                      stroke="white"
                      strokeWidth="2"
                      onMouseDown={() => setIndex === 0 && handleMouseDown(pointIndex)}
                      style={{ cursor: setIndex === 0 ? 'move' : 'default' }}
                    />
                  ))}
                </g>
              ))}
            </svg>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>T = {t.toFixed(2)}</Label>
              <form className="w-full">
                <div className="w-full max-w-md">
                  <SliderPrimitive.Root
                    className="relative flex items-center select-none touch-none w-full h-5"
                    defaultValue={[0]}
                    value={[t]}
                    onValueChange={(values) => {
                      const newT = values[0];
                      setT(newT);
                    }}
                    max={1}
                    min={0}
                    step={0.01}
                    orientation="horizontal"
                    id="t-slider"
                  >
                    <SliderPrimitive.Track className="bg-gray-200 relative grow rounded-full h-2">
                      <SliderPrimitive.Range className="absolute bg-gray-900 rounded-full h-full" />
                    </SliderPrimitive.Track>
                    <SliderPrimitive.Thumb
                      className="block w-5 h-5 bg-gray-900 rounded-full hover:bg-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 cursor-grab active:cursor-grabbing"
                      aria-label="T value"
                    />
                  </SliderPrimitive.Root>
                </div>
              </form>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">Order</label>
              <input
                type="number"
                value={order}
                onChange={(e) => setOrder(parseInt(e.target.value))}
                className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <p className="text-sm text-gray-500">
              Drag red circles to move control points
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
