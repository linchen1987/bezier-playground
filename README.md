# Bezier Playground

An interactive web application for visualizing and experimenting with Bezier curves. Built with React, TypeScript, and Tailwind CSS.

This project is implemented with AI assistance, inspired by [Sam Gentle's Bezier Playground](https://samgentle.com/playgrounds/bezier). The original implementation has been reimagined using modern web technologies and enhanced with additional features.

![Bezier Playground Demo](demo.gif)

## Features

- Interactive Bezier curve visualization
- Real-time curve manipulation with draggable control points
- De Casteljau's algorithm visualization with intermediate construction lines
- Adjustable curve order (number of control points)
- Time parameter (t) control with smooth slider
- Responsive design

## Tech Stack

- React
- TypeScript
- Tailwind CSS
- Radix UI
- Vite

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/linchen1987/bezier-playground.git
cd bezier-playground
```

2. Install dependencies:
```bash
pnpm install
```

3. Start the development server:
```bash
pnpm run dev
```

4. Open your browser and visit `http://localhost:5173`

## Usage

- Drag the red control points to modify the Bezier curve shape
- Use the slider to animate the curve construction (t parameter)
- Adjust the order input to change the number of control points
- Watch the intermediate construction lines to understand how the curve is built

## License

MIT License - feel free to use this project for learning, teaching, or any other purpose. 