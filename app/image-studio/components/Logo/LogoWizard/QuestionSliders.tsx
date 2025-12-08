"use client"

/**
 * QuestionSliders Components
 *
 * Slider controls for depth and tilt questions
 */

interface DepthSliderProps {
  extrusionDepth: number
  onExtrusionChange: (value: number) => void
}

export function DepthSlider({ extrusionDepth, onExtrusionChange }: DepthSliderProps) {
  return (
    <div className="max-w-md mx-auto mt-6 space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="text-zinc-400">Fine-tune 3D Intensity</span>
        <span className="text-purple-400 font-medium">{extrusionDepth}%</span>
      </div>
      <input
        type="range"
        min="0"
        max="100"
        step="5"
        value={extrusionDepth}
        onChange={(e) => onExtrusionChange(Number(e.target.value))}
        className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
        style={{
          background: `linear-gradient(to right, #8B5CF6 0%, #8B5CF6 ${extrusionDepth}%, #3f3f46 ${extrusionDepth}%, #3f3f46 100%)`
        }}
      />
      <div className="flex justify-between text-xs text-zinc-500">
        <span>Minimal</span>
        <span>Light</span>
        <span>Strong</span>
        <span>Extreme</span>
      </div>
    </div>
  )
}

interface TiltSliderProps {
  tiltAngle: number
  onTiltAngleChange: (value: number) => void
}

export function TiltSlider({ tiltAngle, onTiltAngleChange }: TiltSliderProps) {
  return (
    <div className="max-w-md mx-auto mt-6 space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="text-zinc-400">Fine-tune Tilt Angle</span>
        <span className="text-purple-400 font-medium">{tiltAngle}°</span>
      </div>
      <input
        type="range"
        min="-45"
        max="45"
        step="1"
        value={tiltAngle}
        onChange={(e) => onTiltAngleChange(Number(e.target.value))}
        className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
        style={{
          background: `linear-gradient(to right, #3f3f46 0%, #3f3f46 ${(tiltAngle + 45) / 90 * 100}%, #8B5CF6 ${(tiltAngle + 45) / 90 * 100}%, #8B5CF6 100%)`
        }}
      />
      <div className="flex justify-between text-xs text-zinc-500">
        <span>-45°</span>
        <span>-20°</span>
        <span>0°</span>
        <span>+20°</span>
        <span>+45°</span>
      </div>
    </div>
  )
}
