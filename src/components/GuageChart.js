import { useEffect, useRef, useMemo } from "react";
import {
	Chart as ChartJS,
	ArcElement,
	Tooltip,
	Legend,
	DoughnutController,
} from "chart.js";
import "../App.css";

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, DoughnutController);

// Risk categories as a constant
const RISK_CATEGORIES = [
	"Critical Risk",
	"High Risk",
	"Moderate Risk",
	"Low Risk",
];

// Needle plugin
const needlePlugin = {
	id: "needle-plugin",
	beforeDraw: (chart) => {
		const { ctx, chartArea } = chart;
		if (!chartArea) return;

		// Clear previous needle
		ctx.clearRect(0, 0, chart.canvas.width, chart.canvas.height);

		// Semi-circle dimensions
		const centerX = (chartArea.left + chartArea.right) / 2;
		const centerY = chartArea.bottom;
		const radius = (chartArea.right - chartArea.left) / 2;

		// Calculate needle position
		const riskPercentage = chart.config.options.plugins.needleValue || 0;
		const angle = Math.PI * (riskPercentage / 100) - Math.PI; // Map percentage to semi-circle
		const needleLength = radius * 0.8;

		// Draw the needle
		ctx.save();
		ctx.beginPath();
		ctx.moveTo(centerX, centerY);
		ctx.lineTo(
			centerX + needleLength * Math.cos(angle),
			centerY + needleLength * Math.sin(angle)
		);
		ctx.lineWidth = 3;
		ctx.strokeStyle = "#000";
		ctx.stroke();

		// Draw needle base
		ctx.beginPath();
		ctx.arc(centerX, centerY, 6, 0, 2 * Math.PI);
		ctx.fillStyle = "#000";
		ctx.fill();
		ctx.restore();
	},
};

// Register the needle plugin
ChartJS.register(needlePlugin);

const GaugeChart = ({ riskCategory }) => {
	const chartRef = useRef(null);
	const chartInstance = useRef(null);

	// Find the index of the risk category
	const riskIndex = RISK_CATEGORIES.indexOf(riskCategory);

	// Calculate the risk percentage
	const riskPercentage = useMemo(
		() => (riskIndex + 1) * 25 - 12.5, // Center needle within each category
		[riskIndex]
	);

	// Chart data
	const data = useMemo(
		() => ({
			labels: RISK_CATEGORIES,
			datasets: [
				{
					data: [25, 25, 25, 25], // Equal distribution
					backgroundColor: ["#FF6B6B", "#FFB74D", "#FFD700", "#66BB6A"],
					borderWidth: 0,
					cutout: "75%", // Adjust for gauge appearance
				},
			],
		}),
		[]
	);

	// Chart options
	const options = useMemo(
		() => ({
			circumference: 180, // Half-circle
			rotation: 270, // Start at the bottom
			responsive: true,
			maintainAspectRatio: false,
			plugins: {
				legend: { display: false },
				tooltip: { enabled: false },
				needleValue: riskPercentage, // Pass calculated percentage
			},
			animation: { duration: 1000 }, // Smooth animation
		}),
		[riskPercentage]
	);

	useEffect(() => {
		// Destroy the previous chart instance, if any
		if (chartInstance.current) {
			chartInstance.current.destroy();
		}

		// Create a new chart instance
		if (chartRef.current) {
			chartInstance.current = new ChartJS(chartRef.current, {
				type: "doughnut",
				data,
				options,
			});
		}

		// Cleanup on unmount
		return () => {
			if (chartInstance.current) {
				chartInstance.current.destroy();
				chartInstance.current = null;
			}
		};
	}, [data, options]); // Recreate the chart when data or options change

	return (
		<div className="gauge-chart">
			<canvas ref={chartRef}></canvas>
			<div className="risk-label">
				<h3>{riskCategory}</h3>
			</div>
		</div>
	);
};

export default GaugeChart;
