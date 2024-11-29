import { useState } from "react";
import "../App.css";

function QuestionCard({ question, questionNumber, onAnswer }) {
	// State to track selected option
	const [selectedOptionIndex, setSelectedOptionIndex] = useState(null);

	const handleOptionClick = (index, score, text) => {
		setSelectedOptionIndex(index); // Update selected option
		onAnswer(score, text); // Trigger the callback
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
