import { useState, useEffect } from "react";
import "../App.css";

function QuestionCard({ question, questionNumber, onAnswer }) {
	const [selectedOptionIndex, setSelectedOptionIndex] = useState(null);

	// Reset selected option whenever the question changes
	useEffect(() => {
		setSelectedOptionIndex(null);
		console.log(selectedOptionIndex, "selected");
		// Reset selection when question changes
	}, [question, selectedOptionIndex]);

	const handleOptionClick = (index, score, text) => {
		setSelectedOptionIndex(index); // Mark the current option as selected
		onAnswer(score, text); // Trigger the callback with selected data
	};

	return (
		<div className="question-card">
			<h2>
				{questionNumber}. {question.question}
			</h2>
			<p>{question.context}</p>
			<div className="warning-signs">
				<h3>Common Warning Signs:</h3>
				<ul>
					{question.warningSigns.map((sign, index) => (
						<li key={index}>{sign}</li>
					))}
				</ul>
			</div>
			<div className="options">
				{question.options.map((option, index) => (
					<button
						key={index}
						className={`option-button ${
							selectedOptionIndex === index ? "selected" : ""
						}`}
						onClick={() => handleOptionClick(index, option.score, option.text)}>
						<div className="option-content">
							<div>
								<p>{option.text}</p>
								<p>Impact: {option.impact}</p>
							</div>
						</div>
					</button>
				))}
			</div>
		</div>
	);
}

export default QuestionCard;
