import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";
import Form from "./Form";

function HeroSection() {
	const navigate = useNavigate();
	const [showForm, setShowForm] = useState(false);

	const startQuiz = () => {
		setShowForm(true);
	};

	const closeForm = () => {
		setShowForm(false);
	};

	return (
		<section className="hero">
			<div className={`hero-content ${showForm ? "blur" : ""}`}>
				{!showForm && (
					<>
						<h1>
							Accelerate Development, Slash Time-to-Market & Crush Tech Debt!
						</h1>
						<p>
							Take our 'Tech Debt Terminator' quiz to streamline your software
							development process.
						</p>
						<button onClick={startQuiz}>Take the Assessment</button>
					</>
				)}
			</div>

			{showForm && (
				<div className="form-overlay">
					<Form navigate={navigate} closeForm={closeForm} />
				</div>
			)}
		</section>
	);
}

export default HeroSection;
