import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	BarElement,
	Title,
	Tooltip,
	Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import GaugeChart from "./GuageChart";
import jsPDF from "jspdf";
import { baseUrl } from "../Util";

// Register Chart.js components
ChartJS.register(
	CategoryScale,
	LinearScale,
	BarElement,
	Title,
	Tooltip,
	Legend
);

const ResultPage = () => {
	const { submissionId } = useParams();
	const [submissionData, setSubmissionData] = useState(null);
	const [recommendation, setRecommendation] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [emailStatus, setEmailStatus] = useState("");
	// console.log("rec", recommendation);

	// Fetch submission data
	useEffect(() => {
		const fetchSubmissionData = async () => {
			try {
				const response = await axios.get(
					`${baseUrl}/api/results/${submissionId}`
				);
				setSubmissionData(response.data);

				const recommendationResponse = await axios.get(
					`${baseUrl}/api/recommendations`
				);
				// console.log(recommendationResponse);

				const matchedRecommendation = recommendationResponse.data.find(
					(rec) => rec.riskCategory === response.data.riskCategory
				);
				setRecommendation(matchedRecommendation);
			} catch (err) {
				console.error("Error fetching data:", err);
				setError("Failed to load results or recommendations.");
			} finally {
				setLoading(false);
			}
		};

		fetchSubmissionData();
	}, [submissionId]);

	const sendResultsByEmail = async () => {
		try {
			const quizUserData = JSON.parse(localStorage.getItem("quizUserData"));
			const userEmail = quizUserData?.email;

			if (!userEmail) {
				setEmailStatus("Email not found in local storage.");
				return;
			}

			// Initialize PDF
			const pdf = new jsPDF("p", "mm", "a4");
			let currentY = 10; // Start at the top of the first page
			const pageHeight = 297; // A4 page height in mm
			const marginBottom = 10; // Margin from the bottom of the page

			// Helper to add text and check for page overflow
			const addTextToPDF = (text, x, y, lineSpacing = 10) => {
				const textLines = pdf.splitTextToSize(text, 180); // Wrap text to fit within 180mm
				textLines.forEach((line) => {
					if (currentY + lineSpacing > pageHeight - marginBottom) {
						pdf.addPage(); // Add new page
						currentY = 10; // Reset currentY to the top
					}
					pdf.text(line, x, currentY); // Add text line
					currentY += lineSpacing; // Move down for the next line
				});
			};

			pdf.setFontSize(14);
			addTextToPDF("Quiz Results", 10, currentY);
			pdf.setFontSize(12);
			addTextToPDF(
				`Total Score: ${submissionData.totalScore / 10}`,
				10,
				currentY
			);
			addTextToPDF(
				`Risk Category: ${submissionData.riskCategory}`,
				10,
				currentY
			);

			if (recommendation) {
				addTextToPDF("Recommendations:", 10, currentY);

				if (recommendation.immediateActions) {
					addTextToPDF("Immediate Actions:", 10, currentY);
					recommendation.immediateActions.steps.forEach((step, index) => {
						addTextToPDF(
							`${index + 1}. ${step.subHead || "No subhead"}`,
							10,
							currentY
						);
						step.actions.forEach((action) => {
							addTextToPDF(`- ${action}`, 15, currentY);
						});
					});
				}

				if (recommendation.shortTermActions) {
					addTextToPDF("Short-Term Actions:", 10, currentY);
					recommendation.shortTermActions.steps.forEach((step, index) => {
						addTextToPDF(
							`${index + 1}. ${step.subHead || "No subhead"}`,
							10,
							currentY
						);
						step.actions.forEach((action) => {
							addTextToPDF(`- ${action}`, 15, currentY);
						});
					});
				}

				if (recommendation.longTermActions) {
					addTextToPDF("Long-Term Actions:", 10, currentY);
					recommendation.longTermActions.steps.forEach((step, index) => {
						addTextToPDF(
							`${index + 1}. ${step.subHead || "No subhead"}`,
							10,
							currentY
						);
						step.actions.forEach((action) => {
							addTextToPDF(`- ${action}`, 15, currentY);
						});
					});
				}
				if (recommendation.timeline) {
					addTextToPDF("Timeline:", 10, currentY);
					recommendation.timeline.steps.forEach((step) => {
						addTextToPDF(`- ${step || "No subhead"}`, 10, currentY);
					});
				}
			} else {
				addTextToPDF("No recommendations available.", 10, currentY);
			}

			// Generate PDF as Base64 string
			const pdfBase64 = pdf.output("datauristring").split(",")[1];

			const emailData = {
				recipientEmail: userEmail,
				results: `Total Score: ${
					submissionData.totalScore / 10
				}, Risk Category: ${submissionData.riskCategory}`,
				attachmentBase64: pdfBase64,
			};

			const response = await axios.post(
				"http://localhost:8080/api/send-email",
				emailData
			);

			if (response.data.success) {
				setEmailStatus("Email sent successfully!");
			} else {
				setEmailStatus("Failed to send the email.");
			}
		} catch (err) {
			console.error("Error sending email:", err);
			setEmailStatus("Error sending email.");
		}
	};

	// const generatePDF = async () => {
	// 	const input = document.getElementById("pdf-content");
	// 	if (!input) {
	// 		console.error("Element not found: #pdf-content");
	// 		return;
	// 	}

	// 	try {
	// 		// Render the content to a canvas using html2canvas
	// 		const canvas = await html2canvas(input, { scale: 2 }); // Scale ensures better quality
	// 		// const imgData = canvas.toDataURL("image/png"); // Convert canvas to image
	// 		const pdf = new jsPDF("p", "mm", "a4"); // Initialize jsPDF

	// 		// PDF page size in pixels (A4 size at 72 DPI)
	// 		const pageWidth = 190; // PDF width in mm (leaving margins)
	// 		const pageHeight = 260; // PDF height in mm
	// 		const imgWidth = pageWidth; // Set the image width to fit the page width
	// 		const pxPerMm = canvas.width / pageWidth; // Calculate pixels per mm
	// 		// const imgHeight = canvas.height / pxPerMm; // Full image height in mm

	// 		// Number of pages required
	// 		const pageHeightPx = pageHeight * pxPerMm; // Page height in pixels
	// 		let yOffset = 0; // Offset for slicing the canvas

	// 		// Loop through the canvas and add each page
	// 		while (yOffset < canvas.height) {
	// 			const pageCanvas = document.createElement("canvas");
	// 			pageCanvas.width = canvas.width;
	// 			pageCanvas.height = Math.min(pageHeightPx, canvas.height - yOffset); // Remaining height

	// 			// Draw the current section of the canvas
	// 			const ctx = pageCanvas.getContext("2d");
	// 			ctx.drawImage(
	// 				canvas,
	// 				0,
	// 				yOffset,
	// 				canvas.width,
	// 				pageCanvas.height,
	// 				0,
	// 				0,
	// 				canvas.width,
	// 				pageCanvas.height
	// 			);

	// 			// Convert the page canvas to an image
	// 			const pageImgData = pageCanvas.toDataURL("image/png");

	// 			// Add the image to the PDF
	// 			if (yOffset === 0) {
	// 				pdf.addImage(
	// 					pageImgData,
	// 					"PNG",
	// 					10,
	// 					10,
	// 					imgWidth,
	// 					pageCanvas.height / pxPerMm
	// 				);
	// 			} else {
	// 				pdf.addPage();
	// 				pdf.addImage(
	// 					pageImgData,
	// 					"PNG",
	// 					10,
	// 					10,
	// 					imgWidth,
	// 					pageCanvas.height / pxPerMm
	// 				);
	// 			}

	// 			// Move the offset to the next section
	// 			yOffset += pageHeightPx;
	// 		}

	// 		// Save the PDF
	// 		pdf.save(`Quiz_Result_${submissionId}.pdf`);
	// 	} catch (err) {
	// 		console.error("Error generating PDF:", err);
	// 	}
	// };

	if (loading) {
		return <div>Loading results...</div>;
	}

	if (error) {
		return <div>{error}</div>;
	}

	if (!submissionData) {
		return <div>No submission data found.</div>;
	}

	const { totalScore, riskCategory, answers } = submissionData;

	// chart data
	const chartData = {
		labels: answers.map((_, index) => `Q${index + 1}`),
		datasets: [
			{
				label: "Question Scores",
				data: answers.map((ans) => ans.score),
				backgroundColor: "rgba(54, 162, 235, 0.6)",
				borderColor: "rgba(54, 162, 235, 1)",
				borderWidth: 1,
			},
		],
	};

	const chartOptions = {
		scales: {
			y: {
				beginAtZero: true,
				max: 10,
			},
		},
	};

	return (
		<div className="result-page" id="pdf-content">
			<h1>Quiz Results</h1>
			<div className="summary">
				<p>
					<strong>Total Score:</strong> {totalScore / 10}
				</p>
				<h2>Risk Level: {riskCategory}</h2>
			</div>
			{/* <div className="chart-container">
				<h3>Score Distribution</h3>
				<Bar data={chartData} options={chartOptions} />
			</div> */}

			<div className="doughnut-container">
				<GaugeChart riskCategory={riskCategory} />
			</div>

			<div className="recommendation-container">
				<h3>Recommendations</h3>
				{recommendation ? (
					<>
						<h4>{recommendation.summary}</h4>
						<p>{recommendation.detailedSummary}</p>
						<div>
							<h4>Immediate Actions:</h4>
							<p>{recommendation.immediateActions.summary}</p>
							{recommendation.immediateActions.steps.map((step, index) => (
								<div key={index}>
									<p>
										{typeof step?.subHead === "object"
											? JSON.stringify(step.subHead)
											: step?.subHead}
									</p>
									<ul>
										{step?.actions.map((action, actionIndex) => (
											<li key={actionIndex}>{action}</li>
										))}
									</ul>
								</div>
							))}
						</div>
						<div>
							<h4>Short-Term Actions:</h4>
							<p>{recommendation.shortTermActions.summary}</p>
							{recommendation.shortTermActions.steps.map((step, index) => (
								<div key={index}>
									<p>{step?.subHead}</p>
									<ul>
										{step?.actions.map((action, actionIndex) => (
											<li key={actionIndex}>{action}</li>
										))}
									</ul>
								</div>
							))}
						</div>
						<div>
							<h4>Long-Term Actions:</h4>

							{recommendation.longTermActions.steps.map((step, index) => (
								<div key={index}>
									<p>{step?.subHead}</p>
									<ul>
										{step?.actions.map((action, actionIndex) => (
											<li key={actionIndex}>{action}</li>
										))}
									</ul>
								</div>
							))}
						</div>
						<div>
							<h4>Timeline:</h4>
							<ul>
								{recommendation.timeline.steps.map((step, index) => (
									<li key={index}>
										{typeof step === "object" ? JSON.stringify(step) : step}
									</li>
								))}
							</ul>
						</div>
					</>
				) : (
					<p>No recommendations available.</p>
				)}
			</div>

			<div className="email-section">
				<h2>Get Your Detailed Technical Debt Report</h2>
				<p>Receive a comprehensive analysis with actionable recommendations</p>
				<button onClick={sendResultsByEmail}>Send My Report</button>
				{emailStatus && <p className="email-success">{emailStatus}</p>}
			</div>
			{/* <div className="actions">
				<button onClick={generatePDF}>Download PDF</button>
			</div> */}
		</div>
	);
};

export default ResultPage;
