import { useState, useEffect } from "react";
import axios from "axios";
import QuestionCard from "./QuestionCard";
import { useNavigate } from "react-router-dom";
import "../App.css";
import { baseUrl } from "../Util";

function QuizPage() {
	const [questions, setQuestions] = useState([]);
	const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
	const [totalScore, setTotalScore] = useState(0);
	const [answers, setAnswers] = useState([]);
	const [loading, setLoading] = useState(true);
	const navigate = useNavigate();

	useEffect(() => {
		const fetchQuestions = async () => {
			try {
				const response = await axios.get(`${baseUrl}/api/getQuestions`);
				setQuestions(response.data);
				setLoading(false);
			} catch (error) {
				console.error("Error fetching questions:", error);
			}
		};

		fetchQuestions();
	}, []);

	const handleAnswer = (score, questionId, selectedOption) => {
		const existingAnswerIndex = answers.findIndex(
			(ans) => ans.questionId === questionId
		);

		let updatedAnswers;
		let updatedTotalScore;

		if (existingAnswerIndex !== -1) {
			updatedAnswers = [...answers];
			const previousScore = updatedAnswers[existingAnswerIndex].score;
			updatedAnswers[existingAnswerIndex] = {
				questionId,
				selectedOption,
				score,
			};
			updatedTotalScore = totalScore - previousScore + score;
		} else {
			updatedAnswers = [...answers, { questionId, selectedOption, score }];
			updatedTotalScore = totalScore + score;
		}

		setAnswers(updatedAnswers);
		setTotalScore(updatedTotalScore);

		if (currentQuestionIndex + 1 < questions.length) {
			setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
		} else {
			const averageScore = (updatedTotalScore / questions.length).toFixed(1);

			let riskCategory = "";
			if (averageScore >= 0 && averageScore <= 3) {
				riskCategory = "Critical Risk";
			} else if (averageScore > 3 && averageScore <= 5) {
				riskCategory = "High Risk";
			} else if (averageScore > 5 && averageScore <= 7) {
				riskCategory = "Moderate Risk";
			} else if (averageScore > 7 && averageScore <= 10) {
				riskCategory = "Low Risk";
			}

			submitQuiz(updatedAnswers, updatedTotalScore, riskCategory);
		}
	};

	const handleBack = () => {
		if (currentQuestionIndex > 0) {
			const previousQuestionIndex = currentQuestionIndex - 1;

			const currentQuestionId = questions[currentQuestionIndex]._id;
			const previousAnswer = answers.find(
				(ans) => ans.questionId === currentQuestionId
			);

			if (previousAnswer) {
				const adjustedScore = totalScore - previousAnswer.score;
				setTotalScore(adjustedScore);
			}

			setCurrentQuestionIndex(previousQuestionIndex);
		}
	};

	const submitQuiz = async (finalAnswers, finalTotalScore, riskCategory) => {
		const submissionData = {
			answers: finalAnswers,
			totalScore: finalTotalScore,
			riskCategory,
		};

		try {
			const response = await axios.post(
				`${baseUrl}/api/submitQuiz`,
				submissionData
			);
			const submissionId = response.data.submissionId;
			navigate(`/results/${submissionId}`);
		} catch (error) {
			console.error("Error submitting quiz:", error);
			alert("Failed to submit quiz. Please try again.");
		}
	};

	if (loading) {
		return <div>Loading questions...</div>;
	}

	return (
		<div className="quiz-page">
			<h1>Tech Debt Terminator Quiz</h1>
			<p>
				Answer {questions.length} questions to get your personalized technical
				debt report
			</p>
			<progress
				value={currentQuestionIndex + 1}
				max={questions.length}></progress>
			{questions.length > 0 && (
				<QuestionCard
					question={questions[currentQuestionIndex]}
					questionNumber={currentQuestionIndex + 1}
					onAnswer={(score, selectedOption) =>
						handleAnswer(
							score,
							questions[currentQuestionIndex]._id, // question ID
							selectedOption
						)
					}
				/>
			)}
			<div className="quiz-navigation">
				{currentQuestionIndex > 0 && (
					<button onClick={handleBack} className="back-button">
						Back
					</button>
				)}
				{/* {currentQuestionIndex + 1 === questions.length && (
					<button
						onClick={() =>
							alert("Make sure all answers are final before submitting!")
						}>
						Finish
					</button>
				)} */}
			</div>
		</div>
	);
}

export default QuizPage;
